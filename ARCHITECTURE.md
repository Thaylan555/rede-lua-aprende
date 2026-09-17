# Arquitetura — Rede Lua Educação v6

## Fonte de verdade

O Supabase permanece responsável por autenticação, PostgreSQL, RLS, RPCs e Storage. Não há D1/R2, Qdrant, Meilisearch ou Matomo na arquitetura atual.

## Mega Perfil

`rede_lua_profiles` guarda configuração declarativa, não a imagem renderizada:

- `avatar_style`
- `avatar_seed`
- `avatar_config` JSONB
- `profile_theme` JSONB
- `profile_title`, `bio`, `favorite_subjects`, `profile_visibility`

A imagem é renderizada pelo DiceBear HTTP API. O frontend consulta `/<style>/options.json`, monta os controles disponíveis e salva apenas as escolhas no Supabase.

## Quiz Studio

`rede_lua_activities` agora possui:

- `experience_mode`
- `theme_config`
- `game_config`

`rede_lua_questions` agora possui:

- `question_type`
- `media_url`
- `hint`
- `time_limit_seconds`

A RPC `rede_lua_create_activity_v2` valida e cria a atividade. O jogo recebe tema/config via `rede_lua_game_state` e `rede_lua_host_game_state`.

## Cronômetro

O cliente mostra a contagem regressiva, mas a decisão final de timeout e bônus de velocidade acontece na RPC `rede_lua_answer`, usando `question_started_at` do servidor. Assim, o navegador não é a fonte de verdade da pontuação.

## Imagens

O bucket público `rede-lua-assets` aceita PNG/JPEG/WebP até 3 MB. Políticas limitam upload/alteração/exclusão a caminhos do próprio professor, com `rede_lua_is_teacher()`.


## v6.9 — perfis jogáveis e ecossistema de criação

- `rede_lua_creator_profile()` calcula XP/nível do educador, métricas, emblemas e vitrine sem duplicar esses dados em colunas.
- `rede_lua_player_profile()` monta conquistas e histórico do aluno a partir das partidas reais.
- `moon_coins` é a moeda cosmética ganha em respostas; `rede_lua_cosmetic_unlocks` registra apenas itens já desbloqueados.
- `rede_lua_shared_forge()` expõe perguntas compartilhadas somente para professores autenticados. A cópia preserva o crédito exibido no Hub e cria uma versão editável na Forja do professor.
- Novos estilos DiceBear continuam declarativos: o banco guarda estilo/seed/opções, nunca precisa armazenar a imagem gerada.
- O QR Code usa um link `/#/game?code=...`; o roteador lê o código e pré-preenche a entrada da partida.
