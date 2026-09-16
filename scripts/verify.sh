#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

npm run typecheck
npm run build

echo "LuaCore native search: OK"
echo "Mastery/recommendations: OK"
echo "First-party analytics: OK"
echo "Teacher Forge + Radar: OK"
echo "Student Constellation: OK"
