# Painel Comercial — HL Models

Dashboard de gestão comercial e marketing para campanhas de Lead Ads do Facebook, com sincronização bidirecional com Google Sheets e integração com Pixel / Conversions API.

> 📋 **Plano completo do projeto**: ver [`PLANO_PROJETO.md`](./PLANO_PROJETO.md)

---

## 🚀 Quick Start

```bash
# 1. Instalar dependências
npm install

# 2. Copiar variáveis de ambiente
cp .env.example .env.local
# → preencher com credenciais do Supabase + Google Service Account

# 3. Rodar em dev
npm run dev
```

Acesse em **http://localhost:3000**

---

## 🗂️ Estrutura do Projeto

```
painel-comercial-hl-models/
├── app/
│   ├── (auth)/login/             # Tela de login
│   ├── (dashboard)/              # Rotas autenticadas
│   │   ├── page.tsx              # Home (KPIs + gráficos)
│   │   ├── board/                # Kanban comercial
│   │   ├── lead/[id]/            # Detalhe do lead
│   │   ├── analytics/            # Gráficos de marketing
│   │   ├── export/               # Exportação CSV/Excel
│   │   └── admin/                # Configurações
│   └── auth/callback/            # OAuth callback
├── components/
│   ├── layout/                   # Sidebar, Header
│   ├── providers/                # Theme, React Query
│   ├── ui/                       # shadcn/ui
│   ├── charts/                   # Recharts wrappers
│   └── kanban/                   # Componentes do board
├── lib/
│   ├── supabase/                 # Clients (browser + server)
│   ├── google-sheets/            # Helpers API Sheets
│   ├── facebook-capi/            # Helpers CAPI
│   └── utils/                    # Formatters, status, etc
├── supabase/
│   ├── migrations/               # SQL schema
│   └── functions/                # Edge Functions (Deno)
│       ├── sync-sheets-to-db/
│       ├── sync-db-to-sheets/
│       └── send-capi-event/
├── types/                        # TypeScript types
├── PLANO_PROJETO.md              # Documentação completa
└── README.md
```

---

## 🔧 Setup Completo

### 1. Supabase

1. Criar projeto no [Supabase](https://app.supabase.com) (ou usar DDG existente com schema `hl_comercial`)
2. Rodar migration inicial:
   ```bash
   psql <CONNECTION_STRING> -f supabase/migrations/20260418_001_init_schema.sql
   ```
   Ou pelo Dashboard → SQL Editor → colar + Run
3. Criar primeiro usuário admin:
   - Auth → Users → Add user → email + senha
   - SQL Editor:
     ```sql
     update hl_comercial.profiles set role = 'admin' where email = 'SEU_EMAIL';
     ```

### 2. Google Sheets API

1. Criar projeto no [Google Cloud Console](https://console.cloud.google.com)
2. Ativar **Google Sheets API**
3. Criar **Service Account** com role `Viewer`
4. Baixar chave JSON
5. **Compartilhar a planilha** com o email da Service Account (permissão de Editor)
6. Preencher no `.env.local`:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL` = email do SA
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` = `private_key` do JSON (com `\n` literais)
   - `GOOGLE_SHEETS_ID` = ID da planilha (da URL)

### 3. Deploy das Edge Functions

```bash
# Via Supabase CLI
supabase functions deploy sync-sheets-to-db --project-ref $SUPABASE_PROJECT_ID
supabase functions deploy sync-db-to-sheets --project-ref $SUPABASE_PROJECT_ID
supabase functions deploy send-capi-event --project-ref $SUPABASE_PROJECT_ID

# Setar secrets
supabase secrets set \
  GOOGLE_SHEETS_ID=... \
  GOOGLE_SERVICE_ACCOUNT_EMAIL=... \
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="..." \
  --project-ref $SUPABASE_PROJECT_ID
```

### 4. Cron de sincronização

No Supabase Dashboard → **Database → Cron Jobs**:

```sql
select cron.schedule(
  'sync-sheets-to-db-5min',
  '*/5 * * * *',
  $$
    select net.http_post(
      url := 'https://<PROJECT>.supabase.co/functions/v1/sync-sheets-to-db',
      headers := jsonb_build_object('Authorization', 'Bearer <SERVICE_ROLE_KEY>')
    );
  $$
);

select cron.schedule(
  'sync-db-to-sheets-2min',
  '*/2 * * * *',
  $$
    select net.http_post(
      url := 'https://<PROJECT>.supabase.co/functions/v1/sync-db-to-sheets',
      headers := jsonb_build_object('Authorization', 'Bearer <SERVICE_ROLE_KEY>')
    );
  $$
);
```

### 5. Vercel Deploy

```bash
# Quando Lucas liberar o GitHub + conta Vercel:
vercel link
vercel env pull .env.local
vercel deploy --prod
```

Variáveis a configurar no Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL` (URL final do deploy)

---

## 🎨 Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| UI | Tailwind + shadcn/ui + Lucide |
| Charts | Recharts |
| DnD | @hello-pangea/dnd |
| Tables | TanStack Table |
| Backend | Supabase (Postgres + Auth + Edge Functions) |
| Sync | Google Sheets API v4 |
| Cache | TanStack Query |

---

## 📊 Status das Fases

- [x] **Fase 1** — Setup & Fundação (estrutura + auth + layout)
- [ ] **Fase 2** — Sincronização Sheets ↔ Supabase
- [ ] **Fase 3** — Board Comercial (Kanban + Lista + Export)
- [ ] **Fase 4** — Analytics & Marketing
- [ ] **Fase 5** — CAPI + Admin + Polimento

---

## 🔐 Segurança

- RLS habilitado em todas as tabelas
- Service Role Key **nunca** exposta no client
- Dados sensíveis (tokens Google, FB) apenas em Edge Functions secrets
- Auth obrigatória em todas as rotas exceto `/login`

---

## 📝 Desenvolvimento

```bash
npm run dev              # Dev server
npm run build            # Build produção
npm run typecheck        # Verificar tipos
npm run lint             # ESLint
npm run supabase:types   # Regenerar types do DB
```

---

## 🤝 Créditos

Desenvolvido por **DDG — Dose de Growth** para **HL Models**.
