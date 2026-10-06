'use client';

import { useActionState, useState } from 'react';
import { autenticar } from './actions';

export default function Formulario({ configurado }) {
  const [state, action, pending] = useActionState(autenticar, {});
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <form action={action} noValidate>
      <label htmlFor="email">E-mail</label>
      <input id="email" name="email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required disabled={!configurado || pending} />
      <label htmlFor="password">Senha</label>
      <input id="password" name="password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required disabled={!configurado || pending} />
      <p className="ajuda">Para criar uma conta, use uma senha com pelo menos 6 caracteres.</p>
      <div className="botoes-login">
        <button type="submit" name="intent" value="entrar" disabled={pending || !configurado}>Entrar</button>
        <button type="submit" name="intent" value="criar" disabled={pending || !configurado}>Criar conta</button>
      </div>
      {pending && <p role="status">Aguarde…</p>}
      {state.erro && <p role="alert" className="mensagem-erro">{state.erro}</p>}
      {state.mensagem && <p role="status">{state.mensagem}</p>}
    </form>
  );
}
