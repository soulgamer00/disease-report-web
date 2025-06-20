<!-- frontend/src/routes/dashboard/+layout.svelte -->
<!-- ✅ Dashboard protected layout -->
<!-- Wraps all dashboard pages with authentication check -->

<script lang="ts">
  import { onMount } from 'svelte';
  import { userStore } from '$lib/stores/user.store';
  import type { LayoutData } from './$types';
  
  // ============================================
  // PROPS
  // ============================================
  
  interface Props {
    children: import('svelte').Snippet;
    data: LayoutData;
  }
  
  let { children, data }: Props = $props();
  
  // ============================================
  // REACTIVE STATE
  // ============================================
  
  let mounted = $state(false);
  
  // ============================================
  // LIFECYCLE
  // ============================================
  
  onMount(() => {
    console.log('🔐 Dashboard layout mounted');
    console.log('📋 Layout data:', data);
    
    // Initialize user store if needed
    if (!userStore.getCurrentState().isAuthenticated) {
      userStore.init();
    }
    
    mounted = true;
  });
</script>

<!-- ============================================ -->
<!-- DASHBOARD LAYOUT -->
<!-- ============================================ -->

{#if mounted}
  <!-- Dashboard content -->
  {@render children()}
{:else}
  <!-- Loading state while initializing -->
  <div class="min-h-screen flex items-center justify-center" 
       style="background-color: var(--surface-secondary);">
    <div class="text-center">
      <div class="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full mx-auto mb-4"
           style="border-color: var(--accent-primary);">
      </div>
      <p style="color: var(--text-secondary);">กำลังโหลด...</p>
    </div>
  </div>
{/if}

<!-- ============================================ -->
<!-- STYLES -->
<!-- ============================================ -->

<style>
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
</style>