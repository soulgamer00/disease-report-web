<!-- frontend/src/routes/dashboard/+layout.svelte -->
<!-- ✅ MINIMAL FIX - เก็บโครงสร้างเดิม แค่เปลี่ยน userStore เป็น authStore -->

<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '$lib/stores/auth.store'; // ✅ เปลี่ยนจาก userStore
  import type { LayoutData } from './$types';
  
  // Props (เหมือนเดิม)
  interface Props {
    children: import('svelte').Snippet;
    data: LayoutData;
  }
  
  let { children, data }: Props = $props();
  
  // State (เหมือนเดิม)
  let mounted = $state(false);
  
  // Lifecycle
  onMount(() => {
    console.log('🔐 Dashboard layout mounted');
    console.log('📋 Layout data:', data);
    
    // ✅ แค่เปลี่ยนบรรทัดนี้ - sync auth store กับ server data
    authStore.initializeFromServer({
      user: data.user,
      isAuthenticated: data.isAuthenticated
    });
    
    mounted = true;
  });
</script>

<!-- Layout เหมือนเดิมทุกอย่าง -->
{#if mounted}
  {@render children()}
{:else}
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

<!-- Styles เหมือนเดิม -->
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