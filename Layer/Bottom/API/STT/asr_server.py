#!/usr/bin/env python3
"""
ASR Server using Whisper (tarteel-ai/whisper-base-ar-quran)
Receives audio bytes via WebSocket, returns transcription.
"""
import asyncio
import json
import websockets
import torch
from transformers import WhisperProcessor, WhisperForConditionalGeneration
import subprocess
import tempfile
import os
import re

# ---------- Configuration ----------
MODEL_ID = "tarteel-ai/whisper-base-ar-quran"
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
SAMPLE_RATE = 16000

print(f"🚀 Loading model '{MODEL_ID}' on {DEVICE}...")
processor = WhisperProcessor.from_pretrained(MODEL_ID)
model = WhisperForConditionalGeneration.from_pretrained(MODEL_ID)
model.to(DEVICE)
print("✅ Model and processor ready")

def clean_transcript(text: str) -> str:
    """Remove special tokens like <|ar|>, <|transcribe|>, etc."""
    return re.sub(r'<[^>]+>', '', text).strip()

async def transcribe(websocket):
    try:
        async for message in websocket:
            if len(message) < 1000:
                print("⚠️ Audio too short, skipping")
                continue

            # Save incoming audio bytes to a temporary file
            with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp:
                tmp.write(message)
                tmp_path = tmp.name

            try:
                # Convert to 16kHz mono WAV using ffmpeg
                with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as wav_tmp:
                    wav_path = wav_tmp.name

                subprocess.run(
                    [
                        "ffmpeg", "-i", tmp_path,
                        "-ar", str(SAMPLE_RATE), "-ac", "1",
                        "-y", wav_path
                    ],
                    check=True,
                    capture_output=True,
                    text=True
                )

                # Load WAV using soundfile (or torchaudio)
                import soundfile as sf
                audio_array, sr = sf.read(wav_path, dtype='float32')
                print(f"🎙️ Loaded {len(audio_array)/sr:.2f}s of audio")

                # Process with Whisper
                input_features = processor(
                    audio_array,
                    sampling_rate=sr,
                    return_tensors="pt"
                ).input_features.to(DEVICE)

                with torch.no_grad():
                    predicted_ids = model.generate(input_features)

                transcript = processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
                cleaned = clean_transcript(transcript)
                print(f"📝 Transcript: '{cleaned}'")

                if websocket.open:
                    await websocket.send(json.dumps({"text": cleaned}))

            finally:
                os.unlink(tmp_path)
                if os.path.exists(wav_path):
                    os.unlink(wav_path)

    except websockets.exceptions.ConnectionClosed:
        print("🔌 Client disconnected")
    except Exception as e:
        print(f"❌ Error: {e}")

async def main():
    async with websockets.serve(transcribe, "0.0.0.0", 8082):
        print("✅ ASR server listening on ws://0.0.0.0:8082")
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())