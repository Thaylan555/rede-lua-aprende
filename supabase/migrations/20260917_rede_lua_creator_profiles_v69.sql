-- Rede Lua v6.9 — Perfil de Criador, perfil do jogador e economia cosmética
alter table public.rede_lua_profiles
  add column if not exists moon_coins integer not null default 0;

alter table public.rede_lua_question_bank
  add column if not exists is_shared boolean not null default false,
  add column if not exists shared_at timestamptz;

create index if not exists rede_lua_question_bank_is_shared_subject_idx
  on public.rede_lua_question_bank(is_shared,subject,updated_at desc)
  where is_shared=true;

create table if not exists public.rede_lua_cosmetic_unlocks (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null,
  unlocked_at timestamptz not null default now(),
  primary key(user_id,item_id)
);
alter table public.rede_lua_cosmetic_unlocks enable row level security;
drop policy if exists rede_lua_cosmetics_own_select on public.rede_lua_cosmetic_unlocks;
create policy rede_lua_cosmetics_own_select on public.rede_lua_cosmetic_unlocks
for select to authenticated using (user_id=(select auth.uid()));

create or replace function public.rede_lua_creator_profile()
returns jsonb language plpgsql security definer set search_path='public','pg_temp' as $$
declare
  v_uid uuid := (select auth.uid());
  v_stats jsonb; v_badges jsonb; v_showcase jsonb;
  v_xp integer; v_level integer; v_activities integer; v_games integer;
  v_participants integer; v_answers integer; v_minutes integer; v_accuracy numeric;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if not public.rede_lua_is_teacher() then raise exception 'TEACHER_REQUIRED'; end if;
  select count(*)::int into v_activities from public.rede_lua_activities where author_id=v_uid and status<>'archived';
  select count(*)::int into v_games from public.rede_lua_games where host_id=v_uid;
  select count(*)::int into v_participants from public.rede_lua_participants p join public.rede_lua_games g on g.id=p.game_id where g.host_id=v_uid;
  select count(*)::int,coalesce(round(100.0*count(*) filter(where a.correct)/nullif(count(*),0)),0)
    into v_answers,v_accuracy from public.rede_lua_answers a join public.rede_lua_games g on g.id=a.game_id where g.host_id=v_uid;
  select coalesce(round(sum(extract(epoch from (coalesce(ended_at,now())-created_at))/60.0))::int,0)
    into v_minutes from public.rede_lua_games where host_id=v_uid and status='finished';
  v_xp := v_activities*120 + v_games*80 + v_participants*8 + v_answers*2;
  v_level := 1 + floor(v_xp::numeric/500)::int;
  v_stats := jsonb_build_object('activities',v_activities,'games',v_games,'participants',v_participants,'answers',v_answers,'minutesPlayed',v_minutes,'accuracy',coalesce(v_accuracy,0),'creatorXp',v_xp,'creatorLevel',v_level);
  with badge_rows as (
    select 'primeiro-passo' id,'Primeiro Passo' label,'Criou a primeira atividade.' note,'🌱' icon where v_activities>=1
    union all select 'mestre-quizzes','Mestre dos Quizzes','Criou 10 atividades.','🎮' where v_activities>=10
    union all select 'sala-viva','Sala Viva','Abriu 10 partidas com a turma.','✨' where v_games>=10
    union all select 'impacto-50','Impacto 50','Recebeu 50 participações em suas salas.','🌙' where v_participants>=50
    union all select 'impacto-250','Impacto 250','Recebeu 250 participações em suas salas.','🚀' where v_participants>=250
    union all select 'cartografo','Cartógrafo da Turma','Coletou 500 respostas para orientar revisões.','🧭' where v_answers>=500
  ) select coalesce(jsonb_agg(jsonb_build_object('id',id,'label',label,'note',note,'icon',icon)),'[]'::jsonb) into v_badges from badge_rows;
  select coalesce(jsonb_agg(jsonb_build_object('id',x.id,'title',x.title,'subject',x.subject,'difficulty',x.difficulty,'experienceMode',x.experience_mode,'theme',x.theme_config,'plays',x.plays,'questions',x.questions) order by x.plays desc,x.updated_at desc),'[]'::jsonb)
    into v_showcase from (
      select a.id,a.title,a.subject,a.difficulty,a.experience_mode,a.theme_config,a.updated_at,count(distinct g.id)::int plays,count(distinct q.id)::int questions
      from public.rede_lua_activities a left join public.rede_lua_games g on g.activity_id=a.id left join public.rede_lua_questions q on q.activity_id=a.id
      where a.author_id=v_uid and a.status='published' group by a.id order by plays desc,a.updated_at desc limit 6
    ) x;
  return jsonb_build_object('stats',v_stats,'badges',v_badges,'showcase',v_showcase);
