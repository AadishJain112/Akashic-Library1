/**
 * Akashic Library HTTP Client
 * Adheres strictly to Section 2, 3, and 6 of the API specification.
 * - Handles credentials: 'include' (Django session cookies)
 * - Auto-extracts 'csrftoken' from document.cookie and sends X-CSRFToken for unsafe methods
 * - Handles 204 No Content safely
 * - Normalizes DRF errors ({detail: ...}, {error: ...}, field dicts, string)
 * - Retries once on CSRF 403 if authenticated
 */

export interface NormalizedError {
  message: string;
  status?: number;
  fieldErrors?: Record<string, string[]>;
  raw?: unknown;
}

export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(^|;)\s*csrftoken\s*=\s*([^;]+)/);
  return match ? decodeURIComponent(match[2]) : null;
}

export function normalizeError(error: unknown, status?: number): NormalizedError {
  if (!error) {
    return { message: 'An unknown error occurred in the library catalog.', status };
  }

  // If already normalized
  if (typeof error === 'object' && 'message' in (error as any) && 'fieldErrors' in (error as any)) {
    return error as NormalizedError;
  }

  if (typeof error === 'string') {
    return { message: error, status };
  }

  const errObj = error as Record<string, any>;

  // Check { detail: "..." }
  if (typeof errObj.detail === 'string') {
    return { message: errObj.detail, status };
  }

  // Check { error: "..." }
  if (typeof errObj.error === 'string') {
    return { message: errObj.error, status };
  }

  // Check field-level errors: { username: ["taken"], password: [...] } or { quantity: "..." }
  const fieldErrors: Record<string, string[]> = {};
  let primaryMessage = '';

  for (const [key, value] of Object.entries(errObj)) {
    if (key === 'status' || key === 'statusCode') continue;
    if (Array.isArray(value)) {
      fieldErrors[key] = value.map(v => String(v));
      if (!primaryMessage) primaryMessage = `${key}: ${value[0]}`;
    } else if (typeof value === 'string') {
      fieldErrors[key] = [value];
      if (!primaryMessage) primaryMessage = `${key}: ${value}`;
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      message: primaryMessage || 'Validation failed. Please inspect the indicated fields.',
      status,
      fieldErrors,
      raw: error,
    };
  }

  return {
    message: errObj.message || 'The librarian could not complete this request.',
    status,
    raw: error,
  };
}

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  skipCsrfRetry?: boolean;
}

export async function apiRequest<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, skipCsrfRetry, ...customOptions } = options;
  const method = (customOptions.method || 'GET').toUpperCase();
  const isUnsafe = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

  // Build full URL
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let url = `${BASE_URL}${cleanEndpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') {
        searchParams.append(k, String(v));
      }
    }
    const query = searchParams.toString();
    if (query) {
      url += (url.includes('?') ? '&' : '?') + query;
    }
  }

  const headers = new Headers(customOptions.headers || {});
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  // If sending body and not FormData, ensure Content-Type is application/json
  if (customOptions.body && !(customOptions.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Attach CSRF token on unsafe methods
  if (isUnsafe) {
    const csrfToken = getCsrfToken();
    if (csrfToken && !headers.has('X-CSRFToken')) {
      headers.set('X-CSRFToken', csrfToken);
    }
  }

  const fetchConfig: RequestInit = {
    ...customOptions,
    method,
    headers,
    credentials: 'include', // Django session cookies
  };

  try {
    const response = await fetch(url, fetchConfig);

    // 204 No Content
    if (response.status === 204) {
      return null as T;
    }

    // Attempt to parse JSON response
    let data: any = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch {
        data = null;
      }
    } else {
      try {
        const text = await response.text();
        data = text ? { detail: text } : null;
      } catch {
        data = null;
      }
    }

    // CSRF Retry logic: If a write failed with 403 CSRF error and we haven't retried yet
    if (response.status === 403 && isUnsafe && !skipCsrfRetry) {
      const detailStr = String(data?.detail || data?.error || '');
      if (detailStr.toLowerCase().includes('csrf') || !getCsrfToken()) {
        try {
          // Refetch /api/auth/me/ to get a fresh csrftoken cookie
          await fetch(`${BASE_URL}/api/auth/me/`, { credentials: 'include' });
          // Retry the request once with new token
          return await apiRequest<T>(endpoint, { ...options, skipCsrfRetry: true });
        } catch {
          // Fall through to error throwing
        }
      }
    }

    if (!response.ok) {
      const normalized = normalizeError(data, response.status);
      throw normalized;
    }

    return data as T;
  } catch (err: any) {
    if (err && err.message && err.status) {
      throw err;
    }
    // Network or server offline
    throw normalizeError({ detail: 'The library desk is unreachable. Please check your connection.' }, 503);
  }
}
