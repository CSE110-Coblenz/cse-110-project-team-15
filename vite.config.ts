import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig(() => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // const env = loadEnv(mode, process.cwd(), '');

  return {
    // root: 'frontend', // Assuming index.html is in frontend/ or root? 
    // Based on previous file listing, index.html is in root.

    server: {
      port: 5173,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './frontend/src'),
      },
    },
  };
});
