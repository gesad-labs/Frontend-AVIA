import { AuthProvider } from './contexts/AuthContext'
import { ProjectProvider } from './context/ProjectContext'
import AppRouter from './routes/index'

export default function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <AppRouter />
      </ProjectProvider>
    </AuthProvider>
  )
}
