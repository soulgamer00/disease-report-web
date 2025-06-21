<!-- frontend/src/lib/components/dashboard/DashboardNav.svelte -->
<!-- ✅ SIMPLE FIX - เปลี่ยนแค่ userStore เป็น authStore -->

<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  
  // ✅ เปลี่ยนเฉพาะบรรทัดนี้
  import { authStore, userDisplayInfo } from '$lib/stores/auth.store';
  import { getActiveMenuSections, type MenuItem, type MenuSection } from '$lib/config/menu.config';
  import { themeStore } from '$lib/stores/theme.store';
  
  // Lucide icons (เหมือนเดิม)
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
  
  // Props (เหมือนเดิม)
  interface Props {
    isCollapsed?: boolean;
  }
  
  let { isCollapsed = false }: Props = $props();
  
  // State (เหมือนเดิม)
  let menuSections = $state<MenuSection[]>([]);
  let expandedSections = $state<Set<string>>(new Set());
  let isMobileMenuOpen = $state<boolean>(false);
  let isUserMenuOpen = $state<boolean>(false);
  let isLoggingOut = $state<boolean>(false);
  
  // ✅ เปลี่ยนเฉพาะ 3 บรรทัดนี้
  let userState = $derived($authStore);
  let displayInfo = $derived($userDisplayInfo);
  let currentTheme = $derived($themeStore);
  
  // เหมือนเดิม
  let currentRoute = $derived($page.url.pathname);
  
  let availableMenuSections = $derived.by(() => {
    if (userState.user?.userRoleId) {
      return getActiveMenuSections(userState.user.userRoleId);
    }
    return [];
  });
  
  // Effects (เหมือนเดิม)
  $effect(() => {
    if (availableMenuSections.length > 0) {
      menuSections = availableMenuSections;
      
      if (expandedSections.size === 0) {
        const firstSection = availableMenuSections[0];
        if (firstSection) {
          expandedSections = new Set([firstSection.id]);
        }
      }
    }
  });
  
  // Functions (เหมือนเดิม)
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
    isMobileMenuOpen = false;
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
  
  // ✅ เปลี่ยนเฉพาะ function นี้
  async function handleLogout(): Promise<void> {
    if (isLoggingOut) return;
    
    try {
      isLoggingOut = true;
      await authStore.logout();
      goto('/login?logout=success');
    } catch (error) {
      console.error('Logout error:', error);
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
  
  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
</script>

<!-- HTML เหมือนเดิมทุกบรรทัด ไม่เปลี่ยนเลย -->
<nav class="dashboard-nav h-full flex flex-col border-r"
     style="background-color: var(--surface-primary); border-color: var(--border-primary);"
     class:collapsed={isCollapsed}>

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

  <div class="nav-menu flex-1 overflow-y-auto p-2">
    {#if menuSections.length > 0}
      {#each menuSections as section}
        <div class="menu-section mb-2">
          
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
          
          {#if expandedSections.has(section.id)}
            <div class="section-items mt-1 space-y-1">
              {#each section.items as item}
                <button
                  onclick={() => handleMenuItemClick(item)}
                  class="menu-item w-full flex items-center gap-3 p-2 rounded-lg transition-all"
                  class:active={isActiveRoute(item.route)}
                  style={isActiveRoute(item.route) 
                    ? `background-color: var(--accent-primary); color: var(--surface-primary);`
                    : `color: var(--text-primary); background-color: transparent;`}
                  title={isCollapsed ? item.title : ''}
                >
                  <svelte:component this={getMenuIcon(item.icon)} size="16" />
                  {#if !isCollapsed}
                    <span class="text-sm">{item.title}</span>
                  {/if}
                </button>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    {:else}
      <div class="p-4 text-center" style="color: var(--text-secondary);">
        <div class="animate-pulse">กำลังโหลดเมนู...</div>
      </div>
    {/if}
  </div>

  <div class="nav-footer border-t p-2" style="border-color: var(--border-primary);">
    
    {#if displayInfo}
      <div class="user-info p-2 mb-2 rounded-lg" style="background-color: var(--surface-secondary);">
        {#if !isCollapsed}
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
                 style="background-color: var(--accent-primary); color: var(--surface-primary);">
              {displayInfo.initials}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium truncate" style="color: var(--text-primary);">
                {displayInfo.fullName}
              </div>
              <div class="text-xs truncate" style="color: var(--text-secondary);">
                {displayInfo.hospitalName}
              </div>
            </div>
          </div>
          
          <div class="mt-2">
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {displayInfo.roleColor}">
              {displayInfo.roleName}
            </span>
          </div>
        {:else}
          <button
            onclick={toggleUserMenu}
            class="w-full flex items-center justify-center p-2 rounded-lg"
            style="background-color: var(--accent-primary); color: var(--surface-primary);"
            title={displayInfo.fullName}
          >
            <span class="text-sm font-medium">
              {displayInfo.initials}
            </span>
          </button>
        {/if}
      </div>
    {:else}
      <div class="p-2 mb-2">
        <div class="animate-pulse">
          <div class="h-10 bg-gray-300 rounded-lg"></div>
        </div>
      </div>
    {/if}

    <!-- ✅ User Actions - ตามโครงสร้างเดิม (ไม่ใช่ dropdown) -->
    <div class="user-actions space-y-2">
      
      <button
        onclick={handleProfileClick}
        class="w-full flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-gray-100"
        style="color: var(--text-secondary); background-color: transparent;"
        title={isCollapsed ? 'โปรไฟล์' : ''}
      >
        <User size="16" />
        {#if !isCollapsed}
          <span class="text-sm">โปรไฟล์</span>
        {/if}
      </button>
      
      <button
        onclick={handleSettingsClick}
        class="w-full flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-gray-100"
        style="color: var(--text-secondary); background-color: transparent;"
        title={isCollapsed ? 'ตั้งค่า' : ''}
      >
        <Settings size="16" />
        {#if !isCollapsed}
          <span class="text-sm">ตั้งค่า</span>
        {/if}
      </button>
      
      <!-- ✅ Logout Button - ตามโครงสร้างเดิม -->
      <button
        onclick={handleLogout}
        disabled={isLoggingOut}
        class="w-full flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-red-50"
        style="color: var(--error, #dc2626); background-color: transparent;"
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
  }
  
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