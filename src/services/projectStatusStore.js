// Status do projeto (Planejamento / Em andamento / Concluido).
// O back ainda nao tem esse campo: guardamos por projeto no localStorage deste navegador.
// Quando existir endpoint, so este arquivo precisa mudar (ProjectsPage e SettingsPage o usam).

const STATUS_LS_KEY = 'avia_project_statuses'

export const STATUS_PADRAO = 'EM ANDAMENTO'

export const STATUS_LABELS = {
  'PLANEJAMENTO': 'Planejamento',
  'EM ANDAMENTO': 'Em andamento',
  'CONCLUÍDO': 'Concluído',
}

export function loadSavedStatuses() {
  try { return JSON.parse(localStorage.getItem(STATUS_LS_KEY) || '{}') }
  catch { return {} }
}

export function loadStatus(id) {
  return loadSavedStatuses()[String(id)] || STATUS_PADRAO
}

export function saveStatus(id, status) {
  try {
    const saved = loadSavedStatuses()
    saved[String(id)] = status
    localStorage.setItem(STATUS_LS_KEY, JSON.stringify(saved))
  } catch { /* ignore quota/parse errors */ }
}

export function removeSavedStatus(id) {
  try {
    const saved = loadSavedStatuses()
    delete saved[String(id)]
    localStorage.setItem(STATUS_LS_KEY, JSON.stringify(saved))
  } catch { /* ignore quota/parse errors */ }
}
