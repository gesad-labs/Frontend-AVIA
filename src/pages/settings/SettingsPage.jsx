import { useParams } from 'react-router-dom'
export default function SettingsPage() {
  const { projectId } = useParams()
  return <div style={{ padding: 32 }}>Configurações — projeto {projectId} — em construção</div>
}
