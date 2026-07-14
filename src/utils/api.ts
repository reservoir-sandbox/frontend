export const TOKEN_KEY = 'reservoir-bearer-token';
export const API_URL = import.meta.env.VITE_API_URL

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export const api = {
  get: async <T = any>(url: string, options: FetchOptions = {}): Promise<T> => {
    const token = localStorage.getItem(TOKEN_KEY);
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: token ? `Bearer ${token}` : '',
      },
      credentials: 'include',
    });

    if (response.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) {
        const newToken = localStorage.getItem(TOKEN_KEY);
        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${newToken}`,
          },
          credentials: 'include',
        });
        return retryResponse.json();
      }
    }

    return response.json();
  },

  post: async <T = any>(
    url: string,
    data?: BodyInit | Record<string, any>,
    options: FetchOptions = {}
  ): Promise<T> => {
    const token = localStorage.getItem(TOKEN_KEY);
    const isFormData = data instanceof FormData;
    const isUrlEncoded = data instanceof URLSearchParams;

    const response = await fetch(url, {
      method: 'POST',
      ...options,
      headers: {
        ...options.headers,
        Authorization: token ? `Bearer ${token}` : '',
        ...(data &&
        !isFormData &&
        !isUrlEncoded &&
        !(data instanceof Blob) &&
        !(data instanceof ArrayBuffer)
          ? { 'Content-Type': 'application/json' }
          : {}),
      },
      body: data as BodyInit,
      credentials: 'include',
    });

    return response.json();
  },

  put: async <T = any>(
    url: string,
    data?: Record<string, any>,
    options: FetchOptions = {}
  ): Promise<T> => {
    const token = localStorage.getItem(TOKEN_KEY);
    const response = await fetch(url, {
      method: 'PUT',
      ...options,
      headers: {
        ...options.headers,
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });

    return response.json();
  },

  delete: async <T = any>(url: string, options: FetchOptions = {}): Promise<T> => {
    const token = localStorage.getItem(TOKEN_KEY);
    const response = await fetch(url, {
      method: 'DELETE',
      ...options,
      headers: {
        ...options.headers,
        Authorization: token ? `Bearer ${token}` : '',
      },
      credentials: 'include',
    });

    return response.json();
  },
};

const refreshToken = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem(TOKEN_KEY, data.access_token);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};