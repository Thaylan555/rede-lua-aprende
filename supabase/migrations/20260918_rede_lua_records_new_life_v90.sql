-- Rede Lua v9.0 — Recordes + Nova Vida
alter table public.rede_lua_profiles
  add column if not exists life_number integer not null default 1,
  add column if not exists life_xp bigint not null default 0,
  add column if not exists legacy_stars integer not null default 0,
  add column if not exists best_level integer not null default 1,
  add column if not exists last_rebirth_at timestamptz;

alter table public.rede_lua_profiles drop constraint if exists rede_lua_profiles_life_number_check;
alter table public.rede_lua_profiles add constraint rede_lua_profiles_life_number_check check (life_number >= 1);
alter table public.rede_lua_profiles drop constraint if exists rede_lua_profiles_life_xp_check;
alter table public.rede_lua_profiles add constraint rede_lua_profiles_life_xp_check check (life_xp >= 0);
alter table public.rede_lua_profiles drop constraint if exists rede_lua_profiles_legacy_stars_check;
alter table public.rede_lua_profiles add constraint rede_lua_profiles_legacy_stars_check check (legacy_stars >= 0);
alter table public.rede_lua_profiles drop constraint if exists rede_lua_profiles_best_level_check;
alter table public.rede_lua_profiles add constraint rede_lua_profiles_best_level_check check (best_level >= 1);

update public.rede_lua_profiles
set best_level = greatest(best_level, level), life_xp = greatest(life_xp, xp)
where best_level < level or life_xp = 0;

create table if not exists public.rede_lua_personal_records (
  user_id uuid not null references auth.users(id) on delete cascade,
  record_key text not null,
  label text not null,
  value numeric not null default 0,
  meta jsonb not null default '{}'::jsonb,
  achieved_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, record_key)
);

create table if not exists public.rede_lua_life_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  life_number integer not null,
  final_life_xp bigint not null default 0,
  legacy_stars_earned integer not null default 0,
  avatar_snapshot jsonb not null default '{}'::jsonb,
  record_snapshot jsonb not null default '{}'::jsonb,
  started_at timestamptz,
  ended_at timestamptz not null default now()
);

create index if not exists rede_lua_life_history_user_life_idx on public.rede_lua_life_history(user_id, life_number desc);

alter table public.rede_lua_personal_records enable row level security;
alter table public.rede_lua_life_history enable row level security;

drop policy if exists rede_lua_personal_records_own_select on public.rede_lua_personal_records;
create policy rede_lua_personal_records_own_select on public.rede_lua_personal_records for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists rede_lua_life_history_own_select on public.rede_lua_life_history;
create policy rede_lua_life_history_own_select on public.rede_lua_life_history for select to authenticated
using (user_id = (select auth.uid()));

revoke all on public.rede_lua_personal_records from anon, authenticated;
revoke all on public.rede_lua_life_history from anon, authenticated;
grant select on public.rede_lua_personal_records to authenticated;
grant select on public.rede_lua_life_history to authenticated;

create or replace function public.rede_lua_track_life_progress()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if new.xp > old.xp then new.life_xp := old.life_xp + (new.xp - old.xp); end if;
  new.best_level := greatest(old.best_level, new.level);
  return new;
end;
$$;

drop trigger if exists rede_lua_track_life_progress on public.rede_lua_profiles;
create trigger rede_lua_track_life_progress before update on public.rede_lua_profiles
for each row execute function public.rede_lua_track_life_progress();

