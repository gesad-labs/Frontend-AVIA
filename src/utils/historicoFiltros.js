/* ── Filtros do Histórico de atividades (US029) ───────────────────────
   Lógica pura (sem React), testável isoladamente.

   QUEM FILTRA O QUÊ
     • Back  (GET /projetos/{id}/tarefas/historico): membros, intervalo de
       sprints, status e impedimento. Entre filtros vale "E"; dentro de um
       filtro (vários membros / vários status) vale "OU".
     • Front: tags (campo `tipo`) — o back ainda não tem esse filtro, então é
       aplicado sobre o resultado que o back devolveu.

   O histórico reflete o ESTADO ATUAL dos cards. O back não expõe log de
   eventos nem datas de sprint; "período" é um intervalo de SPRINTS, na ordem
   de criação (id). O back recusa início > fim (400), então o front impede.
   ─────────────────────────────────────────────────────────────────── */

export const SEM_TAG = 'sem-tag'

export const STATUS_HISTORICO = [
  { value: 'A_FAZER',   label: 'A Fazer',   bg: '#f1f5f9', color: '#64748b' },
  { value: 'FAZENDO',   label: 'Fazendo',   bg: '#dbeafe', color: '#1d4ed8' },
  { value: 'TESTE',     label: 'Em Teste',  bg: '#fef9c3', color: '#a16207' },
  { value: 'CONCLUIDA', label: 'Concluída', bg: '#dcfce7', color: '#15803d' },
]
const STATUS_VALIDOS = STATUS_HISTORICO.map(s => s.value)

export const FILTROS_VAZIOS = Object.freeze({
  membros: [],          // ids de usuário (string)
  sprintDe: '',         // id da sprint inicial ('' = sem limite)
  sprintAte: '',        // id da sprint final   ('' = sem limite)
  status: [],           // valores de StatusTarefa
  impedimento: 'todos', // 'todos' | 'com' | 'sem'
  tipos: [],            // tags (campo `tipo`) e/ou SEM_TAG — filtro do front
})

/* As sprints não têm datas no back: a ordem cronológica é a de criação (id). */
export function ordenarSprints(sprints) {
  return [...(sprints ?? [])].sort((a, b) => a.id - b.id)
}

export function contarFiltrosAtivos(f) {
  return [
    f.membros.length > 0,
    f.sprintDe !== '' || f.sprintAte !== '',
    f.status.length > 0,
    f.impedimento !== 'todos',
    f.tipos.length > 0,
  ].filter(Boolean).length
}

/* ── Parâmetros do endpoint do back ── */
export function paraConsulta(f) {
  return {
    responsaveisIds: f.membros.map(Number).filter(Number.isFinite),
    sprintInicioId: f.sprintDe !== '' ? Number(f.sprintDe) : null,
    sprintFimId:    f.sprintAte !== '' ? Number(f.sprintAte) : null,
    status: f.status,
    impedimento: f.impedimento === 'com' ? true : f.impedimento === 'sem' ? false : null,
  }
}

/* Só vale a pena chamar o endpoint quando algum filtro do BACK está ativo. */
export function temFiltroNoServidor(f) {
  const c = paraConsulta(f)
  return c.responsaveisIds.length > 0 || c.sprintInicioId != null || c.sprintFimId != null
    || c.status.length > 0 || c.impedimento != null
}

/* "?responsaveisIds=1&responsaveisIds=2&sprintInicioId=3&status=FAZENDO&impedimento=true" */
export function montarQuery(c) {
  const p = new URLSearchParams()
  ;(c.responsaveisIds ?? []).forEach(id => p.append('responsaveisIds', id))
  if (c.sprintInicioId != null) p.set('sprintInicioId', c.sprintInicioId)
  if (c.sprintFimId != null)    p.set('sprintFimId', c.sprintFimId)
  ;(c.status ?? []).forEach(s => p.append('status', s))
  if (c.impedimento != null)    p.set('impedimento', String(c.impedimento))
  const qs = p.toString()
  return qs ? `?${qs}` : ''
}

/* ── Tags: refinamento feito no front ── */
export function filtrarPorTags(tarefas, tipos) {
  if (!tipos || tipos.length === 0) return tarefas
  const set = new Set(tipos.map(t => t.toUpperCase()))
  return tarefas.filter(t => {
    const tag = (t.tipo ?? '').trim().toUpperCase()
    return tag === '' ? set.has(SEM_TAG.toUpperCase()) : set.has(tag)
  })
}

/* ── Resumo para análise de produtividade / gargalos ── */
export function resumir(tarefas) {
  const total = tarefas.length
  const concluidas = tarefas.filter(t => t.status === 'CONCLUIDA').length
  return {
    total,
    concluidas,
    emAndamento: tarefas.filter(t => t.status === 'FAZENDO' || t.status === 'TESTE').length,
    impedimentos: tarefas.filter(t => t.impedimento).length,
    taxaConclusao: total > 0 ? Math.round((concluidas / total) * 100) : 0,
  }
}

/* Uma linha por membro. Um card com 2 responsáveis conta para os dois.
   Com filtro de membros ativo, só aparecem os membros escolhidos (senão um
   colega que dividiu o card apareceria sem ter sido pedido). */
export function resumoPorMembro(tarefas, membrosFiltro = []) {
  const escolhidos = new Set(membrosFiltro.map(String))
  const linhas = new Map()
  const linha = (id, nome) => {
    if (!linhas.has(id)) linhas.set(id, { id, nome, total: 0, concluidas: 0, impedimentos: 0 })
    return linhas.get(id)
  }

  for (const t of tarefas) {
    const resp = t.responsaveis ?? []
    const alvos = resp.length > 0
      ? resp.map(r => ({ id: String(r.id), nome: r.nome }))
      : [{ id: 'sem-responsavel', nome: 'Sem responsável' }]
    for (const a of alvos) {
      if (escolhidos.size > 0 && !escolhidos.has(a.id)) continue
      const l = linha(a.id, a.nome)
      l.total += 1
      if (t.status === 'CONCLUIDA') l.concluidas += 1
      if (t.impedimento) l.impedimentos += 1
    }
  }
  return [...linhas.values()].sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome))
}

/* ── Filtros ↔ URL (?membros=1,2&de=3&ate=5&status=FAZENDO&impedimento=com&tags=BUG) ── */
export function filtrosParaParams(f) {
  const p = new URLSearchParams()
  if (f.membros.length) p.set('membros', f.membros.join(','))
  if (f.sprintDe !== '') p.set('de', f.sprintDe)
  if (f.sprintAte !== '') p.set('ate', f.sprintAte)
  if (f.status.length) p.set('status', f.status.join(','))
  if (f.impedimento !== 'todos') p.set('impedimento', f.impedimento)
  if (f.tipos.length) p.set('tags', f.tipos.join(','))
  return p
}

export function filtrosDeParams(p) {
  const lista = chave => (p.get(chave) ?? '').split(',').map(s => s.trim()).filter(Boolean)
  const imp = p.get('impedimento')
  let de = p.get('de') ?? ''
  let ate = p.get('ate') ?? ''
  // Link antigo/editado à mão com início > fim: o back responderia 400. Normaliza.
  if (de !== '' && ate !== '' && Number(de) > Number(ate)) [de, ate] = [ate, de]
  return {
    membros: lista('membros').filter(m => Number.isFinite(Number(m))),
    sprintDe: de,
    sprintAte: ate,
    status: lista('status').filter(s => STATUS_VALIDOS.includes(s)),
    impedimento: imp === 'com' || imp === 'sem' ? imp : 'todos',
    tipos: lista('tags'),
  }
}