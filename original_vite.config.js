export default {
  server: {
    host: '127.0.0.1',
    port: 5175,
    strictPort: true,
    watch: { usePolling: true, interval: 200 }
  },
  build: { target: 'es2022' }
};
