# E-mail do domínio — Rede Lua

A aplicação usa estes endereços como padrão:

- `support@redelua.xyz` — suporte da plataforma
- `contato@redelua.xyz` — contato geral / remetente do formulário
- `escolas@redelua.xyz` — conversas com escolas

## Receber e-mails

No Cloudflare, habilite **Email Routing** para `redelua.xyz`, confirme um e-mail de destino e crie os três endereços personalizados acima apontando para sua caixa real. O Cloudflare cuida dos registros necessários quando o domínio usa o DNS dele.

## Enviar pelo formulário do site

A v8 usa a Pages Function `POST /api/contact`. Para envio real, verifique `redelua.xyz` em um provedor de e-mail transacional como Resend e configure no Cloudflare Pages:

```env
RESEND_API_KEY=re_...
CONTACT_TO_EMAIL=support@redelua.xyz
CONTACT_FROM_EMAIL=Rede Lua <contato@redelua.xyz>
```

Para também guardar as mensagens na área administrativa:

```env
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
```

**Nunca** exponha essa chave como `VITE_SUPABASE_SERVICE_ROLE_KEY`.

## Sem Resend

O site ainda pode mostrar os links `mailto:` e, se a service-role estiver configurada, armazenar o formulário no Rede Lua Control. Para e-mail automático saindo do formulário, configure um provedor de envio.
