-- Limpeza para builds intermediários da v6.9 que chegaram a criar uma coluna `shared` duplicada.
drop index if exists public.rede_lua_question_bank_shared_subject_idx;
drop function if exists public.rede_lua_shared_questions(text,integer);
drop function if exists public.rede_lua_toggle_question_share(uuid,boolean);
alter table public.rede_lua_question_bank drop column if exists shared;
