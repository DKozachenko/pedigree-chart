import { Box, Grid, Typography, Paper, Container } from '@mui/material';
import { LoginForm } from './components';

export function Auth() {
  return (
    <Box component="section" sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: '#f8fdff'
    }}>
      <Container maxWidth="md">
        <Grid container rowSpacing={3} justifyContent="center">
          <Grid item md={12}>
            <Typography variant="h4" align="center">
              От чьего лица вы хотите проcматривать родственное дерево?
            </Typography>
          </Grid>

          <Grid item md={12}>
            <Typography component="div" variant="body1">
              <Paper variant="elevation" elevation={3} sx={{ px: 3, py: 2 }}>Вы можете просматривать древо относительно какого-либо пользователя. Для этого вам необходимо ввести его ФИО. 
                <Paper variant="outlined" sx={{ bgcolor: '#e29797', border: '1px solid red', p: 1, my: 1 }}>Учтите, что если вы укажете несуществующего пользователя, то у вас не будет возможности просмотреть древо.</Paper>
                Также можно использовать приложение как гость. В таком случае родственные связи отображаться не будут.
              </Paper>
            </Typography>
          </Grid>

          <Grid item md={6}>
            <LoginForm></LoginForm>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

