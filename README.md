# Rede Lua na Educação — v6.9 Painel de Mestre + Perfil Jogável

A v6 transforma a plataforma em um ecossistema mais personalizável para alunos e professores, mantendo o **Supabase como fonte principal de dados** e o **LuaCore** como núcleo pedagógico.

## O que entrou na v6

- **Mega Perfil** para aluno/professor: nome, título, bio, matérias favoritas, cartão, cores, padrão e visibilidade.
- **Avatar Studio com DiceBear**: 5 estilos disponíveis e opções descobertas dinamicamente via `options.json` (cabelo, óculos, olhos, acessórios, cores e outras peças conforme o estilo).
- **DiceBear self-host opcional** com Docker (`docker-compose.avatar.yml`).
- **Quiz Studio**: temas, paletas, padrão visual, formato dos botões, tipografia, logo próprio e mídia nas perguntas.
- **4 experiências de jogo**: Quiz Clássico, Corrida Lunar, Caça às Estrelas e Modo Foco.
- **Cronômetro autoritativo no servidor** e bônus de velocidade opcional na Corrida Lunar.
- **Verdadeiro/Falso** além de múltipla escolha.
- **Dicas e imagens** nas perguntas.
- **Supabase Storage** para logos e imagens de atividade (`rede-lua-assets`).
- Forja Lunar, Radar de Aprendizagem, Constelação do Aluno, busca nativa e recomendações continuam no LuaCore.

## Arquitetura

```text
Cloudflare Pages (React/Vite)
        │
        ├── Supabase Auth
        ├── Supabase Postgres + RLS + RPC
        ├── Supabase Storage (logos/imagens de quiz)
        └── DiceBear HTTP API (pública ou self-host)

LuaCore no Postgres
  ├── Busca Lunar (FTS + pg_trgm)
  ├── domínio e afinidade
  ├── recomendações
  ├── Forja Lunar
  ├── Radar de Aprendizagem
  └── Constelação do Aluno
```

## Desenvolvimento

```bash
npm install
npm run build
```

Variáveis do frontend:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_DICEBEAR_API_URL=https://api.dicebear.com/10.x
```

Para self-host do Avatar Studio:

```bash
docker compose -f docker-compose.avatar.yml up -d
```

Depois aponte `VITE_DICEBEAR_API_URL` para seu domínio/porta DiceBear terminando em `/10.x`.

## Banco

A migration principal da v6 está em:

`supabase/migrations/20260916_rede_lua_megaprofiles_quiz_studio.sql`

Ela adiciona configuração de perfil, configuração visual de atividades, novos campos de pergunta, Storage e RPCs da v6.

## v6.2 — Avatar Fun Studio

O Mega Perfil ganhou uma camada de personalização própria sobre o DiceBear: looks teen, robô, pixel, pirata, gamer, acessórios Lua, efeitos e molduras. As escolhas extras ficam no JSON `avatar_config`. A v6.2 inclui apenas uma migration pequena para liberar os novos estilos `bottts` e `pixel-art` na validação do perfil.


## v6.6 — Sala Viva
Reações ao vivo nas partidas, remoção segura de atividades com histórico e duplicação de quizzes para reutilização.

## v6.8 — Perfil Vivo

O Mega Perfil agora possui módulos reordenáveis com Dnd Kit, Selo Orbital com Boring Avatars, celebrações com Canvas Confetti, microanimações, gerador local de codinomes e moderação escolar em duas camadas (frontend + PostgreSQL).


## v6.9 — Painel de Mestre + Perfil Jogável

A experiência de professor ganhou um **Painel de Mestre** com XP de educador, nível, emblemas, métricas privadas e vitrine das atividades publicadas. O Hub de Criação oferece quatro pontos de partida: Quiz Relâmpago, Batalha de Chefão, Caça ao Tesouro e Cartas de Desafio. A Forja Lunar também ganhou compartilhamento entre professores com crédito do criador e cópia para a Forja pessoal.

Para a turma, a Constelação agora mostra conquistas e histórico de missões. Respostas logadas rendem **Luas**, usadas na Loja Lunar para desbloquear cosméticos determinísticos do avatar — sem caixas aleatórias. O Avatar Studio ganhou Big Smile, Fun Emoji, Croodles e Micah, além dos estilos já existentes.

A Sala ao Vivo mostra QR Code para entrada rápida. Os templates Chefão e Tesouro também têm componentes visuais próprios durante a partida.

## v7.0 — Universo Vivo

A v7 adiciona a **Rede Lua Control**, animações oficiais do Lumi, avisos globais, feature flags, Easter eggs com recompensas, moderação administrativa e catálogo de cosméticos administrável. A autorização de admin fica no Supabase e não depende do JavaScript do navegador.
