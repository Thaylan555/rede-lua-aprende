-- Rede Lua v6.9 — Avatar Plus + Lua Coins por atividade
alter table public.rede_lua_profiles drop constraint if exists rede_lua_profiles_avatar_style_check;
alter table public.rede_lua_profiles add constraint rede_lua_profiles_avatar_style_check
check (avatar_style in ('adventurer','avataaars','personas','lorelei','notionists','bottts','pixel-art','big-smile','fun-emoji','croodles','micah'));

drop function if exists public.rede_lua_forge_questions(text,integer);
create function public.rede_lua_forge_questions(p_subject text default null,p_limit integer default 30)
returns table(id uuid,subject text,skill_key text,prompt text,choices jsonb,correct_index integer,explanation text,difficulty text,tags text[],times_used integer,shared boolean,updated_at timestamptz)
language sql stable set search_path='public' as $$
  select q.id,q.subject,q.skill_key,q.prompt,q.choices,q.correct_index,q.explanation,q.difficulty,q.tags,q.times_used,q.is_shared as shared,q.updated_at
  from public.rede_lua_question_bank q
  where q.owner_id=(select auth.uid()) and (p_subject is null or trim(p_subject)='' or lower(q.subject)=lower(trim(p_subject)))
  order by q.times_used desc,q.updated_at desc limit greatest(1,least(coalesce(p_limit,30),100));
$$;

create or replace function public.rede_lua_update_profile_studio(p_display_name text,p_bio text,p_profile_title text,p_avatar_style text,p_avatar_seed text,p_avatar_config jsonb,p_profile_theme jsonb,p_visibility text,p_favorite_subjects text[] default '{}')
returns jsonb language plpgsql set search_path='public' as $$
declare v_uid uuid := (select auth.uid()); v_row public.rede_lua_profiles;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if char_length(trim(p_display_name)) not between 2 and 32 then raise exception 'INVALID_DISPLAY_NAME'; end if;
  if char_length(coalesce(p_bio,'')) > 220 then raise exception 'BIO_TOO_LONG'; end if;
  if char_length(trim(coalesce(p_profile_title,''))) not between 2 and 42 then raise exception 'INVALID_PROFILE_TITLE'; end if;
  if p_avatar_style not in ('adventurer','avataaars','personas','lorelei','notionists','bottts','pixel-art','big-smile','fun-emoji','croodles','micah') then raise exception 'INVALID_AVATAR_STYLE'; end if;
  if char_length(trim(coalesce(p_avatar_seed,''))) not between 3 and 80 then raise exception 'INVALID_AVATAR_SEED'; end if;
  if jsonb_typeof(coalesce(p_avatar_config,'{}'::jsonb)) <> 'object' or pg_column_size(coalesce(p_avatar_config,'{}'::jsonb)) > 14000 then raise exception 'INVALID_AVATAR_CONFIG'; end if;
  if jsonb_typeof(coalesce(p_profile_theme,'{}'::jsonb)) <> 'object' or pg_column_size(coalesce(p_profile_theme,'{}'::jsonb)) > 8000 then raise exception 'INVALID_PROFILE_THEME'; end if;
  if p_visibility not in ('private','classroom') then raise exception 'INVALID_VISIBILITY'; end if;
  update public.rede_lua_profiles set display_name=trim(p_display_name),bio=left(coalesce(p_bio,''),220),profile_title=trim(p_profile_title),avatar_style=p_avatar_style,avatar_seed=trim(p_avatar_seed),avatar_config=coalesce(p_avatar_config,'{}'::jsonb),profile_theme=coalesce(p_profile_theme,'{}'::jsonb),profile_visibility=p_visibility,favorite_subjects=coalesce(p_favorite_subjects,'{}'),updated_at=now() where user_id=v_uid returning * into v_row;
  if not found then raise exception 'PROFILE_NOT_FOUND'; end if;
  return jsonb_build_object('userId',v_row.user_id,'displayName',v_row.display_name,'role',v_row.role,'bio',v_row.bio,'profileTitle',v_row.profile_title,'avatarStyle',v_row.avatar_style,'avatarSeed',v_row.avatar_seed,'avatarConfig',v_row.avatar_config,'profileTheme',v_row.profile_theme,'visibility',v_row.profile_visibility,'favoriteSubjects',to_jsonb(v_row.favorite_subjects),'xp',v_row.xp,'level',v_row.level,'streakDays',v_row.streak_days,'moonCoins',v_row.moon_coins);
end; $$;

create or replace function public.rede_lua_after_answer_learning()
returns trigger language plpgsql security definer set search_path='public' as $$
declare v_user uuid; v_subject text; v_xp integer; v_coins integer;
begin
  select p.user_id,a.subject into v_user,v_subject from public.rede_lua_participants p join public.rede_lua_games g on g.id=new.game_id join public.rede_lua_activities a on a.id=g.activity_id where p.id=new.participant_id;
  if v_user is null or v_subject is null then return new; end if;
  insert into public.rede_lua_mastery(user_id,subject,attempts,correct_count,mastery_score,confidence,last_result,updated_at)
  values(v_user,v_subject,1,case when new.correct then 1 else 0 end,case when new.correct then 0.5800 else 0.4200 end,0.2500,new.correct,now())
  on conflict(user_id,subject) do update set attempts=public.rede_lua_mastery.attempts+1,correct_count=public.rede_lua_mastery.correct_count+case when new.correct then 1 else 0 end,mastery_score=round(greatest(0.0500,least(0.9800,public.rede_lua_mastery.mastery_score*0.84+(case when new.correct then 1.0 else 0.0 end)*0.16))::numeric,4),confidence=round(least(0.9900,1.0-(1.0/(1.0+((public.rede_lua_mastery.attempts+1)::numeric/3.0))))::numeric,4),last_result=new.correct,updated_at=now();
  insert into public.rede_lua_subject_affinity(user_id,subject,score) values(v_user,v_subject,case when new.correct then 4 else 1 end) on conflict(user_id,subject) do update set score=public.rede_lua_subject_affinity.score+excluded.score,updated_at=now();
  v_xp:=case when new.correct then greatest(18,least(85,18+(new.awarded_points/5))) else 5 end;
  v_coins:=case when new.correct then 4 else 1 end;
  update public.rede_lua_profiles set xp=xp+v_xp,level=greatest(level,1+floor((xp+v_xp)::numeric/500)::integer),moon_coins=moon_coins+v_coins,streak_days=case when last_learning_date=current_date then streak_days when last_learning_date=current_date-1 then streak_days+1 else 1 end,last_learning_date=current_date,updated_at=now() where user_id=v_user;
  return new;
end; $$;

revoke all on function public.rede_lua_forge_questions(text,integer) from public;
revoke all on function public.rede_lua_update_profile_studio(text,text,text,text,text,jsonb,jsonb,text,text[]) from public;
grant execute on function public.rede_lua_forge_questions(text,integer) to authenticated;
grant execute on function public.rede_lua_update_profile_studio(text,text,text,text,text,jsonb,jsonb,text,text[]) to authenticated;
