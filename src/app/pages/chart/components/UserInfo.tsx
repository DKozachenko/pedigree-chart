import { Box, Button, Paper, Typography } from '@mui/material';
import { IUserState, selectUser, useCustomSelector, dropUser, Dispatch, setCurrentRelativeKey, setCenteredRelativeKey } from '../../../store';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { RelativesSearch } from './RelativesSearch';
import { useCallback } from 'react';

export function UserInfo() {
  const navigate: NavigateFunction = useNavigate();
  const dispatch: Dispatch = useDispatch();
  const userState: IUserState = useCustomSelector(selectUser);
  
  const extractUserInfo: () => string = () => {
    if (userState.isAdmin) {
      return 'Админ';
    }

    if (userState.isGuest) {
      return 'Гость';
    }

    return `${userState.lastName} ` + 
      `${userState.name![0].toUpperCase()}.` +
      `${userState.middleName ? userState.middleName[0].toUpperCase() + '.' : ''}`;
  }

  const logout: () => void = () => {
    dispatch(dropUser());
    navigate('/auth');
  }
  
  const onRelativesChange = useCallback((key: number | null) => {
    if (userState.isAdmin) {
      dispatch(setCurrentRelativeKey(key));
      return;
    }
    dispatch(setCenteredRelativeKey(key));
  }, []);

  return (
    <Box component="div" sx={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      zIndex: '6',
      bgcolor: '#f8fdff',
      border: '1px solid black',
      borderRadius: '10px',
      p: 1,
      maxWidth: '200px'
    }}>
      <Typography component="div" variant="caption">
        Вы просматриваете древо как:&nbsp;
        <Typography fontWeight="700" variant="caption">
          { extractUserInfo() }
        </Typography>
      </Typography>

      { userState.isGuest &&
        <Paper variant="outlined" sx={{ bgcolor: '#f0f0f0', border: '1px solid #787878', p: 0.5, mt: 1 }}>
          <Typography variant="caption">
            Вам недоступен просмотр родственных связей
          </Typography>
        </Paper>
      }

      <RelativesSearch onChange={onRelativesChange}></RelativesSearch>

      <Button type="button" variant="outlined" fullWidth sx={{ mt: 1.5 }} onClick={logout}>
        Выйти
      </Button>
    </Box>
  )
}

