import { cookies } from "next/headers";
import { headers } from "next/headers";

async function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") || "http";
  return `${proto}://${host}`;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

export async function adminFetch<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const baseUrl = await getBaseUrl();
  const cookieStore = await cookies();

  const res = await fetch(`${baseUrl}/api/v1/admin${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieStore.toString(),
      ...options?.headers,
    },
    cache: "no-store",
  });

  const json = await res.json();

  if (!res.ok) {
    return {
      success: false,
      data: null as T,
      error: json.error || { code: "UNKNOWN", message: res.statusText },
    };
  }

  return json;
}

/** Fetch from public API (v1, non-admin) */
export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const baseUrl = await getBaseUrl();
  const cookieStore = await cookies();

  const res = await fetch(`${baseUrl}/api/v1${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieStore.toString(),
      ...options?.headers,
    },
    cache: "no-store",
  });

  const json = await res.json();

  if (!res.ok) {
    return {
      success: false,
      data: null as T,
      error: json.error || { code: "UNKNOWN", message: res.statusText },
    };
  }

  return json;
}
