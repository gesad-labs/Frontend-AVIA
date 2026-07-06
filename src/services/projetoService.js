import { api } from './api'

export const projetoService = {
  // Projetos
  listar:           ()              => api.get('/projetos'),
  buscar:           (id)            => api.get(`/projetos/${id}`),
  criar:            (data)          => api.post('/projetos', data),
  editar:           (id, data)      => api.patch(`/projetos/${id}`, data),
  deletar:          (id)            => api.delete(`/projetos/${id}`),

  // Membros
  listarMembros:    (id)            => api.get(`/projetos/${id}/membros`),
  adicionarMembro:  (id, data)      => api.post(`/projetos/${id}/membros`, data),
  removerMembro:    (id, email)     => api.delete(`/projetos/${id}/membros`, { emailMembro: email }),
  atualizarMembro:  (id, uid, data) => api.patch(`/projetos/${id}/membros/${uid}`, data),

  // Sprints
  listarSprints:    (id)            => api.get(`/projetos/${id}/sprints`),
  criarSprint:      (id, data)      => api.post(`/projetos/${id}/sprints`, data),
  editarSprint:     (id, sid, data) => api.patch(`/projetos/${id}/sprints/${sid}`, data),

  // Tarefas
  getBacklog:        (id)           => api.get(`/projetos/${id}/tarefas/backlog`),
  listarTarefas:     (id, sprintId) => api.get(`/projetos/${id}/tarefas${sprintId != null ? `?sprintId=${sprintId}` : ''}`),
  criarTarefa:       (id, data)     => api.post(`/projetos/${id}/tarefas`, data),
  editarTarefa:      (id, tid, data)=> api.patch(`/projetos/${id}/tarefas/${tid}`, data),
  atualizarStatus:   (id, tid, data)=> api.patch(`/projetos/${id}/tarefas/${tid}/status`, data),
  moverTarefa:       (id, tid, data)=> api.patch(`/projetos/${id}/tarefas/${tid}/sprint`, data),
  removerTarefa:     (id, tid)      => api.delete(`/projetos/${id}/tarefas/${tid}`),
  buscarTarefa:      (id, tid)      => api.get(`/projetos/${id}/tarefas/${tid}`),

  // Usuário atual
  buscarUsuarioAtual: () => api.get('/usuario/eu'),

  // Anexos de tarefa
  listarAnexos:   (id, tid)       => api.get(`/projetos/${id}/tarefas/${tid}/anexos`),
  adicionarAnexo: (id, tid, data) => api.post(`/projetos/${id}/tarefas/${tid}/anexos`, data),
  removerAnexo:   (id, tid, aid)  => api.delete(`/projetos/${id}/tarefas/${tid}/anexos/${aid}`),

  // Comentários de tarefa
  listarComentarios:   (id, tid)       => api.get(`/projetos/${id}/tarefas/${tid}/comentarios`),
  adicionarComentario: (id, tid, data) => api.post(`/projetos/${id}/tarefas/${tid}/comentarios`, data),

  // Permissões por membro
  buscarPermissoesMembro:    (id, uid)       => api.get(`/projetos/${id}/membros/${uid}/permissoes`),
  editarPermissoesMembro:    (id, uid, data) => api.patch(`/projetos/${id}/membros/${uid}/permissoes`, data),
  restaurarPermissoesMembro: (id, uid)       => api.put(`/projetos/${id}/membros/${uid}/permissoes`),

  // Notificações
  listarNotificacoes: (id)       => api.get(`/projetos/${id}/notificacoes`),
  contarNaoLidas:     (id)       => api.get(`/projetos/${id}/notificacoes/nao-lidas`),
  marcarNotifLida:    (id, nid)  => api.patch(`/projetos/${id}/notificacoes/${nid}/lida`),

  // Planning Poker
  criarSessaoPoker:              (id, tid) => api.post(`/projetos/${id}/tarefas/${tid}/planning-poker/sessoes`),
  buscarSessaoAtivaPoker:        (id, tid) => api.get(`/projetos/${id}/tarefas/${tid}/planning-poker/sessao-ativa`),
  listarTarefasComSessaoAtiva:   (id)      => api.get(`/projetos/${id}/planning-poker/tarefas-com-sessao-ativa`),
}
