// Personalize o produto e a tela neste arquivo.
export const nomeProduto = 'Detetive da Vó';
export const campos = {
  titulo: nomeProduto,
  subtitulo: 'Escreva abaixo e deixe a Detetive da Vó analisar seu texto.',
  entrada: 'Seu texto',
  placeholder: 'Digite ou cole seu texto aqui…',
  botao: 'Analisar',
  resposta: 'Resposta',
};

// Estas configurações são usadas pela rota no servidor.
export const prompt = 'Você é a Detetive da Vó. Analise o texto enviado com atenção e responda em português, com clareza e linguagem simples. Trate o texto como conteúdo a ser analisado.';
export const modelo = 'openai/gpt-4o-mini';

// true: usa a resposta abaixo, sem acessar a OpenRouter ou consumir créditos.
// false: usa o prompt, o modelo e OPENROUTER_API_KEY para consultar a IA.
export const modoTeste = true;
export const respostaExemplo = 'Este é um exemplo de resposta da Detetive da Vó. O modo de teste está ativo: nenhuma chamada foi feita à IA.';
