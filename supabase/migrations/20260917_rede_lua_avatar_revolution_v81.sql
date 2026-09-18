-- Rede Lua v8.1 — Avatar Revolution
-- LuaMates originais, categorias cosméticas expandidas e validação do LuaID.

alter table public.rede_lua_profiles drop constraint if exists rede_lua_profiles_avatar_style_check;
alter table public.rede_lua_profiles add constraint rede_lua_profiles_avatar_style_check
  check (avatar_style = any(array[
    'lua-mates'::text,'adventurer'::text,'avataaars'::text,'personas'::text,'lorelei'::text,'notionists'::text,
    'bottts'::text,'pixel-art'::text,'big-smile'::text,'fun-emoji'::text,'croodles'::text,'micah'::text
  ]));

alter table public.rede_lua_cosmetic_catalog drop constraint if exists rede_lua_cosmetic_catalog_kind_check;
alter table public.rede_lua_cosmetic_catalog add constraint rede_lua_cosmetic_catalog_kind_check
  check(kind in ('head','face','aura','frame','theme','species','outfit','companion','expression','background'));

insert into public.rede_lua_cosmetic_catalog(id,label,note,kind,value,cost,min_level,emoji,sort_order) values
  ('species-cloud-yeti','Yeti Nuvem','Um LuaMate raro de regiões geladas do universo.','species','cloud-yeti',90,5,'☁️',110),
  ('species-prism-axolotl','Axolote Prisma','Um LuaMate colorido que muda totalmente o cartão.','species','prism-axolotl',75,4,'🩷',120),
  ('species-pock-dragon','Dragão de Bolso','Pequeno, verde e cheio de atitude.','species','pocket-dragon',80,4,'🐲',130),
  ('outfit-space','Traje Espacial','Roupa de exploração para LuaMates.','outfit','space',45,2,'🚀',140),
  ('outfit-arcade','Roupa Arcade','Visual retrô para quem vive no modo jogo.','outfit','arcade',50,3,'🎮',150),
  ('companion-robot-pet','Robô Pet','Companheiro flutuante para qualquer avatar.','companion','robot-pet',55,3,'🤖',160),
  ('companion-planet','Planetinha','Um mini planeta orbitando seu personagem.','companion','planet-buddy',45,2,'🪐',170),
  ('companion-book','Livro Vivo','Um livro que acompanha quem curte aprender.','companion','book-sprite',35,2,'📘',180),
  ('aura-confetti','Aura de Confete','Confetes vivos ao redor do avatar.','aura','confetti',55,3,'🎉',190),
  ('aura-hearts','Aura Coração','Corações flutuantes para um look mais divertido.','aura','hearts',45,2,'💗',200),
  ('aura-books','Biblioteca Voadora','Livros orbitando seu avatar.','aura','books',60,4,'📚',210),
  ('frame-royal','Moldura Real','Dourado e roxo em estilo de carta rara.','frame','royal',70,4,'👑',220),
  ('frame-frost','Moldura Gelo','Moldura azul clara inspirada em mundos gelados.','frame','frost',55,3,'❄️',230),
  ('theme-candy','Tema Doce','Rosa, lilás e amarelo em uma paleta divertida.','theme','candy',70,4,'🍬',240),
  ('theme-forest','Tema Floresta','Verde, dourado e natureza no seu LuaID.','theme','forest',70,4,'🌿',250)
on conflict(id) do update set label=excluded.label,note=excluded.note,kind=excluded.kind,value=excluded.value,cost=excluded.cost,min_level=excluded.min_level,emoji=excluded.emoji,sort_order=excluded.sort_order;

create or replace function public.rede_lua_update_profile_studio(
  p_display_name text,
  p_bio text,
  p_profile_title text,
  p_avatar_style text,
  p_avatar_seed text,
  p_avatar_config jsonb,
  p_profile_theme jsonb,
  p_visibility text,
  p_favorite_subjects text[] default '{}'::text[]
) returns jsonb
language plpgsql
set search_path to 'public'
as $function$
declare v_uid uuid := (select auth.uid()); v_row public.rede_lua_profiles;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if char_length(trim(p_display_name)) not between 2 and 32 then raise exception 'INVALID_DISPLAY_NAME'; end if;
  if char_length(coalesce(p_bio,'')) > 220 then raise exception 'BIO_TOO_LONG'; end if;
  if char_length(trim(coalesce(p_profile_title,''))) not between 2 and 42 then raise exception 'INVALID_PROFILE_TITLE'; end if;
  if p_avatar_style not in ('lua-mates','adventurer','avataaars','personas','lorelei','notionists','bottts','pixel-art','big-smile','fun-emoji','croodles','micah') then raise exception 'INVALID_AVATAR_STYLE'; end if;
  if char_length(trim(coalesce(p_avatar_seed,''))) not between 3 and 80 then raise exception 'INVALID_AVATAR_SEED'; end if;
  if jsonb_typeof(coalesce(p_avatar_config,'{}'::jsonb)) <> 'object' or pg_column_size(coalesce(p_avatar_config,'{}'::jsonb)) > 18000 then raise exception 'INVALID_AVATAR_CONFIG'; end if;
  if jsonb_typeof(coalesce(p_profile_theme,'{}'::jsonb)) <> 'object' or pg_column_size(coalesce(p_profile_theme,'{}'::jsonb)) > 8000 then raise exception 'INVALID_PROFILE_THEME'; end if;
  if p_visibility not in ('private','classroom') then raise exception 'INVALID_VISIBILITY'; end if;

  update public.rede_lua_profiles
  set display_name=trim(p_display_name),bio=left(coalesce(p_bio,''),220),profile_title=trim(p_profile_title),avatar_style=p_avatar_style,
      avatar_seed=trim(p_avatar_seed),avatar_config=coalesce(p_avatar_config,'{}'::jsonb),profile_theme=coalesce(p_profile_theme,'{}'::jsonb),
      profile_visibility=p_visibility,favorite_subjects=coalesce(p_favorite_subjects,'{}'),updated_at=now()
  where user_id=v_uid returning * into v_row;

  if not found then raise exception 'PROFILE_NOT_FOUND'; end if;
  return jsonb_build_object(
    'userId',v_row.user_id,'displayName',v_row.display_name,'role',v_row.role,'bio',v_row.bio,'profileTitle',v_row.profile_title,
    'avatarStyle',v_row.avatar_style,'avatarSeed',v_row.avatar_seed,'avatarConfig',v_row.avatar_config,'profileTheme',v_row.profile_theme,
    'visibility',v_row.profile_visibility,'favoriteSubjects',to_jsonb(v_row.favorite_subjects),'xp',v_row.xp,'level',v_row.level,
    'streakDays',v_row.streak_days,'moonCoins',v_row.moon_coins
  );
end; $function$;
