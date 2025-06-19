<!-- frontend/src/routes/+layout.svelte -->
<!-- ✅ Fixed root layout with proper theme integration -->
<!-- Clean and working theme support for SvelteKit 5 -->

<script lang="ts">
  import { browser } from '$app/environment';
  import { navigating, page } from '$app/stores';
  import { onMount } from 'svelte';
  import { themeStore } from '$lib/stores/theme.store';
  import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';
  import '../app.css';

  // ============================================
  // PROPS - SvelteKit 5 children prop
  // ============================================
  
  interface Props {
    children: import('svelte').Snippet;
  }
  
  let { children }: Props = $props();

  // ============================================
  // REACTIVE STATE
  // ============================================
  
  // Navigation loading state
  let isNavigating = $state(false);
  let mounted = $state(false);
  
  // Theme state from store
  let themeState = $state($themeStore);
  
  // Update theme state when store changes
  $effect(() => {
    themeState = $themeStore;
  });
  
  // Track navigation state
  $effect(() => {
    isNavigating = $navigating !== null;
  });

  // ============================================
  // PAGE METADATA
  // ============================================
  
  const defaultTitle = 'ระบบรายงานโรค';
  const defaultDescription = 'ระบบรายงานการติดตาม การเฝ้าระวัง และควบคุมโรค';
  
  // Dynamic page title based on current route
  let pageTitle = $derived.by(() => {
    const currentPath = $page.url.pathname;
    
    switch (currentPath) {
      case '/':
        return defaultTitle;
      case '/login':
        return `เข้าสู่ระบบ | ${defaultTitle}`;
      case '/patients':
        return `รายการผู้ป่วย | ${defaultTitle}`;
      case '/dashboard':
        return `แดชบอร์ด | ${defaultTitle}`;
      case '/reports':
        return `รายงาน | ${defaultTitle}`;
      case '/profile':
        return `โปรไฟล์ | ${defaultTitle}`;
      default:
        return defaultTitle;
    }
  });
  
  // Dynamic theme color for mobile browsers
  let themeColor = $derived.by(() => {
    return themeState.effectiveTheme === 'dark' ? '#1e293b' : '#ffffff';
  });

  // ============================================
  // LIFECYCLE
  // ============================================
  
  onMount(() => {
    console.log('🚀 Layout mounted - initializing theme');
    
    // Initialize theme store
    themeStore.init();
    
    // Mark as mounted
    mounted = true;
    
    console.log('✅ Theme initialized:', $themeStore);
  });

  // ============================================
  // KEYBOARD SHORTCUTS
  // ============================================
  
  function handleGlobalKeyboard(event: KeyboardEvent) {
    // Toggle theme with Ctrl/Cmd + Shift + D (for Dark)
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'D') {
      event.preventDefault();
      themeStore.toggle();
      console.log('🌗 Theme toggled via keyboard');
    }
    
    // Other global shortcuts can be added here
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'k':
          event.preventDefault();
          // Future: Open command palette
          break;
      }
    }
  }
  
  // Add keyboard event listener
  $effect(() => {
    if (browser && mounted) {
      document.addEventListener('keydown', handleGlobalKeyboard);
      return () => {
        document.removeEventListener('keydown', handleGlobalKeyboard);
      };
    }
  });
</script>

<!-- ============================================ -->
<!-- PAGE HEAD (SEO & Meta Tags) -->
<!-- ============================================ -->

<svelte:head>
  <!-- Page title -->
  <title>{pageTitle}</title>
  
  <!-- Basic meta tags -->
  <meta name="description" content={defaultDescription} />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta charset="utf-8" />
  
  <!-- Theme color for mobile browsers -->
  <meta name="theme-color" content={themeColor} />
  
  <!-- Favicons -->
  <link rel="icon" type="image/png" href="/favicon.png" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  
  <!-- Open Graph meta tags -->
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={defaultDescription} />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="th_TH" />
  
  <!-- Fonts with proper preloading -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link 
    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Sarabun:wght@300;400;500;600;700&display=swap" 
    rel="stylesheet" 
  />
</svelte:head>

<!-- ============================================ -->
<!-- MAIN LAYOUT CONTENT -->
<!-- ============================================ -->

<div class="app-layout min-h-screen transition-colors duration-300">
  
  <!-- Global Loading Indicator -->
  {#if isNavigating}
    <div class="fixed top-0 left-0 right-0 z-50">
      <div class="h-1 bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
    </div>
  {/if}
  
  <!-- Header (if needed) -->
  <header class="sticky top-0 z-40 bg-surface border-b border-primary backdrop-blur-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        
        <!-- Logo/Brand -->
        <div class="flex items-center gap-3">
          <h1 class="text-xl font-bold text-primary">
            🏥 {defaultTitle}
          </h1>
        </div>
        
        <!-- Navigation Actions -->
        <div class="flex items-center gap-4">
          
          <!-- Current Path Indicator (for development) -->
          {#if mounted}
            <div class="hidden md:block text-sm text-secondary">
              {$page.url.pathname}
            </div>
          {/if}
          
          <!-- Theme Toggle -->
          <ThemeToggle position="right" size="sm" />
          
        </div>
      </div>
    </div>
  </header>
  
  <!-- Main Content -->
  <main class="flex-1">
    {@render children()}
  </main>
  
  <!-- Footer (optional) -->
  <footer class="mt-auto border-t border-primary bg-surface">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="text-center text-sm text-secondary">
        <p>
          ระบบรายงานโรค - พัฒนาด้วย SvelteKit 5
        </p>
        <p class="mt-1">
          Current Theme: <strong class="text-primary">{themeState.theme}</strong>
          {#if themeState.theme === 'system'}
            (System: {themeState.systemTheme})
          {/if}
        </p>
      </div>
    </div>
  </footer>
  
</div>

<!-- ============================================ -->
<!-- DEVELOPMENT HELPERS -->
<!-- ============================================ -->

{#if mounted}
  <!-- Theme Debug Info (only in development) -->
  <div class="fixed bottom-4 left-4 z-50 hidden lg:block">
    <div class="bg-surface border border-primary rounded-lg p-3 text-xs shadow-lg">
      <div class="font-semibold text-primary mb-1">Theme Debug:</div>
      <div class="text-secondary space-y-1">
        <div>Theme: <span class="text-primary">{themeState.theme}</span></div>
        <div>Effective: <span class="text-primary">{themeState.effectiveTheme}</span></div>
        <div>System: <span class="text-primary">{themeState.systemTheme}</span></div>
        <div>Loading: <span class="text-primary">{themeState.isLoading}</span></div>
      </div>
      <div class="mt-2 text-xs text-tertiary">
        Press <kbd class="px-1 bg-elevated rounded">Ctrl+Shift+D</kbd> to toggle
      </div>
    </div>
  </div>
{/if}

<!-- ============================================ -->
<!-- STYLES -->
<!-- ============================================ -->

<style>
  /* App-specific styles */
  .app-layout {
    display: flex;
    flex-direction: column;
    background-color: var(--bg-primary);
    color: var(--text-primary);
  }
  
  /* Header backdrop blur effect */
  :global(header) {
    background-color: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(8px);
  }
  
  :global([data-theme="dark"]) :global(header) {
    background-color: rgba(30, 41, 59, 0.8);
  }
  
  /* Loading indicator animation */
  @keyframes loading-shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  /* Debug panel styling */
  kbd {
    font-family: ui-monospace, monospace;
    font-size: 0.75rem;
  }
  
  /* Smooth transitions for layout elements */
  header, main, footer {
    transition: background-color 0.3s ease, border-color 0.3s ease;
  }
</style>