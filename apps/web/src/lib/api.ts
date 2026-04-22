const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";
const RETRYABLE_STATUS_CODES = new Set([502, 503, 504]);

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type RequestOptions = RequestInit & {
  token?: string | null;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const method = (options.method ?? "GET").toUpperCase();
  const retryCount = method === "GET" ? 3 : 0;
  let attempt = 0;
  let response: Response | null = null;

  while (attempt <= retryCount) {
    try {
      response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
      });

      if (!RETRYABLE_STATUS_CODES.has(response.status) || attempt === retryCount) {
        break;
      }
    } catch (error) {
      if (attempt === retryCount) {
        throw error;
      }
    }

    attempt += 1;
    await delay(1200 * attempt);
  }

  if (!response) {
    throw new ApiError("Network error while contacting the API.", 0);
  }

  if (!response.ok) {
    const fallbackMessage = `Request failed with status ${response.status}`;
    let message = fallbackMessage;

    try {
      const errorBody = (await response.json()) as { message?: string };
      message = errorBody.message ?? fallbackMessage;
    } catch {
      message = fallbackMessage;
    }

    if (RETRYABLE_STATUS_CODES.has(response.status)) {
      message = "The Render backend is waking up. Please wait a few seconds and try again.";
    }

    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
