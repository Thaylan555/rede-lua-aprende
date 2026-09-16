#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

bash scripts/verify.sh

if [ ! -d node_modules ]; then
  echo "== Instalando dependências =="
  npm install
fi

echo "== Typecheck =="
npm run typecheck

echo "== Build frontend =="
npm run build

echo "== Deploy Cloudflare Pages =="
npx wrangler pages deploy frontend/dist --project-name=rede-lua-educacao

echo
echo "Deploy enviado. Confira o domínio personalizado aprende.redelua.xyz no painel do Pages."
