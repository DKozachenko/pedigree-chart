import { Gender } from './gender';

export interface IRelative {
  key: number;
  name: string;
  lastName: string;
  middleName?: string;
  gender: Gender;
  parents?: [number] | [number, number];
}