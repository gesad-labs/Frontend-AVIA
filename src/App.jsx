import { ToastProvider } from './context/ToastProvider'
import { AuthProvider } from './contexts/AuthContext'
import { ProjectProvider } from './context/ProjectContext'
import AppRouter from './routes/index'

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ProjectProvider>
          <AppRouter />
        </ProjectProvider>
      </AuthProvider>
    </ToastProvider>
  )
}
