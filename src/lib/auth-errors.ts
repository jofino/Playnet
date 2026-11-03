import { isAuthError, isAuthRetryableFetchError } from '@supabase/supabase-js';

export const EMAIL_ALREADY_REGISTERED_MESSAGE = 'Este e-mail já está cadastrado. Tente entrar.';

const NO_CONNECTION_MESSAGE = 'Sem conexão com a internet. Verifique sua rede e tente de novo.';
const GENERIC_MESSAGE = 'Não foi possível concluir agora. Tente de novo em instantes.';

// A documentação do Supabase orienta identificar o erro pelo código, não pelo texto da mensagem.
const MESSAGE_BY_CODE: Record<string, string> = {
  invalid_credentials: 'E-mail ou senha incorretos.',
  email_exists: EMAIL_ALREADY_REGISTERED_MESSAGE,
  user_already_exists: EMAIL_ALREADY_REGISTERED_MESSAGE,
  weak_password: 'Essa senha é muito fraca. Escolha uma mais difícil de adivinhar.',
  email_not_confirmed: 'Confirme seu e-mail antes de entrar. Procure o link na sua caixa de entrada.',
  email_address_invalid: 'Este e-mail não é aceito. Use outro endereço.',
  over_request_rate_limit: 'Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.',
  over_email_send_rate_limit: 'Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.',
  signup_disabled: 'Novos cadastros estão desativados no momento.',
  email_provider_disabled: 'Novos cadastros estão desativados no momento.',
};

/** Traduz um erro do Supabase Auth para uma mensagem em português que pode ir para a tela. */
export function getAuthErrorMessage(error: unknown) {
  // Status 0: a requisição nem chegou ao servidor.
  if (isAuthRetryableFetchError(error) && error.status === 0) {
    return NO_CONNECTION_MESSAGE;
  }
  if (isAuthError(error) && error.code) {
    return MESSAGE_BY_CODE[error.code] ?? GENERIC_MESSAGE;
  }
  return GENERIC_MESSAGE;
}
