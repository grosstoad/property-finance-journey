import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/proptrack-api': {
        target: 'https://data.proptrack.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/proptrack-api/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            process.stdout.write(`Proxy error: ${err}\n`);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            process.stdout.write(`Sending Request: ${req.method} ${req.url}\n`);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            process.stdout.write(`Received Response: ${proxyRes.statusCode} ${req.url}\n`);
          });
        },
      }
    }
  }
})
