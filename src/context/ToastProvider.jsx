import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ToastContext } from './ToastContext'
import ToastContainer from '../components/ToastContainer'
import { getErrorMessage } from '../services/api'

const DURATIONS = { success: 4000, info: 4000, warning: 6000, error: 7000 } // ms
const MAX_VISIBLE = 4

/**
 * ToastProvider — toasts de sucesso/erro/aviso/info para o app inteiro.
 * Também renderiza o <ToastContainer>, então basta montá-lo uma vez no App.
 *
 * - Toast idêntico (mesmo tipo + mesma mensagem) não empilha: reinicia o tempo.
 * - No máximo MAX_VISIBLE na tela; os mais antigos saem primeiro.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id))
    timers.current.delete(id)
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const show = useCallback((type, message, duration) => {
    const id = `${type}:${message}` // id determinístico = deduplicação
    clearTimeout(timers.current.get(id))
    timers.current.set(id, setTimeout(() => dismiss(id), duration ?? DURATIONS[type]))
    setToasts((prev) =>
      [...prev.filter((t) => t.id !== id), { id, type, message }].slice(-MAX_VISIBLE),
    )
    return id
  }, [dismiss])

  // Não deixa timer pendente se o provider for desmontado
  useEffect(() => {
    const pending = timers.current
    return () => {
      pending.forEach(clearTimeout)
      pending.clear()
    }
  }, [])

  // Objeto estável: as funções nunca mudam, então useToast() pode entrar em
  // dependências de useEffect/useCallback sem causar loops nem re-renders.
  const api = useMemo(() => ({
    success: (message, opts) => show('success', message, opts?.duration),
    info:    (message, opts) => show('info',    message, opts?.duration),
    warning: (message, opts) => show('warning', message, opts?.duration),
    error:   (errOrMessage, opts) =>
      show('error', getErrorMessage(errOrMessage, opts?.fallback), opts?.duration),
    dismiss,
  }), [show, dismiss])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}