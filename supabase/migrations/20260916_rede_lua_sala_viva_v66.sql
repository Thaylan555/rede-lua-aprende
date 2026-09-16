-- Rede Lua Educação v6.6 — Sala Viva
-- Safe activity removal + reusable activities + live classroom reactions.

create table if not exists public.rede_lua_game_reactions (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.rede_lua_games(id) on delete cascade,
  participant_id uuid not null references public.rede_lua_participants(id) on delete cascade,
  reaction_id text not null check (reaction_id in ('heart','curious','happy','cool','focus','idea','popcorn','shiba')),
  created_at timestamptz not null default now()
);

create index if not exists rede_lua_game_reactions_game_created_idx
  on public.rede_lua_game_reactions(game_id, created_at desc);
create index if not exists rede_lua_game_reactions_participant_created_idx
  on public.rede_lua_game_reactions(participant_id, created_at desc);

alter table public.rede_lua_game_reactions enable row level security;
revoke all on table public.rede_lua_game_reactions from anon, authenticated;

-- The library should not show archived activities. Historical games still keep their activity.
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
    where a.author_id=(select auth.uid()) and a.status <> 'archived'
    group by a.id
  ) x;
$$;

-- Deleting a quiz that already has game history now archives it instead of destroying history.
create or replace function public.rede_lua_remove_activity(p_activity_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_activity record;
  v_has_games boolean;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into v_activity
  from public.rede_lua_activities
  where id = p_activity_id and author_id = auth.uid()
  for update;
  if not found then raise exception 'ACTIVITY_NOT_FOUND'; end if;

  select exists(select 1 from public.rede_lua_games where activity_id=p_activity_id)
  into v_has_games;

  if v_has_games then
    update public.rede_lua_activities
      set status='archived', updated_at=now()
      where id=p_activity_id;
    return jsonb_build_object('ok',true,'archived',true,'message','Histórico preservado');
  end if;

  delete from public.rede_lua_activities where id=p_activity_id and author_id=auth.uid();
  return jsonb_build_object('ok',true,'archived',false,'message','Atividade removida');
end;
$$;

-- Duplicate an existing activity as a draft, including all questions and theme settings.
create or replace function public.rede_lua_duplicate_activity(p_activity_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_source public.rede_lua_activities%rowtype;
  v_new_id uuid := gen_random_uuid();
  v_title text;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into v_source
  from public.rede_lua_activities
  where id=p_activity_id and author_id=auth.uid() and status <> 'archived';
  if not found then raise exception 'ACTIVITY_NOT_FOUND'; end if;

  v_title := left('Cópia de ' || v_source.title, 120);
  insert into public.rede_lua_activities(
    id,author_id,title,subject,description,difficulty,tags,cover_icon,status,experience_mode,theme_config,game_config
  ) values (
    v_new_id,auth.uid(),v_title,v_source.subject,v_source.description,v_source.difficulty,v_source.tags,v_source.cover_icon,'draft',v_source.experience_mode,v_source.theme_config,v_source.game_config
  );

  insert into public.rede_lua_questions(
    activity_id,order_index,prompt,choices,correct_index,explanation,points,question_type,media_url,hint,time_limit_seconds,shuffle_choices
  )
  select v_new_id,order_index,prompt,choices,correct_index,explanation,points,question_type,media_url,hint,time_limit_seconds,shuffle_choices
  from public.rede_lua_questions
  where activity_id=p_activity_id
  order by order_index;

  return jsonb_build_object('ok',true,'id',v_new_id,'title',v_title);
end;
$$;

-- Participant reaction. Token validation means guests can react without a Supabase account.
create or replace function public.rede_lua_send_reaction(
  p_code text,
  p_participant_id uuid,
  p_token text,
  p_reaction_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_game record;
  v_participant record;
  v_last timestamptz;
begin
  if p_reaction_id not in ('heart','curious','happy','cool','focus','idea','popcorn','shiba') then
    raise exception 'INVALID_REACTION';
  end if;

  select * into v_game
  from public.rede_lua_games
  where code=upper(trim(p_code)) and status in ('lobby','running')
  limit 1;
  if not found then raise exception 'GAME_NOT_RUNNING'; end if;

  select * into v_participant
  from public.rede_lua_participants
  where id=p_participant_id
    and game_id=v_game.id
    and token_hash=encode(extensions.digest(p_token,'sha256'),'hex')
  limit 1;
  if not found then raise exception 'INVALID_PARTICIPANT'; end if;

  select max(created_at) into v_last
  from public.rede_lua_game_reactions
  where participant_id=v_participant.id;

  if v_last is not null and v_last > now() - interval '900 milliseconds' then
    return jsonb_build_object('ok',true,'accepted',false,'throttled',true);
  end if;

  insert into public.rede_lua_game_reactions(game_id,participant_id,reaction_id)
  values(v_game.id,v_participant.id,p_reaction_id);

  -- Keep a compact history for each game.
  delete from public.rede_lua_game_reactions r
  where r.game_id=v_game.id
    and r.created_at < now() - interval '2 hours';

  return jsonb_build_object('ok',true,'accepted',true,'reactionId',p_reaction_id);
end;
$$;

create or replace function public.rede_lua_recent_reactions(
  p_code text,
  p_participant_id uuid,
  p_token text,
  p_limit integer default 12
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_game record;
  v_participant record;
  v_result jsonb;
begin
  select * into v_game from public.rede_lua_games where code=upper(trim(p_code)) limit 1;
  if not found then raise exception 'GAME_NOT_FOUND'; end if;

  select * into v_participant
  from public.rede_lua_participants
  where id=p_participant_id
    and game_id=v_game.id
    and token_hash=encode(extensions.digest(p_token,'sha256'),'hex')
  limit 1;
  if not found then raise exception 'INVALID_PARTICIPANT'; end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id',x.id,
    'reactionId',x.reaction_id,
    'participantId',x.participant_id,
    'displayName',x.display_name,
    'createdAt',(extract(epoch from x.created_at)*1000)::bigint
  ) order by x.created_at asc),'[]'::jsonb)
  into v_result
  from (
    select r.id,r.reaction_id,r.participant_id,p.display_name,r.created_at
    from public.rede_lua_game_reactions r
    join public.rede_lua_participants p on p.id=r.participant_id
    where r.game_id=v_game.id
    order by r.created_at desc
    limit greatest(1,least(coalesce(p_limit,12),30))
  ) x;

  return v_result;
end;
$$;

create or replace function public.rede_lua_host_recent_reactions(
  p_code text,
  p_limit integer default 20
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_game record;
  v_result jsonb;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into v_game
  from public.rede_lua_games
  where code=upper(trim(p_code)) and host_id=auth.uid()
  limit 1;
  if not found then raise exception 'GAME_NOT_FOUND'; end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id',x.id,
    'reactionId',x.reaction_id,
    'participantId',x.participant_id,
    'displayName',x.display_name,
    'createdAt',(extract(epoch from x.created_at)*1000)::bigint
  ) order by x.created_at asc),'[]'::jsonb)
  into v_result
  from (
    select r.id,r.reaction_id,r.participant_id,p.display_name,r.created_at
    from public.rede_lua_game_reactions r
    join public.rede_lua_participants p on p.id=r.participant_id
    where r.game_id=v_game.id
    order by r.created_at desc
    limit greatest(1,least(coalesce(p_limit,20),50))
  ) x;

  return v_result;
end;
$$;

-- Least privilege for exposed RPCs.
revoke all on function public.rede_lua_remove_activity(uuid) from public, anon, authenticated;
revoke all on function public.rede_lua_duplicate_activity(uuid) from public, anon, authenticated;
revoke all on function public.rede_lua_send_reaction(text,uuid,text,text) from public, anon, authenticated;
revoke all on function public.rede_lua_recent_reactions(text,uuid,text,integer) from public, anon, authenticated;
revoke all on function public.rede_lua_host_recent_reactions(text,integer) from public, anon, authenticated;

grant execute on function public.rede_lua_remove_activity(uuid) to authenticated;
grant execute on function public.rede_lua_duplicate_activity(uuid) to authenticated;
grant execute on function public.rede_lua_send_reaction(text,uuid,text,text) to anon, authenticated;
grant execute on function public.rede_lua_recent_reactions(text,uuid,text,integer) to anon, authenticated;
grant execute on function public.rede_lua_host_recent_reactions(text,integer) to authenticated;
