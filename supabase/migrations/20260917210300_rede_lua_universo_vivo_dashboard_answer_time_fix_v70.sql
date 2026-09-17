create or replace function public.rede_lua_admin_dashboard()
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare v_uid uuid:=(select auth.uid()); v_result jsonb;
begin
 if v_uid is null or not public.rede_lua_is_admin() then raise exception 'ADMIN_REQUIRED'; end if;
 select jsonb_build_object(
 'users',(select count(*) from public.rede_lua_profiles),
 'students',(select count(*) from public.rede_lua_profiles where role='student'),
 'teachers',(select count(*) from public.rede_lua_profiles where role='teacher'),
 'admins',(select count(*) from public.rede_lua_admins),
 'suspended',(select count(*) from public.rede_lua_profiles where account_status='suspended'),
 'activities',(select count(*) from public.rede_lua_activities where status<>'archived'),
 'gamesToday',(select count(*) from public.rede_lua_games where created_at>=date_trunc('day',now())),
 'answersToday',(select count(*) from public.rede_lua_answers where answered_at>=date_trunc('day',now())),
 'activeAnnouncements',(select count(*) from public.rede_lua_announcements where active and starts_at<=now() and (ends_at is null or ends_at>now())),
 'recentUsers',coalesce((select jsonb_agg(jsonb_build_object('userId',p.user_id,'displayName',p.display_name,'role',p.role,'level',p.level,'status',p.account_status,'createdAt',p.created_at) order by p.created_at desc) from (select * from public.rede_lua_profiles order by created_at desc limit 8) p),'[]'::jsonb)
 ) into v_result;
 return v_result;
end; $$;
revoke all on function public.rede_lua_admin_dashboard() from public,anon;
grant execute on function public.rede_lua_admin_dashboard() to authenticated,service_role;
