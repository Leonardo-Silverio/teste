import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import BarraConta from '../barra-conta';

export const dynamic = 'force-dynamic';
const porPagina = 20;
const formatarData = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Sao_Paulo',
});

export default async function Historico({ searchParams }) {
  const supabase = await createClient();
  if (!supabase) redirect('/login');
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect('/login');

  const params = await searchParams;
  const numero = Number(params.pagina || 1);
  const pagina = Number.isSafeInteger(numero) && numero >= 1 && numero <= 100000 ? numero : 1;
  const inicio = (pagina - 1) * porPagina;
  let registros = [];
  let falhou = false;
  try {
    const { data, error } = await supabase
      .from('respostas')
      .select('id,texto,resposta,created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .range(inicio, inicio + porPagina);
    falhou = Boolean(error);
    registros = data || [];
  } catch {
    falhou = true;
  }

  return (
    <main className="pagina">
      <BarraConta email={user.email} />
      <h1>Histórico</h1>
      <p className="subtitulo">Suas análises, da mais recente para a mais antiga. Datas e horários de Brasília.</p>
      {falhou ? (
        <p role="alert" className="mensagem-erro">Não foi possível carregar seu histórico. Tente novamente em alguns instantes.</p>
      ) : (
        <>
          {registros.length === 0 && <p>{pagina === 1 ? 'Você ainda não tem análises salvas.' : 'Não há análises nesta página.'}</p>}
          <div className="lista-historico">
            {registros.slice(0, porPagina).map(registro => (
              <article className="item-historico" key={registro.id}>
                <time dateTime={registro.created_at}>{formatarData.format(new Date(registro.created_at))}</time>
                <h2>Seu texto</h2>
                <p className="conteudo-historico">{registro.texto}</p>
                <h2>Resposta da IA</h2>
                <p className="conteudo-historico">{registro.resposta}</p>
              </article>
            ))}
          </div>
          <nav className="paginacao" aria-label="Páginas do histórico">
            {pagina > 1 && <Link href={`/historico?pagina=${pagina - 1}`}>Mais recentes</Link>}
            {registros.length > porPagina && <Link href={`/historico?pagina=${pagina + 1}`}>Mais antigas</Link>}
          </nav>
        </>
      )}
    </main>
  );
}
