import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.resolve(import.meta.dirname, './resources/js'),
        },
    },
    test: {
        globals: true,
        environment: 'happy-dom',
        include: ['resources/js/**/*.{test,spec}.{js,ts}'],
    },
});
