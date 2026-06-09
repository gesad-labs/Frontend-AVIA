import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../../services/api'
import styles from './ResetPasswordPage.module.css'

const EyeIcon = ({ open }) => open ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [show, setShow] = useState({ password: false, confirm: false })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const requirements = [
    { label: 'Mínimo de 8 caracteres',   met: form.password.length >= 8 },
    { label: 'Uma letra maiúscula',       met: /[A-Z]/.test(form.password) },
    { label: 'Um número',                 met: /\d/.test(form.password) },
    { label: 'Um caractere especial',     met: /[^A-Za-z0-9]/.test(form.password) },
  ]

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) {
      setError('As senhas não coincidem.')
      return
    }

    const token = searchParams.get('token')
    if (!token) {
      setError('Link inválido ou expirado. Solicite um novo link de recuperação.')
      return
    }

    setLoading(true)
    try {
      // Backend: { token: string, novaSenha: string } → 204
      await api.post('/auth/redefinicao-senha', { token, novaSenha: form.password })
      navigate('/login')
    } catch (err) {
      setError(err.body?.message ?? 'Token inválido ou expirado. Solicite um novo link.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* ── Branding / Visual Side ── */}
        <div className={styles.left}>
          <div className={styles.leftTop}>
            <p className={styles.leftHeading}>Segurança e Precisão no Gerenciamento.</p>
            <p className={styles.leftSubtitle}>
              Mantenha o controle de seus projetos com a arquitetura robusta da AVIA.
            </p>
          </div>
          <div className={styles.leftFooter}>
            <ShieldIcon />
            <span>Sua conta é protegida por criptografia de ponta a ponta.</span>
          </div>
        </div>

        {/* ── Form Side ── */}
        <div className={styles.right}>
          <div className={styles.header}>
            <h1>Redefinir Senha</h1>
            <p>Crie uma nova senha forte para acessar sua conta AVIA.</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>

            {/* Nova Senha */}
            <div className={styles.field}>
              <label htmlFor="password">Nova Senha</label>
              <div className={styles.inputWrapper}>
                <input
                  id="password"
                  name="password"
                  type={show.password ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoFocus
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShow(s => ({ ...s, password: !s.password }))}
                  tabIndex={-1}
                >
                  <EyeIcon open={show.password} />
                </button>
              </div>
            </div>

            {/* Confirmar Nova Senha */}
            <div className={styles.field}>
              <label htmlFor="confirm">Confirmar Nova Senha</label>
              <div className={styles.inputWrapper}>
                <input
                  id="confirm"
                  name="confirm"
                  type={show.confirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.confirm}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))}
                  tabIndex={-1}
                >
                  <EyeIcon open={show.confirm} />
                </button>
              </div>
            </div>

            {/* Security requirements */}
            <div className={styles.requirements}>
              <p className={styles.reqTitle}>REQUISITOS DE SEGURANÇA</p>
              <div className={styles.reqGrid}>
                {requirements.map((r) => (
                  <div key={r.label} className={`${styles.req} ${r.met ? styles.reqMet : ''}`}>
                    <span className={styles.reqDot} />
                    <span>{r.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.submit} disabled={loading}>
              {loading ? 'Salvando...' : 'Redefinir Senha'}
            </button>

          </form>

          <p className={styles.backLink}>
            <Link to="/login">Voltar para o Login</Link>
          </p>
        </div>

      </div>
    </div>
  )
}
