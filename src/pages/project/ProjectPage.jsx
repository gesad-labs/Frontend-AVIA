import { useParams } from 'react-router-dom'
export default function ProjectPage() {
  const { projectId } = useParams()
  return <div style={{ padding: 32 }}>Projeto {projectId} — em construção</div>
}
