<!-- frontend/src/routes/+layout.svelte -->
<!-- Root layout with beautiful theme support and enhanced styling -->
<script lang="ts">
  import { browser } from '$app/environment';
  import { navigating, page } from '$app/stores';
  import { onMount } from 'svelte';
  import { themeStore } from '$lib/stores/theme.store';
  import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';
  import '../app.css';

  // ============================================
  // PROPS - SvelteKit 5 way to receive children
  // ============================================
  
  interface Props {
    children: import('svelte').Snippet;
  }
  
  let { children }: Props = $props();

  // ============================================
  // REACTIVE STATE
  // ============================================
  
  let isLoading = $state(false);
  let mounted = $state(false);
  let showBackToTop = $state(false);
  
  // Theme state
  let themeState = $state({ 
    effectiveTheme: 'light' as 'light' | 'dark',
    theme: 'system' as 'light' | 'dark' | 'system',
    systemTheme: 'light' as 'light' | 'dark',
    isLoading: false
  });
  
  // ============================================
  // PAGE METADATA
  // ============================================
  
  const defaultTitle = 'ระบบรายงานโรค';
  const defaultDescription = 'ระบบรายงานการติดตาม การเฝ้าระวัง และควบคุมโรค';
  
  // Dynamic page title
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
    return themeState.effectiveTheme === 'dark' ? '#020617' : '#ffffff';
  });

  // ============================================
  // LIFECYCLE
  // ============================================
  
  onMount(() => {
    mounted = true;
    
    // Initialize theme
    themeStore.initialize();
    
    // Subscribe to theme changes
    const unsubscribeTheme = themeStore.subscribe(state => {
      themeState = state;
    });
    
    // Handle scroll for back-to-top button
    const handleScroll = () => {
      showBackToTop = window.scrollY > 400;
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Initialize app
    if (browser) {
      console.log('🚀 SvelteKit 5 App with Theme Support Initialized');
      
      // Add smooth scroll behavior
      document.documentElement.style.scrollBehavior = 'smooth';
    }
    
    return () => {
      unsubscribeTheme();
      window.removeEventListener('scroll', handleScroll);
    };
  });
  
  // ============================================
  // REACTIVE EFFECTS
  // ============================================
  
  // Loading state
  $effect(() => {
    isLoading = !!$navigating;
  });
  
  // Update document class based on route
  $effect(() => {
    if (browser) {
      const currentPath = $page.url.pathname;
      document.body.className = `route-${currentPath.replace('/', '') || 'home'}`;
    }
  });

  // ============================================
  // HANDLERS
  // ============================================
  
  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
  
  function handleKeyboardNavigation(event: KeyboardEvent) {
    // Handle global keyboard shortcuts
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'k':
          event.preventDefault();
          // Open search (implement later)
          break;
        case '/':
          event.preventDefault();
          // Focus search input (implement later)
          break;
      }
    }
    
    // Toggle theme with Ctrl/Cmd + Shift + T
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'T') {
      event.preventDefault();
      themeStore.toggleTheme();
    }
  }
  
  // Add keyboard event listener
  $effect(() => {
    if (browser) {
      document.addEventListener('keydown', handleKeyboardNavigation);
      return () => {
        document.removeEventListener('keydown', handleKeyboardNavigation);
      };
    }
  });
</script>

<!-- ============================================ -->
<!-- PAGE HEAD (SEO & Meta) -->
<!-- ============================================ -->

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={defaultDescription} />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta charset="utf-8" />
  
  <!-- Dynamic theme color -->
  <meta name="theme-color" content={themeColor} />
  
  <!-- Thai language support -->
  <html lang="th"></html>
  
  <!-- Favicons -->
  <link rel="icon" type="image/png" href="/favicon.png" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  
  <!-- Open Graph tags -->
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={defaultDescription} />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="th_TH" />
  
  <!-- Fonts with proper preloading -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link 
    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap" 
    rel="stylesheet" 
  />
  
  <!-- Prevent flash of unstyled content -->
  <script>
    // Apply theme immediately to prevent flash
    (function() {
      const theme = localStorage.getItem('app-theme') || 'system';
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const effectiveTheme = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;
      
      document.documentElement.setAttribute('data-theme', effectiveTheme);
      document.documentElement.classList.add(effectiveTheme);
    })();
  </script>
</svelte:head>

<!-- ============================================ -->
<!-- MAIN APPLICATION STRUCTURE -->
<!-- ============================================ -->

