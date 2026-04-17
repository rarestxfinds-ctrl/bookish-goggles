// Middle/Hook/Use-STT.tsx
import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Returns the appropriate WebSocket URL for the STT proxy.
 * - In GitHub Codespaces: uses the forwarded port 8081 (e.g., wss://...-8081.app.github.dev)
 * - Locally: uses ws://localhost:8081
 */
function getProxyUrl(): string {
  const host = window.location.hostname;
  if (host.endsWith('.app.github.dev')) {
    // Replace the random port number with 8081
    const withProxy = host.replace(/-\d+(\.app\.github\.dev)$/, '-8081$1');
    return `wss://${withProxy}`;
  }
  return 'ws://localhost:8081';
}

export function useDeepgram() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'failed'>('idle');

  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldReconnectRef = useRef(false);

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close(1000, 'Cleanup');
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    wsRef.current = null;
    recorderRef.current = null;
    streamRef.current = null;
    shouldReconnectRef.current = false;
  }, []);

  const connectWebSocket = useCallback(() => {
    const proxyUrl = getProxyUrl();
    console.log('Connecting to STT proxy:', proxyUrl);
    const ws = new WebSocket(proxyUrl);
    ws.binaryType = 'arraybuffer';
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('✅ WebSocket open');
      setConnectionStatus('connected');
      setError(null);
      shouldReconnectRef.current = true;

      // Start recording only after WebSocket is open (handled by startRecording)
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 Received from STT:', data);
        if (data.text?.trim()) {
          // Append each new transcript on a new line
          setTranscript(prev => prev ? `${prev}\n${data.text}` : data.text);
          setInterimTranscript('');
        } else if (data.error) {
          console.error('STT server error:', data.error);
          setError(data.error);
        }
      } catch (err) {
        console.error('Failed to parse message:', err);
      }
    };

    ws.onerror = () => {
      setConnectionStatus('failed');
      setError('WebSocket error — is the STT proxy running on port 8081?');
    };

    ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      setConnectionStatus('idle');
      if (shouldReconnectRef.current && isRecording) {
        console.log('Attempting to reconnect in 2 seconds...');
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 2000);
      } else {
        setIsRecording(false);
      }
    };
  }, [isRecording]);

  const startRecording = useCallback(async () => {
    setError(null);
    setConnectionStatus('connecting');
    setTranscript(''); // Clear previous transcript

    // Clean up any existing connection and media
    cleanup();
    shouldReconnectRef.current = true;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Connect WebSocket first
      connectWebSocket();

      // Wait for WebSocket to open before starting MediaRecorder
      const waitForOpen = () => {
        return new Promise<void>((resolve) => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            resolve();
          } else {
            const handler = () => {
              if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.removeEventListener('open', handler);
                resolve();
              }
            };
            wsRef.current?.addEventListener('open', handler);
          }
        });
      };
      await waitForOpen();

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : '';
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(e.data);
        }
      };

      recorder.start(500); // Send audio chunks every 500ms
      setIsRecording(true);
    } catch (err) {
      setConnectionStatus('failed');
      setError(err instanceof Error ? err.message : 'Failed to access microphone');
      cleanup();
    }
  }, [cleanup, connectWebSocket]);

  const stopRecording = useCallback(() => {
    shouldReconnectRef.current = false;
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close(1000, 'User stopped recording');
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
    setInterimTranscript('');
    setConnectionStatus('idle');
    // Clean up refs but keep the final transcript
    wsRef.current = null;
    recorderRef.current = null;
    streamRef.current = null;
  }, []);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldReconnectRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  return {
    toggleRecording,
    startRecording,
    stopRecording,
    isRecording,
    transcript,
    interimTranscript,
    error,
    connectionStatus,
  };
}