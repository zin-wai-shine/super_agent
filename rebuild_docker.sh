#!/bin/bash
set -e
echo "Checking Docker..."
if ! command -v docker &>/dev/null; then
  echo "Docker not found in PATH."
  echo "1. Open Docker Desktop from Applications"
  echo "2. Wait until it says 'Docker Desktop is running' (whale icon in menu bar)"
  echo "3. Accept any license or permission prompts"
  echo "4. Open Terminal and run this script again: ./rebuild_docker.sh"
  exit 1
fi
echo "Docker found. Rebuilding and starting containers..."
docker compose up --build -d
echo "Done!"
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:8080"
echo "  Nginx:     http://localhost:8000"
echo "  Docs:      http://localhost:3443"
