import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { projetoService } from '../../services/projetoService'
import { createPokerClient } from '../../services/planningPokerSocket'
import styles from './PlanningPokerPage.module.css'

/* ─── Fibonacci deck ─── */
const FIBONACCI = [
  { label: '1',  value: 1,  sub: 'STORY POINT'  },
  { label: '2',  value: 2,  sub: 'STORY POINTS' },
  { label: '3',  value: 3,  sub: 'STORY POINTS' },
  { label: '5',  value: 5,  sub: 'STORY POINTS' },
  { label: '8',  value: 8,  sub: 'STORY POINTS' },
  { label: '13', value: 13, sub: 'STORY POINTS' },
  { label: '21', value: 21, sub: 'STORY POINTS' },
  { label: '?',  value: 0,  sub: 'INCERTEZA'    },
]

/* ─── Avatar ─── */
const COLORS = ['#6366f1', '#0891b2', '#f97316', '#15803d', '#be123c', '#7c3aed']
function avatarColor(str = '') {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return COLORS[h % COLORS.length]
}
function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('') || '?'
}
function Avatar({ nome, size = 34 }) {
  return (
    <div
      className={styles.avatar}
      style={{ background: avatarColor(nome), width: size, height: size, fontSize: size * 0.38 }}
      title={nome}
    >
      {initials(nome)}
    </div>
  )
}

/* ─── Icons ─── */
function IconCheckCircle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

/* ─── Participant row ─── */
function ParticipantRow({ p, isMe, cargo, mostrarValores }) {
  return (
    <div className={`${styles.participantRow} ${isMe ? styles.participantMe : ''}`}>
      <Avatar nome={p.nome} size={36} />
      <div className={styles.participantInfo}>
        <div className={styles.participantNameRow}>
          <span className={styles.participantName}>{p.nome}</span>
          {isMe && <span className={styles.youBadge}>Você</span>}
        </div>
        {cargo && <span className={styles.participantCargo}>{cargo}</span>}
      </div>
      <div className={styles.participantVote}>
        {mostrarValores ? (
          p.valor != null
            ? <span className={styles.voteValue}>{p.valor === 0 ? '?' : p.valor}</span>
            : <span className={styles.voteAbsent}>—</span>
        ) : (
          p.votou
            ? <span className={`${styles.voteCheck} ${isMe ? styles.voteCheckMe : ''}`}><IconCheckCircle /></span>
            : <span className={styles.waitingDots}>···</span>
        )}
      </div>
    </div>
  )
}