end; $$;

create or replace function public.rede_lua_player_profile()
returns jsonb language plpgsql security definer set search_path='public','pg_temp' as $$
declare
  v_uid uuid := (select auth.uid()); v_profile record; v_games integer; v_answers integer; v_correct integer; v_badges jsonb; v_history jsonb;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select user_id,moon_coins,xp,level,streak_days into v_profile from public.rede_lua_profiles where user_id=v_uid;
  select count(distinct p.game_id)::int into v_games from public.rede_lua_participants p join public.rede_lua_games g on g.id=p.game_id where p.user_id=v_uid and g.status='finished';
  select count(*)::int,count(*) filter(where a.correct)::int into v_answers,v_correct from public.rede_lua_answers a join public.rede_lua_participants p on p.id=a.participant_id where p.user_id=v_uid;
  with badge_rows as (
    select 'primeira-missao' id,'Primeira Missão' label,'Concluiu a primeira partida.' note,'🚀' icon where v_games>=1
    union all select 'sequencia-3','Ritmo Lunar','Aprendeu por 3 dias em sequência.','🔥' where v_profile.streak_days>=3
    union all select 'sequencia-7','Semana Estelar','Manteve uma sequência de 7 dias.','🌟' where v_profile.streak_days>=7
    union all select 'cem-respostas','100 Respostas','Chegou a 100 respostas na Rede Lua.','💡' where v_answers>=100
    union all select 'nivel-5','Explorador Nível 5','Chegou ao nível 5.','🏅' where v_profile.level>=5
  ) select coalesce(jsonb_agg(jsonb_build_object('id',id,'label',label,'note',note,'icon',icon)),'[]'::jsonb) into v_badges from badge_rows;
  select coalesce(jsonb_agg(jsonb_build_object('gameId',x.game_id,'title',x.title,'subject',x.subject,'score',x.score,'endedAt',x.ended_at) order by x.ended_at desc),'[]'::jsonb)
    into v_history from (
      select p.game_id,a.title,a.subject,p.score,g.ended_at from public.rede_lua_participants p join public.rede_lua_games g on g.id=p.game_id join public.rede_lua_activities a on a.id=g.activity_id
      where p.user_id=v_uid and g.status='finished' order by g.ended_at desc nulls last limit 8
    ) x;
  return jsonb_build_object('coins',coalesce(v_profile.moon_coins,0),'gamesCompleted',coalesce(v_games,0),'answers',coalesce(v_answers,0),'correct',coalesce(v_correct,0),'accuracy',case when coalesce(v_answers,0)=0 then 0 else round(100.0*v_correct/v_answers) end,'badges',v_badges,'history',v_history);
end; $$;

create or replace function public.rede_lua_my_cosmetics()
returns jsonb language plpgsql security definer set search_path='public','pg_temp' as $$
declare v_uid uuid := (select auth.uid()); v_coins integer; v_unlocks jsonb;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select moon_coins into v_coins from public.rede_lua_profiles where user_id=v_uid;
  select coalesce(jsonb_agg(item_id order by unlocked_at),'[]'::jsonb) into v_unlocks from public.rede_lua_cosmetic_unlocks where user_id=v_uid;
  return jsonb_build_object('coins',coalesce(v_coins,0),'unlocks',coalesce(v_unlocks,'[]'::jsonb));
end; $$;

create or replace function public.rede_lua_unlock_cosmetic(p_item_id text)
returns jsonb language plpgsql security definer set search_path='public','pg_temp' as $$
declare v_uid uuid := (select auth.uid()); v_cost integer; v_level integer; v_coins integer; v_min_level integer;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  v_cost := case p_item_id when 'head-comet-crown' then 60 when 'face-prism-glasses' then 45 when 'aura-comet' then 35 when 'frame-quasar' then 50 when 'theme-aurora' then 80 else null end;
  v_min_level := case p_item_id when 'head-comet-crown' then 3 when 'face-prism-glasses' then 2 when 'aura-comet' then 2 when 'frame-quasar' then 3 when 'theme-aurora' then 4 else null end;
  if v_cost is null then raise exception 'INVALID_COSMETIC'; end if;
  if exists(select 1 from public.rede_lua_cosmetic_unlocks where user_id=v_uid and item_id=p_item_id) then select moon_coins,level into v_coins,v_level from public.rede_lua_profiles where user_id=v_uid; return jsonb_build_object('ok',true,'alreadyUnlocked',true,'coins',v_coins); end if;
  select moon_coins,level into v_coins,v_level from public.rede_lua_profiles where user_id=v_uid for update;
  if v_level < v_min_level then raise exception 'COSMETIC_LEVEL_REQUIRED'; end if;
  if v_coins < v_cost then raise exception 'NOT_ENOUGH_MOON_COINS'; end if;
  update public.rede_lua_profiles set moon_coins=moon_coins-v_cost,updated_at=now() where user_id=v_uid;
  insert into public.rede_lua_cosmetic_unlocks(user_id,item_id) values(v_uid,p_item_id) on conflict do nothing;
  return jsonb_build_object('ok',true,'alreadyUnlocked',false,'coins',v_coins-v_cost,'itemId',p_item_id);
