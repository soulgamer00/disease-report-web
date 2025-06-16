<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import '../app.css';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { authStore, user, isAuthenticated } from '$lib/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let { children } = $props();

  // ============================================
  // REACTIVE STATE
  // ============================================
  
  let showUserMenu = $state(false);

  // ============================================
  // COMPUTED VALUES
  // ============================================
  
  const isLoginPage = $derived($page.url.pathname === '/login');
  const showNavigation = $derived($isAuthenticated && !isLoginPage);
  const currentUser = $derived($user);

  // ============================================
  // EVENT HANDLERS
  // ============================================

  function handleLogout(): void {
    showUserMenu = false;
    authStore.logout();
  }

  function toggleUserMenu(): void {
    showUserMenu = !showUserMenu;
  }

  function closeUserMenu(): void {
    showUserMenu = false;
  }

  function getUserDisplayName(): string {
    if (!currentUser) return 'ผู้ใช้งาน';
    return currentUser.name || currentUser.username || 'ผู้ใช้งาน';
  }

  function getRoleDisplayName(): string {
    if (!currentUser) return '';
    
    const roleNames = {
      'SUPERADMIN': 'ผู้ดูแลระบบหลัก',
      'ADMIN': 'ผู้ดูแลระบบ', 
      'USER': 'ผู้ใช้งาน'
    };
    
    return roleNames[currentUser.userRole] || currentUser.userRole;
  }

  // ============================================
  // LIFECYCLE
  // ============================================

  onMount(() => {
    // Close user menu when clicking outside
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        showUserMenu = false;
      }
    }

    if (browser) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  });
</script>

<!-- ============================================ -->
<!-- MAIN LAYOUT -->
<!-- ============================================ -->

<div class="min-h-screen bg-gray-50">
  
  <!-- Navigation Header (show only when authenticated and not on login page) -->
  {#if showNavigation}
    <header class="bg-white shadow-sm border-b sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          
          <!-- Logo and Title -->
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <h1 class="text-xl font-semibold text-gray-900">ระบบรายงานโรค</h1>
              <p class="text-sm text-gray-500">จังหวัดเพชรบูรณ์</p>
            </div>
          </div>

          <!-- Navigation Menu -->
          <nav class="hidden md:flex space-x-8">
            <a 
              href="/patients" 
              class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 {$page.url.pathname === '/patients' ? 'text-blue-600 bg-blue-50' : ''}"
            >
              รายการผู้ป่วย
            </a>
            <a 
              href="/reports" 
              class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 {$page.url.pathname.startsWith('/reports') ? 'text-blue-600 bg-blue-50' : ''}"
            >
              รายงาน
            </a>
            {#if currentUser?.userRoleId && currentUser.userRoleId <= 2}
              <a 
                href="/admin" 
                class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 {$page.url.pathname.startsWith('/admin') ? 'text-blue-600 bg-blue-50' : ''}"
              >
                จัดการระบบ
              </a>
            {/if}
          </nav>

          <!-- User Menu -->
          <div class="relative user-menu-container">
            <button
              type="button"
              class="flex items-center text-sm rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 p-2 hover:bg-gray-50 transition-colors duration-200"
              onclick={toggleUserMenu}
              aria-expanded={showUserMenu}
              aria-haspopup="true"
            >
              <div class="flex items-center">
                <!-- User Avatar -->
                <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                
                <!-- User Info -->
                <div class="ml-3 text-left hidden sm:block">
                  <div class="text-sm font-medium text-gray-900">{getUserDisplayName()}</div>
                  <div class="text-xs text-gray-500">{getRoleDisplayName()}</div>
                </div>
                
                <!-- Dropdown Arrow -->
                <svg class="ml-2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            <!-- Dropdown Menu -->
            {#if showUserMenu}
              <div class="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <div class="py-1">
                  
                  <!-- User Info Header -->
                  <div class="px-4 py-3 border-b border-gray-100">
                    <div class="text-sm font-medium text-gray-900">{getUserDisplayName()}</div>
                    <div class="text-sm text-gray-500">{currentUser?.username}</div>
                    <div class="text-xs text-gray-400 mt-1">
                      {getRoleDisplayName()}
                      {#if currentUser?.hospital}
                        • {currentUser.hospital.hospitalName}
                      {/if}
                    </div>
                  </div>

                  <!-- Menu Items -->
                  <a 
                    href="/profile" 
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                    onclick={closeUserMenu}
                  >
                    <div class="flex items-center">
                      <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      ข้อมูลส่วนตัว
                    </div>
                  </a>

                  <a 
                    href="/profile/settings" 
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                    onclick={closeUserMenu}
                  >
                    <div class="flex items-center">
                      <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      ตั้งค่า
                    </div>
                  </a>

                  <div class="border-t border-gray-100 my-1"></div>

                  <button 
                    type="button"
                    class="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors duration-150"
                    onclick={handleLogout}
                  >
                    <div class="flex items-center">
                      <svg class="w-4 h-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      ออกจากระบบ
                    </div>
                  </button>

                </div>
              </div>
            {/if}
          </div>

        </div>
      </div>

      <!-- Mobile Navigation (if needed) -->
      <div class="md:hidden border-t border-gray-200">
        <div class="px-2 pt-2 pb-3 space-y-1 bg-white">
          <a 
            href="/patients" 
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50 {$page.url.pathname === '/patients' ? 'text-blue-600 bg-blue-50' : ''}"
          >
            รายการผู้ป่วย
          </a>
          <a 
            href="/reports" 
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50 {$page.url.pathname.startsWith('/reports') ? 'text-blue-600 bg-blue-50' : ''}"
          >
            รายงาน
          </a>
          {#if currentUser?.userRoleId && currentUser.userRoleId <= 2}
            <a 
              href="/admin" 
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50 {$page.url.pathname.startsWith('/admin') ? 'text-blue-600 bg-blue-50' : ''}"
            >
              จัดการระบบ
            </a>
          {/if}
        </div>
      </div>

    </header>
  {/if}

  <!-- Main Content -->
  <main class="flex-1">
    {@render children()}
  </main>

  <!-- Footer (optional) -->
  {#if showNavigation}
    <footer class="bg-white border-t border-gray-200 mt-auto">
      <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <div class="text-sm text-gray-500">
            © 2025 สำนักงานสาธารณสุขจังหวัดเพชรบูรณ์
          </div>
          <div class="text-sm text-gray-500">
            เวอร์ชัน 1.0.0
          </div>
        </div>
      </div>
    </footer>
  {/if}

</div>