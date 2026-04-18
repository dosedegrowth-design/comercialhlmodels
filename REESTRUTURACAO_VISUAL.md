# 🎨 Plano de Reestruturação Visual — v2

> Baseado nas referências: QCommerz, Donezo, Codomo, Openrent
> **Objetivo**: elevar o painel a nível de produto SaaS premium

---

## 🌈 Diretrizes gerais

### Paleta refinada
- **Tema claro** vira o **default** (referências são todas light — mais profissional pra cliente B2B)
- Mantém **tema dark** disponível (toggle no header)
- **Purple/pink** continua sendo o accent brand, mas **usado com parcimônia** (botões CTA, ícones ativos, header do Kanban)
- **Base neutra**: brancos e cinzas muito claros (stone/zinc) no tema claro
- **Bordas sutis** (0.5px) + **shadows suaves** em vez de glow forte no tema claro

### Tipografia
- **Títulos maiores e mais bold** (ex: "Dashboard" 32px semibold, como Donezo)
- **Subtítulo descritivo** menor abaixo ("Plan, prioritize, and accomplish...")
- Labels em **uppercase tracking-wider** mantém consistência

### Espaçamento
- **Mais respiro** entre elementos (padding de 20-24px nos cards)
- **Grid mais arejado** no desktop
- **Cards com borda super sutil** (rgba(0,0,0,0.06)) em vez de borda sólida

---

## 🏠 Home Dashboard — Redesign

### Hero / Header da página
```
┌─────────────────────────────────────────────────────┐
│  Dashboard                    [Distribuir] [Export] │
│  Acompanhe seus leads em tempo real.                │
└─────────────────────────────────────────────────────┘
```

### KPI Cards (nova estrutura — estilo Donezo + QCommerz)

**Card destacado** (primeiro, colorido com gradient brand):
```
┌──────────────────┐
│ Leads Captados ↗ │
│                  │
│ 1.079            │
│ ↑ 12% vs mês ant.│
└──────────────────┘
```

**Cards secundários** (brancos com sparkline mini):
```
┌──────────────────┐
│ Novos         ↗  │
│                  │
│ 1.072            │
│ ▁▂▅▃▇▄▅ (mini)   │
└──────────────────┘
```

**6 cards na horizontal** em telas grandes (hoje são 6 mas quadrados). Mudar pra **retangulares com sparkline** de 7 dias.

### Revenue-style chart (substitui "Leads por dia" atual)
- Line chart grande no estilo QCommerz
- Dropdown "This Year / This Month / This Week" no canto direito
- Tooltip customizado com hover no ponto
- Gradient fill sob a linha (purple → transparente)

### Reminders / Próximas ações (novo bloco, inspirado Donezo)
```
┌───────────────────────────┐
│ Próximos leads             │
│                            │
│ [avatar] Carlos Silva      │
│          Qualificado       │
│          ⏰ há 2h           │
│                            │
│ [Ver todos no Board →]    │
└───────────────────────────┘
```

### Team Collaboration → **Performance Vendedores** inline (estilo Donezo)
```
Performance Vendedores    [+ Distribuir]
┌─────────────────────────────────────────┐
│ [AV] Ana Vieira                  ✓ Top │
│      Working on 45 leads ativos         │
│                                          │
│ [CR] Carlos Ramos              🟡 Bom   │
│      Working on 32 leads ativos         │
└─────────────────────────────────────────┘
```

### Project Progress → **Funil de Conversão gauge** (estilo Donezo)
Substituir o Donut atual por **gauge arc** grande no centro com percentual.

---

## 📋 Board Comercial — Redesign (MAIOR MUDANÇA)

### Novo card do Lead (padrão Openrent + Codomo)

**Antes** (simples):
```
┌────────────────┐
│ [A] Nome       │
│     Telefone   │
│ Campanha       │
│ ⏰ há 2h        │
└────────────────┘
```

**Depois** (rico — como Openrent):
```
┌──────────────────────────────────┐
│ [CG]          🟢 Going Cold      │ ← avatar colorido + badge de "heat"
│                                  │
│ Cameron Gilson                   │ ← nome forte
│ Today 9:23 AM                    │ ← data amigável
│                                  │
│ 📞 (702) 566-5172                │ ← ícones + valor
│ ✉️ cameron@email.com             │
│ 🌐 Apartments.com                │ ← origem (campanha/formulário)
│                                  │
│ [💬] [🔗] [👤 Vendedor]          │ ← ações rápidas no rodapé
└──────────────────────────────────┘
```

**Elementos adicionais**:
- **Badge de "heat"** no topo direito:
  - 🔵 **Novo** (azul) — acabou de chegar
  - 🟢 **Fast Response** (verde) — respondido em < 1h
  - 🟡 **Need Follow Up** (amarelo) — há 1-3 dias sem contato
  - 🔴 **Going Cold** (vermelho) — > 3 dias sem ação
  - ⚫ **Need Contact Details** (neutro) — sem tel/email
