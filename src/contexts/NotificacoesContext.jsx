import { createContext, useContext } from 'react'
import { useNotificacoes } from '../hooks/useNotificacoes'
import { useParams, useLocation } from 'react-router-dom'

const NotificacoesContext = createContext(null)

export function NotificacoesProvider({ children }) {
  const { projectId } = useParams()
  const location = useLocation()
  const isInsideProject = location.pathname.startsWith('/project/')

  const { notificacoes, unreadCount, marcarLida } = useNotificacoes(
    isInsideProject ? projectId : undefined
  )

  return (
    <NotificacoesContext.Provider value={{ notificacoes, unreadCount, marcarLida }}>
      {children}
    </NotificacoesContext.Provider>
  )
}

export function useNotificacoesCtx() {
  const ctx = useContext(NotificacoesContext)
  if (!ctx) return { notificacoes: [], unreadCount: 0, marcarLida: () => {} }
  return ctx
}
