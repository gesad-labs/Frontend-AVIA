import { createContext, useState, useCallback, useEffect } from 'react'
import { api, setToken, clearToken, parseJwt, setUnauthorizedHandler, getErrorMessage } from '../services/api'
import { useToast } from '../hooks/useToast'

export const AuthContext = createContext(null)

/* localStorage keys */
const USER_KEY = 'avia_user'  // parsed user object { id, name, email, role }
// raw JWT stored separately via services/api.js TOKEN_KEY ('avia_token')

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const s = localStorage.getItem(USER_KEY)
      return s ? JSON.parse(s) : null
    } catch { return null }
  })
  const [authLoading, setAuthLoading] = useState(false)
  const toast = useToast()

  const isAuthenticated = Boolean(user)

  /* ── Sessão expirada (401 vindo de qualquer chamada da API) ────────
     O api.js já apagou o token; aqui limpamos o usuário do estado.
     O PrivateRoute então redireciona para /login sozinho. */
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null)
      localStorage.removeItem(USER_KEY)
      toast.warning('Sua sessão expirou. Faça login novamente.')
    })
    return () => setUnauthorizedHandler(null)
  }, [toast])

  /* ── Login ──────────────────────────────────────────────────────── */
  const login = useCallback(async (email, password) => {
    setAuthLoading(true)
    try {
      // Backend field is 'senha', LoginPage sends 'password'
      const { token } = await api.post('/auth/login', { email, senha: password })
      setToken(token)

      // JWT claims: { sub: email, id: Long, nome: String }
      // Backend has no 'role' claim yet — default to MEMBRO
      // TODO: replace 'MEMBRO' with claims.role when backend adds it to token
      const claims = parseJwt(token)
      const safeUser = {
        id:    String(claims?.id ?? ''),
        name:  claims?.nome ?? '',
        email: claims?.sub  ?? email,
        role:  'MEMBRO',
      }

      setUser(safeUser)
      localStorage.setItem(USER_KEY, JSON.stringify(safeUser))
      return { success: true }
    } catch (err) {
      // 401 = credenciais erradas (corpo vazio). Outros status (500, sem
      // conexão...) não podem virar "senha inválida": usam a mensagem própria.
      const msg = getErrorMessage(
        err,
        err.status === 401 ? 'E-mail ou senha inválidos.' : undefined,
      )
      return { success: false, errors: { detail: msg } }
    } finally {
      setAuthLoading(false)
    }
  }, [])

  /* ── Register ───────────────────────────────────────────────────── */
  const register = useCallback(async (name, email, password) => {
    setAuthLoading(true)
    try {
      // Backend fields: { nome, email, senha } → returns { id, nome, email } 201
      await api.post('/auth/cadastro', { nome: name, email, senha: password })
      return { success: true }
    } catch (err) {
      const msg = getErrorMessage(err, 'Erro ao criar conta.')
      return { success: false, errors: { detail: msg } }
    } finally {
      setAuthLoading(false)
    }
  }, [])

  /* ── Logout ─────────────────────────────────────────────────────── */
  const logout = useCallback(() => {
    // POST /auth/logout is stateless on backend (no-op)
    // Just clear local token + user state
    setUser(null)
    clearToken()
    localStorage.removeItem(USER_KEY)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, authLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
