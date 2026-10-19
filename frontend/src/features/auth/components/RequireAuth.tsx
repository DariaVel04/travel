import { Navigate, Outlet, useLocation } from 'react-router';
import { paths } from '@/app/paths';
import { useAuth } from '../hooks/useAuth';

export function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to={paths.login} replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
