#!/usr/bin/env bash
set -e

# Build app and api containers
docker-compose -f docker-compose.dev.yml build
