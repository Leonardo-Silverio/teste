import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { configurationError } from '../../lib/supabase/errors';
import Formulario from './formulario';

export const dynamic = 'force-dynamic';

export default async function Login({ searchParams }) {
  const params = await searchParams;
  const supabase = await createClient();
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) redirect('/');
  }
  return (
    <main className="pagina pagina-login">
      <h1>Detetive da Vó</h1>
      <p className="subtitulo">Entre ou crie sua conta para continuar.</p>
      {!supabase && <p role="alert" className="mensagem-erro">{configurationError}</p>}
      {params.confirmacao === 'erro' && <p role="alert" className="mensagem-erro">Não foi possível confirmar seu e-mail. O link pode ter expirado ou já ter sido usado.</p>}
      <Formulario configurado={Boolean(supabase)} />
    </main>
  );
}
