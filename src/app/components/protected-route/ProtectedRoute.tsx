import { NavigateFunction, useNavigate} from 'react-router-dom';
import { IProtectedRouteProps } from '../../interfaces';
import { useEffect } from 'react';

export function ProtectedRoute({ condition, redirectPath, children }: IProtectedRouteProps) {
  const navigate: NavigateFunction = useNavigate();

  useEffect(() => {
    if (!condition) {
      navigate(redirectPath);
    }
  }, []);

  return children;
}

