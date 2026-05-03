#!/bin/bash
export SSHPASS='-4V2HOvVFF,q7Bx2'
sshpass -e ssh -o StrictHostKeyChecking=no root@srv1534108.hstgr.cloud << 'ENDSSH'
cd /root/super_real_estate
# Stash any local changes on server to avoid pull conflicts
git stash
git pull origin v1
# Rebuild and restart ONLY frontend and backend containers
# Based on the service names in docker-compose.yml: 'frontend' and 'backend'
# This will NOT touch the 'db' service (PostgreSQL).
docker compose up -d --build frontend backend
ENDSSH
