import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { State } from '../../store';
import { DEFAULT_DATA } from './default-data';
import { IRelativeState } from './relative-state';

export const relativesSlice = createSlice({
  name: 'relatives',
  initialState: <IRelativeState>{
    relatives: DEFAULT_DATA,
    currentRelativeKey: null,
    centeredRelativeKey: null
  },
  reducers: {
    setCurrentRelativeKey: (state, action: PayloadAction<number | null>): void => {
      state.currentRelativeKey = action.payload;
      state.centeredRelativeKey = action.payload;
    },
    setCenteredRelativeKey: (state, action: PayloadAction<number | null>): void => {
      state.centeredRelativeKey = action.payload;
    }
  },
});

export const { setCurrentRelativeKey, setCenteredRelativeKey } = relativesSlice.actions;
export const selectRelatives = (state: State) => state.relatives;
export const relativesReducer = relativesSlice.reducer;
