# 📖 Regras e Lógica — Painel Comercial HL Models

> Documentação técnica e de negócio. Atualizada sempre que as regras mudam.
> **Última atualização**: 2026-04-18

---

## 🎯 Objetivo

Painel web que centraliza **todos os leads** de campanhas de Lead Ads do Facebook da HL Models, permite **gestão comercial** (Kanban + distribuição por vendedor), **analytics de marketing** (performance de campanhas), e mantém **sincronização bidirecional** com o Google Sheets (que alimenta o Pixel/CAPI do Facebook).

---

## 🏗️ Arquitetura

```
┌──────────────┐         ┌───────────────┐         ┌──────────────┐         ┌──────────────┐
│ Facebook Ads │────────▶│ Google Sheets │◀───────▶│   Supabase   │────────▶│   Next.js    │
│  Lead Forms  │ nativo  │ 1 aba/form    │  sync   │ hl_comercial │  data   │   Vercel     │
└──────────────┘         └───────┬───────┘         └──────┬───────┘         └──────────────┘
                                 │                        │
                                 │ célula lead_status     │ status_historico
                                 │ atualizada             │
                                 ▼                        ▼
                         ┌───────────────┐         ┌───────────────┐
                         │    Pixel /    │         │ Edge Function │
                         │     CAPI      │◀────────│ send-capi     │
                         └───────────────┘         └───────────────┘
```

### Componentes

| Componente | Tecnologia | Responsabilidade |
|---|---|---|
| Captura de leads | Facebook Ads | Lead Ads → Google Sheets (integração nativa FB) |
| Planilha | Google Sheets | 1 aba por formulário/campanha |
| Banco central | Supabase Postgres (schema `hl_comercial`) | Source of truth |
| Sync | Edge Functions (Deno) | `sync-sheets-to-db` (5min) + `sync-db-to-sheets` (2min) |
| Pixel/CAPI | Edge Function `send-capi-event` | Envia eventos de conversão p/ Meta |
| Frontend | Next.js 14 + Vercel | Dashboard, Kanban, Analytics |
| Auth | Supabase Auth | Email/senha + Google OAuth |

---

## 🔄 Fluxos de Dados

### Fluxo 1 — Entrada de lead novo
```
1. Usuário preenche form do Facebook Lead Ads
2. Facebook grava linha na aba correspondente do Google Sheets (nativo)
3. Cron de 5min chama sync-sheets-to-db
4. Edge Function:
   a. Lista TODAS as abas da planilha
   b. Filtra abas em config.blocked_tabs (ignora MARIA, EVELIN, etc)
   c. Para cada aba válida: detecta colunas, faz upsert em leads
5. Lead aparece no painel com status = 'novo'
```

### Fluxo 2 — Mudança de status pelo vendedor
```
1. Vendedor arrasta card no Kanban OU muda status no drawer
2. UPDATE hl_comercial.leads SET status = 'X'
3. Trigger log_status_change insere em status_historico (sincronizado_sheets = false)
4. Cron de 2min chama sync-db-to-sheets
5. Edge Function:
   a. Busca registros pendentes em status_historico
   b. Pra cada: atualiza célula lead_status da linha correspondente no Sheets
   c. Marca sincronizado_sheets = true
6. [Opcional] Se status = qualificado/agendado/fechado → dispara send-capi-event
7. Pixel do Facebook recebe evento → otimização de campanha
```

### Fluxo 3 — Distribuição de leads pra vendedor
```
1. Admin/cliente vai em "Distribuir leads"
2. Aplica filtros (campanha, status=novo, origem, etc)
3. Seleciona vendedor + quantidade (ex: 50 leads pra Vendedor X)
4. Sistema:
   a. Cria registro em hl_comercial.distribuicoes
   b. UPDATE nos N leads selecionados: vendedor_id + distribuicao_id + atribuido_em
5. View v_performance_vendedor atualizada automaticamente
6. Vendedor vê só seus leads atribuídos no Kanban (filtro padrão)
```

---

## 📋 Regras de Negócio

### Status dos Leads
```
novo → contato_feito → qualificado → agendado → fechado
                                                 └→ perdido
                                                 └→ sem_interesse
```

