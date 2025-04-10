import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 3000
  },
  preview: {
    port: 3000
  },
  build: {
    chunkSizeWarningLimit: 1000, // Increased from default 500kb to 1000kb
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'ui-components': ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-slot'],
          'utils': ['@supabase/supabase-js', 'date-fns', 'zustand']
        }
      }
    }
  }
});