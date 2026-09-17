-- Rede Lua v7.0 — catálogo cosmético e moderação de conteúdo
create table if not exists public.rede_lua_cosmetic_catalog (
 id text primary key,
 label text not null,
 note text not null default '',
 kind text not null check(kind in ('head','face','aura','frame','theme')),
 value text not null,
 cost integer not null default 0 check(cost>=0),
 min_level integer not null default 1 check(min_level>=1),
 emoji text not null default '✨',
 active boolean not null default true,
 sort_order integer not null default 100,
 updated_by uuid null references auth.users(id) on delete set null,
 updated_at timestamptz not null default now()
);
alter table public.rede_lua_cosmetic_catalog enable row level security;
drop policy if exists rede_lua_cosmetic_catalog_active_select on public.rede_lua_cosmetic_catalog;
create policy rede_lua_cosmetic_catalog_active_select on public.rede_lua_cosmetic_catalog for select to authenticated using(active=true);
insert into public.rede_lua_cosmetic_catalog(id,label,note,kind,value,cost,min_level,emoji,sort_order) values
 ('head-comet-crown','Coroa Cometa','Uma coroa espacial para looks especiais.','head','comet-crown',60,3,'☄️',10),
 ('face-prism-glasses','Óculos Prisma','Lentes coloridas com vibe futurista.','face','prism-glasses',45,2,'🌈',20),
 ('aura-comet','Rastro de Cometa','Partículas passando atrás do avatar.','aura','comet',35,2,'✨',30),
 ('frame-quasar','Moldura Quasar','Uma moldura brilhante para destacar o cartão.','frame','quasar',50,3,'🪐',40),
 ('theme-aurora','Tema Aurora','Paleta especial verde, azul e dourado.','theme','aurora',80,4,'🌌',50)
on conflict(id) do nothing;
grant select on public.rede_lua_cosmetic_catalog to authenticated;

create or replace function public.rede_lua_cosmetic_catalog()
returns table(id text,label text,note text,kind text,value text,cost integer,min_level integer,emoji text)
language sql stable security definer set search_path=public,pg_temp as $$
 select c.id,c.label,c.note,c.kind,c.value,c.cost,c.min_level,c.emoji from public.rede_lua_cosmetic_catalog c where c.active=true order by c.sort_order,c.id;
$$;
revoke all on function public.rede_lua_cosmetic_catalog() from public,anon;
grant execute on function public.rede_lua_cosmetic_catalog() to authenticated,service_role;

create or replace function public.rede_lua_unlock_cosmetic(p_item_id text)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare v_uid uuid:=(select auth.uid()); v_cost integer; v_min_level integer; v_level integer; v_coins integer;
begin
 if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
 select cost,min_level into v_cost,v_min_level from public.rede_lua_cosmetic_catalog where id=p_item_id and active=true;
 if not found then raise exception 'INVALID_COSMETIC'; end if;
 if exists(select 1 from public.rede_lua_cosmetic_unlocks where user_id=v_uid and item_id=p_item_id) then
   select moon_coins,level into v_coins,v_level from public.rede_lua_profiles where user_id=v_uid;
   return jsonb_build_object('ok',true,'alreadyUnlocked',true,'coins',v_coins);
 end if;
 select moon_coins,level into v_coins,v_level from public.rede_lua_profiles where user_id=v_uid for update;
 if v_level<v_min_level then raise exception 'COSMETIC_LEVEL_REQUIRED'; end if;
 if v_coins<v_cost then raise exception 'NOT_ENOUGH_MOON_COINS'; end if;
 update public.rede_lua_profiles set moon_coins=moon_coins-v_cost,updated_at=now() where user_id=v_uid;
 insert into public.rede_lua_cosmetic_unlocks(user_id,item_id) values(v_uid,p_item_id) on conflict do nothing;
 return jsonb_build_object('ok',true,'alreadyUnlocked',false,'coins',v_coins-v_cost,'itemId',p_item_id);
