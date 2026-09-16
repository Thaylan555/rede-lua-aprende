-- Rede Lua Educação v6 — Mega Perfis + Quiz Studio
-- Supabase/Postgres only. DiceBear is an optional open-source avatar HTTP API.

create extension if not exists pgcrypto with schema extensions;

-- -------------------------------------------------------------------------
-- 1) Profile Studio
-- -------------------------------------------------------------------------
alter table public.rede_lua_profiles
  add column if not exists bio text not null default '',
  add column if not exists profile_title text not null default 'Explorador Lunar',
  add column if not exists avatar_style text not null default 'adventurer',
  add column if not exists avatar_seed text,
  add column if not exists avatar_config jsonb not null default '{}'::jsonb,
  add column if not exists profile_theme jsonb not null default '{"accent":"#ffbd2e","surface":"#0b2d68","background":"#071c45","card":"#ffffff","pattern":"stars"}'::jsonb,
  add column if not exists profile_visibility text not null default 'private',
  add column if not exists favorite_subjects text[] not null default '{}';

update public.rede_lua_profiles
set avatar_seed = coalesce(nullif(avatar_seed,''), user_id::text)
where avatar_seed is null or avatar_seed='';

alter table public.rede_lua_profiles
  alter column avatar_seed set default encode(extensions.gen_random_bytes(12),'hex');

alter table public.rede_lua_profiles drop constraint if exists rede_lua_profiles_avatar_style_check;
alter table public.rede_lua_profiles add constraint rede_lua_profiles_avatar_style_check
  check (avatar_style in ('adventurer','avataaars','personas','lorelei','notionists'));

alter table public.rede_lua_profiles drop constraint if exists rede_lua_profiles_visibility_check;
alter table public.rede_lua_profiles add constraint rede_lua_profiles_visibility_check
  check (profile_visibility in ('private','classroom'));

alter table public.rede_lua_profiles drop constraint if exists rede_lua_profiles_bio_len_check;
alter table public.rede_lua_profiles add constraint rede_lua_profiles_bio_len_check
  check (char_length(bio) <= 220);

alter table public.rede_lua_profiles drop constraint if exists rede_lua_profiles_title_len_check;
alter table public.rede_lua_profiles add constraint rede_lua_profiles_title_len_check
  check (char_length(profile_title) between 2 and 42);

create or replace function public.rede_lua_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.rede_lua_profiles(user_id, display_name, avatar_seed)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'),''), split_part(coalesce(new.email,'Aluno'),'@',1)),
    new.id::text
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create or replace function public.rede_lua_update_profile_studio(
  p_display_name text,
  p_bio text,
  p_profile_title text,
  p_avatar_style text,
  p_avatar_seed text,
  p_avatar_config jsonb,
  p_profile_theme jsonb,
  p_visibility text,
  p_favorite_subjects text[] default '{}'
) returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
  v_row public.rede_lua_profiles;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if char_length(trim(p_display_name)) not between 2 and 32 then raise exception 'INVALID_DISPLAY_NAME'; end if;
  if char_length(coalesce(p_bio,'')) > 220 then raise exception 'BIO_TOO_LONG'; end if;
  if char_length(trim(coalesce(p_profile_title,''))) not between 2 and 42 then raise exception 'INVALID_PROFILE_TITLE'; end if;
  if p_avatar_style not in ('adventurer','avataaars','personas','lorelei','notionists') then raise exception 'INVALID_AVATAR_STYLE'; end if;
  if char_length(trim(coalesce(p_avatar_seed,''))) not between 3 and 80 then raise exception 'INVALID_AVATAR_SEED'; end if;
  if jsonb_typeof(coalesce(p_avatar_config,'{}'::jsonb)) <> 'object' or pg_column_size(coalesce(p_avatar_config,'{}'::jsonb)) > 14000 then raise exception 'INVALID_AVATAR_CONFIG'; end if;
  if jsonb_typeof(coalesce(p_profile_theme,'{}'::jsonb)) <> 'object' or pg_column_size(coalesce(p_profile_theme,'{}'::jsonb)) > 8000 then raise exception 'INVALID_PROFILE_THEME'; end if;
  if p_visibility not in ('private','classroom') then raise exception 'INVALID_VISIBILITY'; end if;

  update public.rede_lua_profiles
  set display_name = trim(p_display_name),
      bio = left(coalesce(p_bio,''),220),
      profile_title = trim(p_profile_title),
      avatar_style = p_avatar_style,
      avatar_seed = trim(p_avatar_seed),
      avatar_config = coalesce(p_avatar_config,'{}'::jsonb),
      profile_theme = coalesce(p_profile_theme,'{}'::jsonb),
      profile_visibility = p_visibility,
      favorite_subjects = coalesce(p_favorite_subjects,'{}'),
      updated_at = now()
  where user_id = v_uid
  returning * into v_row;

  if not found then raise exception 'PROFILE_NOT_FOUND'; end if;
  return jsonb_build_object(
    'userId', v_row.user_id,
    'displayName', v_row.display_name,
    'role', v_row.role,
    'bio', v_row.bio,
    'profileTitle', v_row.profile_title,
    'avatarStyle', v_row.avatar_style,
    'avatarSeed', v_row.avatar_seed,
    'avatarConfig', v_row.avatar_config,
    'profileTheme', v_row.profile_theme,
    'visibility', v_row.profile_visibility,
    'favoriteSubjects', to_jsonb(v_row.favorite_subjects),
    'xp', v_row.xp,
    'level', v_row.level,
    'streakDays', v_row.streak_days
  );
