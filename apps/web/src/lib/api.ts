const API_BASE =
  import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:4000/api" : "/api");
const RETRYABLE_STATUS_CODES = new Set([502, 503, 504]);
const GET_CACHE_TTL_MS = 30_000;
const getResponseCache = new Map<string, { expiresAt: number; value: unknown }>();
const inflightGetRequests = new Map<string, Promise<unknown>>();

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

function getCacheKey(path: string, options: RequestOptions) {
  return `${options.token ?? "public"}:${path}`;
}

async function performRequest<T>(path: string, options: RequestOptions, method: string) {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

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

export async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const method = (options.method ?? "GET").toUpperCase();

  if (method === "GET") {
    const cacheKey = getCacheKey(path, options);
    const cached = getResponseCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.value as T;
    }

    const inflight = inflightGetRequests.get(cacheKey);

    if (inflight) {
      return (await inflight) as T;
    }

    const requestPromise = performRequest<T>(path, options, method)
      .then((result) => {
        getResponseCache.set(cacheKey, {
          expiresAt: Date.now() + GET_CACHE_TTL_MS,
          value: result,
        });

        return result;
      })
      .finally(() => {
        inflightGetRequests.delete(cacheKey);
      });

    inflightGetRequests.set(cacheKey, requestPromise as Promise<unknown>);
    return await requestPromise;
  }

  const result = await performRequest<T>(path, options, method);
  getResponseCache.clear();
  inflightGetRequests.clear();
  return result;
}
