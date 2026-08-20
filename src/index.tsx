import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './AuthContext';
import { ToastProvider } from './Toast';
import { ThemeProvider } from './ThemeContext';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);