create or replace function public.rede_lua_upsert_profile_records()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  insert into public.rede_lua_personal_records(user_id,record_key,label,value,meta,achieved_at,updated_at)
  values(new.user_id,'lifetime_xp','XP de carreira',new.xp,jsonb_build_object('level',new.level),now(),now())
  on conflict(user_id,record_key) do update set
    value=greatest(public.rede_lua_personal_records.value,excluded.value),
    meta=case when excluded.value >= public.rede_lua_personal_records.value then excluded.meta else public.rede_lua_personal_records.meta end,
    achieved_at=case when excluded.value > public.rede_lua_personal_records.value then now() else public.rede_lua_personal_records.achieved_at end,
    updated_at=now();

  insert into public.rede_lua_personal_records(user_id,record_key,label,value,meta,achieved_at,updated_at)
  values(new.user_id,'best_streak','Maior sequência',new.streak_days,'{}'::jsonb,now(),now())
  on conflict(user_id,record_key) do update set
    value=greatest(public.rede_lua_personal_records.value,excluded.value),
    achieved_at=case when excluded.value > public.rede_lua_personal_records.value then now() else public.rede_lua_personal_records.achieved_at end,
    updated_at=now();

  insert into public.rede_lua_personal_records(user_id,record_key,label,value,meta,achieved_at,updated_at)
  values(new.user_id,'best_level','Maior nível',new.best_level,jsonb_build_object('life',new.life_number),now(),now())
  on conflict(user_id,record_key) do update set
    value=greatest(public.rede_lua_personal_records.value,excluded.value),
    meta=case when excluded.value >= public.rede_lua_personal_records.value then excluded.meta else public.rede_lua_personal_records.meta end,
    achieved_at=case when excluded.value > public.rede_lua_personal_records.value then now() else public.rede_lua_personal_records.achieved_at end,
    updated_at=now();

  insert into public.rede_lua_personal_records(user_id,record_key,label,value,meta,achieved_at,updated_at)
  values(new.user_id,'lives_completed','Vidas concluídas',greatest(0,new.life_number-1),jsonb_build_object('legacyStars',new.legacy_stars),now(),now())
  on conflict(user_id,record_key) do update set value=greatest(public.rede_lua_personal_records.value,excluded.value),meta=excluded.meta,updated_at=now();
  return new;
end;
$$;

drop trigger if exists rede_lua_upsert_profile_records on public.rede_lua_profiles;
create trigger rede_lua_upsert_profile_records
after insert or update of xp,level,streak_days,life_number,legacy_stars on public.rede_lua_profiles
for each row execute function public.rede_lua_upsert_profile_records();

create or replace function public.rede_lua_upsert_game_record()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare v_uid uuid;
begin
  select user_id into v_uid from public.rede_lua_participants where id=new.id;
  if v_uid is null then return new; end if;
  insert into public.rede_lua_personal_records(user_id,record_key,label,value,meta,achieved_at,updated_at)
  values(v_uid,'best_game_score','Maior pontuação em uma sala',new.score,jsonb_build_object('gameId',new.game_id),now(),now())
  on conflict(user_id,record_key) do update set
    value=greatest(public.rede_lua_personal_records.value,excluded.value),
    meta=case when excluded.value >= public.rede_lua_personal_records.value then excluded.meta else public.rede_lua_personal_records.meta end,
    achieved_at=case when excluded.value > public.rede_lua_personal_records.value then now() else public.rede_lua_personal_records.achieved_at end,
    updated_at=now();
  return new;
end;
$$;

drop trigger if exists rede_lua_upsert_game_record on public.rede_lua_participants;
create trigger rede_lua_upsert_game_record after insert or update of score on public.rede_lua_participants
for each row execute function public.rede_lua_upsert_game_record();

insert into public.rede_lua_personal_records(user_id,record_key,label,value,meta)
select user_id,'lifetime_xp','XP de carreira',xp,jsonb_build_object('level',level) from public.rede_lua_profiles
on conflict(user_id,record_key) do update set value=greatest(public.rede_lua_personal_records.value,excluded.value),meta=excluded.meta,updated_at=now();

insert into public.rede_lua_personal_records(user_id,record_key,label,value,meta)
select user_id,'best_streak','Maior sequência',streak_days,'{}'::jsonb from public.rede_lua_profiles
on conflict(user_id,record_key) do update set value=greatest(public.rede_lua_personal_records.value,excluded.value),updated_at=now();

insert into public.rede_lua_personal_records(user_id,record_key,label,value,meta)
select user_id,'best_level','Maior nível',greatest(level,best_level),jsonb_build_object('life',life_number) from public.rede_lua_profiles
on conflict(user_id,record_key) do update set value=greatest(public.rede_lua_personal_records.value,excluded.value),meta=excluded.meta,updated_at=now();

