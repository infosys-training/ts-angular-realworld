const API_ROOT = 'https://api.realworld.show/api';

function getToken(): string | null {
  return window.localStorage.getItem('jwtToken');
}

async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_ROOT}${url}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw {
      errors: {
        network: ['Unable to connect. Please check your internet connection.'],
      },
      status: 0,
    };
  }

  if (!response.ok) {
    let errorBody: unknown;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = null;
    }
    const normalized =
      errorBody && typeof errorBody === 'object' && 'errors' in (errorBody as Record<string, unknown>)
        ? errorBody
        : {
            errors: {
              network: ['Unable to connect. Please check your internet connection.'],
            },
          };
    throw { ...(normalized as object), status: response.status };
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(url: string) => request<T>('GET', url),
  post: <T>(url: string, body?: unknown) => request<T>('POST', url, body),
  put: <T>(url: string, body?: unknown) => request<T>('PUT', url, body),
  delete: <T>(url: string) => request<T>('DELETE', url),
};
