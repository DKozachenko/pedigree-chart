import { IRelative } from './relative';

export interface IRelativeState {
  relatives: IRelative[],
  currentRelativeKey: number | null,
  centeredRelativeKey: number | null
}