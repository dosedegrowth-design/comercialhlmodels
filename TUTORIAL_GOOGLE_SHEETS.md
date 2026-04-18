# 📘 Tutorial — Service Account Google + Compartilhamento da Planilha

> Passo-a-passo para gerar as credenciais que permitirão o painel ler/escrever na planilha da HL Models.
>
> Tempo estimado: **10 minutos**

---

## 🎯 O que é uma Service Account?

É uma "conta de robô" do Google — com um email próprio (ex: `painel-hl@projeto.iam.gserviceaccount.com`) que o nosso servidor usa para acessar a planilha em seu nome (ou em nome da HL Models). Em vez de usar sua conta pessoal com senha, o robô usa uma **chave privada (JSON)** para autenticar.

---

## 📝 Parte 1 — Criar projeto no Google Cloud (se ainda não tem)

1. Abra https://console.cloud.google.com
2. No topo, clique no **seletor de projeto** (fica ao lado do logo do Google Cloud)
3. Clique em **"New Project"** (Novo Projeto)
4. Nome do projeto: `painel-hl-models`
5. Organização: deixa padrão (ou "No organization")
6. Clique em **Create**
7. Aguarde alguns segundos e selecione esse projeto no seletor

> Se você já tem um projeto DDG ativo, pode usar ele em vez de criar um novo.

---

## 📝 Parte 2 — Ativar a API do Google Sheets

1. Com o projeto selecionado, vá em: **APIs & Services → Library**
   (ou acesse: https://console.cloud.google.com/apis/library)
2. Na barra de busca digite: **Google Sheets API**
3. Clique no resultado **Google Sheets API**
4. Clique no botão azul **Enable** (Ativar)

Aguarde ~5 segundos e a API estará ativada.

---

## 📝 Parte 3 — Criar a Service Account

1. Vá em: **IAM & Admin → Service Accounts**
   (ou acesse: https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Clique em **+ Create Service Account** no topo
3. Preencha:
   - **Service account name**: `painel-hl-sheets`
   - **Service account ID**: será preenchido automaticamente (algo como `painel-hl-sheets`)
   - **Description**: `Sincronização de leads do Painel Comercial HL`
4. Clique em **Create and Continue**
5. Na tela de "Grant this service account access to project":
   - Deixe **em branco** (não precisa de role no GCP)
6. Clique em **Continue** → **Done**

Você verá a Service Account criada na lista. **Copie o email dela** — vai parecer com:
```
painel-hl-sheets@painel-hl-models.iam.gserviceaccount.com
```

---

## 📝 Parte 4 — Gerar a chave privada (JSON)

1. Na lista de Service Accounts, **clique no email** da que você acabou de criar
2. Vá na aba **Keys** (Chaves) no topo
3. Clique em **Add Key → Create new key**
4. Selecione **JSON** e clique em **Create**
5. O arquivo JSON será baixado automaticamente para o seu computador
   - Nome: algo como `painel-hl-models-abc123.json`

⚠️ **IMPORTANTE**:
- Esse arquivo é **secreto** — nunca suba pro GitHub, nunca compartilhe
- Guarde em lugar seguro (1Password, Bitwarden, ou no `~/Downloads` só enquanto usa)
- Se perder, basta gerar outra chave (pode ter várias)

---

## 📝 Parte 5 — Compartilhar a planilha com a Service Account

Esse é o passo que MUITA gente esquece! A Service Account existe, mas ela ainda não tem permissão para ver a planilha.

1. Abra a planilha:
   https://docs.google.com/spreadsheets/d/1rR3k_gq9r_Lq0BR55A0QTYIDQDUlCnrkbITLOe8XeJQ/edit

2. Clique no botão verde **Compartilhar** (canto superior direito)

3. No campo "Adicionar pessoas e grupos", cole o **email da Service Account**:
   ```
   painel-hl-sheets@painel-hl-models.iam.gserviceaccount.com
   ```

4. Selecione o papel: **Editor** (precisa ser editor, não só viewer, porque vamos escrever o status de volta)

5. **DESMARQUE** a opção "Notificar pessoas" (a Service Account não tem inbox)

6. Clique em **Compartilhar**

Pronto! Agora nosso robô pode ler e escrever na planilha.

---

## 📝 Parte 6 — Me enviar as credenciais

Abra o arquivo JSON que baixou no **Parte 4**. Ele vai ter esse formato:

```json
{
  "type": "service_account",
  "project_id": "painel-hl-models",
  "private_key_id": "abc...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANB...\n-----END PRIVATE KEY-----\n",
  "client_email": "painel-hl-sheets@painel-hl-models.iam.gserviceaccount.com",
  "client_id": "123456...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

Me manda (em chat seguro, nunca por email aberto) os **dois campos**:

1. **`client_email`** — o email da Service Account
2. **`private_key`** — a chave inteira (com `-----BEGIN PRIVATE KEY-----` no início e `-----END PRIVATE KEY-----\n` no final, incluindo os `\n`)

> Alternativa: você mesmo pode me passar o conteúdo do arquivo `.json` completo — eu extraio o que preciso.

---

## ✅ Checklist final

- [ ] Projeto Google Cloud criado
- [ ] Google Sheets API ativada
- [ ] Service Account criada
- [ ] Chave JSON baixada e guardada em local seguro
- [ ] Planilha compartilhada com o email da SA como **Editor**
- [ ] Credenciais enviadas pro Lucas/Claude

---

## 🔧 O que vai acontecer depois

Com as credenciais em mãos, vou:

1. Guardar o `client_email` + `private_key` nos **secrets do Supabase** (nunca no código público)
2. Fazer deploy da Edge Function `sync-sheets-to-db`
3. Rodar um **primeiro sync manual** pra você ver os leads aparecendo no Supabase
4. Configurar o **cron a cada 5 minutos** pra sync automático
5. Partir pra Fase 3 — Board Comercial

---

## ❓ Dúvidas Frequentes

**"Se eu perder o arquivo JSON, perco o acesso?"**
Não — basta gerar uma nova chave na aba Keys da Service Account. Você pode ter várias chaves ativas.

**"Quanto custa?"**
Google Cloud Free Tier cobre Google Sheets API tranquilamente — zero custo na nossa escala.

**"A Service Account pode ver outras planilhas minhas?"**
Só as que você compartilhou explicitamente com o email dela. Todas as outras continuam privadas.

**"Consigo revogar o acesso depois?"**
Sim, 2 jeitos:
- Tirar o email dela da planilha (Compartilhar → remover)
- Deletar a Service Account no GCP

**"Preciso fazer isso na conta do cliente (HL Models) ou na minha (DDG)?"**
Tanto faz tecnicamente. Recomendo criar na conta DDG porque:
- Você controla o ciclo de vida da credencial
- Se o cliente revogar acesso à conta dele, o painel não quebra
- Mais fácil de manter
