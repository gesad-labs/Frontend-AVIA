import styles from './EmailRecoveryPreview.module.css'

export default function EmailRecoveryPreview() {
  return (
    <div className={styles.page}>
      <article className={styles.card}>

        {/* ── Email Header ── */}
        <header className={styles.emailHeader}>
          <h2 className={styles.subject}>Redefinição de senha solicitada</h2>
          <div className={styles.senderRow}>
            <div className={styles.avatar}>A</div>
            <div className={styles.senderInfo}>
              <p className={styles.senderName}>
                AVIA <span className={styles.senderEmail}>&lt;no-reply@avia.com.br&gt;</span>
              </p>
              <p className={styles.senderTo}>Para mim</p>
            </div>
            <span className={styles.timestamp}>14:32 (há 5 minutos)</span>
          </div>
        </header>

        {/* ── Email Body ── */}
        <section className={styles.emailBody}>

          {/* Brand */}
          <div className={styles.brand}>
            <span className={styles.brandName}>AVIA</span>
            <span className={styles.brandTagline}>GESTÃO ARQUITETÔNICA</span>
          </div>

          {/* Greeting */}
          <p className={styles.greeting}>Olá, João Silva</p>

          {/* Description */}
          <p className={styles.description}>
            Recebemos uma solicitação para redefinir a senha da sua conta no ecossistema
            AVIA. Para prosseguir com a alteração, clique no botão de destaque abaixo:
          </p>

          {/* CTA Button */}
          <div className={styles.ctaWrapper}>
            <a href="#" className={styles.ctaButton}>Redefinir Senha</a>
          </div>

          {/* Warning box */}
          <div className={styles.warningBox}>
            <p>
              Se você não solicitou esta alteração, pode ignorar este e-mail com
              segurança. Seu acesso continuará protegido com sua senha atual.
            </p>
          </div>

          {/* Expiry + support */}
          <div className={styles.notices}>
            <p className={styles.expiry}>Este link expirará em 24 horas por motivos de segurança.</p>
            <p className={styles.support}>
              Precisa de ajuda? Entre em contato com nosso{' '}
              <a href="#" className={styles.supportLink}>Suporte Técnico</a>.
            </p>
          </div>

        </section>

        {/* ── Footer / Signature ── */}
        <footer className={styles.emailFooter}>
          <p className={styles.footerText}>AVIA © 2026 • APLICATIVO DE GERENCIAMENTO</p>
        </footer>

      </article>
    </div>
  )
}
