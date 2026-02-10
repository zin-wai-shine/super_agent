#!/bin/bash
set -e
echo "Checking Docker..."

# Use docker from PATH, or common Docker Desktop locations on macOS
DOCKER_CMD=""
if command -v docker &>/dev/null; then
  DOCKER_CMD=docker
elif [ -x /usr/local/bin/docker ]; then
  DOCKER_CMD=/usr/local/bin/docker
elif [ -x "$HOME/.docker/bin/docker" ]; then
  DOCKER_CMD="$HOME/.docker/bin/docker"
fi

if [ -z "$DOCKER_CMD" ]; then
  echo "Docker not found. Open Docker Desktop from Applications, then run this script again."
  exit 1
fi

# Wait for Docker Desktop to be ready (e.g. after you click Accept)
echo "Waiting for Docker Desktop to be ready..."
echo "(If a window opened, accept the terms / permissions in Docker Desktop.)"
for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30; do
  if $DOCKER_CMD info &>/dev/null; then
    echo "Docker is ready. Rebuilding and starting containers..."
    $DOCKER_CMD compose up --build -d
    echo "Done!"
    echo "  Frontend:  http://localhost:3000"
    echo "  Backend:   http://localhost:8080"
    echo "  Nginx:     http://localhost:8000"
    echo "  Docs:      http://localhost:3443"
    exit 0
  fi
  echo "  ... waiting (${i}/30)"
  sleep 2
done

echo "Docker did not become ready in time. Open Docker Desktop, accept any prompts, then run: ./rebuild_docker.sh"
exit 1
