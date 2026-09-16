# Deploy da Rede Lua no Cloudflare Pages

## 1. Supabase

O Supabase conectado é o núcleo do projeto. Não é necessário D1, R2, Qdrant, Meilisearch ou Matomo.

Configure no frontend:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Configure também nas Pages Functions:

```env
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

## 2. Build

Comando:

```bash
npm install
npm run typecheck
npm run build
```

Diretório de saída:

```text
frontend/dist
```

## 3. Domínio

No painel do Cloudflare Pages, abra **Custom domains**, adicione `aprende.redelua.xyz` e deixe o Cloudflare criar/validar o DNS.

## 4. LuaCore

Nenhum container extra é necessário. Busca, recomendação, domínio e telemetria ficam no PostgreSQL/Supabase.

- Busca: `rede_lua_search_activities`
- Recomendação: `rede_lua_recommend_activities`
- Analytics: `rede_lua_track_core_event`
- Professor: `rede_lua_forge_questions` + `rede_lua_teacher_radar`
- Aluno: `rede_lua_student_constellation`

## 5. Checklist

- HTTPS ativo no domínio.
- `VITE_SUPABASE_*` configuradas no build.
- RLS ativo no Supabase.
- E-mail de confirmação do Supabase ajustado conforme sua preferência.
- Primeiro professor validado por código de convite.
- `npm run typecheck` e `npm run build` passando antes do deploy.
