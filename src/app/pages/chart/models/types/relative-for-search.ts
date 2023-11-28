import { IRelativeNode } from '../interfaces';

export type RelativeForSearch = Pick<IRelativeNode, 'key'> & { label: string };