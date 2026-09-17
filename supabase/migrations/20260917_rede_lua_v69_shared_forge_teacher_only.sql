-- Banco compartilhado é um recurso do Studio do Professor.
create or replace function public.rede_lua_shared_forge(p_subject text default null,p_limit integer default 30)
returns table(id uuid,owner_id uuid,creator_name text,subject text,skill_key text,prompt text,choices jsonb,correct_index integer,explanation text,difficulty text,tags text[],times_used integer,updated_at timestamptz)
language plpgsql stable security definer set search_path='public','pg_temp' as $$
begin
  if (select auth.uid()) is null then raise exception 'AUTH_REQUIRED'; end if;
  if not public.rede_lua_is_teacher() then raise exception 'TEACHER_REQUIRED'; end if;
  return query
    select q.id,q.owner_id,p.display_name,q.subject,q.skill_key,q.prompt,q.choices,q.correct_index,q.explanation,q.difficulty,q.tags,q.times_used,q.updated_at
    from public.rede_lua_question_bank q
    join public.rede_lua_profiles p on p.user_id=q.owner_id
    where q.is_shared=true
      and (p_subject is null or trim(p_subject)='' or lower(q.subject)=lower(trim(p_subject)))
    order by q.times_used desc,q.updated_at desc
    limit greatest(1,least(coalesce(p_limit,30),60));
end; $$;
revoke all on function public.rede_lua_shared_forge(text,integer) from public;
grant execute on function public.rede_lua_shared_forge(text,integer) to authenticated;