end; $$;

create or replace function public.rede_lua_set_forge_shared(p_question_id uuid,p_shared boolean)
returns boolean language plpgsql security definer set search_path='public','pg_temp' as $$
declare v_uid uuid := (select auth.uid());
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if not public.rede_lua_is_teacher() then raise exception 'TEACHER_REQUIRED'; end if;
  update public.rede_lua_question_bank set is_shared=coalesce(p_shared,false),shared_at=case when coalesce(p_shared,false) then now() else null end,updated_at=now() where id=p_question_id and owner_id=v_uid;
  if not found then raise exception 'QUESTION_NOT_FOUND'; end if;
  return true;
end; $$;

create or replace function public.rede_lua_shared_forge(p_subject text default null,p_limit integer default 30)
returns table(id uuid,owner_id uuid,creator_name text,subject text,skill_key text,prompt text,choices jsonb,correct_index integer,explanation text,difficulty text,tags text[],times_used integer,updated_at timestamptz)
language plpgsql stable security definer set search_path='public','pg_temp' as $$
begin
  if (select auth.uid()) is null then raise exception 'AUTH_REQUIRED'; end if;
  if not public.rede_lua_is_teacher() then raise exception 'TEACHER_REQUIRED'; end if;
  return query select q.id,q.owner_id,p.display_name,q.subject,q.skill_key,q.prompt,q.choices,q.correct_index,q.explanation,q.difficulty,q.tags,q.times_used,q.updated_at
  from public.rede_lua_question_bank q join public.rede_lua_profiles p on p.user_id=q.owner_id
  where q.is_shared=true and (p_subject is null or trim(p_subject)='' or lower(q.subject)=lower(trim(p_subject)))
  order by q.times_used desc,q.updated_at desc limit greatest(1,least(coalesce(p_limit,30),60));
end; $$;

create or replace function public.rede_lua_copy_shared_forge(p_question_id uuid)
returns uuid language plpgsql security definer set search_path='public','pg_temp' as $$
declare v_uid uuid := (select auth.uid()); v_src public.rede_lua_question_bank; v_id uuid := gen_random_uuid();
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if not public.rede_lua_is_teacher() then raise exception 'TEACHER_REQUIRED'; end if;
  select * into v_src from public.rede_lua_question_bank where id=p_question_id and is_shared=true;
  if not found then raise exception 'QUESTION_NOT_FOUND'; end if;
  insert into public.rede_lua_question_bank(id,owner_id,subject,skill_key,prompt,choices,correct_index,explanation,difficulty,tags,times_used,is_shared)
  values(v_id,v_uid,v_src.subject,v_src.skill_key,v_src.prompt,v_src.choices,v_src.correct_index,v_src.explanation,v_src.difficulty,v_src.tags,0,false);
  update public.rede_lua_question_bank set times_used=times_used+1 where id=p_question_id;
  return v_id;
end; $$;

revoke all on function public.rede_lua_creator_profile() from public;
revoke all on function public.rede_lua_player_profile() from public;
revoke all on function public.rede_lua_my_cosmetics() from public;
revoke all on function public.rede_lua_unlock_cosmetic(text) from public;
revoke all on function public.rede_lua_set_forge_shared(uuid,boolean) from public;
revoke all on function public.rede_lua_shared_forge(text,integer) from public;
revoke all on function public.rede_lua_copy_shared_forge(uuid) from public;
grant execute on function public.rede_lua_creator_profile() to authenticated;
grant execute on function public.rede_lua_player_profile() to authenticated;
grant execute on function public.rede_lua_my_cosmetics() to authenticated;
grant execute on function public.rede_lua_unlock_cosmetic(text) to authenticated;
grant execute on function public.rede_lua_set_forge_shared(uuid,boolean) to authenticated;
grant execute on function public.rede_lua_shared_forge(text,integer) to authenticated;
grant execute on function public.rede_lua_copy_shared_forge(uuid) to authenticated;
