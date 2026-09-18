-- Rede Lua Educação v8.0 — Nova Plataforma
-- Aprendizado guiado sem revelar respostas, Mini-game Studio v3, LuaID e suporte.

-- 1) Novos modos de experiência
alter table public.rede_lua_activities drop constraint if exists rede_lua_activities_experience_mode_check;
alter table public.rede_lua_activities add constraint rede_lua_activities_experience_mode_check
  check (experience_mode in ('classic','lunar_rush','star_hunt','focus','boss_battle','treasure_hunt','space_race','card_duel'));

create or replace function public.rede_lua_create_activity_v3(
  p_title text,
  p_subject text,
  p_description text,
  p_status text,
  p_difficulty text,
  p_tags text[],
  p_questions jsonb,
  p_experience_mode text default 'classic',
  p_theme_config jsonb default '{}'::jsonb,
  p_game_config jsonb default '{}'::jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id uuid := gen_random_uuid();
  v_q jsonb; v_i integer := 0; v_choices jsonb; v_correct integer;
  v_type text; v_timer integer; v_theme jsonb; v_game jsonb;
begin
  if not public.rede_lua_is_teacher() then raise exception 'TEACHER_REQUIRED'; end if;
  if char_length(trim(p_title)) not between 3 and 120 then raise exception 'INVALID_TITLE'; end if;
  if char_length(trim(p_subject)) not between 2 and 50 then raise exception 'INVALID_SUBJECT'; end if;
  if p_status not in ('draft','published') then raise exception 'INVALID_STATUS'; end if;
  if p_difficulty not in ('easy','medium','hard') then raise exception 'INVALID_DIFFICULTY'; end if;
  if p_experience_mode not in ('classic','lunar_rush','star_hunt','focus','boss_battle','treasure_hunt','space_race','card_duel') then raise exception 'INVALID_EXPERIENCE_MODE'; end if;
  if jsonb_typeof(p_questions) <> 'array' or jsonb_array_length(p_questions) not between 1 and 60 then raise exception 'INVALID_QUESTIONS'; end if;
  if jsonb_typeof(coalesce(p_theme_config,'{}'::jsonb)) <> 'object' or pg_column_size(coalesce(p_theme_config,'{}'::jsonb)) > 16000 then raise exception 'INVALID_THEME'; end if;
  if jsonb_typeof(coalesce(p_game_config,'{}'::jsonb)) <> 'object' or pg_column_size(coalesce(p_game_config,'{}'::jsonb)) > 10000 then raise exception 'INVALID_GAME_CONFIG'; end if;

  v_theme := '{"preset":"lua","primary":"#0b4aa2","secondary":"#ffbd2e","background":"#071c45","surface":"#ffffff","text":"#071c45","pattern":"stars","buttonShape":"rounded","fontStyle":"friendly","logoUrl":"","showRedeLuaBrand":true}'::jsonb || coalesce(p_theme_config,'{}'::jsonb);
  v_game := '{"timerSeconds":20,"enforceTimer":false,"speedBonus":false,"speedBonusPercent":25,"showLeaderboard":true,"showProgress":true}'::jsonb || coalesce(p_game_config,'{}'::jsonb);

  insert into public.rede_lua_activities(id,author_id,title,subject,description,status,difficulty,tags,experience_mode,theme_config,game_config)
  values(v_id,auth.uid(),trim(p_title),trim(p_subject),left(coalesce(p_description,''),700),p_status,p_difficulty,coalesce(p_tags,'{}'),p_experience_mode,v_theme,v_game);

  for v_q in select value from jsonb_array_elements(p_questions) loop
    v_choices := v_q->'choices';
    v_correct := coalesce((v_q->>'correctIndex')::integer,0);
    v_type := coalesce(nullif(v_q->>'questionType',''),'single');
    v_timer := greatest(5, least(180, coalesce((v_q->>'timeLimitSeconds')::integer, coalesce((v_game->>'timerSeconds')::integer,20))));

    if v_type not in ('single','true_false') then raise exception 'INVALID_QUESTION_TYPE'; end if;
    if jsonb_typeof(v_choices) <> 'array' or jsonb_array_length(v_choices) not between 2 and 5 or v_correct < 0 or v_correct >= jsonb_array_length(v_choices) then raise exception 'INVALID_QUESTION'; end if;
    if v_type='true_false' and jsonb_array_length(v_choices) <> 2 then raise exception 'TRUE_FALSE_REQUIRES_TWO_CHOICES'; end if;

    insert into public.rede_lua_questions(activity_id,order_index,prompt,choices,correct_index,explanation,points,question_type,media_url,hint,time_limit_seconds,shuffle_choices)
    values(
      v_id,v_i,trim(v_q->>'prompt'),v_choices,v_correct,left(coalesce(v_q->>'explanation',''),900),greatest(10,least(1000,coalesce((v_q->>'points')::integer,100))),
      v_type,nullif(left(coalesce(v_q->>'mediaUrl',''),1000),''),left(coalesce(v_q->>'hint',''),300),v_timer,coalesce((v_q->>'shuffleChoices')::boolean,false)
    );
    v_i:=v_i+1;
  end loop;

  return jsonb_build_object(
    'id',v_id,'title',trim(p_title),'subject',trim(p_subject),'description',coalesce(p_description,''),'status',p_status,
    'difficulty',p_difficulty,'tags',coalesce(to_jsonb(p_tags),'[]'::jsonb),'questionCount',v_i,
    'experienceMode',p_experience_mode,'theme',v_theme,'gameConfig',v_game,
    'createdAt',(extract(epoch from now())*1000)::bigint,'updatedAt',(extract(epoch from now())*1000)::bigint
  );
end;
$$;
revoke all on function public.rede_lua_create_activity_v3(text,text,text,text,text,text[],jsonb,text,jsonb,jsonb) from public, anon;
grant execute on function public.rede_lua_create_activity_v3(text,text,text,text,text,text[],jsonb,text,jsonb,jsonb) to authenticated;

-- 2) Modo Aprender: sessões guiadas que não revelam o gabarito em erros.
create table if not exists public.rede_lua_study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_id uuid not null references public.rede_lua_activities(id) on delete cascade,
  current_index integer not null default 0 check (current_index >= 0),
  correct_count integer not null default 0 check (correct_count >= 0),
  total_attempts integer not null default 0 check (total_attempts >= 0),
  status text not null default 'active' check (status in ('active','completed','abandoned')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists rede_lua_study_sessions_user_updated_idx on public.rede_lua_study_sessions(user_id, updated_at desc);

create table if not exists public.rede_lua_study_attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.rede_lua_study_sessions(id) on delete cascade,
  question_id uuid not null references public.rede_lua_questions(id) on delete cascade,
  choice_index integer not null,
  correct boolean not null,
  reflection text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists rede_lua_study_attempts_session_question_idx on public.rede_lua_study_attempts(session_id, question_id, created_at);

alter table public.rede_lua_study_sessions enable row level security;
alter table public.rede_lua_study_attempts enable row level security;

drop policy if exists rede_lua_study_sessions_own on public.rede_lua_study_sessions;
create policy rede_lua_study_sessions_own on public.rede_lua_study_sessions
for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists rede_lua_study_attempts_own on public.rede_lua_study_attempts;
create policy rede_lua_study_attempts_own on public.rede_lua_study_attempts
for select to authenticated using (
  exists(select 1 from public.rede_lua_study_sessions s where s.id=session_id and s.user_id=(select auth.uid()))
);

revoke all on public.rede_lua_study_sessions from anon, authenticated;
revoke all on public.rede_lua_study_attempts from anon, authenticated;
grant select on public.rede_lua_study_sessions to authenticated;
grant select on public.rede_lua_study_attempts to authenticated;

create or replace function public.rede_lua_study_state(p_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := (select auth.uid());
  v_s public.rede_lua_study_sessions;
  v_a public.rede_lua_activities;
  v_q public.rede_lua_questions;
  v_count integer;
  v_attempts integer;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into v_s from public.rede_lua_study_sessions where id=p_session_id and user_id=v_uid;
  if not found then raise exception 'STUDY_SESSION_NOT_FOUND'; end if;
  select * into v_a from public.rede_lua_activities where id=v_s.activity_id;
  select count(*)::int into v_count from public.rede_lua_questions where activity_id=v_s.activity_id;

  if v_s.status='completed' or v_s.current_index >= v_count then
    return jsonb_build_object(
      'sessionId',v_s.id,'status','completed','activityId',v_a.id,'title',v_a.title,'subject',v_a.subject,
      'currentIndex',v_count,'questionCount',v_count,'correctCount',v_s.correct_count,'totalAttempts',v_s.total_attempts,'question',null
    );
  end if;

  select * into v_q from public.rede_lua_questions where activity_id=v_s.activity_id and order_index=v_s.current_index;
  select count(*)::int into v_attempts from public.rede_lua_study_attempts where session_id=v_s.id and question_id=v_q.id;

  return jsonb_build_object(
    'sessionId',v_s.id,'status',v_s.status,'activityId',v_a.id,'title',v_a.title,'subject',v_a.subject,
    'currentIndex',v_s.current_index,'questionCount',v_count,'correctCount',v_s.correct_count,'totalAttempts',v_s.total_attempts,
    'attemptsOnQuestion',v_attempts,
    'question',jsonb_build_object(
      'id',v_q.id,'prompt',v_q.prompt,'choices',v_q.choices,'hint',v_q.hint,'mediaUrl',v_q.media_url,
      'questionType',v_q.question_type,'points',v_q.points
    )
  );
end;
$$;
revoke all on function public.rede_lua_study_state(uuid) from public, anon;
grant execute on function public.rede_lua_study_state(uuid) to authenticated;

create or replace function public.rede_lua_study_start(p_activity_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := (select auth.uid());
  v_id uuid;
  v_count integer;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if not exists(select 1 from public.rede_lua_activities where id=p_activity_id and status='published') then raise exception 'ACTIVITY_NOT_AVAILABLE'; end if;
  select count(*)::int into v_count from public.rede_lua_questions where activity_id=p_activity_id;
  if v_count=0 then raise exception 'ACTIVITY_WITHOUT_QUESTIONS'; end if;

  update public.rede_lua_study_sessions set status='abandoned',updated_at=now()
   where user_id=v_uid and activity_id=p_activity_id and status='active';

  insert into public.rede_lua_study_sessions(user_id,activity_id) values(v_uid,p_activity_id) returning id into v_id;
  return public.rede_lua_study_state(v_id);
end;
$$;
revoke all on function public.rede_lua_study_start(uuid) from public, anon;
grant execute on function public.rede_lua_study_start(uuid) to authenticated;

create or replace function public.rede_lua_study_attempt(p_session_id uuid, p_choice_index integer, p_reflection text default '')
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := (select auth.uid());
  v_s public.rede_lua_study_sessions;
  v_q public.rede_lua_questions;
  v_count integer;
  v_correct boolean;
  v_attempts integer;
  v_coach text;
  v_explanation text := '';
  v_earned integer := 0;
  v_next integer;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into v_s from public.rede_lua_study_sessions where id=p_session_id and user_id=v_uid and status='active' for update;
  if not found then raise exception 'STUDY_SESSION_NOT_ACTIVE'; end if;
  select * into v_q from public.rede_lua_questions where activity_id=v_s.activity_id and order_index=v_s.current_index;
  if not found then raise exception 'STUDY_QUESTION_NOT_FOUND'; end if;
  if p_choice_index < 0 or p_choice_index >= jsonb_array_length(v_q.choices) then raise exception 'INVALID_CHOICE'; end if;

  v_correct := p_choice_index=v_q.correct_index;
  insert into public.rede_lua_study_attempts(session_id,question_id,choice_index,correct,reflection)
  values(v_s.id,v_q.id,p_choice_index,v_correct,left(coalesce(p_reflection,''),500));

  select count(*)::int into v_attempts from public.rede_lua_study_attempts where session_id=v_s.id and question_id=v_q.id;
  select count(*)::int into v_count from public.rede_lua_questions where activity_id=v_s.activity_id;

  if v_correct then
    v_next := v_s.current_index + 1;
    v_earned := 10;
    v_explanation := left(coalesce(v_q.explanation,''),900);
    update public.rede_lua_study_sessions set
      current_index=v_next, correct_count=correct_count+1,total_attempts=total_attempts+1,
      status=case when v_next>=v_count then 'completed' else 'active' end,
      completed_at=case when v_next>=v_count then now() else null end,updated_at=now()
    where id=v_s.id;
    update public.rede_lua_profiles set xp=xp+v_earned, level=greatest(level,1+floor((xp+v_earned)::numeric/500)::int), updated_at=now() where user_id=v_uid;
    v_coach := case when v_next>=v_count then 'Você concluiu esta trilha sem receber o gabarito pronto.' else 'Boa. Agora leve esse raciocínio para a próxima etapa.' end;
  else
    update public.rede_lua_study_sessions set total_attempts=total_attempts+1,updated_at=now() where id=v_s.id;
    v_coach := case
      when nullif(trim(v_q.hint),'') is not null then v_q.hint
      when v_attempts=1 then 'Volte ao enunciado e destaque o que ele realmente está pedindo. Elimine uma opção que contradiz isso.'
      when v_attempts=2 then 'Compare as opções duas a duas. Procure a diferença que muda o conceito, não apenas uma palavra.'
      else 'Tente explicar em uma frase qual regra ou ideia você usaria. Depois escolha de novo.'
    end;
  end if;

  return jsonb_build_object(
    'correct',v_correct,'attempts',v_attempts,'earnedXp',v_earned,'coach',v_coach,
    'explanation',case when v_correct then v_explanation else '' end,
    'completed',v_correct and (v_s.current_index+1>=v_count),
    'state',public.rede_lua_study_state(v_s.id)
  );
end;
$$;
revoke all on function public.rede_lua_study_attempt(uuid,integer,text) from public, anon;
grant execute on function public.rede_lua_study_attempt(uuid,integer,text) to authenticated;

create or replace function public.rede_lua_study_skip(p_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := (select auth.uid());
  v_s public.rede_lua_study_sessions;
  v_count integer;
  v_next integer;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into v_s from public.rede_lua_study_sessions where id=p_session_id and user_id=v_uid and status='active' for update;
  if not found then raise exception 'STUDY_SESSION_NOT_ACTIVE'; end if;
  select count(*)::int into v_count from public.rede_lua_questions where activity_id=v_s.activity_id;
  v_next := least(v_count, v_s.current_index+1);
  update public.rede_lua_study_sessions set current_index=v_next,status=case when v_next>=v_count then 'completed' else 'active' end,
    completed_at=case when v_next>=v_count then now() else null end,updated_at=now() where id=v_s.id;
  return public.rede_lua_study_state(v_s.id);
end;
$$;
revoke all on function public.rede_lua_study_skip(uuid) from public, anon;
grant execute on function public.rede_lua_study_skip(uuid) to authenticated;

-- 3) LuaID: handle estável + manifesto de perfil para web/mobile/API.
alter table public.rede_lua_profiles add column if not exists profile_handle text;
update public.rede_lua_profiles set profile_handle='lua_' || substr(replace(user_id::text,'-',''),1,10) where profile_handle is null;
create unique index if not exists rede_lua_profiles_handle_unique on public.rede_lua_profiles(lower(profile_handle));
alter table public.rede_lua_profiles drop constraint if exists rede_lua_profiles_handle_check;
alter table public.rede_lua_profiles add constraint rede_lua_profiles_handle_check check (profile_handle ~ '^[a-z0-9_]{3,24}$');

create or replace function public.rede_lua_set_profile_handle(p_handle text)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_uid uuid := (select auth.uid()); v_handle text := lower(trim(coalesce(p_handle,'')));
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if v_handle !~ '^[a-z0-9_]{3,24}$' then raise exception 'INVALID_HANDLE'; end if;
  if v_handle in ('admin','support','contato','redelua','professor','aluno','api','root','staff') then raise exception 'RESERVED_HANDLE'; end if;
  update public.rede_lua_profiles set profile_handle=v_handle,updated_at=now() where user_id=v_uid;
  return v_handle;
exception when unique_violation then raise exception 'HANDLE_TAKEN';
end;
$$;
revoke all on function public.rede_lua_set_profile_handle(text) from public, anon;
grant execute on function public.rede_lua_set_profile_handle(text) to authenticated;

create or replace function public.rede_lua_profile_manifest()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := (select auth.uid());
  v_p public.rede_lua_profiles;
  v_player jsonb := '{}'::jsonb;
  v_creator jsonb := null;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into v_p from public.rede_lua_profiles where user_id=v_uid;
  if not found then raise exception 'PROFILE_NOT_FOUND'; end if;
  v_player := public.rede_lua_player_profile();
  if v_p.role in ('teacher','admin') then v_creator := public.rede_lua_creator_profile(); end if;
  return jsonb_build_object(
    'version','luaid.v1','id',v_p.user_id,'handle',v_p.profile_handle,'displayName',v_p.display_name,'role',v_p.role,
    'title',v_p.profile_title,'bio',v_p.bio,'level',v_p.level,'xp',v_p.xp,'streakDays',v_p.streak_days,'moonCoins',v_p.moon_coins,
    'avatar',jsonb_build_object('style',v_p.avatar_style,'seed',v_p.avatar_seed,'config',v_p.avatar_config),
    'theme',v_p.profile_theme,'favoriteSubjects',to_jsonb(v_p.favorite_subjects),'visibility',v_p.profile_visibility,
    'player',v_player,'creator',v_creator,'updatedAt',v_p.updated_at
  );
end;
$$;
revoke all on function public.rede_lua_profile_manifest() from public, anon;
grant execute on function public.rede_lua_profile_manifest() to authenticated;

create or replace function public.rede_lua_public_profile(p_handle text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_p public.rede_lua_profiles;
begin
  select * into v_p from public.rede_lua_profiles where lower(profile_handle)=lower(trim(p_handle)) and profile_visibility='classroom' and account_status='active';
  if not found then return null; end if;
  return jsonb_build_object(
    'version','luaid.public.v1','id',v_p.user_id,'handle',v_p.profile_handle,'displayName',v_p.display_name,'role',v_p.role,
    'title',v_p.profile_title,'bio',v_p.bio,'level',v_p.level,'streakDays',v_p.streak_days,
    'avatar',jsonb_build_object('style',v_p.avatar_style,'seed',v_p.avatar_seed,'config',v_p.avatar_config),
    'theme',v_p.profile_theme,'favoriteSubjects',to_jsonb(v_p.favorite_subjects)
  );
end;
$$;
revoke all on function public.rede_lua_public_profile(text) from public;
grant execute on function public.rede_lua_public_profile(text) to anon, authenticated;

-- 4) Caixa de contato. Escrita é feita apenas pelo backend com service-role.
create table if not exists public.rede_lua_contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null check (char_length(name) between 2 and 80),
  email text not null check (char_length(email) between 5 and 180),
  topic text not null default 'contato' check (topic in ('suporte','contato','escola','professor','privacidade')),
  message text not null check (char_length(message) between 10 and 3000),
  status text not null default 'new' check (status in ('new','open','resolved','spam')),
  created_at timestamptz not null default now(),
  handled_at timestamptz,
  handled_by uuid references auth.users(id) on delete set null
);
alter table public.rede_lua_contact_messages enable row level security;
revoke all on public.rede_lua_contact_messages from anon, authenticated;

create or replace function public.rede_lua_admin_contact_messages(p_limit integer default 80)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.rede_lua_is_admin() then raise exception 'ADMIN_REQUIRED'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object(
    'id',m.id,'name',m.name,'email',m.email,'topic',m.topic,'message',m.message,'status',m.status,'createdAt',m.created_at
  ) order by m.created_at desc) from (select * from public.rede_lua_contact_messages order by created_at desc limit greatest(1,least(coalesce(p_limit,80),200))) m),'[]'::jsonb);
end;
$$;
revoke all on function public.rede_lua_admin_contact_messages(integer) from public, anon;
grant execute on function public.rede_lua_admin_contact_messages(integer) to authenticated;
