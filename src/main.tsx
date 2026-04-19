import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import App from './App.tsx';
import './index.css';
import { appTheme } from './theme.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={appTheme}>
      <App />
    </MantineProvider>
  </StrictMode>,
);