end;
$$;

grant execute on function public.rede_lua_update_profile_studio(text,text,text,text,text,jsonb,jsonb,text,text[]) to authenticated;

-- -------------------------------------------------------------------------
-- 2) Quiz Studio / branded experiences
-- -------------------------------------------------------------------------
alter table public.rede_lua_activities
  add column if not exists experience_mode text not null default 'classic',
  add column if not exists theme_config jsonb not null default '{"preset":"lua","primary":"#0b4aa2","secondary":"#ffbd2e","background":"#071c45","surface":"#ffffff","text":"#071c45","pattern":"stars","buttonShape":"rounded","fontStyle":"friendly","logoUrl":"","showRedeLuaBrand":true}'::jsonb,
  add column if not exists game_config jsonb not null default '{"timerSeconds":20,"enforceTimer":false,"speedBonus":false,"speedBonusPercent":25,"showLeaderboard":true,"showProgress":true}'::jsonb;

alter table public.rede_lua_activities drop constraint if exists rede_lua_activities_experience_mode_check;
alter table public.rede_lua_activities add constraint rede_lua_activities_experience_mode_check
  check (experience_mode in ('classic','lunar_rush','star_hunt','focus'));

alter table public.rede_lua_questions
  add column if not exists question_type text not null default 'single',
  add column if not exists media_url text,
  add column if not exists hint text not null default '',
  add column if not exists time_limit_seconds integer not null default 20,
  add column if not exists shuffle_choices boolean not null default false;

alter table public.rede_lua_questions drop constraint if exists rede_lua_questions_type_check;
alter table public.rede_lua_questions add constraint rede_lua_questions_type_check
  check (question_type in ('single','true_false'));

alter table public.rede_lua_questions drop constraint if exists rede_lua_questions_timer_check;
alter table public.rede_lua_questions add constraint rede_lua_questions_timer_check
  check (time_limit_seconds between 5 and 120);

