import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { GiftedFoodsProvider } from './context/GiftedFoodsContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <GiftedFoodsProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </GiftedFoodsProvider>
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>,
);
