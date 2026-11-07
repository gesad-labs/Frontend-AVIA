import { useState } from 'react'
import styles from './ArchiveProjectModal.module.css'

/**
 * Tela de confirmação do arquivamento (US014).
 *  - membrosAfetados: quem passará de membro para visualizador
 *  - onConfirm: async () => string | null  (devolve a mensagem de erro, ou null se deu certo)
 */
export default function ArchiveProjectModal({ projectName, membrosAfetados, onConfirm, onClose }) {
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro]         = useState('')

  async function confirmar() {
    setEnviando(true); setErro('')
    const mensagem = await onConfirm()
    if (mensagem) { setErro(mensagem); setEnviando(false) }
  }

  const qtd = membrosAfetados.length

  return (
    <div className={styles.overlay} onClick={enviando ? undefined : onClose}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="arquivar-titulo"
        onClick={e => e.stopPropagation()}>
        <div className={styles.icon} aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" /><line x1="10" y1="12" x2="14" y2="12" />
          </svg>
        </div>
        <h2 id="arquivar-titulo" className={styles.title}>Arquivar projeto?</h2>
        <p className={styles.text}>
          <strong>{projectName}</strong> sairá da sua lista principal de projetos e ficará disponível
          no filtro <em>Arquivados</em>.
        </p>

        <div className={styles.impact}>
          <p className={styles.impactTitle}>O que vai acontecer</p>
          {qtd === 0 ? (
            <p className={styles.impactText}>Nenhum membro terá o papel alterado: não há membros comuns neste projeto.</p>
          ) : (
            <>
              <p className={styles.impactText}>
                {qtd === 1 ? '1 membro passará' : `${qtd} membros passarão`} a ser <strong>visualizador{qtd === 1 ? '' : 'es'}</strong>,
                só com permissão de leitura:
              </p>
              <ul className={styles.memberList}>
                {membrosAfetados.map(m => <li key={m.id}>{m.nome}</li>)}
              </ul>
            </>
          )}
          <p className={styles.impactText}>Gerentes continuam com acesso total.</p>
        </div>

        {erro && <p className={styles.error} role="alert">{erro}</p>}

        <div className={styles.footer}>
          <button type="button" className={styles.btnSecondary} onClick={onClose} disabled={enviando}>Cancelar</button>
          <button type="button" className={styles.btnDanger} onClick={confirmar} disabled={enviando}>
            {enviando ? 'Arquivando...' : erro ? 'Tentar novamente' : 'Arquivar projeto'}
          </button>
        </div>
      </div>
    </div>
  )
}