# Arquitetura — Rede Lua Educação v8

## Visão geral

```text
Navegador / App web
  │
  ├─ React + Vite (novo shell v8)
  │   ├─ Aprender
  │   ├─ Studio
  │   ├─ LuaID
  │   ├─ Biblioteca / Jogo
  │   └─ Rede Lua Control
  │
  ├─ Cloudflare Pages Functions
  │   ├─ /api/contact
  │   ├─ /api/luaid/*
  │   └─ fontes educacionais externas
  │
  └─ Supabase
      ├─ Auth
      ├─ PostgreSQL + RLS
      ├─ RPCs pedagógicas
      ├─ Storage
      └─ Admin / auditoria
```

## Aprendizado sem resposta pronta

`rede_lua_study_sessions` registra o ponto atual da trilha e `rede_lua_study_attempts` registra as tentativas. O navegador nunca recebe o `correct_index` nessa experiência.

`rede_lua_study_attempt()` decide a resposta no PostgreSQL. Se estiver errada, devolve apenas uma pista. A explicação é liberada somente em resposta correta. `rede_lua_study_skip()` avança sem devolver o gabarito.

## Studio v3

O frontend monta a atividade e chama `rede_lua_create_activity_v3()`. A validação de modo, perguntas, limites, tema e regras continua no servidor. Modos v8:

- classic
- lunar_rush
- star_hunt
- focus
- boss_battle
- treasure_hunt
- space_race
- card_duel

## LuaID

`rede_lua_profiles.profile_handle` é a identidade curta e única. O LuaID não substitui Supabase Auth: ele é uma camada de identidade pública/visual da Rede Lua.

- `rede_lua_profile_manifest()` → manifesto completo autenticado.
- `rede_lua_public_profile(handle)` → dados públicos limitados.
- `/api/luaid/avatar/...` → proxy/cache do avatar DiceBear.

Nenhuma chave administrativa vai para o navegador.

## Contato e e-mail

`POST /api/contact` valida o formulário na Cloudflare Function. Quando `SUPABASE_SERVICE_ROLE_KEY` está configurada, a mensagem é gravada em `rede_lua_contact_messages`. Com `RESEND_API_KEY`, a mesma requisição também envia e-mail ao endereço de suporte.

A service-role fica somente em secret de servidor. O painel administrativo lê a caixa por RPC autenticada, não por acesso direto do cliente à tabela.

## Compatibilidade

As tabelas, perfis, Sala Viva, Loja Lunar, Admin v7 e RPCs anteriores foram mantidos. Isso permite migrar o frontend sem apagar histórico de quizzes, partidas ou perfis.
