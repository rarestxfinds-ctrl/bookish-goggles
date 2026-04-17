#!/bin/bash
# Start the Python ASR server in the background
python Layer/Bottom/API/STT/asr_server.py &
ASR_PID=$!

# Wait a moment for the ASR server to load the model
sleep 5

# Start the Node proxy in the foreground
node Layer/Bottom/API/STT/quran-proxy.mjs

# When Node proxy exits, kill the ASR server
kill $ASR_PID