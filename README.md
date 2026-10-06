# Detetive da Vó

Projeto em Next.js com App Router e JavaScript, com login e cadastro por e-mail e senha usando Supabase Auth. A página principal exige uma sessão validada no servidor. CSS próprio, sem biblioteca de estilo. O botão **Analisar** chama a rota protegida `/api/ia`, que retorna a análise como texto simples. A resposta começa vazia.

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

- Nome do produto, campos da tela, prompt, modelo e modo de teste: `desafio.js` na raiz.
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


## Análise com OpenRouter

O projeto está com `modoTeste = false` em `desafio.js`, usando a OpenRouter. Para testar sem acessar a IA ou precisar de uma chave, altere para `true`: a API retorna `respostaExemplo`. O login continua obrigatório também nesse modo.

Para usar a IA real:

1. Configure `OPENROUTER_API_KEY` em `.env.local` no desenvolvimento e nas variáveis de ambiente da Vercel em produção. Essa chave é usada somente no servidor; nunca adicione o prefixo `NEXT_PUBLIC_`.
2. Em `desafio.js`, mantenha `modoTeste` como `false`. Edite `prompt` e `modelo` nesse mesmo arquivo quando quiser trocar a análise.
3. Reinicie o servidor ou faça um novo deploy. O servidor precisa acessar `https://openrouter.ai/api/v1/chat/completions`.

`POST /api/ia` recebe JSON no formato `{ "texto": "Seu texto aqui" }` e retorna apenas o texto da resposta, com `Content-Type: text/plain`. A sessão é validada no servidor. O prompt é enviado como mensagem de sistema e o texto como mensagem da usuária. A rota aceita até 10.000 caracteres e espera até 30 segundos pelo provedor.

O botão mostra **Analisando...** e fica desabilitado durante a solicitação. O status 429 mostra **Você atingiu o limite de uso de hoje.**; essa mensagem corresponde ao status do provedor, sem criar uma cota diária própria.

## Testes da API

```sh
npm test
```

Os testes executam a rota com autenticação e OpenRouter simuladas, sem credenciais ou chamadas externas. Cobrem acesso sem sessão, modo de teste, validação do texto, envio do prompt/modelo, resposta em texto, erro 429, falhas do provedor, respostas inválidas e timeout.

## Histórico no Supabase

Execute o conteúdo de `supabase/migrations/202610060001_create_respostas.sql` no **SQL Editor** do mesmo projeto Supabase configurado no site. A chave anon usada pelo aplicativo não pode criar tabelas. Se já existir uma tabela `respostas` com outro esquema, adapte-a antes; a migração não remove dados existentes.

A tabela `public.respostas` guarda `id`, `user_id`, `texto`, `resposta` e `created_at`. As políticas RLS permitem a cada pessoa inserir e ler somente suas próprias análises. O horário é registrado pelo banco, não pelo navegador.

Após uma análise, a API salva o texto e a resposta usando o ID da sessão validada no servidor. Isso vale também para o modo de teste. Se o banco falhar, a resposta permanece visível e a tela informa que não foi salva, para evitar perder a análise ou repetir a chamada à IA.

A página protegida `/historico` mostra as análises mais recentes primeiro, com data e hora de Brasília e navegação em páginas de 20 registros. O link **Histórico** aparece no topo das páginas autenticadas.
