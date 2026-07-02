export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: unknown;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init
  });

  const body: ApiEnvelope<T> = await res.json();

  if (!res.ok || !body.success) {
    throw new Error(body.message || `Request to ${path} failed`);
  }

  return body.data as T;
}
