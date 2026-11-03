import { AuthProvider } from './contexts/AuthContext'
import { ProjectProvider } from './context/ProjectContext'
import AppRouter from './routes/index'
import VersionBadge from './components/VersionBadge/VersionBadge'

export default function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <AppRouter />
        <VersionBadge />
      </ProjectProvider>
    </AuthProvider>
  )
}
