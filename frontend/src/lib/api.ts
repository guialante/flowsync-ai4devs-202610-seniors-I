// Fields exposed by the backend's UserTransformer.
export type User = {
  id: number
  fullName: string | null
  email: string
  createdAt: string
  updatedAt: string | null
  initials: string
}

export type AuthPayload = { user: User; token: string }

export type ApiFieldError = { field?: string; message: string; rule?: string }

export class ApiError extends Error {
  status: number
  errors: ApiFieldError[]

  constructor(status: number, errors: ApiFieldError[]) {
    super(errors[0]?.message ?? `Request failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST'
  body?: unknown
  token?: string | null
}

async function request<T>(
  path: string,
  { method = 'GET', body, token }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  // A rejected fetch means the network failed; status 0 marks that case.
  let response: Response
  try {
    response = await fetch(`/api/v1${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, [])
  }

  const json = await response.json().catch(() => null)
  if (!response.ok) {
    const errors = Array.isArray(json?.errors)
      ? json.errors
      : json?.message
        ? [{ message: json.message }]
        : []
    throw new ApiError(response.status, errors)
  }
  return json as T
}

export async function signup(input: {
  email: string
  password: string
  passwordConfirmation: string
}): Promise<AuthPayload> {
  // The validator marks fullName nullable but not optional, so it must be sent.
  const { data } = await request<{ data: AuthPayload }>('/auth/signup', {
    method: 'POST',
    body: { fullName: null, ...input },
  })
  return data
}

export async function login(input: {
  email: string
  password: string
}): Promise<AuthPayload> {
  const { data } = await request<{ data: AuthPayload }>('/auth/login', {
    method: 'POST',
    body: input,
  })
  return data
}

export async function getProfile(token: string): Promise<User> {
  const { data } = await request<{ data: User }>('/account/profile', { token })
  return data
}

export async function logout(token: string): Promise<void> {
  await request('/account/logout', { method: 'POST', token })
}
