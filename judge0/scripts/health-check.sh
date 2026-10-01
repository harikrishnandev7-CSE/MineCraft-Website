#!/usr/bin/env bash
curl -s http://localhost:2358/health_check | grep "status" || echo "Judge0 is not healthy"
