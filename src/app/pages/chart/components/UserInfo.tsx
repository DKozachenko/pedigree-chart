import { Box, Button, InputLabel, MenuItem, Paper, Select, SelectChangeEvent, Typography } from '@mui/material';
import { IUserState, selectUser, useCustomSelector, dropUser, Dispatch, setCurrentRelativeKey } from '../../../store';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useState, Dispatch as ReactDispatch, SetStateAction } from 'react';
import { IRelativeNode } from '../models/interfaces';
import { useRelationships } from '../hooks';

export function UserInfo() {
  const navigate: NavigateFunction = useNavigate();
  const dispatch: Dispatch = useDispatch();
  const userState: IUserState = useCustomSelector(selectUser);
  
  const { getRelativesForSelect } = useRelationships();
  const relativesForSelect: Pick<IRelativeNode, 'key' | 'initials'>[] = getRelativesForSelect()
    .sort((a: Pick<IRelativeNode, 'key' | 'initials'>, b: Pick<IRelativeNode, 'key' | 'initials'>) => a.initials.localeCompare(b.initials));

  const [currentRelative, setCurrentRelative]: [string, ReactDispatch<SetStateAction<string>>] = useState<string>('');
  
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
    const personKey: string = event.target.value;
    setCurrentRelative(personKey);
    dispatch(setCurrentRelativeKey(+personKey));
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
              {relativesForSelect.map((relativeForSelect: Pick<IRelativeNode, 'key' | 'initials'>) => 
                <MenuItem key={relativeForSelect.key} value={relativeForSelect.key}>{ relativeForSelect.initials }</MenuItem>)}
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

