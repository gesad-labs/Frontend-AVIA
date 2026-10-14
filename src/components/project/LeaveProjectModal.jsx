import { useEffect, useState } from 'react'
import { projetoService } from '../../services/projetoService'
import { useAuth } from '../../hooks/useAuth'
import { isGerente } from '../../utils/membros'
import styles from './LeaveProjectModal.module.css'

/* ── Helpers ─────────────────────────────────────────────────────── */

function getErrorMessage(err, fallback) {
  return err?.body?.erro || err?.body?.mensagem || err?.body?.message || fallback
}

/**
 * US012 — Auto remoção do projeto.
 *
 * Fluxo:
 *  1. Carrega os membros para descobrir o papel do usuário logado.
 *  2. Não é gerente, ou há outro gerente  → confirmação simples.
 *  3. É o ÚNICO gerente                   → exige escolher um sucessor.
 *     Ordem das chamadas: promover sucessor → sair. Se a 2ª falhar, o
 *     projeto fica com 2 gerentes (nunca com 0).
 *  4. Só existe o próprio usuário no projeto → bloqueia a saída.
 */
export default function LeaveProjectModal({ projectId, projectName, onClose, onLeft }) {
  const { user } = useAuth()
  const [membros, setMembros]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [loadError, setLoadError] = useState('')
  const [successorId, setSuccessorId] = useState(null)
  const [submitting, setSubmitting]   = useState(false)
  const [error, setError]             = useState('')

  useEffect(() => {
    let cancelled = false
    projetoService.listarMembros(projectId)
      .then(data => { if (!cancelled) setMembros(Array.isArray(data) ? data : []) })
      .catch(err => { if (!cancelled) setLoadError(getErrorMessage(err, 'Não foi possível carregar os membros do projeto.')) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [projectId])

  const me = membros.find(m => m.email?.toLowerCase() === user?.email?.toLowerCase())
  const outros = membros.filter(m => m.id !== me?.id)
  const souGerente = isGerente(me)
  const outrosGerentes = outros.filter(isGerente)
  const precisaSucessor = souGerente && outrosGerentes.length === 0
  const soEu = Boolean(me) && outros.length === 0

  // Só sai quando: dados carregados, usuário localizado, não está sozinho e,
  // se for o único gerente, já escolheu o sucessor.
  const podeConfirmar =
    !loading && !loadError && Boolean(me) && !soEu && (!precisaSucessor || successorId != null)

  async function handleConfirm() {
    setSubmitting(true); setError('')
    try {
      if (precisaSucessor) {
        // Backend precisa aceitar papel 'gerente' neste PATCH (ver notas da feat).
        await projetoService.atualizarMembro(projectId, successorId, { papel: 'gerente' })
      }
      await projetoService.sairDoProjeto(projectId)
      onLeft?.()
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao sair do projeto. Tente novamente.'))
      setSubmitting(false)
    }
  }

  function renderBody() {
    if (loading) return <p className={styles.text}>Verificando seu papel no projeto...</p>
    if (loadError) return <p className={styles.errorText}>{loadError}</p>
    if (!me) return <p className={styles.errorText}>Você não faz parte deste projeto.</p>

    if (soEu) {
      return (
        <p className={styles.text}>
          Você é o único membro de <strong>{projectName}</strong>, então não pode sair —
          o projeto ficaria sem gerente. Adicione outro membro para transferir a gerência
          ou exclua o projeto.
        </p>
      )
    }

    return (
      <>
        <p className={styles.text}>
          Ao sair de <strong>{projectName}</strong> você perde imediatamente o acesso a todos
          os dados, configurações e funcionalidades do projeto. Esta ação não pode ser desfeita.
        </p>

        {souGerente && !precisaSucessor && (
          <p className={styles.hint}>
            Há outro gerente neste projeto, então a saída pode ser feita normalmente.
          </p>
        )}

        {precisaSucessor && (
          <div className={styles.successorBox}>
            <p className={styles.warning}>
              Você é o único gerente. Indique quem assumirá a gerência antes de sair.
            </p>
            <div className={styles.successorList} role="radiogroup" aria-label="Novo gerente">
              {outros.map(m => (
                <label key={m.id}
                  className={`${styles.successorItem} ${successorId === m.id ? styles.successorItemActive : ''}`}>
                  <input type="radio" name="novo-gerente" className={styles.radio}
                    checked={successorId === m.id}
                    onChange={() => setSuccessorId(m.id)} />
                  <span className={styles.successorInfo}>
                    <span className={styles.successorName}>{m.nome || m.email}</span>
                    <span className={styles.successorMeta}>{m.email} · {m.cargo}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {error && <p className={styles.errorText}>{error}</p>}
      </>
    )
  }

  return (
    <div className={styles.overlay} onClick={submitting ? undefined : onClose}>
      <div className={styles.modal} role="dialog" aria-modal="true"
        onClick={e => e.stopPropagation()}>
        <h2 className={styles.title}>Sair do projeto</h2>
        {renderBody()}
        <div className={styles.actions}>
          <button type="button" className={styles.btnCancel} onClick={onClose} disabled={submitting}>
            {soEu || loadError ? 'Fechar' : 'Cancelar'}
          </button>
          {!soEu && !loadError && (
            <button type="button" className={styles.btnDanger}
              onClick={handleConfirm} disabled={!podeConfirmar || submitting}>
              {submitting
                ? 'Saindo...'
                : precisaSucessor ? 'Transferir e sair' : 'Sair do projeto'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}