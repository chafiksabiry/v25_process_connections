import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@harx/shared': path.resolve(__dirname, '../shared'),
        },
    },
    server: {
        port: 5173,
        strictPort: true,
        fs: {
            allow: [path.resolve(__dirname, '..')],
        },
    },
    build: {
        outDir: 'dist',
    },
});
