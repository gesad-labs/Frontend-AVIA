import { api } from './api'

/* Sprints — SprintController (/projetos/{id}/sprints) */
export const sprintService = {
    list: (projectId) => api.get(`/projetos/${projectId}/sprints`),

    /** @param {{nome: string}} data */
    create: (projectId, data) => api.post(`/projetos/${projectId}/sprints`, data),

    /** @param {{ nome?: string, status?: 'EM_PLANEJAMENTO' | 'EM_ANDAMENTO' | 'CONCLUIDA' }} data */
  update: (projectId, sprintId, data) =>
    api.patch(`/projetos/${projectId}/sprints/${sprintId}`, data),
}