/* ─── Main page ─── */
export default function PlanningPokerPage() {
  const { projectId, taskId } = useParams()

  const [tarefa,      setTarefa]      = useState(null)
  const [sessao,      setSessao]      = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [membros,     setMembros]     = useState([])
  const [loading,     setLoading]     = useState(true)
  const [criando,     setCriando]     = useState(false)
  const [selectedCard, setSelectedCard]       = useState(null)
  const [estimativaInput, setEstimativaInput] = useState('')
  const stompRef = useRef(null)

  /* ─── Derived ─── */
  const currentMembro  = membros.find(m => m.id === currentUser?.id)
  const isGerente      = currentMembro?.cargo === 'Gerente' || currentMembro?.papel === 'gerente'

  const isVotando      = sessao?.status === 'VOTANDO'
  const isRevelada     = sessao?.status === 'REVELADA'
  const isFinalizada   = sessao?.status === 'FINALIZADA'
  const isCancelada    = sessao?.status === 'CANCELADA'
  const isAtiva        = isVotando || isRevelada

  const myParticipant  = sessao?.participantes?.find(p => p.usuarioId === currentUser?.id)
  const votouNaRodada  = myParticipant?.votou === true
  const totalVotos     = sessao?.participantes?.filter(p => p.votou).length ?? 0
  const totalPart      = sessao?.participantes?.length ?? 0
  const mostrarValores = isRevelada || isFinalizada

  const mediaVotos = mostrarValores
    ? (() => {
        const vals = (sessao?.participantes ?? [])
          .filter(p => p.valor != null && p.valor > 0)
          .map(p => p.valor)
        if (!vals.length) return null
        return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
      })()
    : null

  /* ─── Load ─── */
  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [tarefaData, userData, membrosData, sessaoData] = await Promise.all([
          projetoService.buscarTarefa(projectId, taskId),
          projetoService.buscarUsuarioAtual(),
          projetoService.listarMembros(projectId),
          projetoService.buscarSessaoAtivaPoker(projectId, taskId),
        ])
        setTarefa(tarefaData)
        setCurrentUser(userData)
        setMembros(Array.isArray(membrosData) ? membrosData : [])
        if (sessaoData) setSessao(sessaoData)
      } catch (e) {
        console.error('Planning Poker load error:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [projectId, taskId])

  /* ─── WebSocket ─── */
  useEffect(() => {
    const client = createPokerClient({
      onConnect: () => {
        client.subscribe(
          `/topic/projetos/${projectId}/tarefas/${taskId}/planning-poker`,
          msg => {
            const evento = JSON.parse(msg.body)
            if (evento.tipo === 'NOVA_RODADA') {
              setSelectedCard(null)
              setEstimativaInput('')
            }
            setSessao(evento.sessao)
          }
        )
      },
    })
    client.activate()
    stompRef.current = client
    return () => client.deactivate()
  }, [projectId, taskId])

  /* ─── Actions ─── */
  function sendWS(destination, body = {}) {
    const client = stompRef.current
    if (!client?.connected) return
    client.publish({ destination, body: JSON.stringify(body) })
  }

  async function handleCriarSessao() {
    setCriando(true)
    try {
      const s = await projetoService.criarSessaoPoker(projectId, taskId)
      setSessao(s)
    } catch {
      alert('Erro ao criar sessão. Pode já existir uma sessão ativa.')
    } finally {
      setCriando(false)
    }
  }

  function handleVotar() {
    if (selectedCard === null || !sessao) return
    sendWS(`/app/planning-poker/${sessao.id}/votar`, { valor: selectedCard })
    setSelectedCard(null)
  }

  function handleRevelar() {
    sendWS(`/app/planning-poker/${sessao.id}/revelar`)
  }

  function handleNovaRodada() {
    setSelectedCard(null)
    setEstimativaInput('')
    sendWS(`/app/planning-poker/${sessao.id}/nova-rodada`)
  }

  function handleFinalizar() {
    const est = parseInt(estimativaInput, 10)
    if (isNaN(est) || est < 0) { alert('Insira uma estimativa válida.'); return }
    sendWS(`/app/planning-poker/${sessao.id}/finalizar`, { estimativaFinal: est })
  }

  function handleCancelar() {
    if (!window.confirm('Cancelar a sessão de Planning Poker?')) return
    sendWS(`/app/planning-poker/${sessao.id}/cancelar`)
  }

  /* ─── Render states ─── */
  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <p className={styles.emptyDesc}>Carregando sessão...</p>
        </div>
      </div>
    )
  }

  if (!sessao) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🃏</div>
          {isGerente ? (
            <>
              <h2 className={styles.emptyTitle}>Iniciar Planning Poker</h2>
              <p className={styles.emptyDesc}>
                Inicie uma sessão de estimativa colaborativa para <strong>{tarefa?.titulo}</strong>.
              </p>
              <button className={styles.btnPrimary} onClick={handleCriarSessao} disabled={criando}>
                {criando ? 'Criando...' : 'Iniciar Sessão'}
              </button>
            </>
          ) : (
            <>
              <h2 className={styles.emptyTitle}>Aguardando sessão</h2>
              <p className={styles.emptyDesc}>
                O gerente ainda não iniciou a sessão para <strong>{tarefa?.titulo}</strong>.
              </p>
            </>
          )}
          <Link to={`/project/${projectId}/backlog`} className={styles.backLink}>
            ← Voltar ao Backlog
          </Link>
        </div>
      </div>
    )
  }

  if (isCancelada) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>✖</div>
          <h2 className={styles.emptyTitle}>Sessão cancelada</h2>
          <p className={styles.emptyDesc}>Esta sessão de Planning Poker foi cancelada.</p>
          <Link to={`/project/${projectId}/backlog`} className={styles.backLink}>
            ← Voltar ao Backlog
          </Link>
        </div>
      </div>
    )
  }

  if (isFinalizada) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>✓</div>
          <h2 className={styles.emptyTitle}>Sessão finalizada</h2>
          <p className={styles.emptyDesc}>
            Estimativa definida:{' '}
            <strong className={styles.finalEstimativa}>{sessao.estimativaFinal} story points</strong>
          </p>
          <Link to={`/project/${projectId}/backlog`} className={styles.backLink}>
            ← Voltar ao Backlog
          </Link>
        </div>
      </div>
    )
  }

  /* ─── Active session ─── */
  return (
    <div className={styles.page}>
      {/* ── Main content ── */}
      <div className={styles.main}>
        <div className={styles.container}>
          <div className={styles.sessaoChip}>
            <span className={styles.chipPulse} />
            SESSÃO DE ESTIMATIVA ATIVA · FIBONACCI
            {sessao.rodadaAtual > 1 && (
              <span className={styles.rodadaBadge}>Rodada {sessao.rodadaAtual}</span>
            )}
          </div>

          <h1 className={styles.tarefaTitulo}>{tarefa?.titulo}</h1>
          {tarefa?.descricao && tarefa.descricao !== tarefa.titulo && (
            <p className={styles.tarefaDesc}>{tarefa.descricao}</p>
          )}

          {/* ── Fibonacci grid ── */}
          <div className={styles.cardGrid}>
            {FIBONACCI.map(({ label, value, sub }) => {
              const isSelected = selectedCard === value
              const isMyVote   = mostrarValores && myParticipant?.valor === value
              const active     = isSelected || isMyVote

              return (
                <button
                  key={label}
                  type="button"
                  className={[
                    styles.fibCard,
                    active ? styles.fibCardSelected : '',
                    isVotando ? styles.fibCardClickable : styles.fibCardDisabled,
                  ].filter(Boolean).join(' ')}
                  onClick={() => isVotando && setSelectedCard(value)}
                  disabled={!isVotando}
                >
                  <span className={styles.fibValue}>{label}</span>
                  <span className={styles.fibSub}>{sub}</span>
                  {active && <span className={styles.fibCheck}>✓</span>}
                </button>
              )
            })}
          </div>

          {/* ── Bottom action bar ── */}
          <div className={styles.actionBar}>
            <div className={styles.barStatus}>
              <span className={styles.barStatusDot} />
              <span>
                <strong>{totalVotos} de {totalPart}</strong> membros votaram
              </span>
            </div>

            <div className={styles.barPontuacao}>
              <span className={styles.barPontuacaoLabel}>PONTUAÇÃO FINAL</span>
              {isRevelada && isGerente ? (
                <input
                  className={styles.estimativaInput}
                  type="number"
                  min="0"
                  placeholder={mediaVotos != null ? String(mediaVotos) : '0'}
                  value={estimativaInput}
                  onChange={e => setEstimativaInput(e.target.value)}
                />
              ) : (
                <span className={styles.barPontuacaoValor}>
                  {mediaVotos != null ? `~${mediaVotos}` : '—'}
                </span>
              )}
            </div>

            <div className={styles.barActions}>
              {isVotando && (
                <button
                  className={styles.btnPrimary}
                  onClick={handleVotar}
                  disabled={selectedCard === null}
                >
                  {votouNaRodada ? 'Alterar Voto' : 'Votar'}
                </button>
              )}
              {isVotando && isGerente && (
                <button className={styles.btnSecondary} onClick={handleRevelar}>
                  Revelar Votos
                </button>
              )}
              {isRevelada && isGerente && (
                <>
                  <button className={styles.btnSecondary} onClick={handleNovaRodada}>
                    Nova Rodada
                  </button>
                  <button
                    className={styles.btnPrimary}
                    onClick={handleFinalizar}
                    disabled={!estimativaInput.trim()}
                  >
                    Finalizar
                  </button>
                </>
              )}
              {isAtiva && isGerente && (
                <button className={styles.btnDanger} onClick={handleCancelar}>
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Sidebar ── */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarTitle}>PARTICIPANTES DO PROJETO</span>
          <span className={styles.sidebarOnline}>{totalPart} ONLINE</span>
        </div>

        <div className={styles.participantList}>
          {(sessao.participantes ?? []).map(p => {
            const membro = membros.find(m => m.id === p.usuarioId)
            return (
              <ParticipantRow
                key={p.usuarioId}
                p={p}
                isMe={p.usuarioId === currentUser?.id}
                cargo={membro?.cargo ?? ''}
                mostrarValores={mostrarValores}
              />
            )
          })}
        </div>

        <div className={styles.dicaBox}>
          <p className={styles.dicaTitle}>DICA DO POKER</p>
          <p className={styles.dicaText}>
            A escala Fibonacci ajuda a lidar com a incerteza. Se estiver entre dois
            números, escolha o maior para garantir uma margem de segurança.
          </p>
        </div>
      </div>
    </div>
  )
}
