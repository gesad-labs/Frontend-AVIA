import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { projetoService } from '../../services/projetoService'
import {
  ACCEPT_ARQUIVOS, TAMANHO_MAXIMO, TIPOS_LEGIVEIS, formatarTamanho, mensagemErroAnexo, validarArquivo,
} from '../../utils/anexos'
import styles from './CardFormPage.module.css'

import { getErrorMessage } from '../../utils/errors'
const TIPO_OPTIONS = ['BUG', 'MELHORIA', 'TAREFA']

const COLUMNS = [
  { key: 'A_FAZER',   label: 'A Fazer'   },
  { key: 'FAZENDO',   label: 'Fazendo'   },
  { key: 'TESTE',     label: 'Em Teste'  },
  { key: 'CONCLUIDA', label: 'Concluída' },
]

export default function CreateCardPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const sprintId     = searchParams.get('sprintId')
  const defaultStatus = searchParams.get('status') ?? 'A_FAZER'

  const [titulo,      setTitulo]      = useState('')
  const [descricao,   setDescricao]   = useState('')
  const [prioridade,  setPrioridade]  = useState('MEDIA')
  const [estimativa,  setEstimativa]  = useState('')
  const [status,      setStatus]      = useState(defaultStatus)
  const [tipo,        setTipo]        = useState('')
  const [responsaveisIds, setResponsaveisIds] = useState(new Set())
  const [membros,     setMembros]     = useState([])
  const [projeto,     setProjeto]     = useState(null)
  const [arquivo,     setArquivo]     = useState(null)
  const [arquivoErro, setArquivoErro] = useState('')
  const [saving,      setSaving]      = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error,       setError]       = useState('')

  useEffect(() => {
    Promise.all([
      projetoService.listarMembros(projectId),
      projetoService.buscar(projectId),
    ]).then(([mems, proj]) => {
      setMembros(Array.isArray(mems) ? mems : [])
      setProjeto(proj)
      setLoadingData(false)
    }).catch(() => setLoadingData(false))
  }, [projectId])

  function escolherArquivo(e) {
    const f = e.target.files?.[0] ?? null
    const problema = f ? validarArquivo(f) : null
    setArquivoErro(problema ?? '')
    setArquivo(problema ? null : f)
    if (problema) e.target.value = ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!titulo.trim()) { setError('Título obrigatório'); return }
    setSaving(true); setError('')
    try {
      const nova = await projetoService.criarTarefa(projectId, {
        titulo:          titulo.trim(),
        descricao:       descricao.trim() || titulo.trim(),
        status,
        prioridade,
        estimativa:      estimativa !== '' ? Number(estimativa) : null,
        sprintId:        sprintId ? Number(sprintId) : null,
        responsaveisIds: Array.from(responsaveisIds),
        tipo:            tipo || null,
      })
      if (arquivo && nova?.id) {
        try {
          await projetoService.adicionarAnexo(projectId, nova.id, arquivo)
        } catch (err) {
          // O card já existe: leva o usuário até ele, com o motivo, para tentar anexar de novo.
          navigate(`/project/${projectId}/task/${nova.id}`, {
            state: { avisoAnexo: `O card foi criado, mas o arquivo não foi anexado: ${mensagemErroAnexo(err)}` },
          })
          return
        }
      }
      navigate(`/project/${projectId}/board`)
    } catch (err) {
      setError(getErrorMessage(err))
      setSaving(false)
    }
  }

  if (loadingData) return <div className={styles.page}><p className={styles.loading}>Carregando...</p></div>

  return (
    <div className={styles.page}>
      <div className={styles.canvas}>

        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Novo Card</h1>
          <p className={styles.pageSubtitle}>
            Crie uma nova tarefa para o Quadro do projeto {projeto?.nome ?? ''}.
          </p>
        </div>

        <div className={styles.formContainer}>
          <form onSubmit={handleSubmit}>
            {error && <p className={styles.errorMsg}>{error}</p>}
            <div className={styles.formInner}>

            {/* Título + Descrição */}
            <div className={styles.sectionTitleDesc}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Título do Card</label>
                <input
                  className={styles.input}
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  placeholder="Ex: Detalhamento de APS FAST"
                  required
                  autoFocus
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Descrição Detalhada</label>
                <textarea
                  className={styles.textarea}
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  placeholder="Descreva os requisitos técnicos e as expectativas deste card..."
                />
              </div>
            </div>

            {/* Metadata: Responsável · Prioridade · Estimativa */}
            <div className={styles.metadataGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Responsáveis</label>
                <div className={styles.checkList}>
                  {membros.map(m => (
                    <label key={m.id} className={styles.checkItem}>
                      <input
                        type="checkbox"
                        checked={responsaveisIds.has(m.id)}
                        onChange={() => {
                          setResponsaveisIds(prev => {
                            const next = new Set(prev)
                            next.has(m.id) ? next.delete(m.id) : next.add(m.id)
                            return next
                          })
                        }}
                      />
                      <span>{m.nome || m.email}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Prioridade</label>
                <select className={styles.select} value={prioridade} onChange={e => setPrioridade(e.target.value)}>
                  <option value="ALTA">Alta</option>
                  <option value="MEDIA">Média</option>
                  <option value="BAIXA">Baixa</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Estimativa (H/SP)</label>
                <input
                  className={styles.input}
                  type="number"
                  min="0"
                  value={estimativa}
                  onChange={e => setEstimativa(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Campos extras: Tipo + Coluna */}
            <div className={styles.extraGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Tipo / Etiqueta</label>
                <select className={styles.select} value={tipo} onChange={e => setTipo(e.target.value)}>
                  <option value="">Sem etiqueta</option>
                  {TIPO_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Coluna</label>
                <select className={styles.select} value={status} onChange={e => setStatus(e.target.value)}>
                  {COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
            </div>

            {/* Anexo (arquivo) */}
            <div className={styles.linkSection}>
              <label className={styles.fieldLabel}>Anexar arquivo (opcional)</label>
              <input
                className={styles.input}
                type="file"
                accept={ACCEPT_ARQUIVOS}
                aria-label="Anexar arquivo"
                onChange={escolherArquivo}
              />
              <small style={{ color: '#64748b' }}>
                {arquivo
                  ? `${arquivo.name} · ${formatarTamanho(arquivo.size)}`
                  : `${TIPOS_LEGIVEIS} · até ${formatarTamanho(TAMANHO_MAXIMO)}`}
              </small>
              {arquivoErro && <small role="alert" style={{ color: '#b91c1c', display: 'block' }}>{arquivoErro}</small>}
            </div>

            {/* Ações */}
            <div className={styles.actions}>
              <button type="button" className={styles.btnCancel} onClick={() => navigate(`/project/${projectId}/board`)}>
                Cancelar
              </button>
              <button type="submit" className={styles.btnSubmit} disabled={saving}>
                {saving ? 'Criando...' : 'Criar Card →'}
              </button>
            </div>

            </div>{/* /formInner */}
          </form>
        </div>

      </div>
    </div>
  )
}