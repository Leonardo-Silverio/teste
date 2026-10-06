import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type');
  const supabase = await createClient();
  if (supabase) {
    try {
      const result = code
        ? await supabase.auth.exchangeCodeForSession(code)
        : tokenHash && type === 'email'
          ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'email' })
          : null;
      if (result && !result.error) return NextResponse.redirect(new URL('/', url.origin));
    } catch {
      // A mensagem de falha é exibida em português, sem expor a resposta externa.
    }
  }
  return NextResponse.redirect(new URL('/login?confirmacao=erro', url.origin));
}
