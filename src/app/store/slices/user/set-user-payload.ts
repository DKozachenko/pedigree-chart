import { IUserState } from './user-state';

export type ISetUserPayload = Omit<IUserState, 'isGuest' | 'isAdmin'>;