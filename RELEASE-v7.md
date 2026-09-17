# Rede Lua na Educação v7.0 — Universo Vivo

A v7.0 transforma a Rede Lua em um ambiente mais vivo, divertido e administrável sem abandonar a base pedagógica das versões anteriores.

## Interface viva

- **Lumi oficial integrado** com quatro animações leves em MP4/WebP, usadas em momentos contextuais da interface.
- **Modo Eclipse secreto** ao interagir repetidamente com a marca/lua.
- **Fragmentos lunares escondidos** em diferentes telas; encontrar todos rende uma conquista secreta e Luas.
- **Microanimações**, feedback de hover/toque, entrada suave de cards e respeito a `prefers-reduced-motion`.
- **Avisos globais** administráveis para alunos, professores ou toda a plataforma.
- **Feature flags** para ligar/desligar experiências sem novo deploy.

## Rede Lua Control

A nova área administrativa é autorizada no backend por `user_id`, não por condição no frontend. O bootstrap inicial é vinculado ao usuário autenticado de `lukycristal02@gmail.com`, que recebe `super_admin`.

Inclui:

- resumo de usuários, professores, atividades, partidas e respostas;
- busca de usuários, mudança aluno/professor e suspensão/reativação;
- geração de convites de professor;
- moderação/arquivamento de atividades;
- edição de preço, nível mínimo e disponibilidade dos cosméticos;
- publicação de avisos segmentados;
- feature flags;
- trilha de auditoria de ações administrativas.

## Backend

- `rede_lua_admins` separa privilégio administrativo do perfil visual.
- RPCs administrativas usam `SECURITY DEFINER`, `search_path` fixo e validação de admin no servidor.
- Contas suspensas deixam de passar nas verificações de professor/admin.
- Super admin é protegido contra suspensão acidental.
- Loja Lunar agora consulta um catálogo no banco em vez de preços hardcoded.
- Segredos e recompensas são concedidos pelo banco e não pelo navegador.

## Assets do Lumi

Os vídeos enviados foram preparados para web e ficam em:

`frontend/public/assets/rede-lua/lumi/`

Foram criados posters WebP para reduzir custo de carregamento e oferecer fallback quando movimento reduzido estiver ativo.

## Deploy

Depois de aplicar o patch:

```bash
npm install
npm run build
```

No projeto conectado desta conversa, as migrations da v7.0 já foram aplicadas no Supabase.
