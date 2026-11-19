import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'
import styles from './ForgotPasswordPage.module.css'

const RefreshIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
)

const EnvelopeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
)

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/recuperacao-senha', { email })
    } catch {
      // Don't reveal whether email exists — always show "sent"
    } finally {
      setLoading(false)
      setSent(true)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.wrapper}>
        <div className={styles.card}>

          {/* Icon badge */}
          <div className={styles.iconBadge}>
            <RefreshIcon />
          </div>

          {/* Header */}
          <div className={styles.header}>
            <h1>Recuperar Senha</h1>
            <p>Insira seu e-mail para receber as instruções de recuperação</p>
          </div>

          {sent ? (
            <div className={styles.success}>
              <p>
                Solicitação enviada para <strong>{email}</strong>.{' '}
                Em desenvolvimento, o link de redefinição é impresso no{' '}
                <strong>console do servidor</strong> (backend).
              </p>
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <div className={styles.field}>
                <label htmlFor="email">E-MAIL CADASTRADO</label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}>
                    <EnvelopeIcon />
                  </span>
                  <input
                    id="email"
                    type="email"
                    placeholder="exemplo@avia.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button type="submit" className={styles.submit} disabled={loading}>
                {loading ? 'Enviando...' : <>Enviar Link de Redefinição <span>→</span></>}
              </button>
            </form>
          )}

          <p className={styles.backLink}>
            <Link to="/login">← Voltar para o login</Link>
          </p>

        </div>

        <p className={styles.support}>
          Problemas com o acesso?{' '}
          <a href="mailto:suporte@avia.com">Contate o suporte</a>
        </p>
      </div>
    </div>
  )
}
