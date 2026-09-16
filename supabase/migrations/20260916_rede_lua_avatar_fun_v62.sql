-- Rede Lua Educação v6.2 — Avatar Fun Studio
-- Adds the teen-friendly Bottts and Pixel Art DiceBear styles.

alter table public.rede_lua_profiles
  drop constraint if exists rede_lua_profiles_avatar_style_check;

alter table public.rede_lua_profiles
  add constraint rede_lua_profiles_avatar_style_check
  check (avatar_style in ('adventurer','avataaars','personas','lorelei','notionists','bottts','pixel-art'));

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
  if p_avatar_style not in ('adventurer','avataaars','personas','lorelei','notionists','bottts','pixel-art') then raise exception 'INVALID_AVATAR_STYLE'; end if;
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
