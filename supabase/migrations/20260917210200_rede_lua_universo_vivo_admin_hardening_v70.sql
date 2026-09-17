create or replace function public.rede_lua_is_admin()
returns boolean language sql stable security definer set search_path=public,pg_temp as $$
 select exists(
   select 1 from public.rede_lua_admins a join public.rede_lua_profiles p on p.user_id=a.user_id
   where a.user_id=(select auth.uid()) and p.account_status='active'
 );
$$;
revoke all on function public.rede_lua_is_admin() from public,anon;
grant execute on function public.rede_lua_is_admin() to authenticated,service_role;

create or replace function public.rede_lua_is_super_admin()
returns boolean language sql stable security definer set search_path=public,pg_temp as $$
 select exists(
   select 1 from public.rede_lua_admins a join public.rede_lua_profiles p on p.user_id=a.user_id
   where a.user_id=(select auth.uid()) and a.role='super_admin' and p.account_status='active'
 );
$$;
revoke all on function public.rede_lua_is_super_admin() from public,anon;
grant execute on function public.rede_lua_is_super_admin() to authenticated,service_role;

create or replace function public.rede_lua_is_teacher()
returns boolean language sql stable security definer set search_path=public,pg_temp as $$
 select exists(select 1 from public.rede_lua_profiles p where p.user_id=(select auth.uid()) and p.role in ('teacher','admin') and p.account_status='active');
$$;

create or replace function public.rede_lua_admin_set_user_status(p_user_id uuid,p_status text,p_reason text default '')
returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare v_uid uuid:=(select auth.uid()); v_target_admin_role text;
begin
 if v_uid is null or not public.rede_lua_is_admin() then raise exception 'ADMIN_REQUIRED'; end if;
 if p_status not in ('active','suspended') then raise exception 'INVALID_STATUS'; end if;
 if p_user_id=v_uid and p_status='suspended' then raise exception 'CANNOT_SUSPEND_SELF'; end if;
 select role into v_target_admin_role from public.rede_lua_admins where user_id=p_user_id;
 if v_target_admin_role is not null and not public.rede_lua_is_super_admin() then raise exception 'ADMIN_ROLE_PROTECTED'; end if;
 if v_target_admin_role='super_admin' and p_status='suspended' then raise exception 'SUPER_ADMIN_PROTECTED'; end if;
 update public.rede_lua_profiles set account_status=p_status,suspension_reason=left(coalesce(p_reason,''),300),updated_at=now() where user_id=p_user_id;
 if not found then raise exception 'PROFILE_NOT_FOUND'; end if;
 perform public.rede_lua_admin_log('user_status','profile',p_user_id::text,jsonb_build_object('status',p_status,'reason',left(coalesce(p_reason,''),300)));
 return true;
end; $$;
revoke all on function public.rede_lua_admin_set_user_status(uuid,text,text) from public,anon;
grant execute on function public.rede_lua_admin_set_user_status(uuid,text,text) to authenticated,service_role;
