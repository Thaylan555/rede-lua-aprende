# Rede Lua na Educação — v8.0 Nova Plataforma

A v8 deixa de tratar a Rede Lua apenas como um site de quizzes e começa a estrutura de uma **plataforma de aprendizado, criação e identidade digital escolar**.

## O que mudou de verdade

- **Frontend principal refeito**: nova navegação, Home, Aprender, Studio, LuaID e Suporte. As telas antigas de jogo, biblioteca e gestão continuam compatíveis.
- **Modo Aprender sem gabarito pronto**: erro gera pista de raciocínio; a alternativa correta e a explicação só aparecem depois que o aluno chega à resposta. Também é possível pular sem revelar a resposta.
- **Studio v3 do professor**: fluxo em etapas, templates de mini-games, perguntas, visual, regras e preview antes de publicar.
- **Novos mini-games**: Batalha de Chefão, Caça ao Tesouro, Corrida Espacial e Duelo de Cartas, além dos modos anteriores.
- **LuaID**: identidade de perfil com handle único e API própria da Rede Lua sobre Supabase + DiceBear.
- **Suporte/Contato**: formulário same-origin via Cloudflare Pages Function, caixa de entrada administrativa no Supabase e envio opcional por Resend.
- **E-mails no domínio**: estrutura preparada para `support@redelua.xyz`, `contato@redelua.xyz` e `escolas@redelua.xyz`.
- Tudo da v7 (Admin, Lumi, segredos, Loja Lunar, perfis e Sala Viva) continua na base.

## Rotas principais

```text
#/home      início
#/learn     trilha de aprendizado guiado
#/studio    criação de quizzes e mini-games
#/profile   LuaID / personalização
#/library   biblioteca
#/play      sala ao vivo
#/support   suporte e contato
#/admin     Rede Lua Control
```

## API LuaID

```text
GET /api/luaid/me
GET /api/luaid/profile/:handle
GET /api/luaid/avatar/:style/:seed.svg
```

O manifesto autenticado inclui identidade, progresso, avatar, tema e blocos de jogador/criador. O endpoint público só retorna um subconjunto quando o perfil está com visibilidade `classroom`.

## Desenvolvimento

```bash
npm install
npm run typecheck
npm run build
```

Variáveis do frontend:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_DICEBEAR_API_URL=https://api.dicebear.com/10.x
```

Variáveis das Pages Functions:

```env
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
RESEND_API_KEY=re_...
CONTACT_TO_EMAIL=support@redelua.xyz
CONTACT_FROM_EMAIL=Rede Lua <contato@redelua.xyz>
```

> `SUPABASE_SERVICE_ROLE_KEY` e `RESEND_API_KEY` são segredos de servidor. Nunca use prefixo `VITE_` neles.

## Banco v8

Migration:

`supabase/migrations/20260917_rede_lua_nova_plataforma_v80.sql`

Ela adiciona sessões de estudo guiado, LuaID/handle, caixa de contato e o Studio v3.

Veja também `EMAIL-REDE-LUA.md`, `ARCHITECTURE.md` e `RELEASE-v8.md`.

## v8.1 — Avatar Revolution
O LuaID agora inclui os **LuaMates**, mascotes originais da Rede Lua, um Avatar Studio em abas, companheiros, novas peças, efeitos, inventário e uma API própria de avatar. Veja `RELEASE-v8.1.md`.
