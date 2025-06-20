<!-- frontend/src/lib/components/dashboard/DashboardNav.svelte -->
<!-- ✅ Fixed infinite loop issues in navigation -->
<!-- Separated effects and simplified state management -->

<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { userStore, userDisplay, userPermissions } from '$lib/stores/user.store';
  import { getActiveMenuSections, type MenuItem, type MenuSection } from '$lib/config/menu.config';
  import { authAPI } from '$lib/api/auth.api';
  import { themeStore } from '$lib/stores/theme.store';
  
  // Lucide icons
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
    Activity,
    ChartBar,
    FileText,
    List,
    Plus,
    History,
    TrendingUp,
    ChartPie,
    Download,
    UsersRound
  } from 'svelte-lucide';
  
  // ============================================
  // PROPS
  // ============================================
  
  interface Props {
    isCollapsed?: boolean;
  }
  
  let { isCollapsed = false }: Props = $props();
  
  // ============================================
  // REACTIVE STATE - แยกให้ชัดเจน
  // ============================================
  
  // Navigation state
  let menuSections = $state<MenuSection[]>([]);
  let expandedSections = $state<Set<string>>(new Set());
  let isMobileMenuOpen = $state<boolean>(false);
  let isUserMenuOpen = $state<boolean>(false);
  let isLoggingOut = $state<boolean>(false);
  
  // ============================================
  // DERIVED STATE - ใช้ $derived แทน effects
  // ============================================
  
  // User state - derived from stores (read-only)
  let userState = $derived($userStore);
  let displayInfo = $derived($userDisplay);
  let permissions = $derived($userPermissions);
  let currentTheme = $derived($themeStore);
  
  // Current route - derived from page store
  let currentRoute = $derived($page.url.pathname);
  
  // Menu sections based on user role - derived
  let availableMenuSections = $derived.by(() => {
    if (userState.user?.userRoleId) {
      return getActiveMenuSections(userState.user.userRoleId);
    }
    return [];
  });
  
  // ============================================
  // SINGLE EFFECT FOR MENU INITIALIZATION
  // ============================================
  
  // Initialize menu when available sections change
  $effect(() => {
    if (availableMenuSections.length > 0) {
      menuSections = availableMenuSections;
      
      // Auto-expand first section only once
      if (expandedSections.size === 0) {
        const firstSection = availableMenuSections[0];
        if (firstSection) {
          expandedSections = new Set([firstSection.id]);
        }
      }
    }
  });
  
  // ============================================
  // EVENT HANDLERS
  // ============================================
  
  function toggleSection(sectionId: string): void {
    const newSet = new Set(expandedSections);
    
    if (newSet.has(sectionId)) {
      newSet.delete(sectionId);
    } else {
      newSet.add(sectionId);
    }
    
    expandedSections = newSet;
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
  
  function getMenuIcon(iconName: string) {
    const iconMap = {
      'layout-dashboard': LayoutDashboard,
      'users': Users,
      'building-2': Building2,
      'activity': Activity,
      'chart-bar': ChartBar,
      'file-text': FileText,
      'list': List,
      'plus': Plus,
      'history': History,
      'trending-up': TrendingUp,
      'chart-pie': ChartPie,
      'download': Download,
      'users-round': UsersRound,
    };
    
    return iconMap[iconName as keyof typeof iconMap] || Activity;
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

<nav class="dashboard-nav h-full flex flex-col border-r"
     style="background-color: var(--surface-primary); border-color: var(--border-primary);"
     class:collapsed={isCollapsed}>

  <!-- Navigation Header -->
  <div class="nav-header p-4 border-b" style="border-color: var(--border-primary);">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg flex items-center justify-center"
             style="background-color: var(--accent-primary); color: var(--surface-primary);">
          <Activity size="20" />
        </div>
        {#if !isCollapsed}
          <div>
            <div class="font-semibold text-sm" style="color: var(--text-primary);">
              ระบบรายงานโรค
            </div>
            <div class="text-xs" style="color: var(--text-secondary);">
              Disease Report System
            </div>
          </div>
        {/if}
      </div>
      
      <!-- Mobile menu toggle -->
      <button
        onclick={toggleMobileMenu}
        class="lg:hidden p-1 rounded"
        style="color: var(--text-secondary);"
      >
        {#if isMobileMenuOpen}
          <X size="20" />
        {:else}
          <Menu size="20" />
        {/if}
      </button>
    </div>
  </div>

  <!-- Navigation Menu -->
  <div class="nav-menu flex-1 overflow-y-auto p-2">
    {#if menuSections.length > 0}
      {#each menuSections as section}
        <div class="menu-section mb-2">
          
          <!-- Section Header -->
          <button
            onclick={() => toggleSection(section.id)}
            class="section-header w-full flex items-center justify-between p-2 rounded-lg transition-colors hover:bg-opacity-50"
            style="background-color: var(--surface-secondary); color: var(--text-secondary);"
          >
            <span class="text-xs font-medium uppercase tracking-wide">
              {#if !isCollapsed}
                {section.title}
              {:else}
                {section.title.charAt(0)}
              {/if}
            </span>
            {#if !isCollapsed}
              {#if expandedSections.has(section.id)}
                <ChevronDown size="14" />
              {:else}
                <ChevronRight size="14" />
              {/if}
            {/if}
          </button>
          
          <!-- Section Items -->
          {#if expandedSections.has(section.id)}
            <div class="section-items mt-1 space-y-1">
              {#each section.items as item}
                {@const IconComponent = getMenuIcon(item.icon)}
                <button
                  onclick={() => handleMenuItemClick(item)}
                  class="menu-item w-full flex items-center gap-3 p-2 rounded-lg transition-all"
                  class:active={isActiveRoute(item.route)}
                  style={isActiveRoute(item.route) 
                    ? `background-color: var(--accent-primary); color: var(--surface-primary);`
                    : `color: var(--text-primary); background-color: transparent;`}
                  title={isCollapsed ? item.title : ''}
                >
                  <IconComponent size="18" />
                  {#if !isCollapsed}
                    <span class="text-sm font-medium">{item.title}</span>
                  {/if}
                  
                  {#if item.badge && !isCollapsed}
                    <span class="ml-auto px-2 py-1 text-xs rounded-full"
                          style="background-color: var(--error); color: var(--surface-primary);">
                      {item.badge}
                    </span>
                  {/if}
                </button>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    {:else}
      <!-- Loading state -->
      <div class="text-center py-8" style="color: var(--text-secondary);">
        <div class="animate-pulse">
          <Activity size="24" class="mx-auto mb-2 opacity-50" />
          <p class="text-sm">กำลังโหลดเมนู...</p>
        </div>
      </div>
    {/if}
  </div>

  <!-- User Profile Section -->
  <div class="nav-footer border-t p-4" style="border-color: var(--border-primary);">
    
    <!-- User Info -->
    {#if displayInfo}
      <div class="user-info mb-3">
        {#if !isCollapsed}
          <div class="text-sm font-medium truncate" style="color: var(--text-primary);">
            {displayInfo.fullName}
          </div>
          <div class="text-xs truncate" style="color: var(--text-secondary);">
            {displayInfo.roleName}
            {#if displayInfo.hospitalName}
              • {displayInfo.hospitalName}
            {/if}
          </div>
        {:else}
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
               style="background-color: var(--accent-primary); color: var(--surface-primary);">
            {displayInfo.fullName.charAt(0)}
          </div>
        {/if}
      </div>
    {/if}
    
    <!-- User Actions -->
    <div class="user-actions space-y-2">
      
      <!-- Profile Button -->
      <button
        onclick={handleProfileClick}
        class="w-full flex items-center gap-3 p-2 rounded-lg transition-colors"
        style="color: var(--text-secondary); background-color: transparent;"
        title={isCollapsed ? 'โปรไฟล์' : ''}
      >
        <User size="16" />
        {#if !isCollapsed}
          <span class="text-sm">โปรไฟล์</span>
        {/if}
      </button>
      
      <!-- Settings Button -->
      <button
        onclick={handleSettingsClick}
        class="w-full flex items-center gap-3 p-2 rounded-lg transition-colors"
        style="color: var(--text-secondary); background-color: transparent;"
        title={isCollapsed ? 'ตั้งค่า' : ''}
      >
        <Settings size="16" />
        {#if !isCollapsed}
          <span class="text-sm">ตั้งค่า</span>
        {/if}
      </button>
      
      <!-- Logout Button -->
      <button
        onclick={handleLogout}
        disabled={isLoggingOut}
        class="w-full flex items-center gap-3 p-2 rounded-lg transition-colors"
        style="color: var(--error); background-color: transparent;"
        title={isCollapsed ? 'ออกจากระบบ' : ''}
      >
        <LogOut size="16" />
        {#if !isCollapsed}
          <span class="text-sm">
            {isLoggingOut ? 'กำลังออก...' : 'ออกจากระบบ'}
          </span>
        {/if}
      </button>
      
    </div>
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
  
  .dashboard-nav.collapsed {
    width: 80px;
  }
  
  .menu-item:hover {
    background-color: var(--surface-hover) !important;
  }
  
  .menu-item.active {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .user-actions button:hover {
    background-color: var(--surface-secondary) !important;
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
    
    .dashboard-nav.mobile-open {
      transform: translateX(0);
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