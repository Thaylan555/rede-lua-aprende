-- Rede Lua Educação v6.8.1
-- Corrige a moderação de perfil sem expor a função auxiliar como RPC pública.

alter function public.rede_lua_guard_profile_text() security definer;
alter function public.rede_lua_guard_profile_text() set search_path = public, pg_temp;

revoke all on function public.rede_lua_profile_text_safe(text) from public, anon, authenticated;
revoke all on function public.rede_lua_guard_profile_text() from public, anon, authenticated;
grant execute on function public.rede_lua_guard_profile_text() to service_role;
