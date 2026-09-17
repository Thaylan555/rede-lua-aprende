-- Rede Lua Educação v6.8 — moderação de texto no perfil (camada do banco)

create or replace function public.rede_lua_profile_text_safe(p_text text)
returns boolean
language sql
immutable
set search_path = public
as $$
  select not (
    regexp_replace(
      translate(
        lower(coalesce(p_text,'')),
        'áàãâäéèêëíìîïóòõôöúùûüç',
        'aaaaaeeeeiiiiooooouuuuc'
      ),
      '[^a-z0-9]+', ' ', 'g'
    ) ~ '(^| )(porra|caralho|merda|buceta|cacete|arrombado|fdp|puta|puto|vadia|vagabunda|vagabundo|nazista|nazismo)( |$)'
  );
$$;

create or replace function public.rede_lua_guard_profile_text()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if not public.rede_lua_profile_text_safe(new.display_name)
     or not public.rede_lua_profile_text_safe(new.profile_title)
     or not public.rede_lua_profile_text_safe(new.bio) then
    raise exception 'PROFILE_TEXT_NOT_ALLOWED';
  end if;
  return new;
end;
$$;

drop trigger if exists rede_lua_profile_text_guard on public.rede_lua_profiles;
create trigger rede_lua_profile_text_guard
before insert or update of display_name, profile_title, bio
on public.rede_lua_profiles
for each row execute function public.rede_lua_guard_profile_text();

revoke all on function public.rede_lua_profile_text_safe(text) from public, anon, authenticated;
revoke all on function public.rede_lua_guard_profile_text() from public, anon, authenticated;
