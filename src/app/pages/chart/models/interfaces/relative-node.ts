import { IRelative } from '../../../../store';

export interface IRelativeNode extends Omit<IRelative, 'name' | 'lastName' | 'middleName'> {
  initials: string,
  wifeKeys?: number[],
  husbandKeys?: number[],
  motherKey?: number,
  fatherKey?: number,
  relationship?: string,
}