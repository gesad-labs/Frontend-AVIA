import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import styles from './SignupPage.module.css'

const EyeOpen = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeClosed = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

export default function SignupPage() {
  const navigate = useNavigate()
  const { register: registerUser, authLoading } = useAuth()
  const toast = useToast()

  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const requirements = [
    { label: 'Mínimo de 8 caracteres',        met: form.password.length >= 8 },
    { label: 'Mínimo de uma letra maiúscula',  met: /[A-Z]/.test(form.password) },
    { label: 'Mínimo de número',               met: /\d/.test(form.password) },
    { label: 'Mínimo de um caractere especial', met: /[^A-Za-z0-9]/.test(form.password) },
  ]

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const result = await registerUser(form.name, form.email, form.password)
    if (result.success) {
      toast.success('Conta criada com sucesso! Faça login para continuar.')
      navigate('/login')
    } else {
      const err = result.errors
      const msg =
        err?.message ||
        err?.detail ||
        err?.email?.[0] ||
        err?.name?.[0] ||
        'Erro ao criar conta. Tente novamente.'
      setError(msg)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.aviaWatermark}>AVIA</div>

      <div className={styles.wrapper}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1>Comece sua jornada</h1>
            <p>Gerencie projetos com autoridade arquitetônica.</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
              <label htmlFor="name">Nome Completo</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Digite seu nome"
                value={form.name}
                onChange={handleChange}
                required
                autoComplete="name"
                autoFocus
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="email@exemplo.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password">Senha</label>
              <div className={styles.passwordWrapper}>
                <input
                  id="password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPass((v) => !v)}
                  tabIndex={-1}
                >
                  {showPass ? <EyeClosed /> : <EyeOpen />}
                </button>
              </div>

              <div className={styles.requirements}>
                <p className={styles.requirementsTitle}>REQUISITOS DE SEGURANÇA</p>
                <div className={styles.requirementsGrid}>
                  {requirements.map((req) => (
                    <div key={req.label} className={`${styles.req} ${req.met ? styles.reqMet : ''}`}>
                      <span className={styles.reqDot} />
                      <span>{req.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.submit} disabled={authLoading}>
              {authLoading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>

          <p className={styles.loginLink}>
            Já tenho uma conta?{' '}
            <Link to="/login">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
