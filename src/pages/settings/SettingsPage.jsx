import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { projetoService } from '../../services/projetoService'
import { useAuth } from '../../hooks/useAuth'
import { getErrorMessage } from '../../utils/errors'
import { isGerente } from '../../utils/membros'
import {
  STATUS_PROJETO, ROTULO_STATUS, statusDoProjeto, saveStatus, arquivadoEm, marcarArquivado,
  podeArquivar, membrosARebaixar, rebaixarMembros,
} from '../../utils/projetoStatus'
import ArchiveProjectModal from '../../components/project/ArchiveProjectModal'
import styles from './SettingsPage.module.css'

export default function SettingsPage() {
  const { projectId } = useParams()
  const { user } = useAuth()

  const [projeto,    setProjeto]    = useState(null)
  const [membros,    setMembros]    = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro,       setErro]       = useState('')
  const [mostrarModal, setMostrarModal] = useState(false)
  const [resultado,  setResultado]  = useState(null)   // { rebaixados: n } depois de arquivar
  const [, setTick] = useState(0)                      // força releitura do status/arquivado (localStorage)

  useEffect(() => {
    let vivo = true
    ;(async () => {
      try {
        const [p, m] = await Promise.all([
          projetoService.buscar(projectId),
          projetoService.listarMembros(projectId),
        ])
        if (!vivo) return
        setProjeto(p)
        setMembros(Array.isArray(m) ? m : [])
      } catch (err) {
        if (vivo) setErro(getErrorMessage(err, 'Não foi possível carregar as configurações do projeto.'))
      } finally {
        if (vivo) setCarregando(false)
      }
    })()
    return () => { vivo = false }
  }, [projectId])

  const eu         = membros.find(m => m.email?.toLowerCase() === user?.email?.toLowerCase())
  const souGerente = isGerente(eu)
  const status     = statusDoProjeto(projectId)
  const dataArquivo = arquivadoEm(projectId)
  const regra      = podeArquivar({ souGerente, status, arquivado: Boolean(dataArquivo) })
  const afetados   = membrosARebaixar(membros)

  function alterarStatus(novo) {
    saveStatus(projectId, novo)
    setTick(t => t + 1)
  }

  /* Devolve a mensagem de erro (ou null). Só marca como arquivado se TODOS os membros foram alterados. */
  async function confirmarArquivamento() {
    const { rebaixados, falhas } = await rebaixarMembros(
      afetados,
      usuarioId => projetoService.atualizarMembro(projectId, usuarioId, { papel: 'visualizador' }),
    )
    try { // reflete o que realmente ficou gravado no back (também em caso de falha parcial)
      const atualizados = await projetoService.listarMembros(projectId)
      if (Array.isArray(atualizados)) setMembros(atualizados)
    } catch { /* mantém a lista anterior */ }

    if (falhas.length > 0) {
      const nomes = falhas.map(f => f.membro.nome).join(', ')
      const motivo = getErrorMessage(falhas[0].erro, 'erro desconhecido')
      return `Não foi possível alterar ${falhas.length === 1 ? '1 membro' : `${falhas.length} membros`} (${nomes}): ${motivo}. `
        + 'O projeto ainda não foi arquivado — tente novamente.'
    }
    marcarArquivado(projectId)
    setResultado({ rebaixados: rebaixados.length })
    setMostrarModal(false)
    setTick(t => t + 1)
    return null
  }

  if (carregando) return <div className={styles.page}><p className={styles.state}>Carregando configurações...</p></div>
  if (erro)       return <div className={styles.page}><p className={styles.stateError} role="alert">{erro}</p></div>

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Configurações do Projeto</h1>
        <p className={styles.subtitle}>{projeto?.nome}</p>
      </header>

      {resultado && (
        <div className={styles.success} role="status">
          Projeto arquivado.{' '}
          {resultado.rebaixados > 0
            ? `${resultado.rebaixados} ${resultado.rebaixados === 1 ? 'membro agora é visualizador' : 'membros agora são visualizadores'}.`
            : 'Nenhum membro precisou ter o papel alterado.'}{' '}
          <Link to="/projects" className={styles.successLink}>Voltar aos projetos</Link>
        </div>
      )}

      <section className={styles.card} aria-labelledby="cfg-status">
        <h2 id="cfg-status" className={styles.cardTitle}>Status do projeto</h2>
        <select
          className={styles.select}
          value={status}
          onChange={e => alterarStatus(e.target.value)}
          disabled={!souGerente || Boolean(dataArquivo)}
          aria-label="Alterar status do projeto"
        >
          {Object.values(STATUS_PROJETO).map(s => <option key={s} value={s}>{ROTULO_STATUS[s]}</option>)}
        </select>
        <p className={styles.hint}>
          {souGerente
            ? 'Um projeto precisa estar Concluído para poder ser arquivado. O status fica guardado neste navegador.'
            : 'Apenas gerentes podem alterar o status do projeto.'}
        </p>
      </section>

      <section className={`${styles.card} ${styles.cardAdvanced}`} aria-labelledby="cfg-avancado">
        <h2 id="cfg-avancado" className={styles.cardTitle}>Ações avançadas</h2>
        <div className={styles.actionRow}>
          <div>
            <p className={styles.actionTitle}>Arquivar projeto</p>
            <p className={styles.hint}>
              Tira o projeto da lista principal e transforma os membros em visualizadores.
              Gerentes continuam com acesso total.
            </p>
          </div>
          {dataArquivo ? (
            <span className={styles.badge}>Arquivado em {dataArquivo.toLocaleDateString('pt-BR')}</span>
          ) : (
            <button type="button" className={styles.btnArchive} disabled={!regra.ok} onClick={() => setMostrarModal(true)}>
              Arquivar projeto
            </button>
          )}
        </div>
        {!dataArquivo && !regra.ok && <p className={styles.reason}>{regra.motivo}</p>}
      </section>

      {mostrarModal && (
        <ArchiveProjectModal
          projectName={projeto?.nome}
          membrosAfetados={afetados}
          onConfirm={confirmarArquivamento}
          onClose={() => setMostrarModal(false)}
        />
      )}
    </div>
  )
}