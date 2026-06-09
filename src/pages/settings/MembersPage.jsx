import styles from './MembersPage.module.css'

const MOCK_MEMBERS = [
  { id: 1, name: 'Ricardo Santos',  email: 'ricardo.santos@avia.com',  role: 'GERENTE',  initials: 'RS' },
  { id: 2, name: 'Beatriz Lima',    email: 'beatriz.lima@avia.com',    role: 'MEMBRO',   initials: 'BL' },
  { id: 3, name: 'Carlos Oliveira', email: 'carlos.oliveira@avia.com', role: 'CONVIDADO', initials: 'CO' },
]

const ROLE_META = {
  ADMINISTRADOR: { label: 'Administrador', color: '#02214E' },
  GERENTE:       { label: 'Gerente',       color: '#0369a1' },
  MEMBRO:        { label: 'Membro',        color: '#475569' },
  CONVIDADO:     { label: 'Convidado',     color: '#9ca3af' },
}

export default function MembersPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Membros do Projeto</h1>
        <p className={styles.subtitle}>Gerencie os membros e seus papéis no projeto.</p>
      </div>

      <div className={styles.list}>
        {MOCK_MEMBERS.map(m => {
          const meta = ROLE_META[m.role] || ROLE_META.CONVIDADO
          return (
            <div key={m.id} className={styles.row}>
              <div className={styles.avatar}>{m.initials}</div>
              <div className={styles.info}>
                <span className={styles.name}>{m.name}</span>
                <span className={styles.email}>{m.email}</span>
              </div>
              <span className={styles.badge} style={{ background: meta.color }}>
                {meta.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
