# Rede Lua Educação v6.2 — Avatar Fun Studio

Esta atualização amplia o Mega Perfil para públicos mais novos e adolescentes sem depender de foto real.

## Novidades

- Dois novos estilos open source do DiceBear: **Bottts (Robô)** e **Pixel Art**.
- Seis looks rápidos: Pirata Lunar, Robô Neon, Gamer Pixel, Mago Cósmico, Street Lunar e Agente Órbita.
- Camada própria **Acessórios Lua**, salva dentro de `avatar_config` do perfil.
- Acessórios extras: chapéu pirata, tapa-olho, headset gamer, chapéu de mago, boné street, antena robô, visor neon, óculos estrela e máscara tech.
- Efeitos: estrelas, neon, pixels e órbita cósmica.
- Molduras: pirata, tech, arcade, cósmica e street.
- O editor deixou de expor a seed técnica e agora usa o botão **Outra combinação**.
- As opções avançadas do DiceBear ficam dentro de **Detalhes do personagem**.
- Valores técnicos das peças são convertidos para rótulos mais amigáveis.
- Os acessórios próprios não são enviados como parâmetros para a API DiceBear; ficam na camada de renderização da Rede Lua.

## Banco

A migration `20260916_rede_lua_avatar_fun_v62.sql` amplia a validação de `avatar_style` para aceitar `bottts` e `pixel-art`. Os acessórios extras continuam sendo armazenados no JSONB `rede_lua_profiles.avatar_config` pelas chaves `_luaHead`, `_luaFace`, `_luaAura`, `_luaFrame` e `_luaLook`, sem criar novas tabelas.

## Segurança e privacidade

A personalização continua sem exigir foto real. A aplicação guarda apenas as escolhas do avatar e do cartão do perfil.
