import { Box, Button, InputLabel, MenuItem, Paper, Select, SelectChangeEvent, Typography } from '@mui/material';
import { IUserState, selectUser, useCustomSelector, dropUser, Dispatch } from '../../../store';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useState, Dispatch as ReactDispatch, SetStateAction } from 'react';

export function UserInfo() {
  const navigate: NavigateFunction = useNavigate();
  const dispatch: Dispatch = useDispatch();
  const userState: IUserState = useCustomSelector(selectUser);

  const [currentRelative, setCurrentRelative]: [string, ReactDispatch<SetStateAction<string>>] = useState('');
  
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
  
  const onRelativesChange = (event: SelectChangeEvent) => {
    const value: string = event.target.value;
    setCurrentRelative(value);
  };

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

      { userState.isAdmin &&
        <>
          <Paper variant="outlined" sx={{ bgcolor: '#f0f0f0', border: '1px solid #787878', p: 0.5, my: 1 }}>
            <Typography variant="caption">
              Вам доступен просмотр родственных связей от лица любого родственника
            </Typography>
          </Paper>

          <Box component="div">
            <InputLabel id="relatives-label">Родственники</InputLabel>
            <Select
              labelId="relatives-label"
              id="relatives"
              label="Родственники"
              fullWidth
              value={currentRelative}
              onChange={onRelativesChange}
            >
              <MenuItem value={1}>Клачков В.В.</MenuItem>
              <MenuItem value={2}>Орлова О.В.</MenuItem>
              <MenuItem value={3}>Шишмарева Е.И.</MenuItem>
            </Select>
          </Box>
        </>
      }

      <Button type="button" variant="outlined" fullWidth sx={{ mt: 1.5 }} onClick={logout}>
        Выйти
      </Button>
    </Box>
  )
}

