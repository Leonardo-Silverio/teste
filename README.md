# Detetive da Vó

Projeto em Next.js com App Router e JavaScript, com login e cadastro por e-mail e senha usando Supabase Auth. A página principal exige uma sessão validada no servidor. CSS próprio, sem biblioteca de estilo. O botão **Analisar** mostra exatamente o texto digitado, preservando quebras de linha. A resposta começa vazia.

## Desenvolvimento

Use Node.js 24 e npm:

```sh
npm ci
npm run dev
```

## Produção

```sh
npm run build
npm start
```

## Personalização

- Textos da análise: objeto `textos` em `app/analisador.js`.
- Cores: variáveis no início de `app/globals.css`.
- Título e descrição do navegador: `metadata` em `app/layout.js`.

## Vercel

Envie o projeto ao GitHub e importe o repositório na Vercel. Use o preset **Next.js**, os comandos padrão e Node.js **24.x**. Configure as duas variáveis públicas do Supabase abaixo nos ambientes de produção e preview e faça um novo deploy. Nunca use a chave `service_role` no lugar da chave anon.


## Configurar o Supabase

1. Crie um projeto no Supabase e habilite o provedor de e-mail em Authentication.
2. Copie `.env.example` para `.env.local` e preencha `NEXT_PUBLIC_SUPABASE_URL` com a URL do projeto e `NEXT_PUBLIC_SUPABASE_ANON_KEY` com a chave pública anon. Não envie `.env.local` ao GitHub.
3. Em Authentication → URL Configuration, configure **Site URL** com o domínio publicado (ou o endereço local durante o desenvolvimento).
4. Se a confirmação de e-mail estiver habilitada, personalize o link do template **Confirm signup** para `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email`. O callback verifica o token e inicia a sessão. Ele também aceita o parâmetro `code` do fluxo PKCE.
5. Reinicie o servidor local ou faça um novo deploy depois de configurar as variáveis.

A chave anon é pública; a autorização de dados deve ser protegida por políticas RLS no Supabase caso sejam adicionadas tabelas. Nenhuma chave administrativa é necessária.

## Fluxos de autenticação

- `/login`: e-mail, senha, **Entrar** e **Criar conta**.
- `/`: acesso apenas para usuárias autenticadas, com e-mail e botão **Sair**.
- Cadastro com confirmação habilitada: orienta a usuária a conferir o e-mail; sem confirmação, entra diretamente.
- Sessões usam cookies gerenciados por `@supabase/ssr`, com atualização no `proxy.js` (convenção do Next.js 16) e validação por `getUser` no servidor.
- Erros exibidos à usuária são traduzidos para português; mensagens internas do Supabase não são exibidas diretamente.
- Sem configuração do Supabase, a página principal continua bloqueada e o login mostra uma orientação em português.
