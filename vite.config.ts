import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/', // ✅ Ensure base path is root
      server: {
        port: 3000,
        host: '0.0.0.0',
        strictPort: false, // Allow fallback to next available port
        cors: {
          origin: ['http://localhost:3000', 'http://localhost', /^http:\/\/.*\.local$/],
          credentials: true
        }
      },
      plugins: [
        react({
          include: "**/*.{jsx,js}", // Process both .js and .jsx files
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        },
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
      }
    };
});
