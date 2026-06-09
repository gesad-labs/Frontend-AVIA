import { Outlet } from 'react-router-dom';

/**
 * AuthLayout — passthrough wrapper for auth pages.
 * Login/Signup have their own full-page layouts.
 */
export default function AuthLayout() {
  return <Outlet />;
}
