/* ── AVIA API Client ─────────────────────────────────────────────────
   Spring Boot backend: http://localhost:8080
   Auth: Bearer JWT in localStorage key 'avia_token'

   ⚠️  CORS must be configured on the backend before browser requests work.
   See SecurityConfig.java — add CorsConfigurationSource bean
   allowing origin http://localhost:5173.
   ─────────────────────────────────────────────────────────────────── */

const BASE_URL = 'http://localhost:8080'
const TOKEN_KEY = 'avia_token'

/* ── Token helpers ── */
export function getToken()   { return localStorage.getItem(TOKEN_KEY) }
export function setToken(t)  { localStorage.setItem(TOKEN_KEY, t) }
export function clearToken() { localStorage.removeItem(TOKEN_KEY) }

/* ── Parse JWT payload (base64url → JSON, client-side only) ── */
export function parseJwt(token) {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(b64))
  } catch {
    return null
  }
}

/* ── Core fetch wrapper ── */
async function request(path, options = {}) {
  const token = getToken()

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  // 204 No Content — return null without trying to parse JSON
  if (res.status === 204) return null

  const body = await res.json().catch(() => ({}))

  if (!res.ok) throw { status: res.status, body }

  return body
}

/* ── HTTP methods ── */
export const api = {
  post:   (path, data) => request(path, { method: 'POST',   body: JSON.stringify(data) }),
  get:    (path)       => request(path, { method: 'GET' }),
  patch:  (path, data) => request(path, { method: 'PATCH',  body: JSON.stringify(data) }),
  delete: (path)       => request(path, { method: 'DELETE' }),
}
