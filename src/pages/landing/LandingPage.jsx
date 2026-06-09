import { Link } from 'react-router-dom'
import styles from './LandingPage.module.css'

/* ── Icons ── */
const IconA = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 20 L12 4 L21 20" /><line x1="6.5" y1="14" x2="17.5" y2="14" />
  </svg>
)

const IconGrid = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
)

const IconDoc = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" />
  </svg>
)

const FEATURES = [
  {
    icon: <IconA />,
    title: 'Painel Arquitetônico',
    desc: 'Uma visão estruturada de alto nível que permite pausar a hierarquia do seu projeto com precisão cirúrgica e clareza visual absoluta.',
  },
  {
    icon: <IconGrid />,
    title: 'Quadros de Alta Precisão',
    desc: 'Fluxos de trabalho otimizados com transições fluidas e resultados claros para que nenhuma tarefa seja perdida no ruído operacional.',
  },
  {
    icon: <IconDoc />,
    title: 'Sistema de Registro',
    desc: 'Cada alteração é documentada de forma imutável, garantindo que o histórico do projeto seja uma fonte de verdade inquestionável.',
  },
]

/* ── App Mockup ── */
function AppMockup() {
  return (
    <div className={styles.mockup}>
      <div className={styles.mockupBar}>
        <span className={styles.dot} style={{ background: '#ff5f57' }} />
        <span className={styles.dot} style={{ background: '#ffbd2e' }} />
        <span className={styles.dot} style={{ background: '#28c840' }} />
      </div>
      <div className={styles.mockupBody}>
        {/* Mini topbar */}
        <div className={styles.mTopbar}>
          <div className={styles.mTabGroup}>
            <span className={styles.mTab}>55</span>
            <span className={styles.mTab}>48</span>
            <span className={`${styles.mTab} ${styles.mTabActive}`}>AVIA</span>
          </div>
          <div className={styles.mBtn} />
        </div>
        {/* Mini content */}
        <div className={styles.mContent}>
          <div className={styles.mSidebar}>
            {[1,2,3,4,5].map(i => (
              <div key={i} className={`${styles.mSideItem} ${i === 2 ? styles.mSideActive : ''}`} />
            ))}
          </div>
          <div className={styles.mMain}>
            <p className={styles.mTitle}>Projetos Ativos</p>
            <div className={styles.mCards}>
              {['#C0E8F9','#e0e7ff','#fde68a'].map((c, i) => (
                <div key={i} className={styles.mCard}>
                  <div className={styles.mCardTop} style={{ background: c }} />
                  <div className={styles.mCardLine} />
                  <div className={styles.mCardLine} style={{ width: '60%' }} />
                  <div className={styles.mCardStatus}>
                    <span className={styles.mPill} style={{ background: i === 0 ? '#dcfce7' : '#fee2e2' }}>
                      {i === 0 ? '●' : '●'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className={styles.page}>

      {/* ── Navbar ── */}
      <header className={styles.navbar}>
        <div className={styles.navInner}>
          <span className={styles.navLogo}>AVIA</span>
          <nav className={styles.navLinks}>
            <Link to="/login" className={styles.navLogin}>Entrar</Link>
            <Link to="/signup" className={styles.navCta}>Cadastre-se</Link>
          </nav>
        </div>
      </header>

      <main className={styles.main}>

        {/* ── Hero ── */}
        <section className={styles.hero}>
          <div className={styles.heroLeft}>
            <span className={styles.heroBadge}>PRODUTIVIDADE DE ELITE</span>
            <h1 className={styles.heroHeading}>
              Gerencie seus projetos com precisão.
            </h1>
            <p className={styles.heroDesc}>
              O AVIA transforma a complexidade em clareza. Uma arquitetura de
              software desenhada para equipes que exigem o mais alto nível de
              controle e performance.
            </p>
            <Link to="/signup" className={styles.heroBtn}>Começar Grátis</Link>
          </div>
          <div className={styles.heroRight}>
            <AppMockup />
          </div>
        </section>

        {/* ── Features ── */}
        <section className={styles.features}>
          <div className={styles.featuresHeader}>
            <h2 className={styles.featuresTitle}>Por que escolher a AVIA?</h2>
            <div className={styles.featuresUnderline} />
          </div>
          <div className={styles.featuresGrid}>
            {FEATURES.map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className={styles.ctaWrapper}>
          <div className={styles.cta}>
            <h2 className={styles.ctaHeading}>
              Pronto para elevar sua produtividade?
            </h2>
            <p className={styles.ctaDesc}>
              Junte-se às equipes de engenharia e design que já utilizam o AVIA
              para entregar projetos complexos com facilidade.
            </p>
            <Link to="/signup" className={styles.ctaBtn}>Começar agora</Link>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span className={styles.footerLogo}>AVIA</span>
          <p className={styles.footerCopy}>© 2026 AVIA. TODOS OS DIREITOS RESERVADOS.</p>
        </div>
      </footer>

    </div>
  )
}
