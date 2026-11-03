import { useState } from 'react'
import styles from './VersionBadge.module.css'

// Ambiente (dev, homolog, prod) e versão embutidos no build (VITE_APP_ENV, VITE_APP_VERSION).
const ENV = import.meta.env.VITE_APP_ENV || 'dev'
const VERSION = import.meta.env.VITE_APP_VERSION || '0.0.0'

// O × só esconde o selo até recarregar a página (F5), quando ele volta.
export default function VersionBadge() {
  const [hidden, setHidden] = useState(false)
  if (hidden) return null

  const label = `${ENV}-${VERSION}`

  return (
    <span className={`${styles.badge} ${styles[ENV] || ''}`} title={`AVIA ${label}`}>
      {label}
      <button type="button" className={styles.close} onClick={() => setHidden(true)} aria-label="Fechar selo de versão">
        ×
      </button>
    </span>
  )
}
