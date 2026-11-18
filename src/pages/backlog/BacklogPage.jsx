import { useParams } from 'react-router-dom'
export default function BacklogPage() {
  const { projectId } = useParams()
  return <div style={{ padding: 32 }}>Backlog — projeto {projectId} — em construção</div>
}
