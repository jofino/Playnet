import { isAuthRetryableFetchError } from '@supabase/supabase-js';

import { GENERIC_MESSAGE, NO_CONNECTION_MESSAGE } from '@/lib/auth-errors';

// Quando a requisição não chega ao servidor, o supabase-js monta a mensagem como
// "TypeError: Network request failed". Respostas do servidor nunca têm esse formato.
const NETWORK_FAILURE = /^(TypeError|FetchError|AbortError|TimeoutError): /;

function isNetworkError(error: unknown) {
  if (isAuthRetryableFetchError(error)) return error.status === 0;
  const message = (error as { message?: unknown } | null)?.message;
  return typeof message === 'string' && NETWORK_FAILURE.test(message);
}

/** Traduz um erro do banco para uma mensagem em português; só falha de rede fala em internet. */
export function getDataErrorMessage(error: unknown) {
  if (__DEV__) {
    const { code, message } = (error ?? {}) as { code?: unknown; message?: unknown };
    console.warn('[Supabase]', code, message);
  }
  return isNetworkError(error) ? NO_CONNECTION_MESSAGE : GENERIC_MESSAGE;
}
