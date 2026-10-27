import { useState } from 'react'
import styles from './VersionBadge.module.css'

// Ambiente (dev, homolog, prod) e versão embutidos no build (VITE_APP_ENV, VITE_APP_VERSION).
const ENV = import.meta.env.VITE_APP_ENV || 'dev'
const VERSION = import.meta.env.VITE_APP_VERSION || '0.0.0'
const HIDDEN_KEY = 'versionBadgeHidden'

function wasClosed() {
  try {
    return sessionStorage.getItem(HIDDEN_KEY) === '1'
  } catch {
    return false
  }
}

export default function VersionBadge() {
  const [hidden, setHidden] = useState(wasClosed)
  if (hidden) return null

  const label = `${ENV}-${VERSION}`
  const close = () => {
    try {
      sessionStorage.setItem(HIDDEN_KEY, '1')
    } catch {
      // sem sessionStorage o selo só some até recarregar
    }
    setHidden(true)
  }

  return (
    <span className={`${styles.badge} ${styles[ENV] || ''}`} title={`AVIA ${label}`}>
      {label}
      <button type="button" className={styles.close} onClick={close} aria-label="Fechar selo de versão">
        ×
      </button>
    </span>
  )
}
