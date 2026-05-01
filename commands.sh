cd /root/super_real_estate
git fetch origin v1
git reset --hard origin/v1
docker compose build backend frontend
docker compose up -d backend frontend
docker run --rm --network super_real_estate_default -v /root/super_real_estate/backend:/app -w /app golang:1.24-alpine go run scratch/migrate_collections.go
echo "DEPLOYMENT_SUCCESSFUL"
