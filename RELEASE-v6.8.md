# Rede Lua Educação v6.8 — Perfil Vivo

A v6.8 usa as ideias de personalização modular e gamificação sem transformar o perfil numa tela cheia de efeitos.

## O que entrou

- **Dnd Kit** no Mega Perfil: o aluno/professor pode arrastar e reorganizar módulos do cartão.
- A ordem fica salva dentro de `avatar_config._luaWidgets`, sem criar dados paralelos desnecessários.
- **Canvas Confetti** ao salvar o primeiro perfil, trocar de visual e subir de nível; respeita `prefers-reduced-motion`.
- **Animate.css** para entradas suaves; o avatar ganha uma flutuação própria discreta e desativável por preferência de movimento.
- **Boring Avatars** gera um **Selo Orbital** SVG determinístico a partir do perfil, sem depender do serviço pago de API.
- **Codinomes locais**: botão “me dá um” cria títulos como “Piloto da Nebulosa” ou “Mentor de Órion”. Não usa Faker nem envia dados pessoais.
- **Moderação dupla**: filtro imediato no frontend + trigger no PostgreSQL para nome, título e bio. O backend continua sendo a autoridade.

## Escolhas técnicas

- `react-beautiful-dnd` não foi usado: o projeto está arquivado/depreciado; a v6.8 usa `@dnd-kit/react`.
- Faker não foi usado para preencher dados reais de estudantes. Para diversão, a plataforma usa um gerador local com palavras curadas.
- `bad-words` não foi usado como única proteção porque a lista padrão não é voltada ao português. O filtro escolar foi feito em PT-BR e repetido no banco.
