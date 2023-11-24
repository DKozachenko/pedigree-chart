import { Box } from '@mui/material';
import { Diagram, UserInfo } from './components';

export function Chart() {
  return (
    <Box component="section" position="relative" sx={{ height: '100%' }}>
      <Diagram></Diagram>
      <UserInfo></UserInfo>
    </Box>
  )
}

