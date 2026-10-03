import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

// Layout
import AppLayout from '../components/layout/AppLayout';
import AuthLayout from '../components/layout/AuthLayout';

// Pages — Landing
import LandingPage from '../pages/landing/LandingPage';

// Pages — Email previews
import EmailRecoveryPreview from '../pages/email/EmailRecoveryPreview';

// Pages — Auth
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

// Pages — App
import DashboardPage from '../pages/dashboard/DashboardPage';
import ProjectPage from '../pages/project/ProjectPage';
import BoardPage from '../pages/board/BoardPage';
import BacklogPage from '../pages/backlog/BacklogPage';
import SettingsPage from '../pages/settings/SettingsPage';
import PermissionsPage from '../pages/settings/PermissionsPage';
import ViewPermissionsPage from '../pages/settings/ViewPermissionsPage';
import MembersPage from '../pages/settings/MembersPage';

// Guards
import PrivateRoute from './PrivateRoute';

const router = createBrowserRouter([
  /* ---- Landing (public) ---- */
  { path: '/', element: <LandingPage /> },

  /* ---- Email previews (public / RF003) ---- */
  { path: '/email/reset-password', element: <EmailRecoveryPreview /> },

  /* ---- Auth routes ---- */
  {
    element: <AuthLayout />,
    children: [
      { path: '/login',            element: <LoginPage /> },
      { path: '/signup',           element: <SignupPage /> },
      { path: '/forgot-password',  element: <ForgotPasswordPage /> },
      { path: '/redefinir-senha',   element: <ResetPasswordPage /> },
    ],
  },

  /* ---- Protected / App routes ---- */
  {
    element: <PrivateRoute><AppLayout /></PrivateRoute>,
    children: [
      { path: '/dashboard',                   element: <DashboardPage /> },
      { path: '/project/:projectId',          element: <ProjectPage /> },
      { path: '/project/:projectId/board',    element: <BoardPage /> },
      { path: '/project/:projectId/backlog',  element: <BacklogPage /> },
      { path: '/project/:projectId/settings',     element: <SettingsPage /> },
      { path: '/project/:projectId/permissions',       element: <PermissionsPage /> },
      { path: '/project/:projectId/permissions/view', element: <ViewPermissionsPage /> },
      { path: '/project/:projectId/members',      element: <MembersPage /> },
    ],
  },

  /* ---- Fallback ---- */
  { path: '*', element: <Navigate to="/" replace /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
