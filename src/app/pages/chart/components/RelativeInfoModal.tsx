import { Box, Modal, Typography } from '@mui/material';
import { IRelative } from '../../../store';

type Props = {
  relative: IRelative,
  isOpen: boolean,
  onClose: () => void
}

export function RelativeInfoModal({ relative, isOpen, onClose }: Props) {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box component="div" sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 3,
      }}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          ID: { relative.key }
        </Typography>
        <Typography component="div" id="modal-modal-description" sx={{ mt: 2 }}>
          <Typography component="p" sx={{
            mb: 1,
          }}>
            Фамилия: { relative.lastName }
          </Typography>

          <Typography component="p" sx={{
            mb: 1,
          }}>
            Имя: { relative.name }
          </Typography>

          { relative.middleName && 
            <Typography component="p">
              Отчество: { relative.middleName }
            </Typography> 
          }
        </Typography>
      </Box>
    </Modal>
  );
}
