'use client';

import { useActionState } from 'react';
import { sair } from './login/actions';

export default function Sair() {
  const [state, action, pending] = useActionState(sair, {});
  return (
    <form action={action}>
      <button type="submit" disabled={pending}>{pending ? 'Saindo…' : 'Sair'}</button>
      {state.erro && <p role="alert" className="mensagem-erro">{state.erro}</p>}
    </form>
  );
}
