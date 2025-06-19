<!-- frontend/src/routes/+layout.svelte -->
<!-- ✅ EMERGENCY FIX: Layout with embedded CSS variables -->
<!-- CSS variables directly in component to ensure they load -->

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
  
  let isNavigating = $state(false);
  let mounted = $state(false);
  let themeState = $state($themeStore);
  
  $effect(() => {
    themeState = $themeStore;
  });
  
  $effect(() => {
    isNavigating = $navigating !== null;
  });

  // ============================================
  // PAGE METADATA
  // ============================================
  
  const defaultTitle = 'ระบบรายงานโรค';
  const defaultDescription = 'ระบบรายงานการติดตาม การเฝ้าระวัง และควบคุมโรค';
  
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
  
  let themeColor = $derived.by(() => {
    return themeState.effectiveTheme === 'dark' ? '#1e293b' : '#ffffff';
  });

  // ============================================
  // LIFECYCLE
  // ============================================
  
  onMount(() => {
    themeStore.init();
    mounted = true;
    
    // Debug CSS variables after mount
    setTimeout(() => {
      const bgPrimary = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary');
    }, 100);
  });

  // ============================================
  // KEYBOARD SHORTCUTS
  // ============================================
  
  function handleGlobalKeyboard(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'D') {
      event.preventDefault();
      themeStore.toggle();
      console.log('🌗 Theme toggled via keyboard');
    }
  }
  
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
<!-- PAGE HEAD -->
<!-- ============================================ -->

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={defaultDescription} />
  <meta name="theme-color" content={themeColor} />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link 
    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Sarabun:wght@300;400;500;600;700&display=swap" 
    rel="stylesheet" 
  />
</svelte:head>

<!-- ============================================ -->
<!-- MAIN LAYOUT -->
<!-- ============================================ -->

<div class="app-layout min-h-screen transition-colors duration-300"
     style="background-color: var(--bg-primary); color: var(--text-primary);">
  
  <!-- Global Loading Indicator -->
  {#if isNavigating}
    <div class="fixed top-0 left-0 right-0 z-50">
      <div class="h-1 animate-pulse" 
           style="background: linear-gradient(90deg, var(--primary-500), var(--primary-600));"></div>
    </div>
  {/if}
  
  <!-- Header -->
  <header class="sticky top-0 z-40 backdrop-blur-sm transition-all duration-300"
          style="background-color: var(--surface-primary); 
                 border-bottom: 1px solid var(--border-primary);">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        
        <!-- Logo/Brand -->
        <div class="flex items-center gap-3">
          <h1 class="text-xl font-bold transition-colors duration-300"
              style="color: var(--text-primary);">
            🏥 {defaultTitle}
          </h1>
        </div>
        
        <!-- Navigation Actions -->
        <div class="flex items-center gap-4">
          
          <!-- Current Path -->
          {#if mounted}
            <div class="hidden md:block text-sm transition-colors duration-300"
                 style="color: var(--text-secondary);">
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
  <main class="flex-1 transition-colors duration-300"
        style="background-color: var(--bg-primary);">
    {@render children()}
  </main>
  
  <!-- Footer -->
  <footer class="mt-auto transition-all duration-300"
          style="border-top: 1px solid var(--border-primary); 
                 background-color: var(--surface-primary);">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="text-center text-sm transition-colors duration-300"
           style="color: var(--text-secondary);">
        <p>ระบบรายงานโรค - พัฒนาด้วย SvelteKit 5</p>
        <p class="mt-1">
          Theme: <strong style="color: var(--text-primary);">{themeState.theme}</strong>
          | Effective: <strong style="color: var(--primary-500);">{themeState.effectiveTheme}</strong>
        </p>
      </div>
    </div>
  </footer>
  
</div>

<!-- Debug Panel -->


<!-- ============================================ -->
<!-- EMBEDDED CSS VARIABLES (EMERGENCY FIX) -->
<!-- ============================================ -->

<style>
  /* Don't import Tailwind here - it's already imported in app.css */

  /* CSS Variables - Light Mode (Default) */
  :global(:root) {
    /* Background Colors */
    --bg-primary: #ffffff;
    --bg-secondary: #f8fafc;
    --bg-tertiary: #f1f5f9;
    
    /* Surface Colors */
    --surface-primary: #ffffff;
    --surface-secondary: #f8fafc;
    --surface-elevated: #ffffff;
    --surface-hover: #f1f5f9;
    --surface-active: #e2e8f0;
    
    /* Text Colors */
    --text-primary: #0f172a;
    --text-secondary: #475569;
    --text-tertiary: #64748b;
    --text-disabled: #94a3b8;
    --text-inverse: #ffffff;
    
    /* Border Colors */
    --border-primary: #e2e8f0;
    --border-secondary: #cbd5e1;
    --border-focus: #3b82f6;
    
    /* Brand Colors */
    --primary-50: #eff6ff;
    --primary-100: #dbeafe;
    --primary-500: #3b82f6;
    --primary-600: #2563eb;
    --primary-700: #1d4ed8;
    --primary-800: #1e40af;
    
    /* Status Colors */
    --success: #10b981;
    --success-bg: #d1fae5;
    --warning: #f59e0b;
    --warning-bg: #fef3c7;
    --error: #ef4444;
    --error-bg: #fee2e2;
    --info: #06b6d4;
    --info-bg: #cffafe;
    
    /* Shadows */
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  /* CSS Variables - Dark Mode */
  :global([data-theme="dark"]) {
    /* Background Colors */
    --bg-primary: #0f172a;
    --bg-secondary: #1e293b;
    --bg-tertiary: #334155;
    
    /* Surface Colors */
    --surface-primary: #1e293b;
    --surface-secondary: #334155;
    --surface-elevated: #475569;
    --surface-hover: #475569;
    --surface-active: #64748b;
    
    /* Text Colors */
    --text-primary: #f8fafc;
    --text-secondary: #cbd5e1;
    --text-tertiary: #94a3b8;
    --text-disabled: #64748b;
    --text-inverse: #0f172a;
    
    /* Border Colors */
    --border-primary: #475569;
    --border-secondary: #64748b;
    --border-focus: #60a5fa;
    
    /* Brand Colors */
    --primary-50: #1e293b;
    --primary-100: #334155;
    --primary-500: #60a5fa;
    --primary-600: #3b82f6;
    --primary-700: #2563eb;
    --primary-800: #1d4ed8;
    
    /* Status Colors */
    --success: #34d399;
    --success-bg: #064e3b;
    --warning: #fbbf24;
    --warning-bg: #451a03;
    --error: #f87171;
    --error-bg: #7f1d1d;
    --info: #22d3ee;
    --info-bg: #164e63;
    
    /* Shadows */
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3);
  }

  /* Base styles */
  :global(*) {
    box-sizing: border-box;
    transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
  }

  :global(html) {
    font-family: 'Sarabun', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  :global(body) {
    margin: 0;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    min-height: 100vh;
  }

  /* Disable transitions during theme switching */
  :global(.theme-transitioning *) {
    transition: none !important;
  }

  /* Focus states */
  :global(*:focus-visible) {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
  }

  /* App layout */
  .app-layout {
    display: flex;
    flex-direction: column;
    background-color: var(--bg-primary);
    color: var(--text-primary);
  }
</style>