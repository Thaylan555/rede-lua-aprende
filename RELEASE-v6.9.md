# Rede Lua Educação v6.9 — Painel de Mestre + Perfil Jogável

## Professor

- Painel de Mestre com nível/XP de educador, métricas, emblemas e vitrine de jogos publicados.
- Hub de Criação com Quiz Relâmpago, Batalha de Chefão, Caça ao Tesouro e Cartas de Desafio.
- Banco Compartilhado da Forja Lunar com autoria visível, compartilhamento opcional e cópia para a Forja pessoal.
- QR Code da Sala ao Vivo para entrada rápida pelo celular.

## Aluno

- Perfil de jogador com Luas, conquistas e histórico recente de missões.
- Luas ganhas em respostas logadas: 4 por acerto e 1 por tentativa incorreta.
- Loja Lunar com desbloqueios por nível + moeda, sem sorteio ou loot box.
- Histórico mostra atividade, matéria, pontuação e data.

## Perfil e avatar

- 11 estilos de base disponíveis no Avatar Studio, incluindo Big Smile, Fun Emoji, Croodles e Micah.
- Loja Lunar adiciona Coroa Cometa, Óculos Prisma, Rastro de Cometa, Moldura Quasar e Tema Aurora.
- Itens premium ficam fora dos seletores gratuitos e só podem ser aplicados depois do desbloqueio.
- Mais presets visuais e miniaturas de estilo para escolher olhando, não apenas lendo nomes.

## Minigames

- O template Batalha de Chefão ganhou barra de energia do chefão durante a partida.
- O template Caça ao Tesouro ganhou progresso visual por pistas.
- Os dois reutilizam o motor de quiz atual, mantendo pontuação e respostas no backend.

## Banco

Migrations da v6.9:
- `20260917_rede_lua_creator_profiles_v69.sql`
- `20260917_rede_lua_creator_hub_avatar_plus_v69.sql`
- `20260917_rede_lua_v69_shared_forge_cleanup.sql`
- `20260917_rede_lua_v69_shared_forge_teacher_only.sql`
