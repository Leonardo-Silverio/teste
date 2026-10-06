import { isAuthError } from '@supabase/supabase-js';

const mensagens = {
  invalid_credentials: 'E-mail ou senha incorretos.',
  email_not_confirmed: 'Confirme seu e-mail antes de entrar.',
  user_already_exists: 'Já existe uma conta com este e-mail.',
  email_exists: 'Já existe uma conta com este e-mail.',
  signup_disabled: 'A criação de contas está desativada no momento.',
  email_provider_disabled: 'O acesso por e-mail está desativado no momento.',
  weak_password: 'Escolha uma senha mais forte, com pelo menos 6 caracteres.',
  validation_failed: 'Confira o e-mail e a senha informados.',
  email_address_invalid: 'Informe um e-mail válido.',
  email_address_not_authorized: 'Este e-mail não está autorizado a criar uma conta.',
  over_email_send_rate_limit: 'Muitos e-mails foram solicitados. Aguarde alguns minutos e tente novamente.',
  over_request_rate_limit: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
  request_timeout: 'O serviço demorou a responder. Tente novamente.',
  session_not_found: 'Sua sessão expirou. Entre novamente.',
};

export function authErrorMessage(error) {
  if (isAuthError(error) && mensagens[error.code]) return mensagens[error.code];
  return 'Não foi possível concluir a solicitação. Tente novamente em alguns instantes.';
}

export const configurationError = 'O login ainda não foi configurado. Configure as variáveis do Supabase para continuar.';
