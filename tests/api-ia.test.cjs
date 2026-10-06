const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');

// Executa a rota real com autenticação e rede simuladas, sem usar credenciais.
async function carregarRota({ modoTeste = false, user = { id: 'teste' }, key = 'chave-simulada', fetchImpl, configured = true, insertError = null } = {}) {
  const chamadas = [];
  const gravacoes = [];
  const context = vm.createContext({
    Response, AbortSignal,
    process: { env: { OPENROUTER_API_KEY: key } },
    fetch: async (...args) => {
      chamadas.push(args);
      return fetchImpl ? fetchImpl(...args) : Response.json({ choices: [{ message: { content: 'Análise em português.' } }] });
    },
  });
  const modules = {
    '../../../desafio': { prompt: 'Prompt configurável.', modelo: 'modelo-configuravel', modoTeste, respostaExemplo: 'Exemplo de teste.' },
    '../../../lib/supabase/server': { createClient: async () => configured ? { auth: { getUser: async () => ({ data: { user }, error: null }) }, from: table => ({ insert: async values => { gravacoes.push({ table, values }); return { error: insertError }; } }) } : null },
  };
  const route = new vm.SourceTextModule(readFileSync('app/api/ia/route.js', 'utf8'), { context });
  await route.link(specifier => {
    const exports = modules[specifier];
    assert.ok(exports, `Import inesperado: ${specifier}`);
    return new vm.SyntheticModule(Object.keys(exports), function () {
      Object.entries(exports).forEach(([name, value]) => this.setExport(name, value));
    }, { context });
  });
  await route.evaluate();
  return { post: route.namespace.POST, chamadas, gravacoes };
}
const request = body => new Request('http://localhost/api/ia', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('sem sessão, não chama a IA, inclusive no modo de teste', async () => {
  const { post, chamadas } = await carregarRota({ user: null, modoTeste: true });
  const response = await post(request({ texto: 'Olá' }));
  assert.equal(response.status, 401);
  assert.match(await response.text(), /Entre novamente/);
  assert.equal(chamadas.length, 0);
});

test('modo de teste retorna exemplo sem chave nem rede', async () => {
  const { post, chamadas } = await carregarRota({ modoTeste: true, key: '' });
  const response = await post(request({ texto: 'Olá' }));
  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'Exemplo de teste.');
  assert.match(response.headers.get('Content-Type'), /text\/plain/);
  assert.equal(chamadas.length, 0);
});

test('valida corpo, tipo, texto vazio e tamanho', async () => {
  const { post, chamadas } = await carregarRota();
  for (const body of [null, {}, { texto: 2 }, { texto: '   ' }, { texto: 'a'.repeat(10001) }]) {
    assert.equal((await post(request(body))).status, 400);
  }
  assert.equal((await post(new Request('http://localhost/api/ia', { method: 'POST', body: '{' }))).status, 400);
  assert.equal(chamadas.length, 0);
});

test('prompt, modelo e texto são enviados; retorna somente o conteúdo', async () => {
  const { post, chamadas } = await carregarRota();
  const response = await post(request({ texto: '  Olá\nVó!  ' }));
  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'Análise em português.');
  assert.equal(chamadas.length, 1);
  const [url, options] = chamadas[0];
  assert.equal(url, 'https://openrouter.ai/api/v1/chat/completions');
  assert.equal(options.method, 'POST');
  assert.equal(options.headers.Authorization, 'Bearer chave-simulada');
  assert.deepEqual(JSON.parse(options.body), { model: 'modelo-configuravel', messages: [{ role: 'system', content: 'Prompt configurável.' }, { role: 'user', content: '  Olá\nVó!  ' }] });
  assert.ok(options.signal);
});

test('429 mantém o status e a mensagem exigida', async () => {
  const { post } = await carregarRota({ fetchImpl: async () => new Response('provider error', { status: 429 }) });
  const response = await post(request({ texto: 'Olá' }));
  assert.equal(response.status, 429);
  assert.equal(await response.text(), 'Você atingiu o limite de uso de hoje.');
});

test('erros do provedor não expõem mensagens internas', async () => {
  const { post } = await carregarRota({ fetchImpl: async () => new Response('internal-secret-provider-error', { status: 403 }) });
  const response = await post(request({ texto: 'Olá' }));
  assert.equal(response.status, 502);
  assert.equal(await response.text(), 'Não foi possível obter a análise. Tente novamente em alguns instantes.');
});

test('respostas inválidas e vazias não são consideradas sucesso', async () => {
  for (const result of [new Response('não é JSON'), Response.json({}), Response.json({ choices: [{ message: { content: ' ' } }] })]) {
    const { post } = await carregarRota({ fetchImpl: async () => result });
    assert.equal((await post(request({ texto: 'Olá' }))).status, 502);
  }
});

test('sem chave ou configuração, informa indisponibilidade sem acessar a rede', async () => {
  for (const options of [{ key: '' }, { configured: false }]) {
    const { post, chamadas } = await carregarRota(options);
    assert.equal((await post(request({ texto: 'Olá' }))).status, 503);
    assert.equal(chamadas.length, 0);
  }
});

test('timeout e falha de rede recebem mensagens em português', async () => {
  for (const [error, status] of [[new DOMException('timeout', 'TimeoutError'), 504], [new Error('network error'), 500]]) {
    const { post } = await carregarRota({ fetchImpl: async () => { throw error; } });
    const response = await post(request({ texto: 'Olá' }));
    assert.equal(response.status, status);
    assert.match(await response.text(), /Tente novamente/);
  }
});


test('salva texto e resposta vinculados à sessão, ignorando ID fornecido no corpo', async () => {
  const { post, gravacoes } = await carregarRota({ user: { id: 'pessoa-logada' } });
  const response = await post(request({ texto: 'Texto enviado.', user_id: 'outra-pessoa' }));
  assert.equal(response.headers.get('X-Historico-Salvo'), 'true');
  assert.equal(await response.text(), 'Análise em português.');
  assert.deepEqual(JSON.parse(JSON.stringify(gravacoes)), [{ table: 'respostas', values: { user_id: 'pessoa-logada', texto: 'Texto enviado.', resposta: 'Análise em português.' } }]);
});

test('modo de teste também grava no histórico', async () => {
  const { post, gravacoes } = await carregarRota({ modoTeste: true });
  const response = await post(request({ texto: 'Texto de teste.' }));
  assert.equal(response.headers.get('X-Historico-Salvo'), 'true');
  assert.equal(gravacoes.length, 1);
  assert.equal(gravacoes[0].values.resposta, 'Exemplo de teste.');
});

test('falha no banco preserva a resposta e informa que não foi salva', async () => {
  const { post } = await carregarRota({ insertError: { code: 'erro-simulado' } });
  const response = await post(request({ texto: 'Texto enviado.' }));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('X-Historico-Salvo'), 'false');
  assert.equal(await response.text(), 'Análise em português.');
});

test('falha da IA não cria registro no histórico', async () => {
  const { post, gravacoes } = await carregarRota({ fetchImpl: async () => new Response('', { status: 429 }) });
  assert.equal((await post(request({ texto: 'Olá' }))).status, 429);
  assert.equal(gravacoes.length, 0);
});