| Status | Quando usar | Evento CAPI |
|---|---|---|
| `novo` | Lead acabou de chegar do Facebook | `Lead` (opcional) |
| `contato_feito` | Vendedor fez 1º contato (WhatsApp/ligação) | — |
| `qualificado` | Cliente demonstrou interesse real | `CompleteRegistration` |
| `agendado` | Visita/reunião marcada | `Schedule` |
| `fechado` | Venda concluída | `Purchase` |
| `perdido` | Cliente não converteu | — |
| `sem_interesse` | Cliente rejeitou produto explicitamente | — |

### Distribuição por Vendedor
- **Atribuição explícita**: admin distribui X leads pra vendedor Y
- **Pesos**: cada vendedor tem `peso_distribuicao` (int) — pesos maiores recebem mais leads em distribuições round-robin
- **Limite diário**: campo `max_leads_por_dia` (null = ilimitado)
- **Histórico**: todas as distribuições ficam em `distribuicoes` (snapshot do filtro aplicado + total)
- **Performance**: view `v_performance_vendedor` mostra KPIs (recebidos, conversão, taxa de contato)
- **Vendedor ativo/inativo**: campo `ativo` — inativos não recebem novos leads

### Mapeamento Sheets ↔ DB
**Abas**:
- Cada aba = 1 formulário do Facebook
- **Novas abas são detectadas automaticamente** no próximo sync
- Abas em `config.blocked_tabs` são ignoradas

**Colunas**:
- Detecção primária: lista de aliases por campo (`nome`, `telefone`, `email`, `full_name`, `phone_number`, etc)
- **Fallback heurístico**: se não encontrar pelo header, analisa os valores (regex) pra identificar telefone/email/nome
- **Campos extras**: tudo que não é mapeado entra em `leads.dados_extras` (jsonb) — preservado
- **Status**: coluna `lead_status` no Sheets é a mesma que fica espelhada com `leads.status` do DB

### Filtros e Limpeza Automática
- **Test leads**: Facebook gera `<test lead: dummy data for phone_number>` → filtrado automaticamente
- **Prefixo `p:` no telefone**: Meta exporta `p:+5511999...` → strip automático
- **Timestamps vazios**: `""` → `NULL` (Postgres rejeita string vazia em timestamptz)
- **Strings vazias**: `""` → `NULL` em todos os campos

---

## 🗄️ Modelo de Dados (Schema `hl_comercial`)

### Tabelas principais

| Tabela | Propósito |
|---|---|
| `profiles` | Usuários autenticados do painel (admin, cliente, comercial, marketing) |
| `vendedores` | Vendedores (podem ou não ter profile) — recebem leads distribuídos |
| `leads` | Lead individual (1 por formulário preenchido) |
| `status_historico` | Log de cada mudança de status |
| `distribuicoes` | Lote de distribuição (X leads pra vendedor Y) |
| `campanhas` | Cache de metadata de campanhas |
| `sync_log` | Log de execução dos syncs (sheets↔db, capi) |
| `config` | Configuração single-row (blocked_tabs, pixel_id, etc) |

### Views úteis
| View | Uso |
|---|---|
| `v_kpis_overview` | Totais por status + taxa de conversão geral |
| `v_leads_por_campanha` | Performance por campanha |
| `v_leads_por_dia` | Série temporal diária |
| `v_performance_vendedor` | KPIs por vendedor |

### Triggers automáticos
- `leads_set_updated_at` — atualiza `updated_at` em UPDATE
- `leads_log_status` — insere em `status_historico` quando `leads.status` muda
- `on_auth_user_created_hl_comercial` — cria profile ao cadastrar usuário no Auth

---

## 🔐 Segurança

### RLS (Row Level Security)
Todas as tabelas têm RLS habilitado.

**Regras gerais**:
- `authenticated` → leitura em todas as tabelas
- `admin` / `cliente` → escrita em `vendedores`, `config`
- `comercial` / `marketing` → escrita em `leads` (status, observações)
- `service_role` → bypass total (usado pelas Edge Functions)

### Secrets
| Secret | Localização | Rotação |
|---|---|---|
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | Supabase Edge Functions secrets | Gerar nova chave no GCP quando comprometida |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Idem | — |
| `GOOGLE_SHEETS_ID` | Idem | Fixo |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-injetada nas Edge Functions | Nunca expor no client |
| `FB_PIXEL_ID` / `FB_CAPI_ACCESS_TOKEN` | Idem | Gerar novo no Meta BM |

**Nunca** comitar credenciais no Git — `.gitignore` já protege:
- `.env*.local`
- `scripts/google-sa.json`
- `**/dose-de-growth-*.json`

---

## ⚠️ Gotchas Conhecidos

