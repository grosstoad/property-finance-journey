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
          proxy.on('error', (err, req, res) => {
            console.error('PropTrack Proxy Error:', {
              error: err.message,
              stack: err.stack,
              url: req.url,
              method: req.method,
              headers: req.headers
            });
            
            // Send a more informative error response
            if (!res.headersSent) {
              res.writeHead(500, {
                'Content-Type': 'application/json'
              });
              res.end(JSON.stringify({
                error: 'Proxy Error',
                message: err.message,
                code: 'PROXY_ERROR'
              }));
            }
          });

          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('PropTrack Proxy Request:', {
              url: req.url,
              method: req.method,
              headers: proxyReq.getHeaders()
            });
          });

          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('PropTrack Proxy Response:', {
              url: req.url,
              method: req.method,
              status: proxyRes.statusCode,
              headers: proxyRes.headers
            });
          });
        },
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization'
        }
      }
    }
  }
})
