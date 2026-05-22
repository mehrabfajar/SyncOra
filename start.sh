#!/bin/bash
trap 'kill 0' EXIT

echo ""
echo "╔══════════════════════════════════╗"
echo "║       SyncOra — Starting...      ║"
echo "╚══════════════════════════════════╝"
echo ""

echo "🚀 Starting backend on http://localhost:5000 ..."
cd backend
venv/bin/python run.py &
cd ..

sleep 2

echo "🚀 Starting frontend on http://localhost:5173 ..."
cd frontend
npm run dev &
cd ..

echo ""
echo "════════════════════════════════════"
echo "  ✓ App running!"
echo "  → Open: http://localhost:5173"
echo "  Press Ctrl+C to stop."
echo "════════════════════════════════════"
echo ""

wait