-- Public media bucket used only for teacher-authored activity logos/covers/question images.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('rede-lua-assets','rede-lua-assets',true,3145728,array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists rede_lua_assets_teacher_insert on storage.objects;
create policy rede_lua_assets_teacher_insert on storage.objects
for insert to authenticated
with check (
  bucket_id='rede-lua-assets'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (select public.rede_lua_is_teacher())
);

drop policy if exists rede_lua_assets_owner_update on storage.objects;
create policy rede_lua_assets_owner_update on storage.objects
for update to authenticated
using (bucket_id='rede-lua-assets' and (storage.foldername(name))[1]=(select auth.uid())::text and (select public.rede_lua_is_teacher()))
with check (bucket_id='rede-lua-assets' and (storage.foldername(name))[1]=(select auth.uid())::text and (select public.rede_lua_is_teacher()));

drop policy if exists rede_lua_assets_owner_delete on storage.objects;
create policy rede_lua_assets_owner_delete on storage.objects
for delete to authenticated
using (bucket_id='rede-lua-assets' and (storage.foldername(name))[1]=(select auth.uid())::text and (select public.rede_lua_is_teacher()));

create or replace function public.rede_lua_create_activity_v2(
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
set search_path = public
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
  if p_experience_mode not in ('classic','lunar_rush','star_hunt','focus') then raise exception 'INVALID_EXPERIENCE_MODE'; end if;
  if jsonb_typeof(p_questions) <> 'array' or jsonb_array_length(p_questions) not between 1 and 50 then raise exception 'INVALID_QUESTIONS'; end if;
  if jsonb_typeof(coalesce(p_theme_config,'{}'::jsonb)) <> 'object' or pg_column_size(coalesce(p_theme_config,'{}'::jsonb)) > 14000 then raise exception 'INVALID_THEME'; end if;
  if jsonb_typeof(coalesce(p_game_config,'{}'::jsonb)) <> 'object' or pg_column_size(coalesce(p_game_config,'{}'::jsonb)) > 8000 then raise exception 'INVALID_GAME_CONFIG'; end if;

  v_theme := '{"preset":"lua","primary":"#0b4aa2","secondary":"#ffbd2e","background":"#071c45","surface":"#ffffff","text":"#071c45","pattern":"stars","buttonShape":"rounded","fontStyle":"friendly","logoUrl":"","showRedeLuaBrand":true}'::jsonb || coalesce(p_theme_config,'{}'::jsonb);
  v_game := '{"timerSeconds":20,"enforceTimer":false,"speedBonus":false,"speedBonusPercent":25,"showLeaderboard":true,"showProgress":true}'::jsonb || coalesce(p_game_config,'{}'::jsonb);

  insert into public.rede_lua_activities(id,author_id,title,subject,description,status,difficulty,tags,experience_mode,theme_config,game_config)
  values(v_id,auth.uid(),trim(p_title),trim(p_subject),left(coalesce(p_description,''),700),p_status,p_difficulty,coalesce(p_tags,'{}'),p_experience_mode,v_theme,v_game);

  for v_q in select value from jsonb_array_elements(p_questions) loop
    v_choices := v_q->'choices';
    v_correct := coalesce((v_q->>'correctIndex')::integer,0);
    v_type := coalesce(nullif(v_q->>'questionType',''),'single');
    v_timer := greatest(5, least(120, coalesce((v_q->>'timeLimitSeconds')::integer, coalesce((v_game->>'timerSeconds')::integer,20))));

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

grant execute on function public.rede_lua_create_activity_v2(text,text,text,text,text,text[],jsonb,text,jsonb,jsonb) to authenticated;

create or replace function public.rede_lua_my_activities()
returns jsonb
language sql
stable
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id',x.id,'title',x.title,'subject',x.subject,'description',x.description,'status',x.status,'difficulty',x.difficulty,'tags',to_jsonb(x.tags),
    'questionCount',x.question_count,'experienceMode',x.experience_mode,'theme',x.theme_config,'gameConfig',x.game_config,
    'createdAt',(extract(epoch from x.created_at)*1000)::bigint,'updatedAt',(extract(epoch from x.updated_at)*1000)::bigint
  ) order by x.updated_at desc),'[]'::jsonb)
  from (
    select a.*,count(q.id)::int as question_count
    from public.rede_lua_activities a
    left join public.rede_lua_questions q on q.activity_id=a.id
    where a.author_id=(select auth.uid())
    group by a.id
  ) x;
