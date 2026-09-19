# Rede Lua v9.3.1 — Hotfix Cloudflare Build

Corrige o TypeScript `TS18047` em `LuaIDView.tsx` durante `npm run build`.

## Correção
A mutation de geração do avatar por IA era criada antes do `if (!user)` que encerra o componente. Por isso o TypeScript não podia garantir que `user` não era `null` dentro da closure.

Antes:
```ts
lifeNumber: user.lifeNumber,
legacyStars: user.legacyStars,
```

Agora:
```ts
lifeNumber: user?.lifeNumber ?? 1,
legacyStars: user?.legacyStars ?? 0,
```

Nenhuma alteração de banco é necessária para este hotfix. A migration v9.3 já permanece aplicada.
