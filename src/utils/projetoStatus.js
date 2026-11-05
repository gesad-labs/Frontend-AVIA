import { isGerente } from './membros'

export const STATUS_PROJETO = {
  PLANEJAMENTO: 'PLANEJAMENTO',
  EM_ANDAMENTO: 'EM ANDAMENTO',
  CONCLUIDO:    'CONCLUÍDO',
}
export const ROTULO_STATUS = {
  'PLANEJAMENTO': 'Planejamento',
  'EM ANDAMENTO': 'Em andamento',
  'CONCLUÍDO':    'Concluído',
}

const STATUS_LS_KEY     = 'avia_project_statuses'
const ARQUIVADOS_LS_KEY = 'avia_project_archived'

function lerJson(chave) {
  try {
    const v = JSON.parse(localStorage.getItem(chave) || '{}')
    return v && typeof v === 'object' ? v : {}
  } catch { return {} }
}
function gravarJson(chave, valor) {
  try { localStorage.setItem(chave, JSON.stringify(valor)) } catch { /* cota cheia / storage indisponível */ }
}

/* ── Status (mesmo formato que ProjectsPage já gravava) ── */
export function loadSavedStatuses() { return lerJson(STATUS_LS_KEY) }

export function saveStatus(id, status) {
  const salvos = lerJson(STATUS_LS_KEY)
  salvos[String(id)] = status
  gravarJson(STATUS_LS_KEY, salvos)
}

export function removeSavedStatus(id) {
  const salvos = lerJson(STATUS_LS_KEY)
  delete salvos[String(id)]
  gravarJson(STATUS_LS_KEY, salvos)
}

export function statusDoProjeto(id) {
  return lerJson(STATUS_LS_KEY)[String(id)] || STATUS_PROJETO.EM_ANDAMENTO
}

/* ── Arquivados: { [id]: "2026-11-04T10:00:00.000Z" } ── */
export function lerArquivados() { return lerJson(ARQUIVADOS_LS_KEY) }

export function arquivadoEm(id) {
  const iso = lerJson(ARQUIVADOS_LS_KEY)[String(id)]
  const data = iso ? new Date(iso) : null
  return data && !Number.isNaN(data.getTime()) ? data : null
}

export function marcarArquivado(id, quando = new Date()) {
  const todos = lerJson(ARQUIVADOS_LS_KEY)
  todos[String(id)] = quando.toISOString()
  gravarJson(ARQUIVADOS_LS_KEY, todos)
}

/* ── Regras ── */
/* Só gerente arquiva, e só projeto concluído que ainda não foi arquivado. */
export function podeArquivar({ souGerente, status, arquivado }) {
  if (arquivado)  return { ok: false, motivo: 'Este projeto já está arquivado.' }
  if (!souGerente) return { ok: false, motivo: 'Apenas gerentes do projeto podem arquivá-lo.' }
  if (status !== STATUS_PROJETO.CONCLUIDO) {
    return { ok: false, motivo: 'Só é possível arquivar um projeto concluído. Marque o projeto como Concluído acima para liberar.' }
  }
  return { ok: true, motivo: '' }
}

/* Quem vira visualizador: só quem hoje é MEMBRO. Gerentes e visualizadores ficam como estão. */
export function membrosARebaixar(membros) {
  return (membros ?? []).filter(m => m?.papel?.toLowerCase() === 'membro' && !isGerente(m))
}

/* Rebaixa um a um (o back não tem operação em lote) e junta os resultados.
   `rebaixar(usuarioId)` é quem chama a API. Uma falha não interrompe os demais:
   o projeto só é marcado como arquivado se `falhas` vier vazio, e repetir a
   operação é seguro (quem já virou visualizador não entra de novo na lista). */
export async function rebaixarMembros(membros, rebaixar) {
  const rebaixados = []
  const falhas = []
  for (const m of membros) {
    try {
      await rebaixar(m.id)
      rebaixados.push(m)
    } catch (erro) {
      falhas.push({ membro: m, erro })
    }
  }
  return { rebaixados, falhas }
}