<div class="app-root min-h-screen bg-primary transition-colors duration-300">
  
  <!-- ========== GLOBAL LOADING INDICATOR ========== -->
  {#if isLoading}
    <div class="fixed top-0 left-0 right-0 z-50">
      <div class="h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 
                  animate-pulse shadow-lg"></div>
      <div class="absolute top-0 left-0 h-1 bg-blue-400 animate-[loading_2s_ease-in-out_infinite]"
           style="width: 0%; animation: loading 2s ease-in-out infinite;"></div>
    </div>
  {/if}

  <!-- ========== SKIP TO CONTENT (Accessibility) ========== -->
  <a 
    href="#main-content" 
    class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
           bg-blue-600 text-white px-4 py-2 rounded-lg z-50 
           focus:outline-none focus:ring-2 focus:ring-blue-300"
  >
    ข้ามไปยังเนื้อหาหลัก
  </a>

  <!-- ========== GLOBAL HEADER ========== -->
  <header 
    class="sticky top-0 z-40 bg-elevated/80 backdrop-blur-md border-b border-primary 
           transition-all duration-300"
    style="height: var(--header-height);"
  >
    <div class="container mx-auto px-4 h-full">
      <div class="flex items-center justify-between h-full">
        
        <!-- Logo and Title -->
        <div class="flex items-center gap-3">
          <div class="flex-shrink-0">
            <!-- App Logo -->
            <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 
                        rounded-lg flex items-center justify-center shadow-md">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          
          <div class="hidden sm:block">
            <h1 class="text-lg font-semibold text-primary thai-text">
              {defaultTitle}
            </h1>
            <p class="text-xs text-secondary">
              เวอร์ชัน 1.0.0
            </p>
          </div>
        </div>

        <!-- Navigation and Actions -->
        <div class="flex items-center gap-2">
          
          <!-- Search Button (placeholder for future) -->
          <button
            type="button"
            class="btn-ghost btn-sm hidden md:flex"
            title="ค้นหา (Ctrl+K)"
            disabled
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span class="hidden lg:inline ml-2">ค้นหา</span>
          </button>

          <!-- Notifications (placeholder for future) -->
          <button
            type="button"
            class="btn-ghost btn-sm relative"
            title="การแจ้งเตือน"
            disabled
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" 
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <!-- Notification badge (hidden for now) -->
            <!-- <span class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span> -->
          </button>

          <!-- Theme Toggle -->
          <ThemeToggle 
            variant="dropdown" 
            size="md" 
            position="right"
            className="hidden sm:block"
          />
          
          <!-- Mobile Theme Toggle -->
          <ThemeToggle 
            variant="icon" 
            size="md"
            className="sm:hidden"
          />

          <!-- User Menu (placeholder for future) -->
          <button
            type="button"
            class="btn-ghost btn-sm"
            title="เมนูผู้ใช้"
            disabled
          >
            <div class="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 
                        rounded-full flex items-center justify-center text-white text-xs font-medium">
              U
            </div>
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- ========== MAIN CONTENT AREA ========== -->
  <main 
    id="main-content"
    class="flex-1 min-h-[calc(100vh-var(--header-height))] 
           focus:outline-none"
    tabindex="-1"
  >
    <!-- Page content will be injected here -->
    {@render children()}
  </main>

  <!-- ========== BACK TO TOP BUTTON ========== -->
  {#if showBackToTop && mounted}
    <button
      type="button"
      onclick={scrollToTop}
      class="fixed bottom-6 right-6 z-30 
             bg-blue-600 hover:bg-blue-700 text-white 
             w-12 h-12 rounded-full shadow-lg hover:shadow-xl 
             transition-all duration-300 transform hover:scale-110
             focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2
             animate-fade-in"
      title="กลับไปด้านบน"
      aria-label="กลับไปด้านบน"
    >
      <svg class="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  {/if}

  <!-- ========== GLOBAL TOAST CONTAINER ========== -->
  <div 
    id="toast-container" 
    class="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none"
    role="region" 
    aria-label="การแจ้งเตือน"
  >
    <!-- Toast notifications will be rendered here by toast system -->
  </div>

  <!-- ========== GLOBAL MODAL CONTAINER ========== -->
  <div 
    id="modal-container" 
    class="relative z-50"
    role="dialog" 
    aria-modal="true"
  >
    <!-- Modal dialogs will be rendered here -->
  </div>

  <!-- ========== GLOBAL LOADING OVERLAY ========== -->
  {#if isLoading}
    <div 
      class="fixed inset-0 bg-overlay/50 backdrop-blur-sm z-40 
             flex items-center justify-center animate-fade-in"
      aria-hidden="true"
    >
      <div class="bg-elevated rounded-lg p-6 shadow-xl max-w-sm w-full mx-4">
        <div class="flex items-center gap-3">
          <div class="loading-spinner"></div>
          <div>
            <p class="text-primary font-medium">กำลังโหลด...</p>
            <p class="text-secondary text-sm">กรุณารอสักครู่</p>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<!-- ============================================ -->
<!-- GLOBAL STYLES & ANIMATIONS -->
<!-- ============================================ -->

<style>
  /* ========== APP-SPECIFIC STYLES ========== */
  
  .app-root {
    min-height: 100vh;
    min-height: 100dvh; /* Dynamic viewport height for mobile */
  }

  /* ========== LOADING ANIMATION ========== */
  
  @keyframes loading {
    0% {
      width: 0%;
      left: 0%;
    }
    50% {
      width: 100%;
      left: 0%;
    }
    100% {
      width: 0%;
      left: 100%;
    }
  }

  /* ========== BACKDROP BLUR FALLBACK ========== */
  
  @supports not (backdrop-filter: blur(12px)) {
    header {
      background-color: var(--bg-elevated);
    }
  }

  /* ========== FOCUS MANAGEMENT ========== */
  
  /* Skip focus management classes since they're not used */

  /* ========== PRINT STYLES ========== */
  
  @media print {
    header,
    #toast-container,
    #modal-container,
    button[title="กลับไปด้านบน"] {
      display: none !important;
    }
    
    .app-root {
      background: white !important;
    }
    
    main {
      min-height: auto !important;
    }
  }

  /* ========== HIGH CONTRAST MODE ========== */
  
  @media (prefers-contrast: high) {
    :global(:root) {
      --border-primary: #000000;
      --text-primary: #000000;
    }
  }

  /* ========== REDUCED MOTION ========== */
  
  @media (prefers-reduced-motion: reduce) {
    .app-root,
    header,
    main,
    button {
      transition: none !important;
    }
    
    .loading-spinner {
      animation: none !important;
    }
  }

  /* ========== MOBILE OPTIMIZATIONS ========== */
  
  @media (max-width: 640px) {
    .container {
      padding-left: 1rem;
      padding-right: 1rem;
    }
  }

  /* ========== TOUCH TARGET IMPROVEMENTS ========== */
  
  @media (pointer: coarse) {
    button {
      min-height: 44px;
      min-width: 44px;
    }
  }
</style>