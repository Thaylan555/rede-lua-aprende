# Rede Lua Educação v8.1 — Avatar Revolution

A v8.1 reconstrói o sistema de avatar do LuaID. O foco deixa de ser apenas escolher um estilo pronto e passa a ser criar uma identidade colecionável e própria da Rede Lua.

## LuaMates
- 12 mascotes originais desenhados em SVG pelo próprio frontend: Urso Lunar, Raposa Nebular, Pinguim Cósmico, Capivara Lunar, Coruja Sábia, Dragão de Bolso, Robô Órbita, Gato Astro, Axolote Prisma, Coelho Estelar, Macaco Cometa e Yeti Nuvem.
- 4 expressões, 5 roupas e 9 companheiros combináveis.
- Continua possível usar os estilos open source do DiceBear como uma segunda família de avatares.

## Avatar Studio
- Interface do LuaID refeita em abas: Avatar, Identidade, Cartão e Inventário.
- Looks prontos, botão Surpreenda-me e randomização completa.
- Mix & Match de chapéus, acessórios de rosto, auras, molduras e companheiros.
- Novos efeitos: confete, corações, neve e livros voando.
- Novas molduras: Real, Floresta, Gelo e Doce.
- Novo catálogo de itens desbloqueáveis com Luas e requisito de nível.

## Lua Avatar API
- `GET /api/luaid/avatar/catalog`
- `GET /api/luaid/avatar/lua-mates/:seed.svg?species=...&expression=...&outfit=...`
- Os avatares LuaMates são renderizados pela própria Rede Lua; estilos externos continuam passando pelo DiceBear.

## Suporte
- Removido da página o bloco interno "Endereços do seu próprio domínio". Essa informação era útil durante configuração, mas não faz sentido para alunos/professores no produto final.

## Banco
Migration: `20260917_rede_lua_avatar_revolution_v81.sql`.

Ela libera `lua-mates` no perfil e expande o catálogo cosmético para espécies, roupas, companheiros, expressões e fundos.
