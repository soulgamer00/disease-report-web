import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  
  // Optimize dependencies for better build performance
  optimizeDeps: {
    include: [
      'dayjs',
      'dayjs/plugin/timezone',
      'dayjs/plugin/utc',
      'chart.js',
      'chart.js/auto'
    ]
  },

  // Server configuration
  server: {
    port: 5173,
    strictPort: false,
    host: true, // Allow external connections
    fs: {
      strict: false
    }
  },

  // Build configuration
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks: {
          'chart-vendor': ['chart.js', 'chartjs-adapter-dayjs-4'],
          'date-vendor': ['dayjs'],
          'excel-vendor': ['xlsx']
        }
      }
    }
  },

  // Development settings
  define: {
    global: 'globalThis'
  }
});