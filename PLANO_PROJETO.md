# 📊 Painel Comercial — HL Models

> Dashboard de gestão comercial + marketing para campanhas de Lead Ads do Facebook, com sincronização bidirecional com Google Sheets e atualização de eventos no Pixel/CAPI do Facebook.

---

## 🎯 Objetivo

Criar um painel administrativo web que:
1. **Centraliza** todos os leads vindos de formulários do Facebook (via Google Sheets)
2. **Gerencia** status comercial dos leads (Kanban + Lista)
3. **Sincroniza** mudanças de status de volta para o Sheets (que alimenta Pixel/CAPI)
4. **Analisa** performance por campanha, grupo de anúncios e anúncio
5. **Exporta** base filtrada (CSV/Excel) para o cliente

---

## 👥 Perfis de Usuário

| Perfil | O que vê / faz |
|---|---|
| **Comercial** | Kanban de leads, busca, mudança de status, contato |
| **Marketing** | Dashboards de performance de campanhas, KPIs, gráficos |
| **Cliente (HL)** | Visão geral + export da base filtrada |
| **Admin (DDG)** | Tudo + configurações de integração |

---

## 🏗️ Arquitetura

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│  Facebook Ads   │─────▶│  Google Sheets   │◀────▶│    Supabase     │
│   Lead Forms    │      │  (1 aba/form)    │ sync │  (source truth) │
└─────────────────┘      └──────────────────┘      └────────┬────────┘
                                  ▲                          │
                                  │ atualiza status          │
                                  │                          ▼
                         ┌────────┴─────────┐       ┌─────────────────┐
                         │  Facebook Pixel  │       │   Next.js App   │
                         │      / CAPI      │       │   (Vercel)      │
                         └──────────────────┘       └─────────────────┘
