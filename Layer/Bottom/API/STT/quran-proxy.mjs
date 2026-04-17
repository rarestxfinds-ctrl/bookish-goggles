import { WebSocketServer } from 'ws';
import WebSocket from 'ws';

const SILENCE_TIMEOUT_MS = 1500;
const LOCAL_ASR_URL = 'ws://localhost:8082';

const wss = new WebSocketServer({ port: 8081, host: '0.0.0.0' });
console.log('✅ Quran proxy listening on port 8081');

wss.on('connection', (clientWs) => {
  console.log('🔌 Client connected');

  const audioChunks = [];
  let silenceTimer = null;
  let asrSocket = null;

  function connectASR() {
    asrSocket = new WebSocket(LOCAL_ASR_URL);
    asrSocket.on('open', () => console.log('🔗 Connected to local ASR server'));
    asrSocket.on('message', (data) => {
      try {
        const result = JSON.parse(data);
        if (result.text && clientWs.readyState === clientWs.OPEN) {
          clientWs.send(JSON.stringify({ text: result.text, is_final: true }));
          console.log('✅ Forwarded to client:', result.text);
        } else if (result.error) {
          console.error('❌ ASR error:', result.error);
        }
      } catch (err) {
        console.error('❌ Failed to parse ASR response:', err.message);
      }
    });
    asrSocket.on('error', (err) => console.error('❌ ASR socket error:', err.message));
    asrSocket.on('close', () => {
      console.log('🔌 ASR server disconnected, reconnecting...');
      setTimeout(connectASR, 1000);
    });
  }
  connectASR();

  async function transcribeAndSend() {
    if (audioChunks.length === 0) return;
    if (!asrSocket || asrSocket.readyState !== WebSocket.OPEN) {
      console.log('⚠️ ASR server not ready, skipping transcription');
      return;
    }
    const chunks = audioChunks.splice(0, audioChunks.length);
    const combined = Buffer.concat(chunks.map(c => Buffer.from(c)));
    console.log(`🎙️ Sending ${combined.length} bytes to local ASR server...`);
    asrSocket.send(combined);
  }

  clientWs.on('message', (data) => {
    audioChunks.push(data);
    clearTimeout(silenceTimer);
    silenceTimer = setTimeout(() => {
      console.log('🔇 Silence detected — transcribing...');
      transcribeAndSend();
    }, SILENCE_TIMEOUT_MS);
  });

  clientWs.on('close', () => {
    console.log('🔌 Client disconnected — transcribing remaining audio...');
    clearTimeout(silenceTimer);
    transcribeAndSend();
    if (asrSocket) asrSocket.close();
  });

  clientWs.on('error', (err) => console.error('❌ Client error:', err.message));
});

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught exception:', err);
});