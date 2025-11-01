const API_BASE = 'https://filmforum.billadom.top/api'

// const API_BASE = 'http://127.0.0.1:8082/api'
function getCsrfToken(): string | undefined {
  const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : undefined
}

export async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const csrf = getCsrfToken()
  const headers = new Headers(init.headers || {})
  if (csrf && !headers.has('X-CSRF-TOKEN')) headers.set('X-CSRF-TOKEN', csrf)
  if (!headers.has('Content-Type') && init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    credentials: 'include'
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) return res.json() as Promise<T>
  // @ts-expect-error allow unknown
  return res.text()
}

export function jsonBody(data: unknown): BodyInit {
  return JSON.stringify(data)
}


