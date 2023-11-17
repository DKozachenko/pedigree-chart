import { Box } from '@mui/material';
import { Diagram, UserInfo } from './components';
import { IRelative, IUserState, findRelativeByUserInfo, selectRelatives, selectUser, useCustomSelector } from '../../store';
import { Dispatch, SetStateAction, useState } from 'react';

export function Chart() {
  const userState: IUserState = useCustomSelector(selectUser);
  const relativesState: IRelative[] = useCustomSelector(selectRelatives);

  const [selectedKey, setSelectedKey]: [number | null, Dispatch<SetStateAction<number | null>>] = useState<number | null>(() => {
    if (!userState.isAdmin && !userState.isGuest) {
      const currentRelative: IRelative = findRelativeByUserInfo(relativesState, userState);
      return currentRelative.key;
    }
    return null;
  });

  const setNewSelectedRelative: (selectedKey: number) => void = (selectedKey: number) => {
    setSelectedKey(selectedKey);
  }

  return (
    <Box component="section" position="relative" sx={{ height: '100%' }}>
      <Diagram selectedKey={selectedKey}></Diagram>
      <UserInfo onChange={setNewSelectedRelative}></UserInfo>
    </Box>
  )
}