1. **Schema exposto no PostgREST**: schema `hl_comercial` precisa estar em `pgrst.db_schemas` — configurado via migration. Se der erro "Invalid schema": `notify pgrst, 'reload config'`.

2. **Schema cache do PostgREST**: após migration, esperar ~30s ou rodar `notify pgrst, 'reload schema'` antes de chamar Edge Functions que usam tabelas recém-criadas.

3. **Coluna `lead_status` no Sheets precisa existir**: se aba nova não tem essa coluna, o sync reverso (DB→Sheets) não funciona nela. Adicionar manualmente no Sheets ou automatizar criação.

4. **Formulários Facebook diferentes**: cada aba pode ter colunas/perguntas diferentes. A Edge Function tolera via:
   - Aliases múltiplos por campo
   - Heurística de detecção pelos valores
   - Preservação em `dados_extras` do que não bate

5. **Test leads do Facebook**: quando você testa um formulário no FB, ele grava `<test lead: dummy data>` — filtrado no sync, mas cuidado: **se o volume de test leads for muito alto numa aba, ela pode ficar vazia pós-filtro**.

6. **Phone prefix `p:`**: Meta exporta `p:+55...` em vez de `+55...` — strip obrigatório.

7. **pg_cron + pg_net são extensions**: precisam ser habilitadas (`create extension pg_cron`, `pg_net`).

8. **Edge Function deploy**: MCP Supabase permite deploy direto. Se via CLI: `supabase functions deploy <name> --project-ref hsiwtgzixratjuigjxyj`.

---

## 🛠️ Como Manter

### Adicionar nova aba ao Sheets
**Nada precisa ser feito no código!** Novas abas entram no próximo cron (max 5min).

### Desativar uma aba do sync
```sql
update hl_comercial.config
set blocked_tabs = array_append(blocked_tabs, 'NOME_DA_ABA')
where id = 1;
```

### Reativar uma aba do sync
```sql
update hl_comercial.config
set blocked_tabs = array_remove(blocked_tabs, 'NOME_DA_ABA')
where id = 1;
```

### Adicionar novo alias de coluna (ex: formulário usa `Cel` em vez de `Celular`)
Editar `COLUMN_MAP` em `supabase/functions/sync-sheets-to-db/index.ts`:
```ts
telefone: [..., "cel"],
```
Redeploy: `supabase functions deploy sync-sheets-to-db`

### Forçar sync manual
```sql
select net.http_post(
  url := 'https://hsiwtgzixratjuigjxyj.supabase.co/functions/v1/sync-sheets-to-db',
  headers := '{"Content-Type":"application/json","Authorization":"Bearer <ANON_KEY>"}'::jsonb,
  body := '{}'::jsonb
);
-- aguarde 5s
select content::text from net._http_response order by created desc limit 1;
```

### Criar novo vendedor
```sql
insert into hl_comercial.vendedores (nome, telefone, email, peso_distribuicao)
values ('João Silva', '11999998888', 'joao@hlmodels.com.br', 1);
```

### Ver performance por vendedor
```sql
select * from hl_comercial.v_performance_vendedor;
```

### Ver último sync
```sql
select * from hl_comercial.sync_log order by executado_em desc limit 5;
```

---

## 🚀 Deploy / Setup Local

Ver `README.md` na raiz do projeto.

### Dependências externas
- **Supabase CLI** (opcional, pra deploy via terminal)
- **Google Cloud Console** (pra gerenciar Service Account)
- **Facebook Business Manager** (pra Pixel ID e CAPI token)

---

## 📞 Contatos / Stakeholders

| Papel | Quem | Responsabilidade |
|---|---|---|
| Cliente | HL Models | Define regras de negócio, status de leads |
| Agência | DDG (Dose de Growth) | Desenvolve, mantém, opera painel |
| Dev lead | Lucas Cassiano | — |

---

## 📚 Histórico de Mudanças

| Data | Mudança | Por |
|---|---|---|
| 2026-04-18 | Criação inicial do projeto | Lucas + Claude |
| 2026-04-18 | Schema `hl_comercial` + 6 tabelas + RLS | Claude |
| 2026-04-18 | 3 Edge Functions deployadas | Claude |
| 2026-04-18 | Primeiro sync: 1.079 leads reais importados | Claude |
| 2026-04-18 | Módulo de vendedores + distribuição adicionado | Claude |
| 2026-04-18 | Abas MARIA/EVELIN excluídas (controle antigo) | Lucas |
