# Rede Lua Educação — v9.3

## O que foi feito

### 1) Avatar com IA integrado ao LuaID
- Novo bloco **"Versão IA do seu avatar"** dentro do LuaID.
- A própria API monta o prompt automaticamente usando:
  - estilo do avatar
  - peças selecionadas
  - nome
  - título
  - bio
  - vida atual
  - estrelas de legado
- A aba mostra:
  - avatar base do LuaID
  - imagem real gerada pela IA
  - prompt automático usado
- Endpoint novo: `POST /api/avatar/v2/enhance`

### 2) Metadados da geração IA
- A imagem real é devolvida diretamente ao frontend e aparece na aba de escolha.
- Para não gastar requisições reabrindo a mesma URL no tier gratuito, a v9.3 não força persistência do arquivo da imagem.
- Novas colunas em `rede_lua_profiles`:
  - `avatar_ai_prompt`
  - `avatar_ai_image_url`
  - `avatar_ai_seed`
  - `avatar_ai_provider`
  - `avatar_ai_generated_at`
- Nova RPC:
  - `rede_lua_set_avatar_ai_preview(...)`

### 3) Notificação 3x após reset de perfil / Nova Vida
- Nova tabela: `rede_lua_user_notifications`
- Novas RPCs:
  - `rede_lua_my_notifications()`
  - `rede_lua_notification_ping(uuid)`
  - `rede_lua_notification_ack(uuid)`
- `rede_lua_begin_new_life()` agora:
  - reseta a parte visual do perfil
  - limpa a última prévia IA salva
  - cria uma notificação persistente
- O frontend abre um modal de aviso até **3 vezes** (em navegações diferentes) até o usuário clicar em **Entendi**.

### 4) Variáveis novas
No Cloudflare Pages / Functions:
- `POLLINATIONS_BASE_URL=https://image.pollinations.ai/prompt`
- `POLLINATIONS_MODEL=flux`
- `POLLINATIONS_TOKEN=` (opcional)

## Arquivos principais alterados
- `functions/api/[[path]].ts`
- `functions/lib/types.ts`
- `frontend/src/api.ts`
- `frontend/src/types.ts`
- `frontend/src/views/LuaIDView.tsx`
- `frontend/src/App.tsx`
- `frontend/src/v91.css`
- `supabase/migrations/20260919_rede_lua_avatar_ai_notifications_v93.sql`
- `.dev.vars.example`
- `wrangler.toml`
