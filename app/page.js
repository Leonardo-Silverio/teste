import { redirect } from 'next/navigation';
import { createClient } from '../lib/supabase/server';
import Analisador from './analisador';
import BarraConta from './barra-conta';
import { campos } from '../desafio';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();
  if (!supabase) redirect('/login');
  // getUser valida a identidade com o Supabase; não confie apenas no cookie.
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect('/login');

  return (
    <main className="pagina">
      <BarraConta email={user.email} />
      <Analisador textos={campos} />
    </main>
  );
}
