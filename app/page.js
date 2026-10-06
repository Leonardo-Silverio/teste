import { redirect } from 'next/navigation';
import { createClient } from '../lib/supabase/server';
import Analisador from './analisador';
import Sair from './sair';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();
  if (!supabase) redirect('/login');
  // getUser valida a identidade com o Supabase; não confie apenas no cookie.
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect('/login');

  return (
    <main className="pagina">
      <div className="barra-conta">
        <span className="email-conta">{user.email}</span>
        <Sair />
      </div>
      <Analisador />
    </main>
  );
}
