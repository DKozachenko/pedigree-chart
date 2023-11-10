import { Routes, Route } from 'react-router-dom';
import { Auth, Chart } from './pages';
import { ProtectedRoute } from './components';
import { IUserState, selectUser, useCustomSelector } from './store';

export function App() {
  const userState: IUserState = useCustomSelector(selectUser);

  return (
    <Routes>
      <Route path="/" element={
        <ProtectedRoute condition={userState.isGuest || userState.name === 'Диана'} redirectPath="auth">
          <Chart></Chart>
        </ProtectedRoute>
      }></Route>
      <Route path="auth" element={ <Auth></Auth> }></Route>
    </Routes>
  )
}
