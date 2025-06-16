import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    // Adapter configuration
    adapter: adapter(),
    
    // CSP and security
    csp: {
      mode: 'auto',
      directives: {
        'script-src': ['self', 'unsafe-inline'],
        'style-src': ['self', 'unsafe-inline'],
        'img-src': ['self', 'data:', 'https:'],
        'font-src': ['self', 'https://fonts.gstatic.com'],
        'connect-src': ['self', 'http://localhost:3000']
      }
    },
    
    // CSRF protection
    csrf: {
      checkOrigin: process.env.NODE_ENV === 'production'
    },
    
    // Path aliases
    alias: {
      $lib: 'src/lib',
      $components: 'src/lib/components',
      $stores: 'src/lib/stores',
      $utils: 'src/lib/utils',
      $types: 'src/lib/types'
    },
    
    // Environment variables exposed to client
    env: {
      publicPrefix: 'PUBLIC_',
      privatePrefix: 'PRIVATE_'
    },
    
    // Files to include in the build
    files: {
      assets: 'static',
      hooks: {
        client: 'src/hooks.client.ts',
        server: 'src/hooks.server.ts'
      },
      lib: 'src/lib',
      params: 'src/params',
      routes: 'src/routes',
      serviceWorker: 'src/service-worker.ts',
      appTemplate: 'src/app.html',
      errorTemplate: 'src/error.html'
    },
    
    // Development options
    typescript: {
      config: (config) => {
        config.compilerOptions.strict = true;
        return config;
      }
    }
  },
  
  // Svelte compiler options
  compilerOptions: {
    // Enable Svelte 5 runes mode
    runes: true,
    dev: process.env.NODE_ENV !== 'production'
  },
  
  // Svelte preprocessors
  preprocess: [],
  
  // Extensions to treat as Svelte components
  extensions: ['.svelte'],
  
  // Vite plugin options
  vitePlugin: {
    // Inspector for debugging
    inspector: {
      toggleKeyCombo: 'meta-shift',
      showToggleButton: 'always',
      toggleButtonPos: 'bottom-right'
    }
  }
};

export default config;