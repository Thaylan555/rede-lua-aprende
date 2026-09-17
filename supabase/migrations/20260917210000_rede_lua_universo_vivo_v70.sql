-- Rede Lua v7.0 — Universo Vivo
-- Administração, anúncios, feature flags, segredos e moderação operacional.

create table if not exists public.rede_lua_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('super_admin','admin','moderator')),
  created_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.rede_lua_admins enable row level security;
drop policy if exists rede_lua_admins_own_select on public.rede_lua_admins;
create policy rede_lua_admins_own_select on public.rede_lua_admins
  for select to authenticated using (user_id = (select auth.uid()));

alter table public.rede_lua_profiles
  add column if not exists account_status text not null default 'active',
  add column if not exists suspension_reason text not null default '';

do $$ begin
  alter table public.rede_lua_profiles
    add constraint rede_lua_profiles_account_status_check
    check (account_status in ('active','suspended'));
exception when duplicate_object then null; end $$;

create or replace function public.rede_lua_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists(
    select 1 from public.rede_lua_admins a
    where a.user_id = (select auth.uid())
  );
$$;

create or replace function public.rede_lua_is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists(
    select 1 from public.rede_lua_admins a
    where a.user_id = (select auth.uid()) and a.role = 'super_admin'
  );
$$;

revoke all on function public.rede_lua_is_admin() from public, anon;
revoke all on function public.rede_lua_is_super_admin() from public, anon;
grant execute on function public.rede_lua_is_admin() to authenticated, service_role;
grant execute on function public.rede_lua_is_super_admin() to authenticated, service_role;

-- Bootstrap seguro: o e-mail serve apenas para vincular o primeiro super admin.
-- A autorização do app passa a depender de user_id + tabela de admins.
insert into public.rede_lua_admins(user_id, role)
select u.id, 'super_admin'
from auth.users u
where lower(u.email) = lower('lukycristal02@gmail.com')
on conflict(user_id) do update set role = 'super_admin';

update public.rede_lua_profiles p
set role = 'admin', updated_at = now()
from auth.users u
where p.user_id = u.id and lower(u.email) = lower('lukycristal02@gmail.com');

create or replace function public.rede_lua_bootstrap_admin_profile()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_email text;
begin
  select email into v_email from auth.users where id = new.user_id;
  if lower(coalesce(v_email,'')) = lower('lukycristal02@gmail.com') then
    insert into public.rede_lua_admins(user_id, role)
    values(new.user_id, 'super_admin')
    on conflict(user_id) do update set role='super_admin';
    new.role := 'admin';
  end if;
  return new;
end;
$$;

drop trigger if exists rede_lua_bootstrap_admin_profile on public.rede_lua_profiles;
create trigger rede_lua_bootstrap_admin_profile
before insert or update of role on public.rede_lua_profiles
for each row execute function public.rede_lua_bootstrap_admin_profile();

create table if not exists public.rede_lua_announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 100),
  body text not null default '' check (char_length(body) <= 600),
  audience text not null default 'all' check (audience in ('all','students','teachers')),
  style text not null default 'info' check (style in ('info','success','warning','event')),
  active boolean not null default true,
  starts_at timestamptz not null default now(),
  ends_at timestamptz null,
  created_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.rede_lua_announcements enable row level security;
drop policy if exists rede_lua_announcements_active_select on public.rede_lua_announcements;
create policy rede_lua_announcements_active_select on public.rede_lua_announcements
  for select to anon, authenticated
  using (active = true and starts_at <= now() and (ends_at is null or ends_at > now()));

create table if not exists public.rede_lua_feature_flags (
  key text primary key check (key ~ '^[a-z0-9_\-]{2,80}$'),
  enabled boolean not null default false,
  description text not null default '',
  config jsonb not null default '{}'::jsonb,
  updated_by uuid null references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);
