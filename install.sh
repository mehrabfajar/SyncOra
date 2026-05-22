#!/bin/bash
set -e

echo ""
echo "╔══════════════════════════════════╗"
echo "║     SyncOra — Install Script     ║"
echo "╚══════════════════════════════════╝"
echo ""

echo "📦 Installing Python backend dependencies..."
cd backend
python3 -m venv venv
venv/bin/pip install -r requirements.txt --quiet
echo "✓ Backend ready"
cd ..

echo ""
echo "📦 Installing Node frontend dependencies..."
cd frontend
npm install --silent
echo "✓ Frontend ready"
cd ..

echo ""
echo "✅ Done! Run ./start.sh to launch the app."
echo ""
