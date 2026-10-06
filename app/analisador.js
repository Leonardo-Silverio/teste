'use client';

import { useRef, useState } from 'react';

export default function Analisador({ textos }) {
  const [texto, setTexto] = useState('');
  const [resposta, setResposta] = useState('');
  const [erro, setErro] = useState('');
  const [analisando, setAnalisando] = useState(false);
  const emAndamento = useRef(false);

  async function analisar(event) {
    event.preventDefault();
    if (emAndamento.current) return;
    if (!texto.trim()) {
      setErro('Digite um texto para analisar.');
      return;
    }
    emAndamento.current = true;
    setAnalisando(true);
    setErro('');
    setResposta('');
    try {
      const response = await fetch('/api/ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto }),
        signal: AbortSignal.timeout(45000),
      });
      if (response.status === 429) {
        setErro('Você atingiu o limite de uso de hoje.');
        return;
      }
      if (!response.ok) {
        const mensagens = {
          400: 'Confira o texto enviado. Ele deve conter entre 1 e 10.000 caracteres.',
          401: 'Sua sessão expirou. Entre novamente para analisar seu texto.',
          503: 'O serviço de análise ainda não está disponível. Tente novamente mais tarde.',
          504: 'A análise demorou mais do que o esperado. Tente novamente.',
        };
        setErro(mensagens[response.status] || 'Não foi possível obter a análise. Tente novamente em alguns instantes.');
        return;
      }
      const resultado = await response.text();
      if (!resultado.trim()) throw new Error('Resposta vazia');
      setResposta(resultado);
    } catch (error) {
      setErro(error.name === 'TimeoutError' || error.name === 'AbortError'
        ? 'A análise demorou mais do que o esperado. Tente novamente.'
        : 'Não foi possível concluir a análise. Verifique sua conexão e tente novamente.');
    } finally {
      emAndamento.current = false;
      setAnalisando(false);
    }
  }

  return (
    <div>
      <header>
        <h1>{textos.titulo}</h1>
        <p className="subtitulo">{textos.subtitulo}</p>
      </header>
      <form onSubmit={analisar}>
        <label htmlFor="texto">{textos.entrada}</label>
        <textarea id="texto" value={texto} onChange={(event) => setTexto(event.target.value)} placeholder={textos.placeholder} rows={6} maxLength={10000} disabled={analisando} />
        <button type="submit" disabled={analisando}>{analisando ? 'Analisando...' : textos.botao}</button>
        {erro && <p role="alert" className="mensagem-erro">{erro}</p>}
      </form>
      <section className="resultado" aria-labelledby="titulo-resposta">
        <h2 id="titulo-resposta">{textos.resposta}</h2>
        <div className="resposta" aria-busy={analisando} role="status" aria-live="polite" aria-atomic="true">{resposta}</div>
      </section>
    </div>
  );
}
