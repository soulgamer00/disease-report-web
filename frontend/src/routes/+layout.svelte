<!-- src/routes/+layout.svelte -->
<!-- Root layout for the entire application -->
<script lang="ts">
  import { browser } from '$app/environment';
  import { navigating, page } from '$app/stores';
  import { onMount } from 'svelte';
  import '../app.css'; // Import global styles (if you have one)

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
  
  // Loading state
  let isLoading = $state(false);
  
  // Page transitions
  $effect(() => {
    isLoading = !!$navigating;
  });

  // ============================================
  // LIFECYCLE
  // ============================================
  
  onMount(() => {
    // Initialize app on client-side
    if (browser) {
      console.log('🚀 SvelteKit 5 App Initialized');
    }
  });

  // ============================================
  // PAGE METADATA
  // ============================================
  
  const defaultTitle = 'ระบบรายงานโรค';
  const defaultDescription = 'ระบบรายงานการติดตาม การเฝ้าระวัง และควบคุมโรค';
</script>

<!-- ============================================ -->
<!-- PAGE HEAD (SEO & Meta) -->
<!-- ============================================ -->

<svelte:head>
  <title>{defaultTitle}</title>
  <meta name="description" content={defaultDescription} />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta charset="utf-8" />
  
  <!-- Thai language support -->
  <html lang="th"></html>
  
  <!-- Favicon -->
  <link rel="icon" type="image/png" href="/favicon.png" />
  
  <!-- Fonts (if needed) -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
</svelte:head>

<!-- ============================================ -->
<!-- MAIN APPLICATION STRUCTURE -->
<!-- ============================================ -->

<div class="min-h-screen bg-gray-50">
  
  <!-- Global Loading Indicator -->
  {#if isLoading}
    <div class="fixed top-0 left-0 right-0 z-50">
      <div class="h-1 bg-blue-600 animate-pulse"></div>
    </div>
  {/if}

  <!-- Main Content Area -->
  <main class="min-h-screen">
    <!-- SvelteKit will inject page content here -->
    {@render children()}
  </main>
  
  <!-- Global Toast/Notification Area (if needed) -->
  <div id="toast-container" class="fixed bottom-4 right-4 z-50 space-y-2">
    <!-- Toast notifications will be rendered here -->
  </div>
  
</div>

<!-- ============================================ -->
<!-- GLOBAL STYLES -->
<!-- ============================================ -->

<style>
  :global(html) {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    scroll-behavior: smooth;
  }
  
  :global(body) {
    margin: 0;
    padding: 0;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  /* Custom scrollbar */
  :global(::-webkit-scrollbar) {
    width: 8px;
  }
  
  :global(::-webkit-scrollbar-track) {
    background: #f1f5f9;
  }
  
  :global(::-webkit-scrollbar-thumb) {
    background: #cbd5e1;
    border-radius: 4px;
  }
  
  :global(::-webkit-scrollbar-thumb:hover) {
    background: #94a3b8;
  }
  
  /* Focus styles */
  :global(*:focus-visible) {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
  
  /* Loading animation */
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
  
  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
</style>