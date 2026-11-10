/* ── Sprints ativas e futuras (US019) ─────────────────────────────────
   O back NÃO valida estas regras: o PATCH de sprint só grava o status que
   receber (EditarSprintRequestDTO { nome, status }). Por isso o front as
   garante, e relê os dados do servidor imediatamente antes de agir
   (verificarInicio / verificarEncerramento) para reduzir a chance de dois
   gerentes agirem em cima de dados velhos. Isso NÃO elimina a corrida (dois
   cliques simultâneos) nem impede outro cliente de burlar a regra — para isso
   o back precisa aplicá-las na própria transação.

   Vocabulário: Futura = EM_PLANEJAMENTO · Ativa = EM_ANDAMENTO · Concluída.
   ─────────────────────────────────────────────────────────────────── */

export const SPRINT = {
  FUTURA:    'EM_PLANEJAMENTO',
  ATIVA:     'EM_ANDAMENTO',
  CONCLUIDA: 'CONCLUIDA',
}

export const ROTULO_SPRINT = {
  EM_PLANEJAMENTO: 'Futura',
  EM_ANDAMENTO:    'Ativa',
  CONCLUIDA:       'Concluída',
}

export function agruparSprints(sprints) {
  const lista = [...(sprints ?? [])].sort((a, b) => a.id - b.id)
  return {
    ativas:     lista.filter(s => s.status === SPRINT.ATIVA),
    futuras:    lista.filter(s => s.status === SPRINT.FUTURA),
    concluidas: lista.filter(s => s.status === SPRINT.CONCLUIDA).reverse(),
  }
}

export function pendentesDaSprint(tarefas) {
  return (tarefas ?? []).filter(t => t.status !== 'CONCLUIDA')
}

export function podeIniciar(sprint, sprints) {
  if (sprint.status !== SPRINT.FUTURA) {
    return { ok: false, motivo: 'Só uma sprint futura pode ser iniciada.' }
  }
  const ativa = (sprints ?? []).find(s => s.status === SPRINT.ATIVA && s.id !== sprint.id)
  if (ativa) {
    return { ok: false, motivo: `Conclua a sprint ativa "${ativa.nome}" antes de iniciar "${sprint.nome}".`, ativa }
  }
  return { ok: true, motivo: '' }
}

export function podeEncerrar(sprint, tarefasDaSprint) {
  if (sprint.status !== SPRINT.ATIVA) {
    return { ok: false, motivo: 'Só uma sprint ativa pode ser encerrada.', pendentes: [] }
  }
  const pendentes = pendentesDaSprint(tarefasDaSprint)
  if (pendentes.length > 0) {
    const n = pendentes.length
    const exemplos = pendentes.slice(0, 3).map(t => `#${t.id} ${t.titulo}`).join('; ')
    const mais = n > 3 ? `; e mais ${n - 3}` : ''
    return {
      ok: false,
      pendentes,
      motivo: `Não é possível encerrar "${sprint.nome}": ${n} card${n > 1 ? 's' : ''} pendente${n > 1 ? 's' : ''} (${exemplos}${mais}). `
        + 'Conclua-os ou devolva-os ao backlog.',
    }
  }
  return { ok: true, motivo: '', pendentes: [] }
}

export function dicaDaSprint(sprint, sprints, tarefasDaSprint) {
  if (sprint.status === SPRINT.FUTURA) {
    const r = podeIniciar(sprint, sprints)
    return r.ok ? '' : r.motivo
  }
  if (sprint.status === SPRINT.ATIVA) {
    const n = pendentesDaSprint(tarefasDaSprint).length
    return n > 0 ? `${n} card${n > 1 ? 's' : ''} pendente${n > 1 ? 's' : ''}: conclua ou devolva ao backlog para encerrar.` : ''
  }
  return ''
}

export async function verificarInicio(servico, projectId, sprint) {
  const resposta = await servico.listarSprints(projectId)
  const sprints = Array.isArray(resposta) ? resposta : []
  const atual = sprints.find(s => s.id === sprint.id) ?? sprint
  return podeIniciar(atual, sprints)
}

export async function verificarEncerramento(servico, projectId, sprint) {
  const [resSprints, resTarefas] = await Promise.all([
    servico.listarSprints(projectId),
    servico.listarTarefas(projectId, sprint.id),
  ])
  const sprints = Array.isArray(resSprints) ? resSprints : []
  const atual = sprints.find(s => s.id === sprint.id) ?? sprint
  return podeEncerrar(atual, Array.isArray(resTarefas) ? resTarefas : [])
}