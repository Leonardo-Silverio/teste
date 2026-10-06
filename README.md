# Analisador de texto

Página única em Next.js com App Router e JavaScript. CSS próprio, sem biblioteca de estilo. O botão **Analisar** mostra exatamente o texto digitado, preservando quebras de linha. A resposta começa vazia.

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

- Textos: objeto `textos` em `app/page.js`.
- Cores: variáveis no início de `app/globals.css`.
- Título e descrição do navegador: `metadata` em `app/layout.js`.

## Vercel

Envie o projeto ao GitHub e importe o repositório na Vercel. Use o preset **Next.js**, os comandos padrão e Node.js **24.x**. Não são necessárias variáveis de ambiente ou serviços externos.
