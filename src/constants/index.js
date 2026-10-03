/** AVIA — Application-wide constants
 *
 *  Espelham os enums do backend (Backend-AVIA/.../enums). Os valores
 *  (chaves) são EXATAMENTE os nomes dos enums Java, para poderem ser
 *  enviados e comparados sem conversão.
 *
 *  ⚠️  Atenção: alguns enums do backend têm @JsonValue, então na RESPOSTA
 *  o JSON traz o texto de exibição, não o nome do enum:
 *    papel          → "gerente"        (nome: GERENTE)
 *    cargo          → "Scrum Master"   (nome: SCRUMMASTER)
 *    tipoEstimativa → "Horas"          (nome: HORAS)
 *    permissões     → "Criar Tarefas"  (nome: CRIARTAREFAS)
 *  Use normalizeEnum() nesses campos antes de comparar com as constantes.
 *  Já status/prioridade de tarefa e status de sprint chegam com o nome puro
 *  (A_FAZER, ALTA, EM_ANDAMENTO...), sem necessidade de normalizar.
 *
 *  Vocabulário: na interface o produto fala "card"; nos services e na API,
 *  "tarefa" (task).
 */

/* --- Normalização de enums com @JsonValue --------------------------- */
/** "Scrum Master" → "SCRUMMASTER" | "gerente" → "GERENTE" | "Criar Tarefas" → "CRIARTAREFAS" */
export function normalizeEnum(value) {
  if (value == null) return null;
  return String(value).normalize('NFD').replace(/[^a-zA-Z]/g, '').toUpperCase();
}

/* --- Task (card) Status — StatusTarefa ------------------------------ */
export const TASK_STATUS = {
  TODO:        'A_FAZER',
  IN_PROGRESS: 'FAZENDO',
  TESTING:     'TESTE',
  DONE:        'CONCLUIDA',
};

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.TODO]:        'A Fazer',
  [TASK_STATUS.IN_PROGRESS]: 'Fazendo',
  [TASK_STATUS.TESTING]:     'Teste',
  [TASK_STATUS.DONE]:        'Concluída',
};

/** Ordem das colunas do quadro Kanban (RF016) */
export const TASK_STATUS_ORDER = [
  TASK_STATUS.TODO,
  TASK_STATUS.IN_PROGRESS,
  TASK_STATUS.TESTING,
  TASK_STATUS.DONE,
];

/* --- Task Priority — PrioridadeTarefa ------------------------------- */
export const PRIORITY = {
  HIGH:   'ALTA',
  MEDIUM: 'MEDIA',
  LOW:    'BAIXA',
};

export const PRIORITY_LABELS = {
  [PRIORITY.HIGH]:   'Alta',
  [PRIORITY.MEDIUM]: 'Média',
  [PRIORITY.LOW]:    'Baixa',
};

/* --- Sprint Status — StatusSprint ----------------------------------- */
export const SPRINT_STATUS = {
  PLANNED:     'EM_PLANEJAMENTO',
  IN_PROGRESS: 'EM_ANDAMENTO',
  DONE:        'CONCLUIDA',
};

export const SPRINT_STATUS_LABELS = {
  [SPRINT_STATUS.PLANNED]:     'Em Planejamento',
  [SPRINT_STATUS.IN_PROGRESS]: 'Em Andamento',
  [SPRINT_STATUS.DONE]:        'Concluída',
};

/* --- Project Role (papel) — PapelProjeto (RF004, RF009–RF011) -------- */
// O backend chama o terceiro papel de VISUALIZADOR; nos requisitos e na
// interface ele é o "Convidado".
export const ROLE = {
  MANAGER: 'GERENTE',
  MEMBER:  'MEMBRO',
  VIEWER:  'VISUALIZADOR',
};

export const ROLE_LABELS = {
  [ROLE.MANAGER]: 'Gerente',
  [ROLE.MEMBER]:  'Membro',
  [ROLE.VIEWER]:  'Convidado',
};

/** Papéis que o backend permite atribuir ao convidar/editar um membro
 *  (GERENTE não é atribuível — vem da criação do projeto). */
export const ASSIGNABLE_ROLES = [ROLE.MEMBER, ROLE.VIEWER];

/* --- Job Role (cargo) — CargoProjeto -------------------------------- */
export const JOB_ROLE = {
  MANAGER:        'GERENTE',
  SCRUM_MASTER:   'SCRUMMASTER',
  DEVELOPER:      'DESENVOLVEDOR',
  QA:             'QA',
  ANALYST:        'ANALISTADEREQUISITOS',
  DESIGNER:       'DESIGNERDEUIUX',
  ARCHITECT:      'ARQUITETODESOFTWARE',
  DEVOPS:         'DEVOPS',
};

