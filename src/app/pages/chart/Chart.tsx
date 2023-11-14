import { Box } from '@mui/material';
import { Diagram, UserInfo } from './components';
import { Diagram2 } from './components/Diagram2';

export function Chart() {
  return (
    <Box component="section" position="relative" sx={{ height: '100%' }}>
      <Diagram></Diagram>
      {/* <Diagram2></Diagram2> */}
      <UserInfo></UserInfo>
    </Box>
  )
}

