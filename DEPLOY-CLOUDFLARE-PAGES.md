# Deploy — Cloudflare Pages • Rede Lua v8

## Build

```text
Framework preset: None
Build command: npm run build
Build output directory: frontend/dist
Root directory: vazio / raiz do repositório
Production branch: main
```

## Variáveis de build do frontend

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_DICEBEAR_API_URL=https://api.dicebear.com/10.x
```

A publishable key pode ser usada no cliente com RLS. Não coloque service-role em variável `VITE_*`.

## Variáveis das Pages Functions

```env
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Para o formulário de contato também guardar mensagens no Rede Lua Control, adicione como **Secret**:

```env
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
```

Para o formulário também enviar e-mail:

```env
RESEND_API_KEY=re_...
CONTACT_TO_EMAIL=support@redelua.xyz
CONTACT_FROM_EMAIL=Rede Lua <contato@redelua.xyz>
```

Depois de adicionar variáveis de build, faça um novo deploy porque o Vite lê `VITE_*` durante a compilação.

## Domínio

Mantenha `redelua.xyz` / `www.redelua.xyz` ligados ao mesmo projeto Pages. Para os endereços de e-mail do domínio, siga `EMAIL-REDE-LUA.md`.
