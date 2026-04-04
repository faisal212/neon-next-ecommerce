import { NextRequest } from 'next/server';

const BASE_URL = 'http://localhost:3000';

export function createRequest(
  method: string,
  path: string,
  options?: {
    body?: unknown;
    headers?: Record<string, string>;
    searchParams?: Record<string, string>;
  },
): NextRequest {
  const url = new URL(path, BASE_URL);
  if (options?.searchParams) {
    for (const [key, value] of Object.entries(options.searchParams)) {
      url.searchParams.set(key, value);
    }
  }

  const init: RequestInit = { method };
  if (options?.body) {
    init.body = JSON.stringify(options.body);
    init.headers = { 'Content-Type': 'application/json', ...options?.headers };
  } else if (options?.headers) {
    init.headers = options.headers;
  }

  return new NextRequest(url, init);
}

// Convenience wrappers
export const get = (path: string, opts?: { headers?: Record<string, string>; searchParams?: Record<string, string> }) =>
  createRequest('GET', path, opts);

export const post = (path: string, body: unknown, opts?: { headers?: Record<string, string> }) =>
  createRequest('POST', path, { ...opts, body });

export const patch = (path: string, body: unknown, opts?: { headers?: Record<string, string> }) =>
  createRequest('PATCH', path, { ...opts, body });

export const del = (path: string, opts?: { headers?: Record<string, string> }) =>
  createRequest('DELETE', path, opts);

// Helper for dynamic route params
export function routeParams<T extends Record<string, string>>(values: T): { params: Promise<T> } {
  return { params: Promise.resolve(values) };
}
