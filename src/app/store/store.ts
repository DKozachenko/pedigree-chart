import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { userReducer } from './slices';

export const store = configureStore({
  reducer: {
    user: userReducer
  }
});

export type State = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;

export const useCustomDispatch: () => Dispatch = useDispatch;
export const useCustomSelector: TypedUseSelectorHook<State> = useSelector;