/* ── AVIA API Client ─────────────────────────────────────────────────
   Spring Boot backend — URL vem de VITE_API_URL (arquivo .env)
   Auth: Bearer JWT in localStorage key 'avia_token'

   - Uma única instância do axios para o app inteiro.
   - Interceptor de request: anexa o token automaticamente.
   - Interceptor de response: padroniza o erro e trata 401 (sessão expirada).
   ─────────────────────────────────────────────────────────────────── */

import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL
if (!BASE_URL) {
  // Falha alto e claro em vez de mandar requisições para o host errado
  throw new Error(
    'VITE_API_URL não está definida. Verifique o arquivo .env na raiz do frontend.',
  )
}
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

/* ── 401 handler ──────────────────────────────────────────────────
   O AuthProvider registra aqui o que fazer quando a sessão expira
   (limpar o usuário do estado). Assim o api.js não precisa conhecer
   React nem o router. */
let onUnauthorized = null
export function setUnauthorizedHandler(fn) { onUnauthorized = fn }

/* ── Instância axios ── */
const http = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

/* Request: injeta o Bearer token em toda chamada */
http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

/* Response: sucesso passa direto; erro vira { status, body } */
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status ?? 0
    const url = error.config?.url ?? ''

    // 401 fora das rotas /auth/* = token expirado/inválido → desloga.
    // (Em /auth/login um 401 significa "senha errada", não sessão expirada.)
    const isAuthRoute = url.startsWith('/auth/')
    if (status === 401 && !isAuthRoute && getToken()) {
      clearToken()
      onUnauthorized?.()
    }

    // Sem resposta do servidor (backend fora do ar, CORS, rede caiu)
    const body = error.response?.data ?? {
      message: 'Não foi possível conectar ao servidor. Tente novamente.',
    }

    // Mesmo formato que o código antigo já esperava: err.status e err.body
    return Promise.reject({ status, body })
  },
)

/* Devolve só o corpo; 204 No Content (data === '') vira null */
const unwrap = (res) => (res.data === '' ? null : res.data)

/* ── Mensagem de erro amigável ─────────────────────────────────────
   Recebe o erro rejeitado pelo api ({ status, body }) — ou uma string —
   e devolve o texto a mostrar ao usuário.

   Ordem de prioridade:
     1. body.erro     → formato do backend (ErroResponseDTO: { "erro": "..." })
     2. body.message  → mensagem local do api.js (sem conexão) e afins
     3. fallback      → texto que a tela passou, por conhecer o contexto
     4. texto padrão do status HTTP
     5. texto genérico

   ⚠️ É `erro` (português) de propósito. O `error` em inglês é o campo do
   corpo padrão do Spring ("Internal Server Error") e não deve aparecer
   para o usuário. */
const STATUS_MESSAGES = {
  400: 'Dados inválidos. Confira as informações e tente novamente.',
  401: 'Sua sessão expirou. Faça login novamente.',
  403: 'Você não tem permissão para realizar esta ação.',
  404: 'Não encontramos o que você procura.',
  409: 'Essa informação já está em uso.',
  500: 'Erro no servidor. Tente novamente em instantes.',
}

const isText = (v) => typeof v === 'string' && v.trim() !== ''

export function getErrorMessage(error, fallback) {
  if (isText(error)) return error

  const body = error?.body
  if (body && typeof body === 'object') {
    if (isText(body.erro))    return body.erro
    if (isText(body.message)) return body.message
  }

  if (isText(fallback)) return fallback

  const status = error?.status
  const byStatus = status >= 500 ? STATUS_MESSAGES[500] : STATUS_MESSAGES[status]
  return byStatus ?? 'Ocorreu um erro inesperado. Tente novamente em instantes.'
}

/* ── HTTP methods (mesma API de antes + put) ── */
export const api = {
  get:    (path, config)       => http.get(path, config).then(unwrap),
  post:   (path, data, config) => http.post(path, data, config).then(unwrap),
  put:    (path, data, config) => http.put(path, data, config).then(unwrap),
  patch:  (path, data, config) => http.patch(path, data, config).then(unwrap),
  // DELETE com body (o backend usa isso em DELETE /projetos/{id}/membros)
  delete: (path, data)         => http.delete(path, data ? { data } : undefined).then(unwrap),
}