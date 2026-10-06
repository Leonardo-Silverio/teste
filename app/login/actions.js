'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '../../lib/supabase/server';
import { authErrorMessage, configurationError } from '../../lib/supabase/errors';

export async function autenticar(previousState, formData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const intent = formData.get('intent');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { erro: 'Informe um e-mail válido.' };
  if (!password) return { erro: 'Informe sua senha.' };
  if (intent !== 'entrar' && intent !== 'criar') return { erro: 'Escolha Entrar ou Criar conta.' };
  if (intent === 'criar' && password.length < 6) return { erro: 'A senha deve ter pelo menos 6 caracteres.' };

  let result;
  try {
    const supabase = await createClient();
    if (!supabase) return { erro: configurationError };
    result = intent === 'criar'
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    if (result.error) return { erro: authErrorMessage(result.error) };
  } catch {
    return { erro: 'Não foi possível conectar ao serviço de login. Tente novamente.' };
  }

  if (!result.data.session) {
    return { mensagem: 'Confira seu e-mail para confirmar o cadastro. Depois, volte aqui para entrar.' };
  }
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function sair() {
  try {
    const supabase = await createClient();
    if (!supabase) return { erro: configurationError };
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) return { erro: authErrorMessage(error) };
  } catch {
    return { erro: 'Não foi possível sair. Tente novamente.' };
  }
  revalidatePath('/', 'layout');
  redirect('/login');
}
