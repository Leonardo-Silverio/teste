'use client';

import { useState } from 'react';

// Personalize todos os textos da página aqui.
const textos = {
  titulo: 'Detetive da Vó',
  subtitulo: 'Escreva abaixo e clique em Analisar para ver seu texto na área de resposta.',
  entrada: 'Seu texto',
  placeholder: 'Digite ou cole seu texto aqui…',
  botao: 'Analisar',
  resposta: 'Resposta',
};

export default function Analisador() {
  const [texto, setTexto] = useState('');
  const [resposta, setResposta] = useState('');

  function analisar(event) {
    event.preventDefault();
    setResposta(texto);
  }

  return (
    <div>
      <header>
        <h1>{textos.titulo}</h1>
        <p className="subtitulo">{textos.subtitulo}</p>
      </header>
      <form onSubmit={analisar}>
        <label htmlFor="texto">{textos.entrada}</label>
        <textarea id="texto" value={texto} onChange={(event) => setTexto(event.target.value)} placeholder={textos.placeholder} rows={6} />
        <button type="submit">{textos.botao}</button>
      </form>
      <section className="resultado" aria-labelledby="titulo-resposta">
        <h2 id="titulo-resposta">{textos.resposta}</h2>
        <div className="resposta" role="status" aria-live="polite" aria-atomic="true">{resposta}</div>
      </section>
    </div>
  );
}
