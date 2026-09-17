# Validação v7.0

- Sintaxe TS/TSX: verificada com o parser TypeScript local.
- Imports relativos: verificados contra os arquivos do projeto.
- CSS: chaves balanceadas verificadas.
- Assets Lumi: MP4 H.264 480×480 + posters WebP.
- Banco conectado: migrations v7.0 aplicadas, bootstrap de super admin confirmado e dashboard administrativo executado com sucesso sob sessão autenticada simulada.
- Autorização: uma conta de professor normal foi verificada como `is_admin = false`.
- Build completo com dependências: depende do ambiente de deploy/registry; Cloudflare Pages continua sendo a validação final de bundling.
