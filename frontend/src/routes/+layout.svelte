<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { authAPI, checkAuth } from '$lib/api';
  import type { UserInfo } from '$lib/types/backend';
  
  // Svelte 5 runes for state management
  let user = $state<UserInfo | null>(null);
  let isLoading = $state(true);
  let isAuthenticated = $state(false);
  let currentPath = $state('');
  
  // Update current path
  onMount(() => {
    currentPath = window.location.pathname;
    
    // Listen for navigation changes
    const handleNavigation = () => {
      currentPath = window.location.pathname;
    };
    
    window.addEventListener('popstate', handleNavigation);
    
    return () => {
      window.removeEventListener('popstate', handleNavigation);
    };
  });
  
  // Check authentication on mount
  onMount(async () => {
    try {
      const authStatus = await checkAuth();
      isAuthenticated = authStatus;
      
      if (authStatus) {
        const profile = await authAPI.getProfile();
        user = profile.data.user;
      }
      
      // TODO: Add navigation guard back later after debugging
      console.log('Auth status:', authStatus, 'Current path:', currentPath);
      
    } catch (error) {
      console.error('Auth check failed:', error);
      isAuthenticated = false;
      user = null;
    } finally {
      isLoading = false;
    }
  });
  
  // Handle logout
  async function handleLogout() {
    try {
      await authAPI.logout();
      user = null;
      isAuthenticated = false;
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      // Force redirect even if logout API fails
      window.location.href = '/login';
    }
  }
  
  // Remove the $effect navigation guard - handled in onMount now
  
  // Get user role display name
  function getUserRoleDisplay(role: string): string {
    switch (role) {
      case 'SUPERADMIN': return 'ผู้ดูแลระบบสูงสุด';
      case 'ADMIN': return 'ผู้ดูแลระบบ';
      case 'USER': return 'ผู้ใช้งาน';
      default: return 'ผู้ใช้งาน';
    }
  }
  
  // Navigation items with $derived
  const navigationItems = $derived(user ? [
    {
      href: '/patients',
      label: 'ข้อมูลผู้ป่วย',
      icon: '👥',
      visible: true
    },
    {
      href: '/reports',
      label: 'รายงานและสถิติ',
      icon: '📊',
      visible: true
    },
    {
      href: '/diseases',
      label: 'จัดการโรค',
      icon: '🦠',
      visible: user.userRoleId <= 2 // Admin and Superadmin only
    },
    {
      href: '/users',
      label: 'จัดการผู้ใช้',
      icon: '👤',
      visible: user.userRoleId <= 2 // Admin and Superadmin only
    }
  ].filter(item => item.visible) : []);

  // Component slots (use traditional slot syntax)
  // const { children } = $props(); // Remove this line
</script>

<svelte:head>
  <title>ระบบรายงานโรค</title>
</svelte:head>

{#if isLoading}
  <!-- Loading screen -->
  <div class="min-h-screen bg-slate-50 flex items-center justify-center">
    <div class="text-center">
      <div class="loading-spinner mx-auto mb-4"></div>
      <p class="text-slate-600 thai-text">กำลังโหลด...</p>
    </div>
  </div>
{:else if isAuthenticated}
  <!-- Authenticated layout -->
  <div class="min-h-screen bg-slate-50">
    <!-- Navigation header -->
    <nav class="bg-white shadow-sm border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo and main nav -->
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-semibold text-slate-900 thai-text">
                ระบบรายงานโรค
              </h1>
            </div>
            
            <!-- Navigation links -->
            <div class="hidden sm:ml-8 sm:flex sm:space-x-8">
              {#each navigationItems as item}
                <a
                  href={item.href}
                  class="inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors
                    {currentPath === item.href 
                      ? 'border-primary-500 text-slate-900' 
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}"
                >
                  <span class="mr-2">{item.icon}</span>
                  <span class="thai-text">{item.label}</span>
                </a>
              {/each}
            </div>
          </div>
          
          <!-- User menu -->
          <div class="flex items-center space-x-4">
            {#if user}
              <div class="text-sm text-slate-700 thai-text hidden md:block">
                <div class="font-medium">{user.name}</div>
                <div class="text-xs text-slate-500">
                  {getUserRoleDisplay(user.userRole)}
                  {#if user.hospital}
                    • {user.hospital.hospitalName}
                  {/if}
                </div>
              </div>
            {/if}
            
            <button
              onclick={handleLogout}
              class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-md text-sm font-medium transition-colors thai-text"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>
      
      <!-- Mobile navigation -->
      <div class="sm:hidden">
        <div class="pt-2 pb-3 space-y-1 border-t border-slate-200">
          {#each navigationItems as item}
            <a
              href={item.href}
              class="block pl-3 pr-4 py-2 text-base font-medium transition-colors thai-text
                {currentPath === item.href
                  ? 'bg-primary-50 border-r-4 border-primary-500 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'}"
            >
              <span class="mr-3">{item.icon}</span>
              {item.label}
            </a>
          {/each}
        </div>
      </div>
    </nav>
    
    <!-- Main content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      {@render children()}
    </main>
    
    <!-- Footer -->
    <footer class="bg-white border-t border-slate-200 mt-auto">
      <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div class="text-center text-sm text-slate-500 thai-text">
          © 2025 ระบบรายงานโรค - เวอร์ชัน 1.0.0
        </div>
      </div>
    </footer>
  </div>
{:else}
  <!-- Unauthenticated layout -->
  <div class="min-h-screen bg-slate-50">
    {@render children()}
  </div>
{/if}

<!-- Global styles for network status -->
<style>
  :global(.offline) {
    filter: grayscale(0.5);
  }
  
  :global(.offline::before) {
    content: "⚠️ ไม่มีการเชื่อมต่ออินเทอร์เน็ต";
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #ef4444;
    color: white;
    text-align: center;
    padding: 0.5rem;
    font-size: 0.875rem;
    z-index: 9999;
  }
</style>