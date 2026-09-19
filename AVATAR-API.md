# Lua Avatar API

API visual própria da Rede Lua para gerar identidades consistentes em perfil, jogo, ranking, cartão e integrações externas.

## Filosofia

O motor não reutiliza as artes do Kahoot ou de outras plataformas. Os desenhos SVG e a composição são próprios da Rede Lua. Referências externas serviram apenas para identificar qualidades desejáveis: leitura rápida, expressividade e variedade.

## Combinações

A API separa o avatar em camadas independentes:

- espécie
- expressão
- olhos
- marca facial
- roupa
- item de cabeça
- item de rosto
- aura
- moldura
- companheiro
- fundo

Mesmo sem contar seeds e variações futuras, a combinação dessas camadas permite milhões de aparências possíveis.

## Cache

Avatares renderizados usam cache público longo porque a URL contém seed + configuração. Ao mudar uma peça, a URL muda e um novo SVG é gerado.

## Compatibilidade

A rota antiga `/api/luaid/avatar/lua-mates/:seed.svg` continua funcionando e passa a usar o motor v2.
