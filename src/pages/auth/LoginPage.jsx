import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import styles from './LoginPage.module.css'

function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, authLoading } = useAuth()

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const from = location.state?.from?.pathname || '/dashboard'

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const result = await login(form.email, form.password)
    if (result.success) {
      navigate(from, { replace: true })
    } else {
      const err = result.errors
      const msg =
        err?.detail ||
        err?.non_field_errors?.[0] ||
        err?.message ||
        'E-mail ou senha inválidos.'
      setError(msg)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* Left — branding panel */}
        <div className={styles.left}>
          <div className={styles.leftTop}>
            <span className={styles.brandName}>AVIA</span>
            <p className={styles.leftSubtitle}>
              A excelência na gestão de projetos começa com uma interface desenhada para a precisão.
            </p>
          </div>
        </div>

        {/* Right — login form */}
        <div className={styles.right}>

          <div className={styles.header}>
            <h1>Bem-vindo</h1>
            <p>Acesse sua conta para gerenciar seus projetos.</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>

            <div className={styles.field}>
              <label htmlFor="email">E-MAIL</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="exemplo@avia.com.br"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label htmlFor="password">SENHA</label>
                <Link to="/forgot-password" className={styles.forgotLink}>
                  Esqueci minha senha
                </Link>
              </div>
              <div className={styles.passwordWrapper}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.submit} disabled={authLoading}>
              {authLoading ? 'Entrando...' : 'Entrar'}
            </button>

          </form>

          <p className={styles.signupLink}>
            Não possui uma conta?{' '}
            <Link to="/signup">Criar nova conta</Link>
          </p>

        </div>
      </div>
    </div>
  )
}
