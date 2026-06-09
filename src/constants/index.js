/** AVIA — Application-wide constants */

/* --- Card Status --- */
export const CARD_STATUS = {
  TODO:        'todo',
  IN_PROGRESS: 'in_progress',
  DONE:        'done',
};

export const CARD_STATUS_LABELS = {
  [CARD_STATUS.TODO]:        'A Fazer',
  [CARD_STATUS.IN_PROGRESS]: 'Em Andamento',
  [CARD_STATUS.DONE]:        'Concluído',
};

/* --- Sprint Status --- */
export const SPRINT_STATUS = {
  PLANNED:    'planned',
  IN_PROGRESS:'in_progress',
  CLOSED:     'closed',
};

export const SPRINT_STATUS_LABELS = {
  [SPRINT_STATUS.PLANNED]:     'Planejada',
  [SPRINT_STATUS.IN_PROGRESS]: 'Em Andamento',
  [SPRINT_STATUS.CLOSED]:      'Encerrada',
};

/* --- User Roles --- */
export const ROLE = {
  ADMIN:   'admin',
  MANAGER: 'manager',
  MEMBER:  'member',
  GUEST:   'guest',
};

export const ROLE_LABELS = {
  [ROLE.ADMIN]:   'Administrador',
  [ROLE.MANAGER]: 'Gerente',
  [ROLE.MEMBER]:  'Membro',
  [ROLE.GUEST]:   'Convidado',
};

/* --- Card Priority --- */
export const PRIORITY = {
  CRITICAL: 'critical',
  HIGH:     'high',
  MEDIUM:   'medium',
  LOW:      'low',
};

export const PRIORITY_LABELS = {
  [PRIORITY.CRITICAL]: 'Crítica',
  [PRIORITY.HIGH]:     'Alta',
  [PRIORITY.MEDIUM]:   'Média',
  [PRIORITY.LOW]:      'Baixa',
};

/* --- Estimation units (RF015) --- */
export const ESTIMATION_UNIT = {
  POINTS: 'points',
  HOURS:  'hours',
};

export const PLANNING_POKER_SEQUENCE = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, '?'];

/* --- Focus mode durations (RF026) --- */
export const FOCUS_DURATIONS = [
  { label: '1 hora',      ms: 60 * 60 * 1000 },
  { label: '2 horas',     ms: 2 * 60 * 60 * 1000 },
  { label: 'Até amanhã',  ms: null }, // handled separately
];

/* --- Notification event types (RF025) --- */
export const NOTIFICATION_EVENT = {
  CARD_ASSIGNED:    'card_assigned',
  CARD_MOVED:       'card_moved',
  COMMENT_ADDED:    'comment_added',
  MENTION:          'mention',
  IMPEDIMENT_FLAG:  'impediment_flag',
  SPRINT_STARTED:   'sprint_started',
  SPRINT_CLOSED:    'sprint_closed',
};

/* --- Rollover destination (RF013) --- */
export const ROLLOVER_DEST = {
  NEXT_SPRINT: 'next_sprint',
  BACKLOG:     'backlog',
};
