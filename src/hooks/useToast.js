import { useContext } from 'react'
import { ToastContext } from '../context/ToastContext'

/**
 * Feedback rápido ao usuário.
 *
 *   const toast = useToast()
 *   toast.success('Projeto criado!')
 *   toast.info('Sincronizando...')
 *   toast.warning('Há cards sem estimativa.')
 *   toast.error(err)                         // erro do api: extrai a mensagem sozinho
 *   toast.error(err, { fallback: 'Não foi possível salvar.' })
 *   toast.success('Salvo', { duration: 2000 })  // ms
 */
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
