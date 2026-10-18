const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";

export type User = {
  id: number;
  fullName: string | null;
  email: string;
  initials: string;
  createdAt: string;
  updatedAt: string | null;
};

export type AuthResponse = { user: User; token: string };

export type ApiFieldError = { field?: string; message: string; rule?: string };

export class ApiError extends Error {
  readonly status: number;
  readonly errors: ApiFieldError[];

  constructor(status: number, errors: ApiFieldError[]) {
    super(errors[0]?.message ?? `Request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; token?: string | null } = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  const response = await fetch(`${API_URL}/api/v1${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const errors = Array.isArray(payload?.errors)
      ? payload.errors
      : [{ message: payload?.message ?? response.statusText }];
    throw new ApiError(response.status, errors);
  }

  return payload as T;
}

export async function signup(input: {
  email: string;
  password: string;
  passwordConfirmation: string;
}): Promise<AuthResponse> {
  // The backend's `fullName` is nullable but still required, so send it explicitly.
  const { data } = await request<{ data: AuthResponse }>("/auth/signup", {
    method: "POST",
    body: { fullName: null, ...input },
  });
  return data;
}

export async function login(input: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const { data } = await request<{ data: AuthResponse }>("/auth/login", {
    method: "POST",
    body: input,
  });
  return data;
}

export async function getProfile(token: string): Promise<User> {
  const { data } = await request<{ data: User }>("/account/profile", { token });
  return data;
}

export async function logout(token: string): Promise<void> {
  await request("/account/logout", { method: "POST", token });
}
