import { Outlet, useParams } from 'react-router-dom';
import styles from './AppLayout.module.css';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { NotificacoesProvider } from '../../contexts/NotificacoesContext';

export default function AppLayout() {
  const { projectId } = useParams();

  return (
    <NotificacoesProvider>
      <div className={styles.shell}>
        <Topbar />
        <div className={styles.body}>
          {projectId && <Sidebar />}
          <main className={styles.content}>
            <Outlet />
          </main>
        </div>
      </div>
    </NotificacoesProvider>
  );
}
