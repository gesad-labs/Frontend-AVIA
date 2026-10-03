import { api } from './api'

/* Membros e permissões — ProjetoController (/projetos/{id}/membros) */
export const memberService = {
  list: (projectId) => api.get(`/projetos/${projectId}/membros`),

  /** @param {{ emailUsuario: string, cargo: string, papel: string }} data */
  add: (projectId, data) => api.post(`/projetos/${projectId}/membros`, data),

  /** @param {{ cargo?: string, papel?: string }} data */
  update: (projectId, userId, data) =>
    api.patch(`/projetos/${projectId}/membros/${userId}`, data),

  /** O backend remove por e-mail, enviado no body do DELETE */
  remove: (projectId, emailMembro) =>
    api.delete(`/projetos/${projectId}/membros`, { emailMembro }),

  getPermissions: (projectId, userId) =>
    api.get(`/projetos/${projectId}/membros/${userId}/permissoes`),

  /** @param {string[]} permissoes ex.: ['CRIARTAREFAS', 'MOVERTAREFAS'] */
  updatePermissions: (projectId, userId, permissoes) =>
    api.patch(`/projetos/${projectId}/membros/${userId}/permissoes`, { permissoes }),

  /** Restaura as permissões padrão do papel do membro */
  resetPermissions: (projectId, userId) =>
    api.put(`/projetos/${projectId}/membros/${userId}/permissoes`),
}
