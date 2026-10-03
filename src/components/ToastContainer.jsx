import styles from './ToastContainer.module.css'

const Svg = ({ children }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)

const ICONS = {
  success: <Svg><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></Svg>,
  error:   <Svg><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></Svg>,
  warning: <Svg><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z" /><path d="M12 9v4" /><path d="M12 17h.01" /></Svg>,
  info:    <Svg><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></Svg>,
}

/* Só apresentação: quem controla a lista é o ToastProvider. */
export default function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className={styles.container} role="region" aria-label="Notificações">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${styles.toast} ${styles[t.type]}`}
          // erro/aviso interrompem o leitor de tela; sucesso/info são "educados"
          role={t.type === 'error' || t.type === 'warning' ? 'alert' : 'status'}
        >
          <span className={styles.icon}>{ICONS[t.type]}</span>
          <p className={styles.message}>{t.message}</p>
          <button
            type="button"
            className={styles.close}
            onClick={() => onDismiss(t.id)}
            aria-label="Fechar notificação"
          >
            <Svg><path d="M18 6 6 18" /><path d="m6 6 12 12" /></Svg>
          </button>
        </div>
      ))}
    </div>
  )
}
