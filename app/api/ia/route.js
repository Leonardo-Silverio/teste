import { prompt, modelo, modoTeste, respostaExemplo } from '../../../desafio';
import { createClient } from '../../../lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

function textoResponse(texto, status = 200, headers = {}) {
  return new Response(texto, {
    status,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'private, no-store', ...headers },
  });
}

async function salvarResposta(supabase, userId, texto, resposta) {
  let salvo = false;
  try {
    const { error } = await supabase.from('respostas').insert({
      user_id: userId,
      texto,
      resposta,
    });
    salvo = !error;
  } catch {
    // Preserve a resposta gerada mesmo quando o banco estiver indisponível.
  }
  return textoResponse(resposta, 200, { 'X-Historico-Salvo': String(salvo) });
}

export async function POST(request) {
  try {
    const supabase = await createClient();
    if (!supabase) return textoResponse('O login ainda não foi configurado. Tente novamente mais tarde.', 503);
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return textoResponse('Sua sessão expirou. Entre novamente para analisar seu texto.', 401);

    let body;
    try {
      body = await request.json();
    } catch {
      return textoResponse('Não foi possível ler o texto enviado. Envie uma solicitação JSON válida.', 400);
    }
    if (!body || typeof body.texto !== 'string' || !body.texto.trim()) {
      return textoResponse('Digite um texto para analisar.', 400);
    }
    if (body.texto.length > 10000) {
      return textoResponse('O texto deve ter no máximo 10.000 caracteres.', 400);
    }

    if (modoTeste) return salvarResposta(supabase, user.id, body.texto, respostaExemplo);
    if (!process.env.OPENROUTER_API_KEY) {
      return textoResponse('O serviço de análise ainda não foi configurado. Tente novamente mais tarde.', 503);
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelo,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: body.texto },
        ],
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (response.status === 429) return textoResponse('Você atingiu o limite de uso de hoje.', 429);
    if (!response.ok) return textoResponse('Não foi possível obter a análise. Tente novamente em alguns instantes.', 502);

    let data;
    try {
      data = await response.json();
    } catch {
      return textoResponse('O serviço de análise retornou uma resposta inválida. Tente novamente.', 502);
    }
    const resposta = data?.choices?.[0]?.message?.content;
    if (typeof resposta !== 'string' || !resposta.trim()) {
      return textoResponse('O serviço de análise não retornou um texto. Tente novamente.', 502);
    }
    return salvarResposta(supabase, user.id, body.texto, resposta);
  } catch (error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      return textoResponse('A análise demorou mais do que o esperado. Tente novamente.', 504);
    }
    return textoResponse('Não foi possível concluir a análise. Tente novamente em alguns instantes.', 500);
  }
}
