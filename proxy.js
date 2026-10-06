import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { getSupabaseConfig } from './lib/supabase/config';

export async function proxy(request) {
  let response = NextResponse.next({ request });
  const config = getSupabaseConfig();
  let user = null;
  if (config) {
    const supabase = createServerClient(config.url, config.key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });
    const { data, error } = await supabase.auth.getUser();
    if (!error) user = data.user;
  }
  const isLogin = request.nextUrl.pathname === '/login';
  if ((!user && !isLogin) || (user && isLogin)) {
    const url = request.nextUrl.clone();
    url.pathname = user ? '/' : '/login';
    url.search = '';
    const redirected = NextResponse.redirect(url);
    response.cookies.getAll().forEach(cookie => redirected.cookies.set(cookie));
    redirected.headers.set('Cache-Control', 'private, no-store');
    return redirected;
  }
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

export const config = { matcher: ['/', '/login'] };
