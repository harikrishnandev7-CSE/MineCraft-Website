#!/usr/bin/env bash
set -e
echo "Starting Judge0 containers..."
docker compose up -d
echo "Judge0 is running at http://localhost:2358"
