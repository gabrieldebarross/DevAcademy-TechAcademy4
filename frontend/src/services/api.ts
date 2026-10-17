export const TOKEN_STORAGE_KEY = 'devacademy:token';
export const USER_STORAGE_KEY = 'devacademy:user';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api';

export class ApiError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

interface ErrorBody {
  statusCode?: unknown;
  error?: unknown;
  message?: unknown;
}

function extractMessage(body: unknown, fallback: string): string {
  if (typeof body === 'object' && body !== null) {
    const candidate = (body as ErrorBody).message;
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate;
    }
    if (Array.isArray(candidate) && candidate.length > 0) {
      return candidate.filter((item) => typeof item === 'string').join(', ');
    }
  }
  return fallback;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, auth = true } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  let token: string | null = null;
  if (typeof window !== 'undefined') {
    token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  if (auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  let parsed: unknown = null;
  if (text.length > 0) {
    try {
      parsed = JSON.parse(text) as unknown;
    } catch {
      parsed = null;
    }
  }

  if (!response.ok) {
    if (response.status === 401 && auth) {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        window.localStorage.removeItem(USER_STORAGE_KEY);
        window.location.href = '/login';
      }
    }
    throw new ApiError(
      extractMessage(parsed, 'Não foi possível concluir a solicitação.'),
      response.status,
    );
  }

  return parsed as T;
}

export const api = { request };
