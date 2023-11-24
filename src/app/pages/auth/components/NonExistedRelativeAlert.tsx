import { Alert, Snackbar } from '@mui/material';

type Props = {
  isOpen: boolean,
  onClose: () => void
}

export function NonExistedRelativeAlert({ isOpen, onClose }: Props) {
  return (
    <Snackbar open={isOpen} autoHideDuration={3000} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} onClose={onClose}>
      <Alert onClose={onClose} severity="error" sx={{ width: '100%' }}>
        Пользователя с такими данными не существует
      </Alert>
    </Snackbar>
  )
}