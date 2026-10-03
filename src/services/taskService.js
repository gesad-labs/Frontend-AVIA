import { api } from './api'

/* Tarefas (cards na UI) — TarefasController (/projetos/{id}/tarefas) */
export const taskService = {
  /** Todas as tarefas do projeto */
  list: (projectId) => api.get(`/projetos/${projectId}/tarefas`),

  /** Tarefas sem sprint */
  listBacklog: (projectId) => api.get(`/projetos/${projectId}/tarefas/backlog`),

  getById: (projectId, taskId) => api.get(`/projetos/${projectId}/tarefas/${taskId}`),

  /**
   * @param {{ titulo: string, descricao?: string, estimativa?: number,
   *   status?: string, prioridade?: string, sprintId?: number,
   *   tarefaParenteId?: number, impedimento?: boolean,
   *   responsaveisIds?: number[], tipo?: string }} data
   */
  create: (projectId, data) => api.post(`/projetos/${projectId}/tarefas`, data),

  /** Edição parcial (PATCH) */
  update: (projectId, taskId, data) =>
    api.patch(`/projetos/${projectId}/tarefas/${taskId}`, data),

  /** @param {'A_FAZER' | 'FAZENDO' | 'TESTE' | 'CONCLUIDA'} status */
  updateStatus: (projectId, taskId, status) =>
    api.patch(`/projetos/${projectId}/tarefas/${taskId}/status`, { status }),

  /** sprintId = null devolve a tarefa ao backlog */
  updateSprint: (projectId, taskId, sprintId) =>
    api.patch(`/projetos/${projectId}/tarefas/${taskId}/sprint`, { sprintId }),

  remove: (projectId, taskId) => api.delete(`/projetos/${projectId}/tarefas/${taskId}`),
}
