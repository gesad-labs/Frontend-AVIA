import { api } from './api'

/* Projetos — ProjetoController (/projetos) */
export const projectService = {
  /** Projetos dos quais o usuário logado faz parte */
  list: () => api.get('/projetos'),

  getById: (projectId) => api.get(`/projetos/${projectId}`),

  /** @param {{ nome: string, tipoEstimativa: 'HORAS' | 'PONTOS' }} data */
  create: (data) => api.post('/projetos', data),

  /** @param {{ nome: string }} data */
  update: (projectId, data) => api.patch(`/projetos/${projectId}`, data),

  remove: (projectId) => api.delete(`/projetos/${projectId}`),
}
