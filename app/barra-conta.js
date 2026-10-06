import Link from 'next/link';
import Sair from './sair';

export default function BarraConta({ email }) {
  return (
    <div className="barra-conta">
      <span className="email-conta">{email}</span>
      <nav className="links-conta" aria-label="Navegação principal">
        <Link href="/">Início</Link>
        <Link href="/historico">Histórico</Link>
      </nav>
      <Sair />
    </div>
  );
}
