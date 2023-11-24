import { IRelative, ISetUserPayload } from '../store';

export const findRelativeByUserInfo: (data: IRelative[], userInfo: ISetUserPayload) => IRelative | undefined = 
  (data: IRelative[], userInfo: ISetUserPayload) => {
  const comparator = userInfo.middleName
    ? (relative: IRelative) => relative.name === userInfo.name && 
      relative.lastName === userInfo.lastName && 
      relative.middleName === userInfo.middleName
    : (relative: IRelative) => relative.name === userInfo.name && 
      relative.lastName === userInfo.lastName;

  return data.find(comparator);
}