import { Routes, Route } from 'react-router-dom';
import { Auth, Chart } from './pages';
import { ProtectedRoute } from './components';
import { Dispatch, IRelative, IUserState, selectRelatives, selectUser, setCurrentRelativeKey, useCustomSelector } from './store';
import { findRelativeByUserInfo } from './utils';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';

export function App() {
  const dispatch: Dispatch = useDispatch();
  const userState: IUserState = useCustomSelector(selectUser);
  const { relatives } = useCustomSelector(selectRelatives);

  const currentRelative: IRelative | undefined = findRelativeByUserInfo(relatives, {
    name: userState.name,
    lastName: userState.lastName,
    middleName: userState.middleName
  });

  useEffect(() => {
    dispatch(setCurrentRelativeKey(currentRelative?.key ?? null));
  }, []);

  const isUserExists: () => boolean = () => {
    return !!currentRelative;
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
