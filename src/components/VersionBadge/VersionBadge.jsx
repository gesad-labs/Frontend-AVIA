import styles from './VersionBadge.module.css'

// Ambiente (dev, homolog, prod) e versão embutidos no build (VITE_APP_ENV, VITE_APP_VERSION).
const ENV = import.meta.env.VITE_APP_ENV || 'dev'
const VERSION = import.meta.env.VITE_APP_VERSION || '0.0.0'

export default function VersionBadge() {
  const label = `${ENV}-${VERSION}`
  return (
    <span className={`${styles.badge} ${styles[ENV] || ''}`} title={`AVIA ${label}`}>
      {label}
    </span>
  )
}