end; $$;
revoke all on function public.rede_lua_unlock_cosmetic(text) from public,anon;
grant execute on function public.rede_lua_unlock_cosmetic(text) to authenticated,service_role;

create or replace function public.rede_lua_admin_cosmetics()
returns setof public.rede_lua_cosmetic_catalog language sql stable security definer set search_path=public,pg_temp as $$
 select c.* from public.rede_lua_cosmetic_catalog c where public.rede_lua_is_admin() order by c.sort_order,c.id;
$$;
revoke all on function public.rede_lua_admin_cosmetics() from public,anon;
grant execute on function public.rede_lua_admin_cosmetics() to authenticated,service_role;

create or replace function public.rede_lua_admin_update_cosmetic(p_id text,p_cost integer,p_min_level integer,p_active boolean)
returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare v_uid uuid:=(select auth.uid());
begin
 if v_uid is null or not public.rede_lua_is_admin() then raise exception 'ADMIN_REQUIRED'; end if;
 update public.rede_lua_cosmetic_catalog set cost=greatest(0,least(coalesce(p_cost,0),100000)),min_level=greatest(1,least(coalesce(p_min_level,1),999)),active=coalesce(p_active,true),updated_by=v_uid,updated_at=now() where id=p_id;
 if not found then raise exception 'COSMETIC_NOT_FOUND'; end if;
 perform public.rede_lua_admin_log('cosmetic_update','cosmetic',p_id,jsonb_build_object('cost',p_cost,'minLevel',p_min_level,'active',p_active));
 return true;
end; $$;
revoke all on function public.rede_lua_admin_update_cosmetic(text,integer,integer,boolean) from public,anon;
grant execute on function public.rede_lua_admin_update_cosmetic(text,integer,integer,boolean) to authenticated,service_role;

create or replace function public.rede_lua_admin_activities(p_query text default null,p_limit integer default 60)
returns table(id uuid,title text,subject text,status text,author_id uuid,author_name text,games integer,questions integer,created_at timestamptz)
language sql stable security definer set search_path=public,pg_temp as $$
 select a.id,a.title,a.subject,a.status,a.author_id,p.display_name,count(distinct g.id)::int,count(distinct q.id)::int,a.created_at
 from public.rede_lua_activities a
 left join public.rede_lua_profiles p on p.user_id=a.author_id
 left join public.rede_lua_games g on g.activity_id=a.id
 left join public.rede_lua_questions q on q.activity_id=a.id
 where public.rede_lua_is_admin() and (p_query is null or trim(p_query)='' or a.title ilike '%'||trim(p_query)||'%' or a.subject ilike '%'||trim(p_query)||'%' or p.display_name ilike '%'||trim(p_query)||'%')
 group by a.id,p.display_name order by a.created_at desc limit greatest(1,least(coalesce(p_limit,60),150));
$$;
revoke all on function public.rede_lua_admin_activities(text,integer) from public,anon;
grant execute on function public.rede_lua_admin_activities(text,integer) to authenticated,service_role;

create or replace function public.rede_lua_admin_archive_activity(p_activity_id uuid,p_archived boolean default true)
returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare v_uid uuid:=(select auth.uid());
begin
 if v_uid is null or not public.rede_lua_is_admin() then raise exception 'ADMIN_REQUIRED'; end if;
 update public.rede_lua_activities set status=case when p_archived then 'archived' else 'draft' end,updated_at=now() where id=p_activity_id;
 if not found then raise exception 'ACTIVITY_NOT_FOUND'; end if;
 perform public.rede_lua_admin_log('activity_archive','activity',p_activity_id::text,jsonb_build_object('archived',p_archived));
 return true;
end; $$;
revoke all on function public.rede_lua_admin_archive_activity(uuid,boolean) from public,anon;
grant execute on function public.rede_lua_admin_archive_activity(uuid,boolean) to authenticated,service_role;
