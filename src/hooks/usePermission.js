import { useAuth } from './useAuth'

const PERMISSIONS = {
  ADMINISTRADOR: new Set([
    'view', 'comment',
    'create_card', 'edit_card', 'delete_card',
    'assign_card', 'add_collaborator',
    'add_member', 'remove_member', 'change_member_role',
    'create_sprint', 'start_sprint', 'end_sprint',
    'start_poker', 'resolve_impediment',
    'create_project', 'edit_project',
  ]),
  GERENTE: new Set([
    'view', 'comment',
    'create_card', 'edit_card', 'delete_card',
    'assign_card', 'add_collaborator',
    'add_member', 'remove_member', 'change_member_role',
    'create_sprint', 'start_sprint', 'end_sprint',
    'start_poker', 'resolve_impediment',
  ]),
  MEMBRO: new Set([
    'view', 'comment',
    'create_card', 'edit_card', 'add_collaborator',
  ]),
  CONVIDADO: new Set(['view']),
}

export function usePermission() {
  const { user } = useAuth()
  const role = (user?.role || 'CONVIDADO').toUpperCase()
  const perms = PERMISSIONS[role] || PERMISSIONS.CONVIDADO
  return {
    can: (p) => perms.has(p),
    cannot: (p) => !perms.has(p),
    role,
  }
}
