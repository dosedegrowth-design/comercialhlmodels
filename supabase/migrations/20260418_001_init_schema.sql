-- ═══════════════════════════════════════════════════════════════════════════
-- Painel Comercial HL Models — Schema inicial
-- ═══════════════════════════════════════════════════════════════════════════

create schema if not exists hl_comercial;

-- ─── ENUMs ─────────────────────────────────────────────────────────────────
do $$ begin
  create type hl_comercial.lead_status as enum (
    'novo',
    'contato_feito',
    'qualificado',
    'agendado',
    'fechado',
    'perdido',
    'sem_interesse'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type hl_comercial.user_role as enum (
    'admin',
    'cliente',
    'comercial',
    'marketing'
  );
exception when duplicate_object then null; end $$;

-- ─── PROFILES (auth bridge) ────────────────────────────────────────────────
create table if not exists hl_comercial.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  nome text,
  avatar_url text,
  role hl_comercial.user_role not null default 'comercial',
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── LEADS (tabela central) ────────────────────────────────────────────────
create table if not exists hl_comercial.leads (
  id uuid primary key default gen_random_uuid(),

  -- Identificadores do Facebook / Sheets
  lead_id_meta text unique,              -- id do lead no Facebook
  form_id text,
  form_nome text,

  -- Campanha
  campanha_id text,
  campanha_nome text,
  adset_id text,
  adset_nome text,
  ad_id text,
  ad_nome text,
  platform text,                          -- facebook | instagram | audience_network
  placement text,

  -- Dados do lead
  nome text,
  telefone text,
  email text,
  dados_extras jsonb default '{}'::jsonb, -- campos customizados do form

  -- Gestão comercial
  status hl_comercial.lead_status not null default 'novo',
  responsavel_id uuid references hl_comercial.profiles(id) on delete set null,
  observacoes text,
  ultimo_contato timestamptz,

  -- Origem no Sheets (para sync reverso)
  origem_sheet_tab text,
  origem_sheet_row integer,

  -- Datas
  lead_criado_em timestamptz,             -- data que o Facebook registrou
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_status_idx on hl_comercial.leads(status);
create index if not exists leads_campanha_idx on hl_comercial.leads(campanha_id);
create index if not exists leads_adset_idx on hl_comercial.leads(adset_id);
create index if not exists leads_responsavel_idx on hl_comercial.leads(responsavel_id);
create index if not exists leads_lead_criado_em_idx on hl_comercial.leads(lead_criado_em desc);
create index if not exists leads_created_at_idx on hl_comercial.leads(created_at desc);
create index if not exists leads_form_idx on hl_comercial.leads(form_id);
create index if not exists leads_search_idx on hl_comercial.leads using gin(
  to_tsvector('portuguese', coalesce(nome, '') || ' ' || coalesce(telefone, '') || ' ' || coalesce(email, ''))
);

-- ─── HISTÓRICO DE STATUS ───────────────────────────────────────────────────
create table if not exists hl_comercial.status_historico (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references hl_comercial.leads(id) on delete cascade,
  status_anterior hl_comercial.lead_status,
  status_novo hl_comercial.lead_status not null,
  alterado_por uuid references hl_comercial.profiles(id) on delete set null,
  observacao text,
  sincronizado_sheets boolean not null default false,
  sincronizado_capi boolean not null default false,
  alterado_em timestamptz not null default now()
);

create index if not exists status_historico_lead_idx on hl_comercial.status_historico(lead_id);
create index if not exists status_historico_data_idx on hl_comercial.status_historico(alterado_em desc);
create index if not exists status_historico_pending_sheets_idx
  on hl_comercial.status_historico(sincronizado_sheets) where sincronizado_sheets = false;

-- ─── CAMPANHAS (cache de metadata) ─────────────────────────────────────────
create table if not exists hl_comercial.campanhas (
  id uuid primary key default gen_random_uuid(),
  campanha_id text unique not null,
  campanha_nome text,
  objetivo text,
  ativa boolean default true,
  gasto_total numeric(12,2),
  impressoes bigint,
  cliques bigint,
  updated_at timestamptz not null default now()
);

-- ─── SYNC LOG ──────────────────────────────────────────────────────────────
create table if not exists hl_comercial.sync_log (
  id uuid primary key default gen_random_uuid(),
  tipo text not null,                     -- sheets_to_db | db_to_sheets | capi
  status text not null,                   -- success | error | partial
  rows_affected integer default 0,
  mensagem text,
  detalhes jsonb,
  executado_em timestamptz not null default now()
);

create index if not exists sync_log_tipo_idx on hl_comercial.sync_log(tipo, executado_em desc);

-- ─── CONFIG (app-wide) ─────────────────────────────────────────────────────
create table if not exists hl_comercial.config (
  id integer primary key default 1,
  google_sheet_id text,
  column_mapping jsonb default '{}'::jsonb,
  facebook_pixel_id text,
  notify_new_lead boolean default true,
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);

insert into hl_comercial.config (id) values (1) on conflict do nothing;

-- ─── TRIGGERS ──────────────────────────────────────────────────────────────
create or replace function hl_comercial.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists leads_set_updated_at on hl_comercial.leads;
create trigger leads_set_updated_at
  before update on hl_comercial.leads
  for each row execute function hl_comercial.set_updated_at();

drop trigger if exists profiles_set_updated_at on hl_comercial.profiles;
create trigger profiles_set_updated_at
  before update on hl_comercial.profiles
  for each row execute function hl_comercial.set_updated_at();

-- Registra histórico automático em mudança de status
create or replace function hl_comercial.log_status_change()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'UPDATE' and new.status is distinct from old.status) then
    insert into hl_comercial.status_historico (
      lead_id, status_anterior, status_novo, alterado_por
    ) values (
      new.id, old.status, new.status, auth.uid()
    );
  end if;
  return new;
end $$;

drop trigger if exists leads_log_status on hl_comercial.leads;
create trigger leads_log_status
  after update on hl_comercial.leads
  for each row execute function hl_comercial.log_status_change();

-- Cria profile automático ao cadastrar usuário
create or replace function hl_comercial.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into hl_comercial.profiles (id, email, nome, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    'comercial'
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function hl_comercial.handle_new_user();

-- ─── RLS POLICIES ──────────────────────────────────────────────────────────
alter table hl_comercial.profiles enable row level security;
alter table hl_comercial.leads enable row level security;
alter table hl_comercial.status_historico enable row level security;
alter table hl_comercial.campanhas enable row level security;
alter table hl_comercial.sync_log enable row level security;
alter table hl_comercial.config enable row level security;

-- profiles
create policy "profiles_self_read" on hl_comercial.profiles
  for select using (auth.uid() = id or exists (
    select 1 from hl_comercial.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

create policy "profiles_self_update" on hl_comercial.profiles
  for update using (auth.uid() = id);

-- leads — todos usuários autenticados podem ver/editar
create policy "leads_read_authenticated" on hl_comercial.leads
  for select using (auth.role() = 'authenticated');

create policy "leads_update_authenticated" on hl_comercial.leads
  for update using (auth.role() = 'authenticated');

create policy "leads_insert_service" on hl_comercial.leads
  for insert with check (auth.role() = 'authenticated' or auth.role() = 'service_role');

-- status_historico
create policy "status_historico_read" on hl_comercial.status_historico
  for select using (auth.role() = 'authenticated');

create policy "status_historico_insert" on hl_comercial.status_historico
  for insert with check (auth.role() = 'authenticated' or auth.role() = 'service_role');

-- campanhas / sync_log / config — somente admin grava, todos leem
create policy "campanhas_read" on hl_comercial.campanhas
  for select using (auth.role() = 'authenticated');

create policy "sync_log_read" on hl_comercial.sync_log
  for select using (auth.role() = 'authenticated');

create policy "config_read" on hl_comercial.config
  for select using (auth.role() = 'authenticated');

create policy "config_admin_update" on hl_comercial.config
  for update using (exists (
    select 1 from hl_comercial.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

-- ─── VIEWS úteis ───────────────────────────────────────────────────────────
create or replace view hl_comercial.v_kpis_overview as
select
  count(*) filter (where status = 'novo') as total_novos,
  count(*) filter (where status = 'contato_feito') as total_contato,
  count(*) filter (where status = 'qualificado') as total_qualificados,
  count(*) filter (where status = 'agendado') as total_agendados,
  count(*) filter (where status = 'fechado') as total_fechados,
  count(*) filter (where status = 'perdido') as total_perdidos,
  count(*) as total_geral,
  round(100.0 * count(*) filter (where status = 'fechado') / nullif(count(*), 0), 2) as taxa_conversao_pct
from hl_comercial.leads;

create or replace view hl_comercial.v_leads_por_campanha as
select
  campanha_id,
  campanha_nome,
  count(*) as total_leads,
  count(*) filter (where status = 'qualificado') as qualificados,
  count(*) filter (where status = 'fechado') as fechados,
  count(*) filter (where status = 'perdido') as perdidos,
  round(100.0 * count(*) filter (where status = 'fechado') / nullif(count(*), 0), 2) as taxa_conversao_pct
from hl_comercial.leads
where campanha_id is not null
group by campanha_id, campanha_nome
order by total_leads desc;

create or replace view hl_comercial.v_leads_por_dia as
select
  date_trunc('day', coalesce(lead_criado_em, created_at))::date as dia,
  count(*) as total,
  count(*) filter (where status = 'fechado') as fechados
from hl_comercial.leads
group by 1
order by 1 desc;
