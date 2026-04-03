const DEFAULT_PRODUCTION_API_URL = 'https://gp-fintech.onrender.com/api';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? DEFAULT_PRODUCTION_API_URL : 'http://localhost:5000/api');

export async function apiRequest(path, options = {}) {
  try {
    const { headers, ...restOptions } = options;
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...restOptions,
      headers: {
        'Content-Type': 'application/json',
        ...(headers ?? {}),
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('finance:unauthorized'));
      }
      throw new Error(data.message || 'Something went wrong.');
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        'Unable to reach the server. The backend may be unavailable, sleeping, or blocked by deployment configuration.',
      );
    }

    throw error;
  }
}