```

### Fluxo de dados
1. **Lead chega**: Facebook → Google Sheets (integração nativa já existente)
2. **Sync periódico** (a cada 5min): Edge Function lê Sheets → grava no Supabase (append-only, upsert por ID único)
3. **Usuário altera status** no dashboard: Supabase → Edge Function → Google Sheets (coluna `status`)
4. **Sheets atualizado** dispara evento no Pixel/CAPI (integração existente) OU nossa Edge Function chama CAPI direto

---

## 💻 Stack Técnico

| Camada | Tecnologia |
|---|---|
| **Frontend** | Next.js 14 (App Router) + TypeScript |
| **UI** | Tailwind CSS + shadcn/ui + Recharts + Lucide Icons |
| **Backend** | Supabase (PostgreSQL + Auth + Edge Functions + Realtime) |
| **Sync** | Google Sheets API v4 + Service Account |
| **Integração Facebook** | Conversions API (CAPI) via Edge Function |
| **Hospedagem** | Vercel (frontend) + Supabase (backend) |
| **Versionamento** | GitHub (repo a ser criado) |

---

## 🗄️ Modelo de Dados (Supabase)

### Schema: `hl_comercial`

#### `leads`
```sql
id                uuid PRIMARY KEY
lead_id_meta      text UNIQUE         -- ID do lead no Facebook
form_id           text                -- ID do formulário
form_nome         text                -- nome da aba/form no Sheets
campanha_id       text
campanha_nome     text
adset_id          text
adset_nome        text
ad_id             text
ad_nome           text
nome              text
telefone          text
email             text
dados_extras      jsonb               -- campos customizados do form
status            text                -- enum: novo, contato_feito, qualificado, agendado, fechado, perdido, sem_interesse
origem_sheet_row  integer             -- linha na planilha (pra sync reverso)
origem_sheet_tab  text                -- aba de origem
created_at        timestamptz
lead_criado_em    timestamptz         -- data do Facebook
ultimo_contato    timestamptz
responsavel_id    uuid                -- FK user
observacoes       text
```

#### `status_historico`
```sql
id              uuid PRIMARY KEY
lead_id         uuid FK leads
status_anterior text
status_novo     text
alterado_por    uuid FK user
alterado_em     timestamptz
sincronizado    boolean               -- se já foi pro Sheets
```

#### `campanhas` (cache de metadata)
```sql
id, campanha_id, nome, adset_id, ad_id, ativa, updated_at
```

#### `sync_log`
```sql
id, tipo (sheets_to_db | db_to_sheets | capi), status, rows_affected, erro, executado_em
```

---

## 🎨 Telas / Features

### 1. **Login** (`/login`)
- Auth Supabase (email/senha + Google OAuth)
- Roles: `admin` | `cliente` | `comercial` | `marketing`

### 2. **Dashboard Home** (`/`)
Cards de KPIs + gráficos principais:
- Total de leads (dia/semana/mês/personalizado)
- Distribuição por status (donut)
- Leads por dia (line chart últimos 30d)
- Top 5 campanhas (bar chart)
- Taxa de conversão geral (%)
- Filtro global de data no topo

### 3. **Board Comercial** (`/board`) ⭐ principal
- **Visão Kanban**: colunas por status, cards draggable
- **Visão Lista**: tabela paginada com ordenação/filtros
- Filtros: data, campanha, adset, responsável, busca (nome/tel/email)
- **Ações por card**:
  - Ver detalhes (drawer lateral)
  - Mudar status (drag & drop ou select)
  - Adicionar observação
  - Marcar último contato
  - Link direto WhatsApp
- **Toggle Kanban ↔ Lista** no topo
- **Botão Export**: CSV/Excel da base filtrada atual

### 4. **Detalhe do Lead** (`/lead/[id]`)
- Todas as informações do lead
- Histórico de status (timeline)
- Campo de observações
- Dados da campanha de origem (link pro Business Manager)
- Botões: WhatsApp, Ligar, Email

### 5. **Analytics Marketing** (`/analytics`)
- **Por Campanha**: leads, conversões, taxa, custo/lead (se tiver gasto)
- **Por Adset**: mesma visão, agrupado
- **Por Anúncio**: ranking
- **Funil de conversão**: visual por status
- **Cohort de conversão**: dias entre Novo → Fechado
- **Mapa de horário**: heatmap quando mais leads chegam
- **Comparativo de períodos**: semana atual vs anterior

### 6. **Export** (`/export`)
- Filtro avançado
- Seleção de colunas
- Formato: CSV, Excel
- Download direto ou envio por email

### 7. **Configurações** (`/admin`) — apenas admin
- Gerenciar usuários
- Configurar Service Account Google
- Configurar Pixel ID / CAPI Token
- Mapeamento de colunas do Sheets
- Status de última sync
- Logs de erro

---

## 🔄 Sincronização Sheets ↔ Supabase

### Edge Function: `sync-sheets-to-db` (cron 5min)
1. Lê Service Account → Google Sheets API
2. Lista todas as abas
3. Para cada aba:
   - Detecta colunas padrão (nome, tel, email, campaign_name...)
   - Upsert por `lead_id_meta` na tabela `leads`
4. Grava log em `sync_log`

### Edge Function: `sync-db-to-sheets` (trigger em UPDATE status)
1. Trigger Postgres quando `leads.status` muda
2. Chama Edge Function com `lead_id`
3. Edge Function atualiza célula específica no Sheets via `origem_sheet_row` + `origem_sheet_tab`
4. Opcionalmente: dispara CAPI com o novo evento (ex: Lead Qualified, Purchase)

### Edge Function: `send-capi-event` (opcional, se quisermos controlar)
- Envia evento para Conversions API do Facebook
- Eventos: `Lead`, `CompleteRegistration` (qualificado), `Purchase` (fechado)

---

## 📋 Status dos Leads (proposta — aguardando validação)

| Status | Descrição | Evento CAPI |
|---|---|---|
| `novo` | Lead acabou de chegar do Facebook | `Lead` |
| `contato_feito` | Vendedor fez primeiro contato | `CustomEvent: ContatoFeito` |
| `qualificado` | Lead tem perfil/interesse real | `CompleteRegistration` |
| `agendado` | Visita/reunião marcada | `Schedule` |
| `fechado` | Venda/conversão realizada | `Purchase` |
| `perdido` | Não converteu | — |
| `sem_interesse` | Lead rejeitou produto | — |

---

## 🚀 Cronograma de Entregas

### **Fase 1 — Setup & Fundação** (entrega 1)
- [ ] Pasta + estrutura Next.js + shadcn/ui configurados
- [ ] Supabase: schema + tabelas + RLS policies
- [ ] Auth funcionando (login/logout + proteção de rotas)
- [ ] Layout base + sidebar + tema claro/escuro
- [ ] Deploy inicial na Vercel

### **Fase 2 — Sincronização de Dados** (entrega 2)
- [ ] Service Account Google configurada
- [ ] Edge Function `sync-sheets-to-db` rodando em cron
- [ ] Mapeamento dinâmico de colunas (detecta padrão Facebook)
- [ ] Dados reais aparecendo no Supabase
- [ ] Logs de sync visíveis

### **Fase 3 — Board Comercial** (entrega 3) ⭐
- [ ] Listagem de leads (tabela + Kanban)
- [ ] Filtros: data, campanha, status, busca
- [ ] Drawer de detalhes
- [ ] Mudança de status (UI)
- [ ] Edge Function `sync-db-to-sheets` (status volta pro Sheets)
- [ ] Histórico de status
- [ ] Export CSV/Excel

### **Fase 4 — Analytics & Marketing** (entrega 4)
- [ ] Dashboard Home com KPIs
- [ ] Gráficos (Recharts): donut, line, bar, funil
- [ ] Analytics por campanha/adset/anúncio
- [ ] Comparativo de períodos
- [ ] Heatmap de horários

### **Fase 5 — CAPI + Polimento** (entrega 5)
- [ ] Integração Conversions API (se necessário)
- [ ] Notificações/alertas de novos leads
- [ ] Página de configurações admin
- [ ] Documentação de uso para o cliente
- [ ] Ajustes finais de UX

---

## ❓ Definições Pendentes (preciso de você)

- [ ] **Acesso Google Sheets**: Service Account email (a gerar) precisa ser compartilhado com permissão de edição na planilha
- [ ] **Status finais**: validar lista de status acima
- [ ] **Integração Pixel existente**: como funciona hoje? (Zapier, n8n, script?)
- [ ] **Supabase**: usa o projeto DDG existente (`hkjukobqpjezhpxzplpj`) em schema novo `hl_comercial`, ou cria novo projeto?
- [ ] **Repositório GitHub**: nome do repo + organização
- [ ] **Domínio**: `painel.hlmodels.com.br`? Subdomínio custom?
- [ ] **Facebook BM**: Pixel ID + Access Token CAPI (quando for integrar)
- [ ] **Usuários iniciais**: emails do cliente + equipe comercial/marketing

---

## 📁 Estrutura de Pastas (inicial)

```
painel-comercial-hl-models/
├── app/
│   ├── (auth)/login/
│   ├── (dashboard)/
│   │   ├── page.tsx              # Home
│   │   ├── board/
│   │   ├── lead/[id]/
│   │   ├── analytics/
│   │   ├── export/
│   │   └── admin/
│   └── api/
├── components/
│   ├── ui/                       # shadcn
│   ├── charts/
│   ├── kanban/
│   └── filters/
├── lib/
│   ├── supabase/
│   ├── google-sheets/
│   └── facebook-capi/
├── supabase/
│   ├── migrations/
│   └── functions/
│       ├── sync-sheets-to-db/
│       ├── sync-db-to-sheets/
│       └── send-capi-event/
├── types/
├── PLANO_PROJETO.md
├── README.md
└── package.json
```

---

## 🎯 Próximos Passos (ordem)

1. ✅ Você valida este plano + responde definições pendentes
2. ⏳ Eu monto estrutura Next.js + Supabase local (sem GitHub/Vercel ainda)
3. ⏳ Você libera acesso à planilha + Supabase credentials
4. ⏳ Eu executo Fase 1 (setup + auth + layout)
5. ⏳ Você revisa e aprova → segue pra Fase 2
6. ⏳ Ao final de tudo pronto e testado local: você libera GitHub + Vercel → deploy

---

**Versão**: 1.0
**Data**: 2026-04-18
**Autor**: Claude (via DDG)
