import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { IUserState } from './user-state';
import { ISetUserPayload } from './set-user-payload';
import { State } from '../store';

const updateLocalStorage = (state: IUserState): void => {
  for (const [key, value] of Object.entries(state)) {
    if (value !== null) {
      localStorage.setItem(key, value);
    }
  }
}

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    isGuest: localStorage.getItem('isGuest') ? localStorage.getItem('isGuest') === 'true' : null,
    name: localStorage.getItem('name'),
    lastName: localStorage.getItem('lastName'),
    middleName: localStorage.getItem('middleName'),
  },
  reducers: {
    setUser: (state, action: PayloadAction<ISetUserPayload>) => {
      state.isGuest = false;
      state.name = action.payload.name;
      state.lastName = action.payload.lastName;
      state.middleName = action.payload.middleName || null;
      updateLocalStorage({ ...state });
    },
    dropUser: (state) => {
      state.isGuest = null;
      state.name = null;
      state.lastName = null;
      state.middleName = null;
      updateLocalStorage({ ...state });
    },
    setGuest: (state) => {
      state.isGuest = true;
      state.name = null;
      state.lastName = null;
      state.middleName = null;
      updateLocalStorage({ ...state });
    },
  }
})

export const { setUser, dropUser, setGuest } = userSlice.actions;
export const selectUser = (state: State) => state.user;
export const userReducer = userSlice.reducer;