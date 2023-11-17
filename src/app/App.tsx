import { Routes, Route } from 'react-router-dom';
import { Auth, Chart } from './pages';
import { ProtectedRoute } from './components';
import { IRelative, IUserState, findRelativeByUserInfo, selectRelatives, selectUser, useCustomSelector } from './store';

export function App() {
  const userState: IUserState = useCustomSelector(selectUser);
  const relativesState: IRelative[] = useCustomSelector(selectRelatives);

  const isUserExists: () => boolean = () => {
    return !!findRelativeByUserInfo(relativesState, userState);
  }

  return (
    <Routes>
      <Route path="/" element={
        <ProtectedRoute condition={userState.isAdmin || userState.isGuest || isUserExists()} redirectPath="auth">
          <Chart></Chart>
        </ProtectedRoute>
      }></Route>
      <Route path="auth" element={ <Auth></Auth> }></Route>
    </Routes>
  )
}
