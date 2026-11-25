import { defineConfig } from 'vite';
import { resolve } from 'path';
import { cpSync, existsSync } from 'fs';

function copyPublicFolderPlugin() {
  return {
    name: 'copy-public-folder',
    closeBundle() {
      const src = resolve(__dirname, 'public');
      const dest = resolve(__dirname, 'dist/public');
      if (existsSync(src)) {
        cpSync(src, dest, { recursive: true });
      }
    }
  };
}

export default defineConfig({
  base: './',
  root: '.',
  publicDir: false,
  plugins: [copyPublicFolderPlugin()],
  server: {
    port: 5173,
    allowedHosts: true,
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'pages/login.html'),
        register: resolve(__dirname, 'pages/register.html'),
        lostItems: resolve(__dirname, 'pages/lost-items.html'),
        foundItems: resolve(__dirname, 'pages/found-items.html'),
        reportLost: resolve(__dirname, 'pages/report-lost.html'),
        reportFound: resolve(__dirname, 'pages/report-found.html'),
        itemDetails: resolve(__dirname, 'pages/item-details.html'),
        myReports: resolve(__dirname, 'pages/my-reports.html'),
        claims: resolve(__dirname, 'pages/claims.html'),
        notifications: resolve(__dirname, 'pages/notifications.html'),
        profile: resolve(__dirname, 'pages/profile.html')
      }
    }
  }
});
