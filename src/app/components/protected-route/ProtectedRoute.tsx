import { Navigate } from 'react-router-dom';
import { IProtectedRouteProps } from '../../interfaces';

export function ProtectedRoute({ condition, redirectPath, children }: IProtectedRouteProps) {
  if (!condition) {
    return <Navigate to={redirectPath} />;
  }

  return children;
}

