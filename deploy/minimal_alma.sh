#!/usr/bin/env bash
set -euo pipefail

# Minimal deployment script for AlmaLinux/RHEL family
# Assumes: git repo already cloned, running from repo root
# Usage: bash deploy/minimal_alma.sh

BACKEND_DIR=backend
FRONTEND_DIR=frontend

echo "[1/6] Installing Node dependencies (backend)";
(cd "$BACKEND_DIR" && npm install --production)

echo "[2/6] Running seed (creates tables & sample data)";
(node "$BACKEND_DIR/src/seed.js")

echo "[3/6] Installing frontend dependencies";
(cd "$FRONTEND_DIR" && npm install)

echo "[4/6] Building frontend";
(cd "$FRONTEND_DIR" && npm run build)

echo "[5/6] Starting backend via PM2 (serves API + static dist)";
# Ensure logs dir exists
mkdir -p "$BACKEND_DIR/logs"
if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi
(cd "$BACKEND_DIR" && pm2 start ecosystem.config.js --only kick-backend)
pm2 save

echo "[6/6] PM2 startup systemd (if not configured)";
pm2 startup systemd -u $(whoami) --hp $(eval echo ~$USER) || true

echo "Done. API: http://<SERVER_IP>:4000/api/health";
echo "Frontend: http://<SERVER_IP>:4000";
