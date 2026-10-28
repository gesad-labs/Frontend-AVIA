import { useParams, Navigate } from 'react-router-dom'
export default function ProjectPage() {
  const { projectId } = useParams()
  return <Navigate to={`/project/${projectId}/board`} replace />
}
