#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# Deploy das Edge Functions + setar secrets
# ═══════════════════════════════════════════════════════════════════════════
#
# Uso:
#   1. Instalar Supabase CLI: brew install supabase/tap/supabase
#   2. Login:                 supabase login
#   3. Colocar arquivo JSON em scripts/google-sa.json (NÃO comitar)
#   4. Rodar:                 ./scripts/deploy-functions.sh
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

PROJECT_REF="hsiwtgzixratjuigjxyj"
SA_JSON="${1:-scripts/google-sa.json}"

if [ ! -f "$SA_JSON" ]; then
  echo "❌ Arquivo $SA_JSON não encontrado"
  echo "   Coloque o JSON da Service Account em: $SA_JSON"
  exit 1
fi

echo "📋 Extraindo credenciais do Service Account..."
SA_EMAIL=$(python3 -c "import json; print(json.load(open('$SA_JSON'))['client_email'])")
SA_KEY=$(python3 -c "import json; print(json.load(open('$SA_JSON'))['private_key'])")

echo "🔐 Setando secrets no Supabase ($PROJECT_REF)..."
supabase secrets set \
  --project-ref "$PROJECT_REF" \
  GOOGLE_SHEETS_ID="1rR3k_gq9r_Lq0BR55A0QTYIDQDUlCnrkbITLOe8XeJQ" \
  GOOGLE_SERVICE_ACCOUNT_EMAIL="$SA_EMAIL" \
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="$SA_KEY"

echo ""
echo "🚀 Deployando Edge Functions..."
supabase functions deploy sync-sheets-to-db --project-ref "$PROJECT_REF" --no-verify-jwt
supabase functions deploy sync-db-to-sheets --project-ref "$PROJECT_REF" --no-verify-jwt
supabase functions deploy send-capi-event --project-ref "$PROJECT_REF" --no-verify-jwt

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "🧪 Teste o sync manualmente:"
echo "   curl -X POST https://$PROJECT_REF.supabase.co/functions/v1/sync-sheets-to-db"
