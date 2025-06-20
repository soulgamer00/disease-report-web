<!-- frontend/src/lib/components/dashboard/DashboardNav.svelte -->
<!-- ✅ Role-based navigation menu for dashboard -->
<!-- Dynamic menu based on user permissions with modern styling -->

<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { userStore, userDisplay, userPermissions } from '$lib/stores/user.store';
  import { getActiveMenuSections, type MenuItem, type MenuSection } from '$lib/config/menu.config';
  import { authAPI } from '$lib/api/auth.api';
  import { themeStore } from '$lib/stores/theme.store';
  
  // Lucide icons from svelte-lucide (v2.x for Svelte 5)
  import { 
    ChevronDown, 
    ChevronRight, 
    LogOut, 
    Menu, 
    X,
    User,
    Settings,
    LayoutDashboard,
    Users,
    Building2,
    Activity,      // แทน Virus
    ChartBar,      // แทน BarChart3
    FileText,
    List,
    Plus,          // แทน PlusCircle
    History,
    TrendingUp,
    ChartPie,      // แทน PieChart
    Download,
    UsersRound     // แทน Users2
  } from 'svelte-lucide';
  
  // ============================================
  // PROPS
  // ============================================
  
  interface Props {
    isCollapsed?: boolean;
  }
  
  let { isCollapsed = false }: Props = $props();
  
  // ============================================
  // REACTIVE STATE
  // ============================================
  
  // User and theme state
  let userState = $state($userStore);
  let displayInfo = $state($userDisplay);
  let permissions = $state($userPermissions);
  let currentTheme = $state($themeStore);
  
  // Navigation state
  let menuSections = $state<MenuSection[]>([]);
  let expandedSections = $state<Set<string>>(new Set());
  let isMobileMenuOpen = $state<boolean>(false);
  let isUserMenuOpen = $state<boolean>(false);
  let isLoggingOut = $state<boolean>(false);
  
  // Current route tracking
  let currentRoute = $state<string>('');
  
  // ============================================
  // REACTIVE UPDATES
  // ============================================
  
  $effect(() => {
    userState = $userStore;
    displayInfo = $userDisplay;
    permissions = $userPermissions;
    currentTheme = $themeStore;
    
    // Update menu when user changes
    if (userState.user?.userRoleId) {
      menuSections = getActiveMenuSections(userState.user.userRoleId);
      
      // Auto-expand first section
      if (menuSections.length > 0 && expandedSections.size === 0) {
        expandedSections.add(menuSections[0].id);
        expandedSections = new Set(expandedSections); // Trigger reactivity
      }
    }
  });
  
  $effect(() => {
    currentRoute = $page.url.pathname;
  });
  
  // ============================================
  // EVENT HANDLERS
  // ============================================
  
  function toggleSection(sectionId: string): void {
    if (expandedSections.has(sectionId)) {
      expandedSections.delete(sectionId);
    } else {
      expandedSections.add(sectionId);
    }
    expandedSections = new Set(expandedSections); // Trigger reactivity
  }
  
  function handleMenuItemClick(item: MenuItem): void {
    // Close mobile menu
    isMobileMenuOpen = false;
    
    // Navigate to route
    goto(item.route);
  }
  
  function toggleMobileMenu(): void {
    isMobileMenuOpen = !isMobileMenuOpen;
  }
  
  function toggleUserMenu(): void {
    isUserMenuOpen = !isUserMenuOpen;
  }
  
  function handleClickOutside(event: MouseEvent): void {
    const target = event.target as Element;
    if (!target.closest('.user-menu-container')) {
      isUserMenuOpen = false;
    }
  }
  
  async function handleLogout(): Promise<void> {
    if (isLoggingOut) return;
    
    try {
      isLoggingOut = true;
      await authAPI.logout();
      userStore.clearUser();
      goto('/login?logout=success');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API fails
      userStore.clearUser();
      goto('/login');
    } finally {
      isLoggingOut = false;
    }
  }
  
  function isActiveRoute(route: string): boolean {
    if (route === '/dashboard') {
      return currentRoute === '/dashboard';
    }
    return currentRoute.startsWith(route);
  }
  
  function handleProfileClick(): void {
    isUserMenuOpen = false;
    goto('/profile');
  }
  
  function handleSettingsClick(): void {
    isUserMenuOpen = false;
    goto('/settings');
  }
  
  // ============================================
  // LIFECYCLE
  // ============================================
  
  onMount(() => {
    // Close user menu when clicking outside
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
</script>

<!-- ============================================ -->
<!-- NAVIGATION COMPONENT -->
<!-- ============================================ -->

<nav class="dashboard-nav h-full flex flex-col" 
     style="background-color: var(--surface-primary); border-right: 1px solid var(--border-primary);">
  
  <!-- Header Section -->
  <div class="nav-header p-4 border-b" style="border-color: var(--border-primary);">
    
    <!-- Mobile Menu Toggle -->
    <div class="flex items-center justify-between lg:justify-center">
      <button 
        class="lg:hidden p-2 rounded-lg hover:bg-opacity-10"
        style="color: var(--text-primary); background-color: var(--surface-hover);"
        onclick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        {#if isMobileMenuOpen}
          <X size="24" />
        {:else}
          <Menu size="24" />
        {/if}
      </button>
      
      <!-- Logo/Title -->
      <div class="flex items-center gap-3" class:hidden={isCollapsed}>
        <div class="w-8 h-8 rounded-lg flex items-center justify-center"
             style="background-color: var(--primary-500); color: white;">
          <span class="font-bold text-sm">DR</span>
        </div>
        <div class="hidden lg:block">
          <h1 class="font-semibold text-lg" style="color: var(--text-primary);">
            Disease Report
          </h1>
          <p class="text-xs" style="color: var(--text-secondary);">
            ระบบรายงานโรค
          </p>
        </div>
      </div>
    </div>
  </div>
  
  <!-- User Info Section -->
  {#if displayInfo}
    <div class="user-info p-4 border-b" style="border-color: var(--border-primary);">
      <div class="user-menu-container relative">
        <button 
          class="w-full flex items-center gap-3 p-2 rounded-lg transition-colors"
          style="color: var(--text-primary);"
          class:bg-opacity-10={isUserMenuOpen}
          style:background-color={isUserMenuOpen ? 'var(--surface-hover)' : 'transparent'}
          onclick={toggleUserMenu}
        >
          <!-- Avatar -->
          <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
               style="background-color: var(--primary-100); color: var(--primary-600);">
            {displayInfo.initials}
          </div>
          
          <!-- User Details -->
          <div class="flex-1 text-left" class:hidden={isCollapsed}>
            <div class="font-medium text-sm truncate">
              {displayInfo.fullName}
            </div>
            <div class="text-xs opacity-70 truncate">
              {displayInfo.roleName}
            </div>
          </div>
          
          <!-- Dropdown Arrow -->
          <div 
            class="w-4 h-4 transition-transform flex items-center justify-center"
            class:rotate-180={isUserMenuOpen}
            class:hidden={isCollapsed}
          >
            <ChevronDown size="16" />
          </div>
        </button>
        
        <!-- User Dropdown Menu -->
        {#if isUserMenuOpen && !isCollapsed}
          <div class="absolute top-full left-0 right-0 mt-2 py-2 rounded-lg shadow-lg z-50"
               style="background-color: var(--surface-primary); border: 1px solid var(--border-primary);">
            
            <!-- Hospital Info -->
            <div class="px-3 py-2 border-b" style="border-color: var(--border-primary);">
              <div class="text-xs opacity-60" style="color: var(--text-secondary);">
                โรงพยาบาล
              </div>
              <div class="text-sm font-medium truncate" style="color: var(--text-primary);">
                {displayInfo.hospitalName}
              </div>
            </div>
            
            <!-- Menu Items -->
            <button 
              class="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
              style="color: var(--text-primary);"
              onclick={handleProfileClick}
            >
              <User size="16" />
              <span>ข้อมูลโปรไฟล์</span>
            </button>
            
            {#if permissions.isSuperadmin}
              <button 
                class="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                style="color: var(--text-primary);"
                onclick={handleSettingsClick}
              >
                <Settings size="16" />
                <span>ตั้งค่าระบบ</span>
              </button>
            {/if}
            
            <hr class="my-1" style="border-color: var(--border-primary);">
            
            <button 
              class="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
              style="color: var(--error-600);"
              onclick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut size="16" />
              <span>{isLoggingOut ? 'กำลังออกจากระบบ...' : 'ออกจากระบบ'}</span>
            </button>
          </div>
        {/if}
      </div>
    </div>
  {/if}
  
  <!-- Navigation Menu -->
  <div class="nav-menu flex-1 overflow-y-auto p-4 space-y-2">
    
    <!-- Mobile Overlay -->
    {#if isMobileMenuOpen}
      <button
        class="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
        onclick={toggleMobileMenu}
        aria-label="Close mobile menu"
        type="button"
      ></button>
    {/if}
    
    <!-- Menu Sections -->
    <div 
      class="space-y-4 lg:block"
      class:hidden={!isMobileMenuOpen}
      style:transform={isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)'}
    >
      {#each menuSections as section (section.id)}
        <div class="menu-section">
          
          <!-- Section Header -->
          <button 
            class="w-full flex items-center justify-between p-2 rounded-lg text-sm font-medium transition-colors"
            style="color: var(--text-secondary);"
            onclick={() => toggleSection(section.id)}
            class:hidden={isCollapsed}
          >
            <span>{section.title}</span>
            <div 
              class="w-4 h-4 transition-transform flex items-center justify-center"
              class:rotate-90={expandedSections.has(section.id)}
            >
              <ChevronRight size="16" />
            </div>
          </button>
          
          <!-- Section Items -->
          {#if expandedSections.has(section.id) || isCollapsed}
            <div class="menu-items space-y-1 mt-2" class:mt-0={isCollapsed}>
              {#each section.items as item (item.id)}
                <button
                  class="w-full flex items-center gap-3 p-3 rounded-lg text-sm transition-colors group relative"
                  style="color: var(--text-primary);"
                  style:background-color={isActiveRoute(item.route) ? 'var(--primary-100)' : 'transparent'}
                  style:color={isActiveRoute(item.route) ? 'var(--primary-600)' : 'var(--text-primary)'}
                  onclick={() => handleMenuItemClick(item)}
                  title={isCollapsed ? item.title : item.description}
                  type="button"
                >
                  <!-- Icon -->
                  <div class="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                    <!-- Dynamic Lucide icon based on item.icon -->
                    {#if item.icon === 'layout-dashboard'}
                      <LayoutDashboard size="18" />
                    {:else if item.icon === 'users'}
                      <Users size="18" />
                    {:else if item.icon === 'building-2'}
                      <Building2 size="18" />
                    {:else if item.icon === 'virus'}
                      <Activity size="18" />
                    {:else if item.icon === 'bar-chart-3'}
                      <ChartBar size="18" />
                    {:else if item.icon === 'file-text'}
                      <FileText size="18" />
                    {:else if item.icon === 'list'}
                      <List size="18" />
                    {:else if item.icon === 'plus-circle'}
                      <Plus size="18" />
                    {:else if item.icon === 'history'}
                      <History size="18" />
                    {:else if item.icon === 'trending-up'}
                      <TrendingUp size="18" />
                    {:else if item.icon === 'pie-chart'}
                      <ChartPie size="18" />
                    {:else if item.icon === 'download'}
                      <Download size="18" />
                    {:else if item.icon === 'users-2'}
                      <UsersRound size="18" />
                    {:else if item.icon === 'settings'}
                      <Settings size="18" />
                    {:else if item.icon === 'user-circle'}
                      <User size="18" />
                    {:else if item.icon === 'stethoscope'}
                      <div class="w-4 h-4 border-2 border-current rounded-full relative">
                        <div class="absolute top-1 left-1 w-1 h-1 bg-current rounded-full"></div>
                      </div>
                    {:else if item.icon === 'clipboard-list'}
                      <div class="w-4 h-4 border-2 border-current rounded-sm relative">
                        <div class="absolute top-1 left-1 right-1 h-0.5 bg-current"></div>
                        <div class="absolute top-2 left-1 right-1 h-0.5 bg-current"></div>
                        <div class="absolute top-3 left-1 right-1 h-0.5 bg-current"></div>
                      </div>
                    {:else}
                      <!-- Fallback icon -->
                      <div class="w-4 h-4 border-2 border-current rounded"></div>
                    {/if}
                  </div>
                  
                  <!-- Label -->
                  <span class="truncate" class:hidden={isCollapsed}>
                    {item.title}
                  </span>
                  
                  <!-- Badge -->
                  {#if item.badge && !isCollapsed}
                    <div class="ml-auto px-2 py-0.5 rounded-full text-xs"
                         style="background-color: var(--primary-100); color: var(--primary-600);">
                      {item.badge}
                    </div>
                  {/if}
                  
                  <!-- Active Indicator -->
                  {#if isActiveRoute(item.route)}
                    <div class="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 rounded-r"
                         style="background-color: var(--primary-500);"></div>
                  {/if}
                </button>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
  
  <!-- Footer Section -->
  <div class="nav-footer p-4 border-t" style="border-color: var(--border-primary);">
    <!-- Theme Toggle -->
    <button 
      class="w-full flex items-center gap-3 p-2 rounded-lg text-sm transition-colors"
      style="color: var(--text-secondary);"
      onclick={() => themeStore.toggle()}
      title="เปลี่ยนธีม"
    >
      <div class="w-5 h-5 flex items-center justify-center">
        {#if currentTheme.effectiveTheme === 'dark'}
          🌙
        {:else}
          ☀️
        {/if}
      </div>
      <span class:hidden={isCollapsed}>
        {currentTheme.effectiveTheme === 'dark' ? 'โหมดมืด' : 'โหมดสว่าง'}
      </span>
    </button>
  </div>
</nav>

<!-- ============================================ -->
<!-- COMPONENT STYLES -->
<!-- ============================================ -->

<style>
  .dashboard-nav {
    width: 280px;
    transition: width 0.3s ease;
  }
  
  .menu-items button:hover {
    background-color: var(--surface-hover) !important;
  }
  
  @media (max-width: 1024px) {
    .dashboard-nav {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      z-index: 50;
      transform: translateX(-100%);
      transition: transform 0.3s ease;
    }
  }
  
  /* Custom scrollbar */
  .nav-menu::-webkit-scrollbar {
    width: 4px;
  }
  
  .nav-menu::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .nav-menu::-webkit-scrollbar-thumb {
    background: var(--border-primary);
    border-radius: 2px;
  }
  
  .nav-menu::-webkit-scrollbar-thumb:hover {
    background: var(--text-secondary);
  }
</style>