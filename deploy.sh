#!/bin/bash
set -e

# ─────────────────────────────────────────────────────────────
#  Donkoun CLIENT — Cloudflare Pages Deploy Script
#  Usage: ./deploy.sh [branch]
#  Example: ./deploy.sh main
# ─────────────────────────────────────────────────────────────

PROJECT_NAME="donkoun-client"
OUTPUT_DIR="dist/donkoun-trip"
BRANCH="${1:-main}"

echo "🚀 Déploiement du CLIENT sur Cloudflare Pages..."
echo "   Projet  : $PROJECT_NAME"
echo "   Branche : $BRANCH"
echo ""

# ── Installation des dépendances ─────────────────────────────
echo "📦 Installation des dépendances..."
npm install --legacy-peer-deps

# ── Build de production ───────────────────────────────────────
echo "🔨 Build de production..."
export NODE_OPTIONS=--openssl-legacy-provider
npm run prod

# ── Fichier _redirects pour le routing Angular (SPA) ─────────
echo "/* /index.html 200" > "$OUTPUT_DIR/_redirects"
echo "✅ Fichier _redirects créé"

# ── Déploiement via Wrangler ──────────────────────────────────
echo "☁️  Déploiement sur Cloudflare Pages..."
npx wrangler pages deploy "$OUTPUT_DIR" \
  --project-name="$PROJECT_NAME" \
  --branch="$BRANCH" \
  --commit-dirty=true

echo ""
echo "✅ Déploiement CLIENT terminé !"
echo "   URL : https://$PROJECT_NAME.pages.dev"
