import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress React Router warnings in development environment
// This is not ideal for production, but helps during development
if (import.meta.env.DEV) {
  const originalConsoleWarn = console.warn;
  console.warn = (...args) => {
    if (args[0]?.includes?.('React Router Future Flag Warning')) {
      return;
    }
    originalConsoleWarn(...args);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
