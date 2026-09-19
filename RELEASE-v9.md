# Rede Lua v9.0 — Universo 95

A v9.0 é uma reconstrução visual e mecânica do frontend. O objetivo foi trocar a sensação de "site com páginas" por uma plataforma única de aprendizagem, jogo, criação e identidade.

## Mudanças principais

- Novo shell com rail lateral no desktop, HUD superior e dock inferior no mobile.
- Home totalmente nova, com estágio visual, entrada por PIN, caminhos por papel e demonstração de sistemas.
- Motion para transições, microinterações e entrada de conteúdo.
- Design system novo com tokens, CSS Layers, `color-mix()`, glass surfaces, motion reduzido e layout responsivo.
- Novo **Recorde Lua** com melhores marcas pessoais.
- Novo sistema de **Nova Vida**: o avatar pode renascer quando cumpre a meta de XP da vida atual.
- O renascimento reseta apenas o personagem equipado e a progressão da vida atual. Inventário, Luas, badges, Recordes e estrelas de legado permanecem.
- Histórico de vidas anteriores salvo no Supabase.
- Novo **Painel de Impacto** para demonstrar o valor pedagógico para direção/escola.
- Novo **Modo Prosa** com microcopy neutra, mineira, baiana ou misturada. Textos críticos de segurança continuam em português padrão.
- Comando Lunar (`Ctrl/Cmd + K`) para navegação rápida.
- Reestilização profunda das telas legadas: Aprender, Studio, LuaID, Game, Biblioteca, Suporte e Gestão.
- LuaID passa a mostrar a vida atual do personagem.
- Backend com RLS para Recordes e histórico de vidas.

## Nova mecânica: Recordes

O sistema preserva automaticamente marcas como:

- XP de carreira;
- maior nível;
- maior sequência;
- maior pontuação em uma sala;
- vidas concluídas.

Além disso, a área de Recordes mostra partidas concluídas, respostas, acerto geral e, para professor, maior sala aplicada.

## Nova mecânica: Nova Vida

A vida 1 exige 600 XP de vida para renascer. A exigência aumenta em 250 XP a cada nova vida.

Ao renascer:

- o avatar equipado vira um novo LuaMate aleatório;
- `life_xp` volta a 0;
- a vida aumenta em 1;
- o usuário recebe estrelas de legado;
- a vida anterior é arquivada com avatar e Recordes daquele momento.

## Tecnologia de interface

- React 19
- TypeScript
- Vite 8
- TanStack Query
- Motion for React
- Lucide
- CSS Layers + custom properties + `color-mix()`
- Supabase
- Cloudflare Pages/Functions

