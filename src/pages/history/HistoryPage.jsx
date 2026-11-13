import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { projetoService } from '../../services/projetoService'
import { getErrorMessage } from '../../utils/errors'
import {
    SEM_TAG, STATUS_HISTORICO, FILTROS_VAZIOS,
    ordenarSprints, contarFiltrosAtivos, paraConsulta, temFiltroNoServidor,
    filtrarPorTags, resumir, resumoPorMembro, filtrosDeParams, filtrosParaParams,
} from '../../utils/historicoFiltros'
import MultiSelect from './MultiSelect'
import styles from './HistoryPage.module.css'

const PAGINA = 50
const STATUS_POR_VALOR = Object.fromEntries(STATUS_HISTORICO.map(s => [s.value, s]))
const SPRINT_STATUS_LABEL = { EM_PLANEJAMENTO: 'planejamento', EM_ANDAMENTO: 'em andamento', CONCLUIDA: 'concluída' }

export default function HistoryPage() {
    const { projectId } = useParams()
    const [params, setParams] = useSearchParams()

    const [base, setBase] = useState([])      // histórico sem filtros (total + opções de tag)
    const [sprints, setSprints] = useState([])
    const [membros, setMembros] = useState([])
    const [carregado, setCarregado] = useState(false)
    const [erro, setErro] = useState('')
    const [resultado, setResultado] = useState(null)    // { chave, lista } | { chave, erro } vindo do back
    const [limite, setLimite] = useState(PAGINA)

    /* Os filtros vivem na URL: sobrevivem ao F5 e dá para compartilhar a análise. */
    const filtros = useMemo(() => filtrosDeParams(params), [params])

    function atualizarFiltros(parcial) {
        setParams(filtrosParaParams({ ...filtros, ...parcial }), { replace: true })
        setLimite(PAGINA)
    }
    function limparFiltros() {
        setParams(filtrosParaParams(FILTROS_VAZIOS), { replace: true })
        setLimite(PAGINA)
    }

    /* Carga inicial: base sem filtros + sprints + membros. */
    useEffect(() => {
        let vivo = true
            ; (async () => {
                try {
                    const [t, s, m] = await Promise.all([
                        projetoService.filtrarHistorico(projectId, {}),
                        projetoService.listarSprints(projectId),
                        projetoService.listarMembros(projectId),
                    ])
                    if (!vivo) return
                    setBase(Array.isArray(t) ? t : [])
                    setSprints(Array.isArray(s) ? s : [])
                    setMembros(Array.isArray(m) ? m : [])
                } catch (err) {
                    if (vivo) setErro(getErrorMessage(err))
                } finally {
                    if (vivo) setCarregado(true)
                }
            })()
        return () => { vivo = false }
    }, [projectId])

    /* Filtros do back (membros / sprints / status / impedimento) → consulta ao endpoint. */
    const consulta = useMemo(() => paraConsulta(filtros), [filtros])
    const noServidor = temFiltroNoServidor(filtros)
    const chave = JSON.stringify(consulta)

    useEffect(() => {
        if (!carregado || erro || !noServidor) return
        let vivo = true
        projetoService.filtrarHistorico(projectId, consulta)
            .then(lista => { if (vivo) setResultado({ chave, lista: Array.isArray(lista) ? lista : [] }) })
            .catch(err => { if (vivo) setResultado({ chave, erro: getErrorMessage(err) }) })
        return () => { vivo = false }
    }, [projectId, carregado, erro, noServidor, chave, consulta])

    const atual = noServidor && resultado?.chave === chave ? resultado : null
    const buscando = noServidor && carregado && !atual
    const erroBusca = atual?.erro ?? ''
    const doServidor = noServidor ? (atual?.lista ?? resultado?.lista ?? null) : base   // enquanto busca, mostra o último resultado

    const sprintsOrdenadas = useMemo(() => ordenarSprints(sprints), [sprints])
    const sprintPorId = useMemo(() => new Map(sprints.map(s => [s.id, s])), [sprints])

    /* Tags: refinamento no front sobre o que o back devolveu. */
    const filtradas = useMemo(() => {
        const lista = filtrarPorTags(doServidor ?? [], filtros.tipos)
        // Mais recentes primeiro: sprint mais nova no topo; backlog por último.
        const pos = new Map(sprintsOrdenadas.map((s, i) => [s.id, i]))
        return [...lista].sort((a, b) =>
            (pos.get(b.sprintId) ?? -1) - (pos.get(a.sprintId) ?? -1) || b.id - a.id)
    }, [doServidor, filtros.tipos, sprintsOrdenadas])

    const resumo = useMemo(() => resumir(filtradas), [filtradas])
    const porMembro = useMemo(() => resumoPorMembro(filtradas, filtros.membros), [filtradas, filtros.membros])

    const opcoesMembros = useMemo(
        () => membros.map(m => ({ value: String(m.id), label: m.nome })),
        [membros])

    const opcoesTags = useMemo(() => {
        const vistas = [...new Set(base.map(t => (t.tipo ?? '').trim().toUpperCase()).filter(Boolean))].sort()
        return [...vistas.map(t => ({ value: t, label: t })), { value: SEM_TAG, label: 'Sem tag' }]
    }, [base])

    /* O back exige sprint inicial ≤ final (senão 400): cada seletor só oferece opções coerentes com o outro. */
    const opcoesDe = sprintsOrdenadas.filter(s => filtros.sprintAte === '' || s.id <= Number(filtros.sprintAte))
    const opcoesAte = sprintsOrdenadas.filter(s => filtros.sprintDe === '' || s.id >= Number(filtros.sprintDe))

    const rotuloSprint = s => `${s.nome}${s.status ? ` (${SPRINT_STATUS_LABEL[s.status] ?? s.status})` : ''}`
    const ativos = contarFiltrosAtivos(filtros)

    if (!carregado) return <div className={styles.page}><p className={styles.state}>Carregando histórico...</p></div>
    if (erro) return <div className={styles.page}><p className={styles.stateError} role="alert">{erro}</p></div>

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Histórico de atividades</h1>
                    <p className={styles.subtitle}>
                        Combine filtros para analisar a produtividade da equipe e achar gargalos.
                    </p>
                </div>
            </header>

            {/* ── Filtros ── */}
            <section className={styles.filters} aria-label="Filtros do histórico">
                <MultiSelect
                    label="Membros"
                    opcoes={opcoesMembros}
                    valores={filtros.membros}
                    onChange={v => atualizarFiltros({ membros: v })}
                    textoVazio="Todos os membros"
                />

                <div className={styles.field}>
                    <span className={styles.fieldLabel}>Sprints — de</span>
                    <select
                        className={`${styles.control} ${filtros.sprintDe !== '' ? styles.controlActive : ''}`}
                        value={filtros.sprintDe}
                        onChange={e => atualizarFiltros({ sprintDe: e.target.value })}
                        aria-label="Sprint inicial"
                    >
                        <option value="">Primeira</option>
                        {opcoesDe.map(s => <option key={s.id} value={s.id}>{rotuloSprint(s)}</option>)}
                    </select>
                </div>

                <div className={styles.field}>
                    <span className={styles.fieldLabel}>Sprints — até</span>
                    <select
                        className={`${styles.control} ${filtros.sprintAte !== '' ? styles.controlActive : ''}`}
                        value={filtros.sprintAte}
                        onChange={e => atualizarFiltros({ sprintAte: e.target.value })}
                        aria-label="Sprint final"
                    >
                        <option value="">Última</option>
                        {opcoesAte.map(s => <option key={s.id} value={s.id}>{rotuloSprint(s)}</option>)}
                    </select>
                </div>

                <MultiSelect
                    label="Status do card"
                    opcoes={STATUS_HISTORICO.map(s => ({ value: s.value, label: s.label }))}
                    valores={filtros.status}
                    onChange={v => atualizarFiltros({ status: v })}
                    textoVazio="Todos os status"
                />

                <div className={styles.field}>
                    <span className={styles.fieldLabel}>Impedimentos</span>
                    <select
                        className={`${styles.control} ${filtros.impedimento !== 'todos' ? styles.controlActive : ''}`}
                        value={filtros.impedimento}
                        onChange={e => atualizarFiltros({ impedimento: e.target.value })}
                        aria-label="Impedimentos"
                    >
                        <option value="todos">Todos</option>
                        <option value="com">Com impedimento</option>
                        <option value="sem">Sem impedimento</option>
                    </select>
                </div>

                <MultiSelect
                    label="Tags"
                    opcoes={opcoesTags}
                    valores={filtros.tipos}
                    onChange={v => atualizarFiltros({ tipos: v })}
                    textoVazio="Todas as tags"
                />

                <button type="button" className={styles.clearBtn} onClick={limparFiltros} disabled={ativos === 0}>
                    Limpar filtros{ativos > 0 ? ` (${ativos})` : ''}
                </button>
            </section>

            {erroBusca && <p className={styles.stateError} role="alert">{erroBusca}</p>}

            {doServidor === null ? (
                <p className={styles.state}>Aplicando filtros...</p>
            ) : (
                <div className={buscando ? styles.atualizando : undefined} aria-busy={buscando}>
                    {/* ── Resumo ── */}
                    <section className={styles.kpis} aria-label="Resumo do resultado">
                        <Kpi valor={resumo.total} rotulo="Cards no resultado" />
                        <Kpi valor={`${resumo.concluidas} (${resumo.taxaConclusao}%)`} rotulo="Concluídos" />
                        <Kpi valor={resumo.emAndamento} rotulo="Em andamento / teste" />
                        <Kpi valor={resumo.impedimentos} rotulo="Com impedimento" alerta={resumo.impedimentos > 0} />
                    </section>

                    {/* ── Por membro ── */}
                    {porMembro.length > 0 && (
                        <section className={styles.block}>
                            <h2 className={styles.blockTitle}>Por membro</h2>
                            <div className={styles.tableWrap}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr><th>Membro</th><th>Cards</th><th>Concluídos</th><th>Impedimentos</th></tr>
                                    </thead>
                                    <tbody>
                                        {porMembro.map(l => (
                                            <tr key={l.id}>
                                                <td>{l.nome}</td>
                                                <td>{l.total}</td>
                                                <td>{l.concluidas}</td>
                                                <td className={l.impedimentos > 0 ? styles.alertCell : undefined}>{l.impedimentos}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {/* ── Lista ── */}
                    <section className={styles.block}>
                        <h2 className={styles.blockTitle}>
                            Cards <span className={styles.count}>{filtradas.length} de {base.length}</span>
                            {buscando && <span className={styles.count}>atualizando…</span>}
                        </h2>

                        {filtradas.length === 0 ? (
                            <div className={styles.empty}>
                                <p>{base.length === 0 ? 'Este projeto ainda não tem cards.' : 'Nenhum card atende a todos os filtros selecionados.'}</p>
                                {ativos > 0 && <button type="button" className={styles.clearBtn} onClick={limparFiltros}>Limpar filtros</button>}
                            </div>
                        ) : (
                            <>
                                <div className={styles.tableWrap}>
                                    <table className={styles.table}>
                                        <thead>
                                            <tr><th>Card</th><th>Sprint</th><th>Status</th><th>Responsáveis</th><th>Tag</th><th>Impedimento</th></tr>
                                        </thead>
                                        <tbody>
                                            {filtradas.slice(0, limite).map(t => {
                                                const st = STATUS_POR_VALOR[t.status]
                                                const sprint = t.sprintId != null ? sprintPorId.get(t.sprintId) : null
                                                return (
                                                    <tr key={t.id}>
                                                        <td className={styles.cardCell}>
                                                            <Link to={`/project/${projectId}/task/${t.id}`} className={styles.cardLink}>
                                                                <span className={styles.cardId}>#{t.id}</span> {t.titulo}
                                                            </Link>
                                                            {t.tarefaParenteId != null && <span className={styles.subTag}>subcard de #{t.tarefaParenteId}</span>}
                                                        </td>
                                                        <td>{sprint ? sprint.nome : <span className={styles.muted}>Backlog</span>}</td>
                                                        <td>
                                                            {st && <span className={styles.statusChip} style={{ background: st.bg, color: st.color }}>{st.label}</span>}
                                                        </td>
                                                        <td>
                                                            {(t.responsaveis ?? []).length > 0
                                                                ? t.responsaveis.map(r => r.nome).join(', ')
                                                                : <span className={styles.muted}>—</span>}
                                                        </td>
                                                        <td>{t.tipo ? <span className={styles.tagChip}>{t.tipo.toUpperCase()}</span> : <span className={styles.muted}>—</span>}</td>
                                                        <td>{t.impedimento ? <span className={styles.impChip}>Impedimento</span> : <span className={styles.muted}>—</span>}</td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                {filtradas.length > limite && (
                                    <button type="button" className={styles.moreBtn} onClick={() => setLimite(l => l + PAGINA)}>
                                        Mostrar mais ({filtradas.length - limite} restantes)
                                    </button>
                                )}
                            </>
                        )}
                    </section>
                </div>
            )}
        </div>
    )
}

function Kpi({ valor, rotulo, alerta = false }) {
    return (
        <div className={`${styles.kpi} ${alerta ? styles.kpiAlert : ''}`}>
            <span className={styles.kpiValue}>{valor}</span>
            <span className={styles.kpiLabel}>{rotulo}</span>
        </div>
    )
}