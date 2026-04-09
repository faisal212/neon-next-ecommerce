import { getClientSessionToken } from './session-client';

type FetchOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

/**
 * Client-side fetch helper for store API calls.
 * Prepends /api/v1, handles JSON encoding, includes credentials and session token.
 */
export async function storeFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { body, headers: customHeaders, ...rest } = options;

  const sessionToken = getClientSessionToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(sessionToken && { 'x-session-token': sessionToken }),
    ...customHeaders,
  };

  const response = await fetch(`/api/v1${path}`, {
    credentials: 'include',
    ...rest,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}
