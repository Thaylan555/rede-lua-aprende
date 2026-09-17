# Validação v6.9

- Migrações da v6.9 aplicadas no projeto Supabase conectado.
- Banco compartilhado restrito ao fluxo de professor autenticado.
- Coluna duplicada temporária `shared` removida; a fonte canônica é `is_shared`.
- Arquivos TypeScript/TSX passaram por verificação sintática local sem dependências instaladas; erros de resolução de módulos são esperados nesse modo.
- `npm install` no ambiente de geração excedeu o tempo disponível, portanto o build completo `tsc -b && vite build` deve ser confirmado pelo próximo deploy do Cloudflare Pages.
