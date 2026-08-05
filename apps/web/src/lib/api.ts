import type {
  ApiErrorBody,
  Appointment,
  AuthResponse,
  CreatePropertyInput,
  Property,
  PropertyPage,
  User,
} from '@/types/api';

const requestTimeoutMs = 10_000;

const getApiBaseUrl = () => {
  const value = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, '');

  if (!value) {
    throw new ApiError(
      'The API is not configured. Set NEXT_PUBLIC_API_BASE_URL and redeploy.',
      0,
    );
  }

  return value;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly fieldErrors: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends RequestInit {
  token?: string | null;
}

const parseError = async (response: Response): Promise<ApiError> => {
  let body: ApiErrorBody | undefined;

  try {
    body = (await response.json()) as ApiErrorBody;
  } catch {
    body = undefined;
  }

  const rawMessage = body?.message;
  const message = Array.isArray(rawMessage)
    ? rawMessage[0]
    : rawMessage ||
      (response.status >= 500
        ? 'EstateMint is temporarily unavailable. Please try again.'
        : 'The request could not be completed.');
  const fieldErrors = Object.fromEntries(
    (body?.errors ?? []).map((error) => [error.field, error.messages]),
  );

  return new ApiError(message, response.status, fieldErrors);
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), requestTimeoutMs);
  const abortFromCaller = () => controller.abort();

  options.signal?.addEventListener('abort', abortFromCaller, { once: true });

  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(options.body === undefined
          ? {}
          : { 'Content-Type': 'application/json' }),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw await parseError(response);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (controller.signal.aborted) {
      throw new ApiError('The request timed out. Please try again.', 0);
    }

    throw new ApiError(
      'Could not reach EstateMint. Check your connection and try again.',
      0,
    );
  } finally {
    window.clearTimeout(timeout);
    options.signal?.removeEventListener('abort', abortFromCaller);
  }
}

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) =>
    apiRequest<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  me: (token: string) => apiRequest<User>('/auth/me', { token }),
};

export const propertiesApi = {
  list: (params: URLSearchParams, signal?: AbortSignal) =>
    apiRequest<PropertyPage>(`/properties?${params.toString()}`, { signal }),
  get: (id: string, signal?: AbortSignal) =>
    apiRequest<Property>(`/properties/${id}`, { signal }),
  mine: (token: string) =>
    apiRequest<Property[]>('/properties/mine', { token }),
  create: (token: string, input: CreatePropertyInput) =>
    apiRequest<Property>('/properties', {
      method: 'POST',
      token,
      body: JSON.stringify(input),
    }),
  archive: (token: string, id: string) =>
    apiRequest<Property>(`/properties/${id}`, { method: 'DELETE', token }),
};

export const favoritesApi = {
  list: (token: string) => apiRequest<Property[]>('/favorites', { token }),
  add: (token: string, propertyId: string) =>
    apiRequest<Property>(`/favorites/${propertyId}`, { method: 'POST', token }),
  remove: (token: string, propertyId: string) =>
    apiRequest<{ removed: true }>(`/favorites/${propertyId}`, {
      method: 'DELETE',
      token,
    }),
};

export const appointmentsApi = {
  list: (token: string) =>
    apiRequest<Appointment[]>('/appointments', { token }),
  create: (
    token: string,
    input: { propertyId: string; scheduledAt: string; message?: string },
  ) =>
    apiRequest<Appointment>('/appointments', {
      method: 'POST',
      token,
      body: JSON.stringify(input),
    }),
};
