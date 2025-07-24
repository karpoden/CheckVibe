import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // <--- ЭТО важно
    proxy: {
      '/api': {
        target: 'http://backend:3001',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://backend:3001',
        changeOrigin: true,
        secure: false,
      },
    },
    allowedHosts: [
      'checkvibeapp.ru'
    ],
  },
});