- **Avatar colorido por status** (mantém paleta gradient)
- **Fonte visual** (ícone do formulário: "Mulheres Maduras 02", "Kids"...)
- **Vendedor atribuído** no rodapé (se tiver): pequeno avatar + nome

### Header da coluna (estilo Codomo)
```
● Novo  [48]                    +
```
- Ponto colorido + nome + contador em pill + botão "+" para adicionar manual

### Toggle de visualização (estilo Codomo)
```
[Board] [To-do] [Table] [List]      🔍 Search anything...    [▼ Filter]
```
Substitui o toggle atual Kanban/Lista por 4 opções + busca inline + botão filtro.

### Mini-progresso no card (estilo Codomo)
- Indicador circular no canto do card mostrando **"tempo no status"** (0%, 50%, 100% antes de ficar frio)
- Ex: card em `novo` há 1h mostra 10%, há 6h mostra 50%, há 24h mostra 100% (cold)

---

## 🧭 Sidebar — Ajustes

### Agrupamento (estilo QCommerz + Codomo)
```
MENU
  ▪ Dashboard
  ▪ Board Comercial
  ▪ Analytics
  ▪ Vendedores

PROJETOS (abas do Sheets)
  ● MULHERES MADURAS  [560]
  ● MULHERES MADURAS 02  [512]
  ● KIDS  [6]
  [+ Nova aba via Sheets]

GERAL
  ▪ Exportar
  ▪ Configurações
  ▪ Ajuda
```

Cada formulário/aba do Sheets vira **filtro rápido** no sidebar (clica → filtra Board). Muito útil porque cada aba = 1 campanha diferente.

### Footer com usuário (estilo Donezo)
```
┌─────────────────┐
│ [avatar] Lucas  │
│   admin         │
│   ⚙ Logout      │
└─────────────────┘
```

---

## 🎯 Componentes novos necessários

| Componente | Uso |
|---|---|
| `StatusHeatBadge` | Badge de "heat" (Fast/Need Follow/Going Cold) baseado em tempo |
| `Sparkline` | Mini chart inline nos KPIs |
| `Gauge` | Arco de progresso pra taxa de conversão |
| `LeadCardRich` | Novo card do Kanban com todas as infos |
| `ProjectSidebarGroup` | Grupo de abas do Sheets no sidebar |
| `ViewTabs` | Toggle Board/Table/List/Kanban |
| `UserFooterCard` | Card do usuário no rodapé da sidebar |

---

## 📊 Analytics (ainda não construída) — Plano

Novo layout com 3 blocos principais:
1. **Performance por campanha** (tabela estilo Openrent com barras)
2. **Evolução temporal** (line chart com comparação período anterior)
3. **Top insights automáticos** (cards gerados: "Campanha X converteu 3x mais que a média", "Formulário Y está 2 dias sem leads novos")

---

## 🚀 Ordem de implementação

### Fase 1 — Visual (prioridade alta)
1. ✅ Aplicar tema claro como default (manter dark como opção)
2. ✅ Refazer **LeadCardRich** com todas as infos (Openrent-style) + heat badge
3. ✅ Header das colunas do Kanban com contador em pill (Codomo-style)
4. ✅ KPI cards com sparkline + card destacado no primeiro
5. ✅ Sidebar com agrupamento (Menu / Projetos / Geral) + formulários como filtros rápidos

### Fase 2 — Novos componentes
6. ✅ Sparkline component (Recharts mini)
7. ✅ StatusHeatBadge (calcula heat do lead baseado em tempo/atividade)
8. ✅ Gauge de conversão
9. ✅ Reminders (próximos leads a contactar) na Home

### Fase 3 — Ajustes finos
10. ✅ Tipografia maior nos headers
11. ✅ Espaçamento mais arejado
12. ✅ Shadows mais suaves no tema claro
13. ✅ Micro-animações preservadas

---

## 🎨 Decisões de design

| Decisão | Justificativa |
|---|---|
| **Tema claro default** | Todas as refs B2B são light. Transmite profissionalismo + melhor pra print/export |
| **Heat badge no card** | Cliente consegue ver **imediatamente** quais leads estão esfriando |
| **Ícone da fonte (formulário)** | Diferencia origem sem precisar ler texto |
| **Vendedor atribuído no card** | Visibilidade imediata de quem é responsável |
| **Sidebar com abas do Sheets** | Navegação rápida entre formulários (cada um = 1 campanha real) |
| **Sparkline nos KPIs** | Contextualiza o número (crescendo? caindo?) |

---

**Versão**: 2.0
**Data**: 2026-04-18
**Status**: ⏳ Aguardando aprovação do Lucas
