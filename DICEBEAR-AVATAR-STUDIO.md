# Avatar Studio — DiceBear

A Rede Lua v6 usa a API open source do DiceBear para montar avatares combináveis. O frontend lê o endpoint `options.json` do estilo selecionado e monta controles para cabelo, óculos, olhos, acessórios, cores e outras peças que aquele estilo disponibiliza.

## Desenvolvimento rápido

Sem configurar nada, o frontend usa `https://api.dicebear.com/10.x`.

## Produção / self-host

```bash
docker compose -f docker-compose.avatar.yml up -d
```

Depois coloque no frontend:

```env
VITE_DICEBEAR_API_URL=https://avatar.seudominio.com/10.x
```

O container deixa `OPTIONS=1` ligado porque o Estúdio de Perfil usa `/<style>/options.json` para descobrir as opções permitidas sem hardcode.

> Dica: publique o container atrás de Caddy/Nginx/Cloudflare e aplique cache. O Supabase guarda apenas `avatar_style`, `avatar_seed` e `avatar_config`; a imagem é gerada sob demanda.
