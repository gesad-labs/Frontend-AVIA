import { useParams } from 'react-router-dom'
export default function BoardPage() {
  const { projectId } = useParams()
  return <div style={{ padding: 32 }}>Board — projeto {projectId} — em construção</div>
}
