export const API_BASE = 'https://filmforum.billadom.top/api'

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
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) {
    const json = await res.json() as any
    // 检查后端返回的错误代码
    if (json.code && json.code !== 200) {
      const error = new Error(json.message || `API Error (code: ${json.code})`)
      // 将后端的错误代码附加到Error对象上
      ;(error as any).code = json.code
      throw error
    }
    return json as Promise<T>
  }
  // 如果不是JSON响应，则检查状态码
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  // @ts-expect-error allow unknown
  return res.text()
}

export function jsonBody(data: unknown): BodyInit {
  return JSON.stringify(data)
}

export async function updatePhoto(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('strategy_id', '2')
  
  const res = await fetch('https://pic.billadom.top/api/v1/upload', {
    method: 'POST',
    body: formData
  })
  const json = await res.json() as any
  return json.data
  console.log(res)
}


