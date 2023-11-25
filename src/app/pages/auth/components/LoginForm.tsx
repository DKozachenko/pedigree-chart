import { SetStateAction, useState, Dispatch as ReactDispatch, useCallback } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { SubmitHandler, useForm, Controller } from 'react-hook-form';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch } from 'react-redux';
import { Dispatch } from '@reduxjs/toolkit';
import * as yup from "yup"
import { setGuest, setUser, setAdmin, ISetUserPayload, useCustomSelector, selectRelatives, setCurrentRelativeKey, IRelative } from '../../../store';
import { findRelativeByUserInfo } from '../../../utils';
import { NonExistedRelativeAlert } from './NonExistedRelativeAlert';

const formSchema = yup
  .object({
    name: yup.string().required('Поле является обязательным').nullable(),
    lastName: yup.string().required('Поле является обязательным').nullable(),
    middleName: yup.string().nullable()
  })
  .required();

export function LoginForm() {
  const navigate: NavigateFunction = useNavigate();
  const dispatch: Dispatch = useDispatch();
  const { relatives } = useCustomSelector(selectRelatives);
  const [isNonExistedRelativeModalOpen, setIsNonExistedRelativeModalOpen]: [boolean, ReactDispatch<SetStateAction<boolean>>] = useState<boolean>(false);

  const { control, handleSubmit, formState: { errors, isValid } } = useForm<ISetUserPayload>({
    resolver: yupResolver(formSchema),
    defaultValues: {
      name: '',
      lastName: '',
      middleName: ''
    },
    mode: 'onChange'
  });

  const login: SubmitHandler<ISetUserPayload> = (data: ISetUserPayload) => {
    const currentRelative: IRelative | undefined = findRelativeByUserInfo(relatives, data);
    if (!currentRelative) {
      setIsNonExistedRelativeModalOpen(true);
      return;
    }
    dispatch(setUser(data));
    dispatch(setCurrentRelativeKey(currentRelative.key));
    navigate('/');
  }

  const loginAsGuest = (): void => {
    dispatch(setGuest());
    dispatch(setCurrentRelativeKey(null));
    navigate('/');
  }

  const loginAsAdmin = (): void => {
    dispatch(setAdmin());
    dispatch(setCurrentRelativeKey(null));
    navigate('/');
  }

  const closeNonExistedModal: () => void = useCallback(() => {
    setIsNonExistedRelativeModalOpen(false);
  }, []);

  return (
    <Box component="form" onSubmit={handleSubmit(login)} sx={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      <Box sx={{ position: 'relative' }}>
        <Controller
          name="name"
          control={control}
          rules={{ required: true }}
          render={({ field }) => <>
            <TextField label="Имя"
              variant="outlined"
              fullWidth
              margin="none" {...field} 
            />
            { errors.name?.message && 
              <Typography color="error"  variant="caption" sx={{ 
                  position: 'absolute', 
                  left: '14px', 
                  top: 'calc(100% + 2px)',
                  zIndex: '5' 
                }}>
                { errors.name.message }
              </Typography> 
            }
            </>
          }
        />
      </Box>

      <Box sx={{ position: 'relative' }}>
        <Controller
          name="lastName"
          control={control}
          rules={{ required: true }}
          render={({ field }) => <>
            <TextField label="Фамилия"
              variant="outlined"
              fullWidth
              margin="none" {...field} 
            />
            { errors.lastName?.message && 
              <Typography color="error"  variant="caption" sx={{ 
                  position: 'absolute', 
                  left: '14px', 
                  top: 'calc(100% + 2px)',
                  zIndex: '5' 
                }}>
                { errors.lastName.message }
              </Typography> 
            }
            </>
          }
        />
      </Box>
      
      <Box sx={{ position: 'relative' }}>
        <Controller
          name="middleName"
          control={control}
          render={({ field }) => <TextField label="Отчество"
              variant="outlined"
              fullWidth
              margin="none" {...field} 
            />
          }
        />
      </Box>

      <Box component="div" sx={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: '10px'
       }}>
        <Button disabled={!isValid} type="submit" sx={{ gridColumn: '1 / -1' }} variant="contained">
          Войти
        </Button>
        <Button type="button" variant="outlined" onClick={loginAsGuest}>
          Войти как гость
        </Button>
        <Button type="button" variant="outlined" onClick={loginAsAdmin}>
          Войти как админ
        </Button>
      </Box>

      { isNonExistedRelativeModalOpen && 
        <NonExistedRelativeAlert isOpen={isNonExistedRelativeModalOpen} onClose={closeNonExistedModal}></NonExistedRelativeAlert> }
    </Box>
  )
}