# Rede Lua Educação v6.8.1 — Correção de permissão do Perfil Vivo

Corrige o erro `permission denied for function rede_lua_profile_text_safe` ao salvar o Mega Perfil.

A função de trigger de moderação agora executa como `SECURITY DEFINER` com `search_path` fixo, enquanto a função auxiliar continua sem acesso direto para `anon` e `authenticated`.

Isso mantém a moderação no banco sem expor a função auxiliar como RPC pública.