export const JOB_ROLE_LABELS = {
  [JOB_ROLE.MANAGER]:      'Gerente',
  [JOB_ROLE.SCRUM_MASTER]: 'Scrum Master',
  [JOB_ROLE.DEVELOPER]:    'Desenvolvedor',
  [JOB_ROLE.QA]:           'QA',
  [JOB_ROLE.ANALYST]:      'Analista de Requisitos',
  [JOB_ROLE.DESIGNER]:     'Designer de UI/UX',
  [JOB_ROLE.ARCHITECT]:    'Arquiteto de Software',
  [JOB_ROLE.DEVOPS]:       'DevOps',
};

/** Cargos atribuíveis a um membro (todos, exceto GERENTE) */
export const ASSIGNABLE_JOB_ROLES = Object.values(JOB_ROLE)
  .filter((r) => r !== JOB_ROLE.MANAGER);

/* --- Member Permissions — PermissoesUsuarioProjeto (RF005, RF006) ---- */
export const PERMISSION = {
  CREATE_TASKS:    'CRIARTAREFAS',
  EDIT_TASKS:      'EDITARTAREFAS',
  DELETE_TASKS:    'EXCLUIRTAREFAS',
  MOVE_TASKS:      'MOVERTAREFAS',
  CREATE_COLUMNS:  'CRIARCOLUNAS',
  EDIT_STRUCTURE:  'EDITARESTRUTURA',
  MANAGE_SPRINTS:  'GERENCIARSPRINTS',
  ADD_MEMBERS:     'ADICIONARMEMBROS',
  REMOVE_MEMBERS:  'REMOVERMEMBROS',
  VIEW_PROJECT:    'VISUALIZARPROJETO',
};

export const PERMISSION_LABELS = {
  [PERMISSION.CREATE_TASKS]:   'Criar Cards',
  [PERMISSION.EDIT_TASKS]:     'Editar Cards',
  [PERMISSION.DELETE_TASKS]:   'Excluir Cards',
  [PERMISSION.MOVE_TASKS]:     'Mover Cards',
  [PERMISSION.CREATE_COLUMNS]: 'Criar Colunas',
  [PERMISSION.EDIT_STRUCTURE]: 'Editar Estrutura',
  [PERMISSION.MANAGE_SPRINTS]: 'Gerenciar Sprints',
  [PERMISSION.ADD_MEMBERS]:    'Adicionar Membros',
  [PERMISSION.REMOVE_MEMBERS]: 'Remover Membros',
  [PERMISSION.VIEW_PROJECT]:   'Visualizar Projeto',
};

/* --- Estimation units — TipoEstimativaProjeto (RF019, RF020) --------- */
export const ESTIMATION_UNIT = {
  POINTS: 'PONTOS',
  HOURS:  'HORAS',
};

export const ESTIMATION_UNIT_LABELS = {
  [ESTIMATION_UNIT.POINTS]: 'Pontos',
  [ESTIMATION_UNIT.HOURS]:  'Horas',
};

/* --- Notification types — TipoNotificacao (RF028) -------------------- */
// O backend hoje só gera estes 3 tipos. Impedimento (RF028) ainda não existe.
export const NOTIFICATION_TYPE = {
  ADDED_TO_PROJECT:  'ADICIONADO_PROJETO',
  TASK_ASSIGNED:     'RESPONSAVEL_TAREFA',
  COMMENT_MENTION:   'MENCIONADO_COMENTARIO',
};

export const NOTIFICATION_TYPE_LABELS = {
  [NOTIFICATION_TYPE.ADDED_TO_PROJECT]: 'Adicionado ao projeto',
  [NOTIFICATION_TYPE.TASK_ASSIGNED]:    'Responsável por card',
  [NOTIFICATION_TYPE.COMMENT_MENTION]:  'Mencionado em comentário',
};

/* --- Planning Poker (RF020) ------------------------------------------ */
// O backend aceita qualquer inteiro >= 0 como voto. O '?' que existia antes
// não pode ser enviado (voto é Integer), então saiu da sequência.
export const PLANNING_POKER_SEQUENCE = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];

// StatusPlanningPokerSessao
export const POKER_SESSION_STATUS = {
  VOTING:    'VOTANDO',
  REVEALED:  'REVELADA',
  FINISHED:  'FINALIZADA',
  CANCELED:  'CANCELADA',
};

// TipoEventoPlanningPoker (mensagens que chegam via WebSocket/STOMP)
export const POKER_EVENT = {
  SESSION_CREATED:  'SESSAO_CRIADA',
  VOTE_REGISTERED:  'VOTO_REGISTRADO',
  VOTES_REVEALED:   'VOTOS_REVELADOS',
  NEW_ROUND:        'NOVA_RODADA',
  SESSION_FINISHED: 'SESSAO_FINALIZADA',
  SESSION_CANCELED: 'SESSAO_CANCELADA',
};

/* --- Rollover destination (RF017) ------------------------------------ */
// Só existe no front por enquanto: o backend ainda não tem endpoint de
// "Encerrar Sprint" com destino dos cards pendentes.
export const ROLLOVER_DEST = {
  NEXT_SPRINT: 'next_sprint',
  BACKLOG:     'backlog',
};