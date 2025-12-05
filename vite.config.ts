import { defineConfig, loadEnv } from 'vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_API_URL || 'http://localhost:8000';

  return {
    // root: 'frontend', // Assuming index.html is in frontend/ or root? 
    // Based on previous file listing, index.html is in root.

    server: {
      port: 5173,
      proxy: {
        '/register': { target, changeOrigin: true },
        '/login': { target, changeOrigin: true },
        '/logout': { target, changeOrigin: true },
        '/delete': { target, changeOrigin: true },
        '/game': { target, changeOrigin: true },
        '/health': { target, changeOrigin: true },
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './frontend/src'),
      },
    },
  };
});
