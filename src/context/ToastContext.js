import { createContext } from 'react'

/* Contexto dos toasts. O valor é sempre o mesmo objeto estável
   (ver ToastProvider), então consumir não causa re-render. */
export const ToastContext = createContext(null)
