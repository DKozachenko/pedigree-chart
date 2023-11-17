import { createSlice } from '@reduxjs/toolkit';
import { State } from '../../store';
import { DEFAULT_DATA } from './default-data';

export const relativesSlice = createSlice({
  name: 'relatives',
  initialState: DEFAULT_DATA,
  reducers: {},
});

export const selectRelatives = (state: State) => state.relatives;
export const relativesReducer = relativesSlice.reducer;
