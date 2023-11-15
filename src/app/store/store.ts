import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { relativesReducer, userReducer } from './slices';

export const store = configureStore({
  reducer: {
    user: userReducer,
    relatives: relativesReducer
  }
});

export type State = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;

export const useCustomDispatch: () => Dispatch = useDispatch;
export const useCustomSelector: TypedUseSelectorHook<State> = useSelector;