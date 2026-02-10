#!/bin/bash
# Run the full stack: DB (Docker), Backend (Go), Frontend (React)
set -e
cd "$(dirname "$0")"

echo "=== Super Real Estate - Run All ==="

# 1. Start database (Docker)
if command -v docker &>/dev/null; then
  echo "Starting PostgreSQL with Docker..."
  docker compose up -d db
  echo "Waiting for DB to be ready..."
  sleep 3
  export DB_PORT=5433
  export DB_HOST=localhost
else
  echo "Docker not found. Using default DB (localhost:5432). Ensure PostgreSQL is running."
fi

# 2. Backend
echo "Starting Backend (Go) on :8080..."
cd backend
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi
go run main.go &
BACKEND_PID=$!
cd ..

# 3. Frontend
echo "Starting Frontend (React) on :3000..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "Backend PID: $BACKEND_PID  |  Frontend PID: $FRONTEND_PID"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8080/api"
echo "Press Ctrl+C to stop both."
wait $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
