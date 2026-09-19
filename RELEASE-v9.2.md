# Rede Lua v9.2 — Lua Avatar API 2

A v9.2 troca o renderer simplificado dos LuaMates por uma API de avatar própria da Rede Lua.

## O que mudou

- Lua Avatar Engine v2 em Cloudflare Pages Functions.
- 24 espécies originais, incluindo animais, robôs e criaturas.
- 8 expressões, 6 estilos de olhos, 6 marcas faciais, 8 roupas, acessórios, auras, fundos, molduras e companheiros.
- SVG 512×512 gerado no servidor, determinístico por seed e cacheável em CDN.
- O frontend agora usa exatamente o mesmo renderer da API, evitando diferenças entre perfil, sala e links externos.
- Mantém compatibilidade com configurações antigas da v8/v9 por aliases de acessórios e efeitos.

## Endpoints

### Catálogo

`GET /api/avatar/v2/catalog`

Retorna todas as opções aceitas pelo motor.

### Avatar determinístico

`GET /api/avatar/v2/render/:seed.svg`

Exemplo:

`/api/avatar/v2/render/thaylan.svg?species=nebula-fox&expression=confident&outfit=pirate&head=pirate-hat&face=eyepatch&background=sunset`

### Surpreenda-me

`GET /api/avatar/v2/random?seed=meu-seed`

Retorna a configuração gerada e a URL final de render.

### Composição validada

`POST /api/avatar/v2/compose`

Body:

```json
{
  "seed": "meu-seed",
  "config": {
    "species": "tiny-alien",
    "expression": "curious",
    "eyes": "spark",
    "outfit": "space",
    "head": "space-helmet",
    "face": "neon-visor",
    "aura": "neon",
    "frame": "arcade",
    "companion": "planet-buddy",
    "background": "stars"
  }
}
```

O servidor normaliza valores inválidos antes de produzir a URL.

## Privacidade

O render do avatar usa apenas seed e opções visuais. Não precisa expor e-mail, nome real, ID de autenticação ou dados escolares.