create or replace function public.rede_lua_my_records()
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_uid uuid := (select auth.uid()); v_p public.rede_lua_profiles;
  v_games integer := 0; v_answers integer := 0; v_correct integer := 0; v_accuracy numeric := 0; v_best_score numeric := 0; v_largest_room integer := 0;
  v_records jsonb := '[]'::jsonb; v_history jsonb := '[]'::jsonb; v_req integer;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into v_p from public.rede_lua_profiles where user_id=v_uid;
  if not found then raise exception 'PROFILE_NOT_FOUND'; end if;

  select count(distinct p.game_id)::int, coalesce(max(p.score),0) into v_games,v_best_score
  from public.rede_lua_participants p join public.rede_lua_games g on g.id=p.game_id
  where p.user_id=v_uid and g.status='finished';

  select count(*)::int, count(*) filter(where a.correct)::int into v_answers,v_correct
  from public.rede_lua_answers a join public.rede_lua_participants p on p.id=a.participant_id
  where p.user_id=v_uid;
  v_accuracy := case when v_answers=0 then 0 else round(100.0*v_correct/v_answers) end;

  if v_p.role in ('teacher','admin') then
    select coalesce(max(x.c),0)::int into v_largest_room from (
      select g.id,count(p.id)::int c from public.rede_lua_games g left join public.rede_lua_participants p on p.game_id=g.id
      where g.host_id=v_uid group by g.id
    ) x;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object('key',r.record_key,'label',r.label,'value',r.value,'meta',r.meta,'achievedAt',r.achieved_at) order by r.updated_at desc),'[]'::jsonb)
  into v_records from public.rede_lua_personal_records r where r.user_id=v_uid;

  select coalesce(jsonb_agg(jsonb_build_object('id',h.id,'lifeNumber',h.life_number,'finalLifeXp',h.final_life_xp,'legacyStarsEarned',h.legacy_stars_earned,'avatarSnapshot',h.avatar_snapshot,'recordSnapshot',h.record_snapshot,'endedAt',h.ended_at) order by h.life_number desc),'[]'::jsonb)
  into v_history from (select * from public.rede_lua_life_history where user_id=v_uid order by life_number desc limit 12) h;

  v_req := 600 + greatest(0,v_p.life_number-1)*250;
  return jsonb_build_object(
    'life',jsonb_build_object('number',v_p.life_number,'xp',v_p.life_xp,'level',1+floor(v_p.life_xp::numeric/150)::int,'nextLifeXp',v_req,'ready',v_p.life_xp>=v_req,'legacyStars',v_p.legacy_stars,'lastRebirthAt',v_p.last_rebirth_at),
    'summary',jsonb_build_object('gamesCompleted',v_games,'answers',v_answers,'correct',v_correct,'accuracy',v_accuracy,'bestGameScore',v_best_score,'largestRoom',v_largest_room),
    'records',v_records,'history',v_history
  );
end;
$$;
revoke all on function public.rede_lua_my_records() from public, anon;
grant execute on function public.rede_lua_my_records() to authenticated;

create or replace function public.rede_lua_begin_new_life()
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_uid uuid := (select auth.uid()); v_p public.rede_lua_profiles; v_req integer; v_stars integer; v_species text;
  v_seed text := encode(gen_random_bytes(12),'hex'); v_snapshot jsonb;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into v_p from public.rede_lua_profiles where user_id=v_uid for update;
  if not found then raise exception 'PROFILE_NOT_FOUND'; end if;
  v_req := 600 + greatest(0,v_p.life_number-1)*250;
  if v_p.life_xp < v_req then raise exception 'LIFE_NOT_READY'; end if;
  v_stars := greatest(1,least(5,1+floor((v_p.life_xp-v_req)::numeric/greatest(1,v_req))::int));
  v_species := (array['moon-bear','nebula-fox','cosmic-penguin','lunar-capybara','wise-owl','pocket-dragon','orbit-robot','astro-cat','prism-axolotl','star-bunny','comet-monkey','cloud-yeti'])[1+floor(random()*12)::int];
  v_snapshot := jsonb_build_object('style',v_p.avatar_style,'seed',v_p.avatar_seed,'config',v_p.avatar_config,'theme',v_p.profile_theme,'title',v_p.profile_title);

  insert into public.rede_lua_life_history(user_id,life_number,final_life_xp,legacy_stars_earned,avatar_snapshot,record_snapshot,started_at,ended_at)
  values(v_uid,v_p.life_number,v_p.life_xp,v_stars,v_snapshot,public.rede_lua_my_records(),coalesce(v_p.last_rebirth_at,v_p.created_at),now());

  update public.rede_lua_profiles set
    life_number=life_number+1,life_xp=0,legacy_stars=legacy_stars+v_stars,last_rebirth_at=now(),avatar_style='lua-mates',avatar_seed=v_seed,
    avatar_config=jsonb_build_object('_luaSpecies',v_species,'_luaExpression','happy','_luaOutfit','academy','_luaCompanion','none','_luaHead','none','_luaFace','none','_luaAura','none','_luaFrame','none','_luaLook','reborn'),updated_at=now()
  where user_id=v_uid;
  return jsonb_build_object('ok',true,'lifeNumber',v_p.life_number+1,'legacyStarsEarned',v_stars,'species',v_species,'message','NOVA_VIDA_STARTED');
end;
$$;
revoke all on function public.rede_lua_begin_new_life() from public, anon;
grant execute on function public.rede_lua_begin_new_life() to authenticated;
