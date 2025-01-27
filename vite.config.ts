import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { compression } from 'vite-plugin-compression2'
import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        compression({
            algorithm: 'brotliCompress',
        }),
        visualizer(),
    ],
    base: '/FlowgorithmToReport/',
})