$$;

-- Add activity presentation to participant state.
create or replace function public.rede_lua_game_state(p_code text, p_participant_id uuid, p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  g record; p record; q record; a record; v_count int; v_board jsonb; v_question jsonb:=null; v_answer jsonb:=null;
  v_activity record;
begin
  select * into g from public.rede_lua_games where code=upper(trim(p_code)) limit 1;
  if not found then raise exception 'GAME_NOT_FOUND'; end if;
  select * into p from public.rede_lua_participants where id=p_participant_id and game_id=g.id and token_hash=encode(extensions.digest(p_token,'sha256'),'hex') limit 1;
  if not found then raise exception 'INVALID_PARTICIPANT'; end if;
  select title,experience_mode,theme_config,game_config into v_activity from public.rede_lua_activities where id=g.activity_id;
  select count(*) into v_count from public.rede_lua_questions where activity_id=g.activity_id;
  if g.status='running' then
    select * into q from public.rede_lua_questions where activity_id=g.activity_id and order_index=g.current_question limit 1;
    if found then
      v_question:=jsonb_build_object(
        'id',q.id,'prompt',q.prompt,'choices',q.choices,'points',q.points,'orderIndex',q.order_index,
        'questionType',q.question_type,'mediaUrl',q.media_url,'hint',q.hint,'timeLimitSeconds',q.time_limit_seconds,'shuffleChoices',q.shuffle_choices
      );
      select * into a from public.rede_lua_answers where participant_id=p.id and question_id=q.id limit 1;
      if found then v_answer:=jsonb_build_object('choiceIndex',a.choice_index,'correct',a.correct,'awardedPoints',a.awarded_points,'explanation',q.explanation); end if;
    end if;
  end if;
  select coalesce(jsonb_agg(jsonb_build_object('id',x.id,'displayName',x.display_name,'score',x.score) order by x.score desc,x.joined_at asc),'[]'::jsonb)
    into v_board from public.rede_lua_participants x where x.game_id=g.id;
  return jsonb_build_object(
    'code',g.code,'status',g.status,'currentQuestion',g.current_question,'questionCount',v_count,
    'questionStartedAt',case when g.question_started_at is null then null else (extract(epoch from g.question_started_at)*1000)::bigint end,
    'activityTitle',v_activity.title,'experienceMode',v_activity.experience_mode,'theme',v_activity.theme_config,'gameConfig',v_activity.game_config,
    'participant',jsonb_build_object('id',p.id,'displayName',p.display_name,'score',p.score),'question',v_question,'answer',v_answer,'leaderboard',v_board
  );
end;
$$;

create or replace function public.rede_lua_host_game_state(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare g record; v_count int; v_prompt text; v_media text; v_participants jsonb;
begin
  select rg.*,a.title as activity_title,a.experience_mode,a.theme_config,a.game_config
    into g from public.rede_lua_games rg join public.rede_lua_activities a on a.id=rg.activity_id
    where rg.code=upper(trim(p_code)) and rg.host_id=(select auth.uid()) limit 1;
  if not found then raise exception 'GAME_NOT_FOUND'; end if;
  select count(*) into v_count from public.rede_lua_questions where activity_id=g.activity_id;
  select prompt,media_url into v_prompt,v_media from public.rede_lua_questions where activity_id=g.activity_id and order_index=g.current_question;
  select coalesce(jsonb_agg(jsonb_build_object('id',p.id,'displayName',p.display_name,'score',p.score) order by p.score desc,p.joined_at asc),'[]'::jsonb)
    into v_participants from public.rede_lua_participants p where p.game_id=g.id;
  return jsonb_build_object(
    'id',g.id,'code',g.code,'status',g.status,'currentQuestion',g.current_question,'questionCount',v_count,
    'questionStartedAt',case when g.question_started_at is null then null else (extract(epoch from g.question_started_at)*1000)::bigint end,
    'activityTitle',g.activity_title,'experienceMode',g.experience_mode,'theme',g.theme_config,'gameConfig',g.game_config,
    'currentPrompt',v_prompt,'currentMediaUrl',v_media,'participants',v_participants
  );
end;
$$;

-- Server-authoritative timer + optional speed bonus.
create or replace function public.rede_lua_answer(p_code text, p_participant_id uuid, p_token text, p_question_id uuid, p_choice_index integer)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  g record; p record; q record; old_a record; v_activity record;
  v_correct boolean; v_points int; v_speed_bonus int:=0; v_elapsed numeric:=0; v_limit int; v_timed_out boolean:=false; v_bonus_pct int;
begin
  select * into g from public.rede_lua_games where code=upper(trim(p_code)) and status='running' limit 1;
  if not found then raise exception 'GAME_NOT_RUNNING'; end if;
  select * into p from public.rede_lua_participants where id=p_participant_id and game_id=g.id and token_hash=encode(extensions.digest(p_token,'sha256'),'hex') for update;
  if not found then raise exception 'INVALID_PARTICIPANT'; end if;
  select * into q from public.rede_lua_questions where id=p_question_id and activity_id=g.activity_id and order_index=g.current_question limit 1;
  if not found then raise exception 'QUESTION_NOT_CURRENT'; end if;
  if p_choice_index<0 or p_choice_index>=jsonb_array_length(q.choices) then raise exception 'INVALID_CHOICE'; end if;
  select game_config into v_activity from public.rede_lua_activities where id=g.activity_id;
  select * into old_a from public.rede_lua_answers where participant_id=p.id and question_id=q.id limit 1;
  if found then return jsonb_build_object('correct',old_a.correct,'awardedPoints',old_a.awarded_points,'speedBonus',0,'timedOut',false,'explanation',q.explanation); end if;

  v_limit := greatest(5,least(120,coalesce(q.time_limit_seconds,(v_activity.game_config->>'timerSeconds')::int,20)));
  if g.question_started_at is not null then v_elapsed := extract(epoch from (now()-g.question_started_at)); end if;
  v_timed_out := coalesce((v_activity.game_config->>'enforceTimer')::boolean,false) and v_elapsed > (v_limit + 1.5);
  v_correct := (not v_timed_out) and p_choice_index=q.correct_index;

  if v_correct then
    v_points := q.points;
    if coalesce((v_activity.game_config->>'speedBonus')::boolean,false) then
      v_bonus_pct := greatest(0,least(50,coalesce((v_activity.game_config->>'speedBonusPercent')::int,25)));
      v_speed_bonus := greatest(0, floor(q.points * (v_bonus_pct::numeric/100.0) * greatest(0,1-(v_elapsed/greatest(1,v_limit))))::int);
      v_points := v_points + v_speed_bonus;
    end if;
  else
    v_points := 0;
  end if;

  insert into public.rede_lua_answers(game_id,participant_id,question_id,choice_index,correct,awarded_points)
  values(g.id,p.id,q.id,p_choice_index,v_correct,v_points);
  if v_points>0 then update public.rede_lua_participants set score=score+v_points where id=p.id; end if;
  return jsonb_build_object('correct',v_correct,'awardedPoints',v_points,'speedBonus',v_speed_bonus,'timedOut',v_timed_out,'explanation',q.explanation);
end;
$$;

-- Keep the intended public join flow and authenticated teacher/student RPCs explicit.
revoke all on function public.rede_lua_update_profile_studio(text,text,text,text,text,jsonb,jsonb,text,text[]) from public, anon;
revoke all on function public.rede_lua_create_activity_v2(text,text,text,text,text,text[],jsonb,text,jsonb,jsonb) from public, anon;
grant execute on function public.rede_lua_update_profile_studio(text,text,text,text,text,jsonb,jsonb,text,text[]) to authenticated;
grant execute on function public.rede_lua_create_activity_v2(text,text,text,text,text,text[],jsonb,text,jsonb,jsonb) to authenticated;
