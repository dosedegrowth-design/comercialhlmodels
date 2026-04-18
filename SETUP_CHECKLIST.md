# ✅ Checklist de Setup — Painel Comercial HL Models

> Itens que o Lucas precisa destravar para o projeto avançar

---

## 🔴 Bloqueadores da Fase 2 (Sync de dados)

### Google Sheets
- [ ] Seguir `TUTORIAL_GOOGLE_SHEETS.md` passo-a-passo
- [ ] Compartilhar planilha com email da Service Account (permissão **Editor**)
- [ ] Me enviar `client_email` + `private_key` do JSON

### Supabase ✅
- [x] Projeto HL Models (`hsiwtgzixratjuigjxyj`) escolhido
- [x] Schema `hl_comercial` criado + 6 tabelas + RLS + triggers + views
- [x] URL + Anon Key já no `.env.local.template`
- [ ] Copiar `SUPABASE_SERVICE_ROLE_KEY` do Dashboard → Settings → API
- [ ] Criar primeiro usuário admin no Auth

---

## 🟡 Bloqueadores da Fase 3 (Board Comercial)

- [ ] Validar lista final de status dos leads:
  - `novo` → `contato_feito` → `qualificado` → `agendado` → `fechado`
  - Alternativos: `perdido`, `sem_interesse`
- [ ] Definir coluna no Sheets onde o status vai ser gravado (nome da coluna)
- [ ] Listar equipe comercial (emails) para criar usuários

---

## 🟢 Bloqueadores da Fase 5 (CAPI + Deploy)

### Facebook Conversions API
- [ ] Como funciona a integração Pixel/CAPI hoje? (Zapier? Nativo?)
- [ ] Se for nova: obter no Business Manager do cliente HL Models:
  - Pixel ID
  - Access Token da Conversions API
  - (opcional) Test Event Code para validação

### Deploy
- [ ] Criar repositório GitHub (nome sugerido: `painel-comercial-hl-models`)
- [ ] Criar projeto Vercel vinculado ao repo
- [ ] Domínio: subdomínio no `hlmodels.com.br` ou Vercel padrão?
  - Sugestão: `painel.hlmodels.com.br`

---

## 📋 Informações do Cliente

- [ ] Nome do contato principal HL Models
- [ ] Email(s) que vão ter acesso ao painel
- [ ] Papel de cada usuário:
  - Admin (DDG)
  - Cliente (HL)
  - Comercial (HL) — equipe que opera os leads
  - Marketing (HL) — quem analisa campanhas

---

## 🎯 Próximos Passos Imediatos

1. Lucas revisa o plano + estrutura de arquivos criada
2. Lucas destrava acesso à planilha + decide projeto Supabase
3. Claude roda `npm install` + migration SQL
4. Claude testa sync inicial com dados reais
5. Aprovação → Fase 3 (Board Comercial)
