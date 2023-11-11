import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './app/App.tsx'
import './main.scss';
import { BrowserRouter } from 'react-router-dom';
import { store } from './app/store';
import { Provider } from 'react-redux'
import { Box } from '@mui/material';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Box component="div" sx={{ height: '100vh', width: '100%' }}>
          <App />
        </Box>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
