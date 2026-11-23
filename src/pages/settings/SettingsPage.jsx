import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { projetoService } from '../../services/projetoService'
import { souGerenteDoProjeto } from '../../utils/membros'
import { getErrorMessage } from '../../utils/errors'
import { STATUS_LABELS, loadStatus, saveStatus } from '../../services/projectStatusStore'
import styles from './SettingsPage.module.css'

// key={projectId}: ao trocar de projeto (dropdown da sidebar) o formulario remonta
// e le o status do projeto novo, sem ficar com estado do anterior.
export default function SettingsPage() {
  const { projectId } = useParams()
  return <ProjectSettings key={projectId} projectId={projectId} />
}

function ProjectSettings({ projectId }) {
  const navigate = useNavigate()
  const [projeto, setProjeto] = useState(null)
  const [erro, setErro] = useState('')
  const [status, setStatus] = useState(() => loadStatus(projectId))

  useEffect(() => {
    projetoService.buscar(projectId)
      .then(setProjeto)
      .catch(err => setErro(getErrorMessage(err)))
  }, [projectId])

  // Aplica na tela e persiste no mesmo instante (sem botao "Salvar").
  function handleStatusChange(e) {
    const novo = e.target.value
    setStatus(novo)
    saveStatus(projectId, novo)
  }

  if (erro) return <div className={styles.page}><p className={styles.error}>{erro}</p></div>
  if (!projeto) return <div className={styles.page}><p className={styles.hint}>Carregando configurações...</p></div>

  const podeEditar = souGerenteDoProjeto(projeto)

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => navigate('/projects')}>
        ← Voltar para projetos
      </button>

      <div className={styles.header}>
        <h1 className={styles.title}>Configurações do projeto</h1>
        <p className={styles.subtitle}>{projeto.nome}</p>
      </div>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Geral</h2>
        <div className={styles.row}>
          <span className={styles.label}>Nome</span>
          <span className={styles.value}>{projeto.nome}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Estimativa</span>
          <span className={styles.value}>{projeto.tipoEstimativa}</span>
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Status do projeto</h2>
        <select
          className={styles.select}
          value={status}
          onChange={handleStatusChange}
          disabled={!podeEditar}
          aria-label="Status do projeto"
        >
          {Object.entries(STATUS_LABELS).map(([valor, rotulo]) => (
            <option key={valor} value={valor}>{rotulo}</option>
          ))}
        </select>
        <p className={styles.hint}>
          {podeEditar
            ? 'A alteração é aplicada na hora e fica salva neste navegador.'
            : 'Apenas gerentes do projeto podem alterar o status.'}
        </p>
      </section>
    </div>
  )
}