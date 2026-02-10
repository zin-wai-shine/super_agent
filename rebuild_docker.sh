#!/bin/bash
echo "Rebuilding and restarting Docker containers..."
docker compose up --build -d
echo "Done! Application should be available at http://localhost:3000/listings"
