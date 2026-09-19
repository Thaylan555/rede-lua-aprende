# Rede Lua v9.4 — Avatar AI Reference

Esta versão corrige o principal problema visual visto na v9.3: a IA podia ignorar o LuaMate e inventar um retrato humano.

## Mudanças
- Prompt automático refeito para priorizar **mascote não-humano** e a espécie escolhida.
- Nome da pessoa removido do núcleo visual do prompt para não induzir retrato humano.
- `enhance=true` removido do modo gratuito para impedir que o provedor reescreva demais o prompt.
- Fallback gratuito troca o padrão para `zimage`, mais voltado a visual estilizado.
- Quando `POLLINATIONS_TOKEN` está configurado, a API passa a usar modo **image-to-image** com a imagem real do LuaMate como referência.
- Modelo de referência configurável por `POLLINATIONS_EDIT_MODEL` (padrão `kontext`).
- O frontend mostra se a geração usou **Modo referência** ou **Modo gratuito por prompt**.

## Variáveis
```env
POLLINATIONS_MODEL=zimage
POLLINATIONS_EDIT_MODEL=kontext
POLLINATIONS_TOKEN=
```

Sem token, a geração continua funcionando pelo fallback legado, mas não há garantia de fidelidade perfeita ao avatar-base. Com token, a imagem-base é enviada como referência e a fidelidade tende a ser muito maior.
