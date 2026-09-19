-- Rede Lua v9.3 — Avatar AI assistido + notificações persistentes de reset.

alter table public.rede_lua_profiles
  add column if not exists avatar_ai_prompt text,
  add column if not exists avatar_ai_image_url text,
  add column if not exists avatar_ai_seed text,
  add column if not exists avatar_ai_provider text,
  add column if not exists avatar_ai_generated_at timestamptz;

create table if not exists public.rede_lua_user_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  title text not null,
  message text not null,
  payload jsonb not null default '{}'::jsonb,
  seen boolean not null default false,
  times_to_show integer not null default 3,
  times_shown integer not null default 0,
  last_shown_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rede_lua_user_notifications_times_check check (times_to_show between 1 and 10 and times_shown >= 0)
);

create index if not exists rede_lua_user_notifications_user_idx
  on public.rede_lua_user_notifications(user_id, seen, created_at desc);

alter table public.rede_lua_user_notifications enable row level security;

drop policy if exists rede_lua_user_notifications_own_select on public.rede_lua_user_notifications;
create policy rede_lua_user_notifications_own_select
  on public.rede_lua_user_notifications for select to authenticated
  using ((select auth.uid()) is not null and user_id = (select auth.uid()));

drop policy if exists rede_lua_user_notifications_own_update on public.rede_lua_user_notifications;
create policy rede_lua_user_notifications_own_update
  on public.rede_lua_user_notifications for update to authenticated
  using ((select auth.uid()) is not null and user_id = (select auth.uid()))
  with check ((select auth.uid()) is not null and user_id = (select auth.uid()));

revoke all on public.rede_lua_user_notifications from anon, authenticated;
grant select, update on public.rede_lua_user_notifications to authenticated;

create or replace function public.rede_lua_set_avatar_ai_preview(
  p_prompt text,
  p_image_url text,
  p_seed text,
  p_provider text default 'pollinations'
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := (select auth.uid());
  v_row public.rede_lua_profiles;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  update public.rede_lua_profiles
     set avatar_ai_prompt = left(coalesce(p_prompt,''), 2400),
         avatar_ai_image_url = left(coalesce(p_image_url,''), 1500),
         avatar_ai_seed = left(coalesce(p_seed,''), 120),
         avatar_ai_provider = left(coalesce(p_provider,'pollinations'), 80),
         avatar_ai_generated_at = now(),
         updated_at = now()
   where user_id = v_uid
   returning * into v_row;

  if not found then raise exception 'PROFILE_NOT_FOUND'; end if;

  return jsonb_build_object(
    'ok', true,
    'imageUrl', v_row.avatar_ai_image_url,
    'prompt', v_row.avatar_ai_prompt,
    'seed', v_row.avatar_ai_seed,
    'provider', coalesce(v_row.avatar_ai_provider, 'pollinations'),
    'generatedAt', v_row.avatar_ai_generated_at
  );
end;
$$;
revoke all on function public.rede_lua_set_avatar_ai_preview(text,text,text,text) from public, anon;
grant execute on function public.rede_lua_set_avatar_ai_preview(text,text,text,text) to authenticated;

create or replace function public.rede_lua_my_notifications()
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := (select auth.uid());
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  return coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'id', n.id,
        'kind', n.kind,
        'title', n.title,
        'message', n.message,
        'payload', n.payload,
        'seen', n.seen,
        'timesToShow', n.times_to_show,
        'timesShown', n.times_shown,
        'lastShownAt', n.last_shown_at,
        'createdAt', n.created_at
      )
      order by n.created_at desc
    )
    from public.rede_lua_user_notifications n
    where n.user_id = v_uid
      and (
        (n.seen = false and n.times_shown < n.times_to_show)
        or n.created_at >= now() - interval '7 days'
      )
  ), '[]'::jsonb);
end;
$$;
revoke all on function public.rede_lua_my_notifications() from public, anon;
grant execute on function public.rede_lua_my_notifications() to authenticated;

create or replace function public.rede_lua_notification_ping(p_notification_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := (select auth.uid());
  v_row public.rede_lua_user_notifications;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;

  update public.rede_lua_user_notifications
     set times_shown = case when times_shown < times_to_show then times_shown + 1 else times_shown end,
         last_shown_at = now(),
         updated_at = now()
   where id = p_notification_id and user_id = v_uid
   returning * into v_row;

  if not found then raise exception 'NOTIFICATION_NOT_FOUND'; end if;

  return jsonb_build_object(
    'id', v_row.id,
    'seen', v_row.seen,
    'timesToShow', v_row.times_to_show,
    'timesShown', v_row.times_shown,
    'lastShownAt', v_row.last_shown_at
  );
end;
$$;
revoke all on function public.rede_lua_notification_ping(uuid) from public, anon;
grant execute on function public.rede_lua_notification_ping(uuid) to authenticated;

create or replace function public.rede_lua_notification_ack(p_notification_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := (select auth.uid());
  v_row public.rede_lua_user_notifications;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;

  update public.rede_lua_user_notifications
     set seen = true,
         updated_at = now()
   where id = p_notification_id and user_id = v_uid
   returning * into v_row;

  if not found then raise exception 'NOTIFICATION_NOT_FOUND'; end if;

  return jsonb_build_object(
    'id', v_row.id,
    'seen', v_row.seen,
    'timesToShow', v_row.times_to_show,
    'timesShown', v_row.times_shown,
    'lastShownAt', v_row.last_shown_at
  );
end;
$$;
revoke all on function public.rede_lua_notification_ack(uuid) from public, anon;
grant execute on function public.rede_lua_notification_ack(uuid) to authenticated;

create or replace function public.rede_lua_begin_new_life()
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_uid uuid := (select auth.uid()); v_p public.rede_lua_profiles; v_req integer; v_stars integer; v_species text;
  v_seed text := encode(gen_random_bytes(12),'hex'); v_snapshot jsonb; v_notification_id uuid;
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
    life_number=life_number+1,
    life_xp=0,
    legacy_stars=legacy_stars+v_stars,
    last_rebirth_at=now(),
    avatar_style='lua-mates',
    avatar_seed=v_seed,
    avatar_ai_prompt=null,
    avatar_ai_image_url=null,
    avatar_ai_seed=null,
    avatar_ai_provider=null,
    avatar_ai_generated_at=null,
    avatar_config=jsonb_build_object('_luaSpecies',v_species,'_luaExpression','happy','_luaOutfit','academy','_luaCompanion','none','_luaHead','none','_luaFace','none','_luaAura','none','_luaFrame','none','_luaLook','reborn'),
    updated_at=now()
  where user_id=v_uid;

  insert into public.rede_lua_user_notifications(user_id,kind,title,message,payload,times_to_show,times_shown)
  values(
    v_uid,
    'profile_reset',
    'Seu perfil foi resetado para uma nova vida',
    'Seu avatar voltou para a base desta nova vida. Recordes, Luas, inventário e legado continuam com você.',
    jsonb_build_object('lifeNumber', v_p.life_number + 1, 'species', v_species, 'legacyStarsEarned', v_stars, 'reset', true),
    3,
    0
  )
  returning id into v_notification_id;

  return jsonb_build_object('ok',true,'lifeNumber',v_p.life_number+1,'legacyStarsEarned',v_stars,'species',v_species,'message','NOVA_VIDA_STARTED','notificationId',v_notification_id);
end;
$$;
revoke all on function public.rede_lua_begin_new_life() from public, anon;
grant execute on function public.rede_lua_begin_new_life() to authenticated;
