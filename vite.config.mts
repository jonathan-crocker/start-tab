import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
    root: resolve(projectRoot, 'src'),
    plugins: [ ],
    css: {
        preprocessorOptions: {
            scss: {
                loadPaths: [resolve(projectRoot, 'node_modules')],
                quietDeps: true,
                silenceDeprecations: ['import']
            }
        }
    },
    build: {
        outDir: resolve(projectRoot, 'dist'),
        emptyOutDir: true,
        assetsDir: 'assets'
    }
});