alter table public.rede_lua_feature_flags enable row level security;
drop policy if exists rede_lua_feature_flags_public_select on public.rede_lua_feature_flags;
create policy rede_lua_feature_flags_public_select on public.rede_lua_feature_flags
  for select to anon, authenticated using (enabled = true);

insert into public.rede_lua_feature_flags(key,enabled,description,config) values
  ('lumi_moments',true,'Lumi pode aparecer em momentos divertidos da interface.','{"chance":0.28}'::jsonb),
  ('eclipse_mode',true,'Segredo visual ativado por interação com a lua.','{}'::jsonb),
  ('secret_stars',true,'Fragmentos lunares escondidos em algumas telas.','{"goal":5}'::jsonb),
  ('seasonal_effects',false,'Decoração sazonal opcional.','{}'::jsonb)
on conflict(key) do nothing;

create table if not exists public.rede_lua_admin_audit (
  id bigint generated always as identity primary key,
  admin_id uuid not null references auth.users(id) on delete restrict,
  action text not null,
  target_type text not null default '',
  target_id text not null default '',
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.rede_lua_admin_audit enable row level security;
drop policy if exists rede_lua_admin_audit_admin_select on public.rede_lua_admin_audit;
create policy rede_lua_admin_audit_admin_select on public.rede_lua_admin_audit
  for select to authenticated using ((select public.rede_lua_is_admin()));

create table if not exists public.rede_lua_secret_unlocks (
  user_id uuid not null references auth.users(id) on delete cascade,
  secret_id text not null,
  unlocked_at timestamptz not null default now(),
  primary key(user_id, secret_id)
);
alter table public.rede_lua_secret_unlocks enable row level security;
drop policy if exists rede_lua_secret_unlocks_own_select on public.rede_lua_secret_unlocks;
create policy rede_lua_secret_unlocks_own_select on public.rede_lua_secret_unlocks
  for select to authenticated using (user_id = (select auth.uid()));

create or replace function public.rede_lua_admin_log(p_action text, p_target_type text default '', p_target_id text default '', p_details jsonb default '{}'::jsonb)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_uid uuid := (select auth.uid());
begin
  if v_uid is null or not public.rede_lua_is_admin() then raise exception 'ADMIN_REQUIRED'; end if;
  insert into public.rede_lua_admin_audit(admin_id,action,target_type,target_id,details)
  values(v_uid,left(coalesce(p_action,''),120),left(coalesce(p_target_type,''),80),left(coalesce(p_target_id,''),160),coalesce(p_details,'{}'::jsonb));
end;
$$;
revoke all on function public.rede_lua_admin_log(text,text,text,jsonb) from public, anon;
grant execute on function public.rede_lua_admin_log(text,text,text,jsonb) to authenticated, service_role;

create or replace function public.rede_lua_admin_dashboard()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := (select auth.uid());
  v_result jsonb;
begin
  if v_uid is null or not public.rede_lua_is_admin() then raise exception 'ADMIN_REQUIRED'; end if;
  select jsonb_build_object(
    'users', (select count(*) from public.rede_lua_profiles),
    'students', (select count(*) from public.rede_lua_profiles where role='student'),
    'teachers', (select count(*) from public.rede_lua_profiles where role='teacher'),
    'admins', (select count(*) from public.rede_lua_admins),
    'suspended', (select count(*) from public.rede_lua_profiles where account_status='suspended'),
    'activities', (select count(*) from public.rede_lua_activities where status<>'archived'),
    'gamesToday', (select count(*) from public.rede_lua_games where created_at >= date_trunc('day',now())),
    'answersToday', (select count(*) from public.rede_lua_answers where answered_at >= date_trunc('day',now())),
    'activeAnnouncements', (select count(*) from public.rede_lua_announcements where active and starts_at<=now() and (ends_at is null or ends_at>now())),
    'recentUsers', coalesce((
      select jsonb_agg(jsonb_build_object('userId',p.user_id,'displayName',p.display_name,'role',p.role,'level',p.level,'status',p.account_status,'createdAt',p.created_at) order by p.created_at desc)
      from (select * from public.rede_lua_profiles order by created_at desc limit 8) p
    ),'[]'::jsonb)
  ) into v_result;
  return v_result;
end;
$$;
revoke all on function public.rede_lua_admin_dashboard() from public, anon;
grant execute on function public.rede_lua_admin_dashboard() to authenticated, service_role;

create or replace function public.rede_lua_admin_users(p_query text default null, p_limit integer default 40)
returns table(user_id uuid, display_name text, email text, role text, level integer, xp bigint, moon_coins integer, account_status text, created_at timestamptz)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select p.user_id,p.display_name,u.email,p.role,p.level,p.xp,p.moon_coins,p.account_status,p.created_at
  from public.rede_lua_profiles p
  join auth.users u on u.id=p.user_id
  where public.rede_lua_is_admin()
    and (p_query is null or trim(p_query)='' or p.display_name ilike '%'||trim(p_query)||'%' or u.email ilike '%'||trim(p_query)||'%')
  order by p.created_at desc
  limit greatest(1,least(coalesce(p_limit,40),100));
$$;
revoke all on function public.rede_lua_admin_users(text,integer) from public, anon;
grant execute on function public.rede_lua_admin_users(text,integer) to authenticated, service_role;

create or replace function public.rede_lua_admin_set_user_status(p_user_id uuid, p_status text, p_reason text default '')
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_uid uuid := (select auth.uid());
begin
  if v_uid is null or not public.rede_lua_is_admin() then raise exception 'ADMIN_REQUIRED'; end if;
  if p_status not in ('active','suspended') then raise exception 'INVALID_STATUS'; end if;
  if p_user_id = v_uid and p_status='suspended' then raise exception 'CANNOT_SUSPEND_SELF'; end if;
  update public.rede_lua_profiles
  set account_status=p_status, suspension_reason=left(coalesce(p_reason,''),300), updated_at=now()
  where user_id=p_user_id;
  if not found then raise exception 'PROFILE_NOT_FOUND'; end if;
  perform public.rede_lua_admin_log('user_status','profile',p_user_id::text,jsonb_build_object('status',p_status,'reason',left(coalesce(p_reason,''),300)));
  return true;
end;
$$;
revoke all on function public.rede_lua_admin_set_user_status(uuid,text,text) from public, anon;
grant execute on function public.rede_lua_admin_set_user_status(uuid,text,text) to authenticated, service_role;

create or replace function public.rede_lua_admin_set_user_role(p_user_id uuid, p_role text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_uid uuid := (select auth.uid());
begin
  if v_uid is null or not public.rede_lua_is_admin() then raise exception 'ADMIN_REQUIRED'; end if;
  if p_role not in ('student','teacher') then raise exception 'INVALID_ROLE'; end if;
  if exists(select 1 from public.rede_lua_admins where user_id=p_user_id) then raise exception 'ADMIN_ROLE_PROTECTED'; end if;
  update public.rede_lua_profiles set role=p_role,updated_at=now() where user_id=p_user_id;
  if not found then raise exception 'PROFILE_NOT_FOUND'; end if;
  perform public.rede_lua_admin_log('user_role','profile',p_user_id::text,jsonb_build_object('role',p_role));
  return true;
end;
$$;
revoke all on function public.rede_lua_admin_set_user_role(uuid,text) from public, anon;
grant execute on function public.rede_lua_admin_set_user_role(uuid,text) to authenticated, service_role;

create or replace function public.rede_lua_admin_create_teacher_invite(p_label text, p_code text, p_max_uses integer default 25, p_expires_at timestamptz default null)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_uid uuid := (select auth.uid()); v_id uuid;
begin
  if v_uid is null or not public.rede_lua_is_admin() then raise exception 'ADMIN_REQUIRED'; end if;
  if char_length(trim(p_code)) < 8 then raise exception 'INVITE_CODE_TOO_SHORT'; end if;
  insert into public.rede_lua_teacher_invites(label,code_hash,active,max_uses,expires_at)
  values(left(coalesce(nullif(trim(p_label),''),'Convite de professor'),80),crypt(trim(p_code),gen_salt('bf',6)),true,greatest(1,least(coalesce(p_max_uses,25),500)),p_expires_at)
  returning id into v_id;
  perform public.rede_lua_admin_log('teacher_invite_create','teacher_invite',v_id::text,jsonb_build_object('label',p_label,'maxUses',p_max_uses));
  return jsonb_build_object('id',v_id,'code',trim(p_code));
end;
$$;
revoke all on function public.rede_lua_admin_create_teacher_invite(text,text,integer,timestamptz) from public, anon;
grant execute on function public.rede_lua_admin_create_teacher_invite(text,text,integer,timestamptz) to authenticated, service_role;

create or replace function public.rede_lua_admin_teacher_invites()
returns table(id uuid,label text,active boolean,max_uses integer,uses integer,expires_at timestamptz,created_at timestamptz)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select i.id,i.label,i.active,i.max_uses,i.uses,i.expires_at,i.created_at
  from public.rede_lua_teacher_invites i
  where public.rede_lua_is_admin()
  order by i.created_at desc
  limit 100;
$$;
revoke all on function public.rede_lua_admin_teacher_invites() from public, anon;
grant execute on function public.rede_lua_admin_teacher_invites() to authenticated, service_role;

create or replace function public.rede_lua_admin_announcements()
returns setof public.rede_lua_announcements
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select a.* from public.rede_lua_announcements a
  where public.rede_lua_is_admin()
  order by a.created_at desc;
$$;
revoke all on function public.rede_lua_admin_announcements() from public, anon;
grant execute on function public.rede_lua_admin_announcements() to authenticated, service_role;

create or replace function public.rede_lua_admin_save_announcement(
  p_id uuid,
  p_title text,
  p_body text,
  p_audience text default 'all',
  p_style text default 'info',
  p_active boolean default true,
  p_starts_at timestamptz default now(),
  p_ends_at timestamptz default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_uid uuid := (select auth.uid()); v_id uuid := coalesce(p_id,gen_random_uuid());
begin
  if v_uid is null or not public.rede_lua_is_admin() then raise exception 'ADMIN_REQUIRED'; end if;
  if p_audience not in ('all','students','teachers') then raise exception 'INVALID_AUDIENCE'; end if;
  if p_style not in ('info','success','warning','event') then raise exception 'INVALID_STYLE'; end if;
  insert into public.rede_lua_announcements(id,title,body,audience,style,active,starts_at,ends_at,created_by,updated_at)
  values(v_id,trim(p_title),trim(coalesce(p_body,'')),p_audience,p_style,p_active,coalesce(p_starts_at,now()),p_ends_at,v_uid,now())
  on conflict(id) do update set title=excluded.title,body=excluded.body,audience=excluded.audience,style=excluded.style,active=excluded.active,starts_at=excluded.starts_at,ends_at=excluded.ends_at,updated_at=now();
  perform public.rede_lua_admin_log('announcement_save','announcement',v_id::text,jsonb_build_object('active',p_active,'audience',p_audience));
  return v_id;
end;
$$;
revoke all on function public.rede_lua_admin_save_announcement(uuid,text,text,text,text,boolean,timestamptz,timestamptz) from public, anon;
grant execute on function public.rede_lua_admin_save_announcement(uuid,text,text,text,text,boolean,timestamptz,timestamptz) to authenticated, service_role;

create or replace function public.rede_lua_admin_flags()
returns setof public.rede_lua_feature_flags
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select f.* from public.rede_lua_feature_flags f
  where public.rede_lua_is_admin()
  order by f.key;
$$;
revoke all on function public.rede_lua_admin_flags() from public, anon;
grant execute on function public.rede_lua_admin_flags() to authenticated, service_role;

create or replace function public.rede_lua_admin_set_flag(p_key text,p_enabled boolean,p_config jsonb default '{}'::jsonb)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_uid uuid := (select auth.uid());
begin
  if v_uid is null or not public.rede_lua_is_admin() then raise exception 'ADMIN_REQUIRED'; end if;
  update public.rede_lua_feature_flags set enabled=p_enabled,config=coalesce(p_config,'{}'::jsonb),updated_by=v_uid,updated_at=now() where key=p_key;
  if not found then raise exception 'FLAG_NOT_FOUND'; end if;
  perform public.rede_lua_admin_log('feature_flag','feature_flag',p_key,jsonb_build_object('enabled',p_enabled,'config',coalesce(p_config,'{}'::jsonb)));
  return true;
end;
$$;
revoke all on function public.rede_lua_admin_set_flag(text,boolean,jsonb) from public, anon;
grant execute on function public.rede_lua_admin_set_flag(text,boolean,jsonb) to authenticated, service_role;

create or replace function public.rede_lua_admin_audit_log(p_limit integer default 60)
returns table(id bigint,admin_id uuid,admin_name text,action text,target_type text,target_id text,details jsonb,created_at timestamptz)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select l.id,l.admin_id,coalesce(p.display_name,'Admin Rede Lua'),l.action,l.target_type,l.target_id,l.details,l.created_at
  from public.rede_lua_admin_audit l
  left join public.rede_lua_profiles p on p.user_id=l.admin_id
  where public.rede_lua_is_admin()
  order by l.created_at desc
  limit greatest(1,least(coalesce(p_limit,60),200));
$$;
revoke all on function public.rede_lua_admin_audit_log(integer) from public, anon;
grant execute on function public.rede_lua_admin_audit_log(integer) to authenticated, service_role;

create or replace function public.rede_lua_claim_secret(p_secret_id text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_uid uuid := (select auth.uid()); v_inserted boolean := false; v_reward integer := 0; v_coins integer;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if p_secret_id not in ('eclipse','fragment-1','fragment-2','fragment-3','fragment-4','fragment-5','cartografo-lunar') then raise exception 'INVALID_SECRET'; end if;
  insert into public.rede_lua_secret_unlocks(user_id,secret_id) values(v_uid,p_secret_id)
  on conflict do nothing;
  get diagnostics v_reward = row_count;
  v_inserted := v_reward = 1;
  v_reward := case when p_secret_id='cartografo-lunar' then 25 when p_secret_id='eclipse' then 10 else 3 end;
  if v_inserted then update public.rede_lua_profiles set moon_coins=moon_coins+v_reward,updated_at=now() where user_id=v_uid; end if;
  select moon_coins into v_coins from public.rede_lua_profiles where user_id=v_uid;
  return jsonb_build_object('ok',true,'new',v_inserted,'reward',case when v_inserted then v_reward else 0 end,'coins',coalesce(v_coins,0));
end;
$$;
revoke all on function public.rede_lua_claim_secret(text) from public, anon;
grant execute on function public.rede_lua_claim_secret(text) to authenticated, service_role;

create or replace function public.rede_lua_my_secrets()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(jsonb_agg(secret_id order by unlocked_at),'[]'::jsonb)
  from public.rede_lua_secret_unlocks
  where user_id=(select auth.uid());
$$;
revoke all on function public.rede_lua_my_secrets() from public, anon;
grant execute on function public.rede_lua_my_secrets() to authenticated, service_role;

-- Grants explícitos para tabelas que o frontend lê diretamente.
grant select on public.rede_lua_announcements, public.rede_lua_feature_flags to anon, authenticated;
grant select on public.rede_lua_admins to authenticated;
grant select on public.rede_lua_secret_unlocks to authenticated;
