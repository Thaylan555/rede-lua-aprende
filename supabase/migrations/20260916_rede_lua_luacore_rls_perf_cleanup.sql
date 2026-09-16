-- Consolidate LuaCore read policies to avoid duplicate permissive RLS evaluation.

drop policy if exists rede_lua_participants_host_read on public.rede_lua_participants;
drop policy if exists rede_lua_participants_own_read on public.rede_lua_participants;
create policy rede_lua_participants_read on public.rede_lua_participants
for select to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1 from public.rede_lua_games g
    where g.id = rede_lua_participants.game_id
      and g.host_id = (select auth.uid())
  )
);

drop policy if exists rede_lua_answers_host_read on public.rede_lua_answers;
drop policy if exists rede_lua_answers_own_read on public.rede_lua_answers;
create policy rede_lua_answers_read on public.rede_lua_answers
for select to authenticated
using (
  exists (
    select 1 from public.rede_lua_participants p
    where p.id = rede_lua_answers.participant_id
      and p.user_id = (select auth.uid())
  )
  or exists (
    select 1 from public.rede_lua_games g
    where g.id = rede_lua_answers.game_id
      and g.host_id = (select auth.uid())
  )
);

drop policy if exists rede_lua_mastery_own_read on public.rede_lua_mastery;
drop policy if exists rede_lua_mastery_teacher_read on public.rede_lua_mastery;
create policy rede_lua_mastery_read on public.rede_lua_mastery
for select to authenticated
using (
  user_id = (select auth.uid())
  or (
    (select public.rede_lua_is_teacher())
    and exists (
      select 1
      from public.rede_lua_participants p
      join public.rede_lua_games g on g.id = p.game_id
      where p.user_id = rede_lua_mastery.user_id
        and g.host_id = (select auth.uid())
    )
  )
);
