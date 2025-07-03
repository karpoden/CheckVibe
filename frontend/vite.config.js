import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // <--- ЭТО важно
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'checkvibe.ru',
      'www.checkvibe.ru',
      'checkvibe.ru:443',
      'checkvibe.ru:5173'
    ],
  },
});
