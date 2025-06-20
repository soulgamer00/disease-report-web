<!-- frontend/src/routes/dashboard/+page.svelte -->
<!-- ✅ Dashboard main page with role-based content -->
<!-- Displays stats, quick actions, and recent activities -->

<script lang="ts">
  import { onMount } from 'svelte';
  import { userStore, userDisplay, userPermissions } from '$lib/stores/user.store';
  import { themeStore } from '$lib/stores/theme.store';
  import DashboardNav from '$lib/components/dashboard/DashboardNav.svelte';
  import type { PageData } from './$types';
  import type { DashboardData, QuickAction, RecentActivity } from './+page.server';
  import { getMenuForRole } from '$lib/config/menu.config';
  import type { UserInfo } from '$lib/types/auth.types';
  
  // Lucide icons
  import {
    TrendingUp,
    TrendingDown,
    Users,
    Building2,
    Activity,
    Clock,
    ChartBar,      // แทน BarChart3
    Plus,
    ArrowRight,
    RefreshCw,
    type Icon
  } from 'svelte-lucide';
  
  // ============================================
  // PROPS & DATA
  // ============================================
  
  let { data }: { data: PageData } = $props();
  
  // ============================================
  // REACTIVE STATE
  // ============================================
  
  // User and theme state
  let userState = $state($userStore);
  let displayInfo = $state($userDisplay);
  let permissions = $state($userPermissions);
  let currentTheme = $state($themeStore);
  
  // Dashboard data
  let dashboardData = $state(data.dashboard);
  let isRefreshing = $state(false);
  let lastRefresh = $state(new Date());
  
  // UI state
  let selectedTimeRange = $state('30days');
  let showAllActivities = $state(false);
  
  // Quick actions arrays - use reactive statements instead of $derived
  let primaryActions: QuickAction[] = $state([]);
  let secondaryActions: QuickAction[] = $state([]);
  let visibleActivities: RecentActivity[] = $state([]);
  
  // ============================================
  // REACTIVE UPDATES (แก้ไข effects)
  // ============================================
  
  // Update user states when stores change
  $effect(() => {
    userState = $userStore;
    displayInfo = $userDisplay;
    permissions = $userPermissions;
    currentTheme = $themeStore;
  });
  
  // Update arrays when dashboardData changes (แยก effect)
  $effect(() => {
    if (dashboardData?.quickActions) {
      primaryActions = dashboardData.quickActions.filter(action => action.category === 'primary');
      secondaryActions = dashboardData.quickActions.filter(action => action.category === 'secondary');
    }
  });
  
  // Update visible activities when data or toggle changes (แยก effect)
  $effect(() => {
    if (dashboardData?.recentActivities) {
      visibleActivities = showAllActivities 
        ? dashboardData.recentActivities 
        : dashboardData.recentActivities.slice(0, 5);
    }
  });
  
  // ============================================
  // COMPUTED VALUES
  // ============================================
  
  // Get greeting based on time
  let greeting = $derived(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'สวัสดีตอนเช้า';
    if (hour < 17) return 'สวัสดีตอนบ่าย';
    return 'สวัสดีตอนเย็น';
  });
  
  // ============================================
  // EVENT HANDLERS
  // ============================================
  
  function handleQuickAction(action: QuickAction): void {
    // Navigate to action route
    window.location.href = action.route;
  }
  
  function handleRefreshDashboard(): void {
    if (isRefreshing) return;
    
    isRefreshing = true;
    lastRefresh = new Date();
    
    // Simulate refresh - in real app, this would refetch data
    setTimeout(() => {
      isRefreshing = false;
    }, 1500);
  }
  
  function toggleAllActivities(): void {
    showAllActivities = !showAllActivities;
    // Update visibleActivities immediately
    if (dashboardData?.recentActivities) {
      visibleActivities = showAllActivities 
        ? dashboardData.recentActivities 
        : dashboardData.recentActivities.slice(0, 5);
    }
  }
  
  function formatRelativeTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'เมื่อสักครู่';
    if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
    if (diffDays === 1) return 'เมื่อวาน';
    if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
    return date.toLocaleDateString('th-TH');
  }
  
  function getActivityIcon(type: RecentActivity['type']): typeof Icon {
    switch (type) {
      case 'patient_added': return Plus;
      case 'user_created': return Users;
      case 'report_generated': return ChartBar;  // แทน BarChart3
      case 'system_update': return RefreshCw;
      default: return Activity;
    }
  }
  
  function getStatIcon(label: string): typeof Icon {
    if (label.includes('ผู้ป่วย')) return Users;
    if (label.includes('โรงพยาบาล')) return Building2;
    if (label.includes('โรค')) return Activity;
    return ChartBar;  // แทน BarChart3
  }
  
  function formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }
  
  // ============================================
  // LIFECYCLE
  // ============================================
  
  onMount(() => {
    // Initialize arrays on mount
    if (dashboardData?.quickActions) {
      primaryActions = dashboardData.quickActions.filter(action => action.category === 'primary');
      secondaryActions = dashboardData.quickActions.filter(action => action.category === 'secondary');
    }
    
    if (dashboardData?.recentActivities) {
      visibleActivities = showAllActivities 
        ? dashboardData.recentActivities 
        : dashboardData.recentActivities.slice(0, 5);
    }
    
    // Initialize user store with server data (ถ้ามี)
    if (data.user) {
      // Type assertion สำหรับ compatibility
      const userInfo = data.user as unknown as UserInfo;
      userStore.setUser(userInfo);
    }
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      if (!isRefreshing) {
        handleRefreshDashboard();
      }
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  });
</script>

<!-- ============================================ -->
<!-- DASHBOARD LAYOUT -->
<!-- ============================================ -->

<div class="dashboard-layout flex h-screen" style="background-color: var(--surface-secondary);">
  
  <!-- Sidebar Navigation -->
  <DashboardNav />
  
  <!-- Main Content Area -->
  <main class="dashboard-content flex-1 overflow-hidden">
    
    <!-- Header Section -->
    <header class="dashboard-header p-6 border-b" style="background-color: var(--surface-primary); border-color: var(--border-primary);">
      <div class="flex items-center justify-between">
        
        <!-- Welcome Section -->
        <div>
          <h1 class="text-2xl font-bold mb-1" style="color: var(--text-primary);">
            {greeting}
            {#if displayInfo}
              <span class="text-xl">, {displayInfo.fullName}</span>
            {/if}
          </h1>
          <p class="text-sm" style="color: var(--text-secondary);">
            {#if displayInfo}
              {displayInfo.roleName}
              {#if displayInfo.hospitalName}
                • {displayInfo.hospitalName}
              {/if}
            {/if}
          </p>
        </div>
        
        <!-- Actions -->
        <div class="flex items-center gap-3">
          
          <!-- Time Range Selector -->
          <select
            bind:value={selectedTimeRange}
            class="px-3 py-2 rounded-lg border text-sm"
            style="background-color: var(--surface-primary); border-color: var(--border-primary); color: var(--text-primary);"
          >
            <option value="7days">7 วันที่แล้ว</option>
            <option value="30days">30 วันที่แล้ว</option>
            <option value="90days">90 วันที่แล้ว</option>
            <option value="1year">1 ปีที่แล้ว</option>
          </select>
          
          <!-- Refresh Button -->
          <button
            onclick={handleRefreshDashboard}
            disabled={isRefreshing}
            class="px-4 py-2 rounded-lg border transition-colors flex items-center gap-2"
            style="background-color: var(--surface-primary); border-color: var(--border-primary); color: var(--text-primary);"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw 
              size="16" 
              class="transition-transform"
              style={`transform: ${isRefreshing ? 'rotate(360deg)' : 'rotate(0deg)'}; animation: ${isRefreshing ? 'spin 1s linear infinite' : 'none'};`}
            />
            <span class="hidden sm:inline">รีเฟรช</span>
          </button>
        </div>
      </div>
    </header>
    
    <!-- Content Body -->
    <div class="dashboard-body flex-1 overflow-y-auto p-6 space-y-6">
      
      <!-- Statistics Cards -->
      <section class="stats-section">
        <h2 class="text-lg font-semibold mb-4" style="color: var(--text-primary);">
          สถิติภาพรวม
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <!-- Total Patients -->
          <div class="stat-card p-4 rounded-lg border" style="background-color: var(--surface-primary); border-color: var(--border-primary);">
            <div class="flex items-center justify-between mb-2">
              <div class="p-2 rounded-lg" style="background-color: var(--primary-100);">
                <Users size="20" style="color: var(--primary-600);" />
              </div>
              <div class="text-right">
                <div class="text-xs" style="color: var(--text-secondary);">ผู้ป่วยทั้งหมด</div>
                <div class="text-2xl font-bold" style="color: var(--text-primary);">
                  {formatNumber(dashboardData.stats.totalPatients)}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-1 text-xs">
              {#if dashboardData.stats.monthlyGrowth >= 0}
                <TrendingUp size="12" style="color: var(--success-600);" />
                <span style="color: var(--success-600);">+{dashboardData.stats.monthlyGrowth}%</span>
              {:else}
                <TrendingDown size="12" style="color: var(--error-600);" />
                <span style="color: var(--error-600);">{dashboardData.stats.monthlyGrowth}%</span>
              {/if}
              <span style="color: var(--text-secondary);">จากเดือนก่อน</span>
            </div>
          </div>
          
          <!-- Total Diseases -->
          <div class="stat-card p-4 rounded-lg border" style="background-color: var(--surface-primary); border-color: var(--border-primary);">
            <div class="flex items-center justify-between mb-2">
              <div class="p-2 rounded-lg" style="background-color: var(--warning-100);">
                <Activity size="20" style="color: var(--warning-600);" />
              </div>
              <div class="text-right">
                <div class="text-xs" style="color: var(--text-secondary);">โรคทั้งหมด</div>
                <div class="text-2xl font-bold" style="color: var(--text-primary);">
                  {formatNumber(dashboardData.stats.totalDiseases)}
                </div>
              </div>
            </div>
            <div class="text-xs" style="color: var(--text-secondary);">
              โรคที่อยู่ในระบบ
            </div>
          </div>
          
          <!-- Total Hospitals (Superadmin only) -->
          {#if permissions.isSuperadmin}
            <div class="stat-card p-4 rounded-lg border" style="background-color: var(--surface-primary); border-color: var(--border-primary);">
              <div class="flex items-center justify-between mb-2">
                <div class="p-2 rounded-lg" style="background-color: var(--info-100);">
                  <Building2 size="20" style="color: var(--info-600);" />
                </div>
                <div class="text-right">
                  <div class="text-xs" style="color: var(--text-secondary);">โรงพยาบาล</div>
                  <div class="text-2xl font-bold" style="color: var(--text-primary);">
                    {formatNumber(dashboardData.stats.totalHospitals)}
                  </div>
                </div>
              </div>
              <div class="text-xs" style="color: var(--text-secondary);">
                โรงพยาบาลที่เข้าร่วม
              </div>
            </div>
          {/if}
          
          <!-- Recent Patients -->
          <div class="stat-card p-4 rounded-lg border" style="background-color: var(--surface-primary); border-color: var(--border-primary);">
            <div class="flex items-center justify-between mb-2">
              <div class="p-2 rounded-lg" style="background-color: var(--success-100);">
                <Clock size="20" style="color: var(--success-600);" />
              </div>
              <div class="text-right">
                <div class="text-xs" style="color: var(--text-secondary);">เดือนนี้</div>
                <div class="text-2xl font-bold" style="color: var(--text-primary);">
                  {formatNumber(dashboardData.stats.recentPatients)}
                </div>
              </div>
            </div>
            <div class="text-xs" style="color: var(--text-secondary);">
              ผู้ป่วยใหม่เดือนนี้
            </div>
          </div>
        </div>
      </section>
      
      <!-- Quick Actions Grid -->
      <section class="actions-section">
        <h2 class="text-lg font-semibold mb-4" style="color: var(--text-primary);">
          การดำเนินการด่วน
        </h2>
        
        <!-- Primary Actions -->
        {#if primaryActions.length > 0}
          <div class="mb-4">
            <h3 class="text-sm font-medium mb-3" style="color: var(--text-secondary);">หลัก</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {#each primaryActions as action (action.id)}
                <button
                  onclick={() => handleQuickAction(action)}
                  class="action-card p-4 rounded-lg border text-left transition-all hover:shadow-md group"
                  style="background-color: var(--surface-primary); border-color: var(--border-primary);"
                >
                  <div class="flex items-start justify-between mb-3">
                    <div class="p-2 rounded-lg" style="background-color: var(--primary-100);">
                      <!-- Dynamic icon would go here -->
                      <div class="w-5 h-5" style="color: var(--primary-600);">
                        {#if action.icon === 'plus-circle'}
                          <Plus size="20" />
                        {:else if action.icon === 'users'}
                          <Users size="20" />
                        {:else if action.icon === 'bar-chart-3'}
                          <ChartBar size="20" />
                        {:else}
                          <Activity size="20" />
                        {/if}
                      </div>
                    </div>
                    <ArrowRight size="16" class="transition-transform group-hover:translate-x-1" style="color: var(--text-secondary);" />
                  </div>
                  <h4 class="font-medium mb-1" style="color: var(--text-primary);">
                    {action.title}
                  </h4>
                  <p class="text-sm" style="color: var(--text-secondary);">
                    {action.description}
                  </p>
                </button>
              {/each}
            </div>
          </div>
        {/if}
        
        <!-- Secondary Actions -->
        {#if secondaryActions.length > 0}
          <div>
            <h3 class="text-sm font-medium mb-3" style="color: var(--text-secondary);">รอง</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {#each secondaryActions as action (action.id)}
                <button
                  onclick={() => handleQuickAction(action)}
                  class="action-card-small p-3 rounded-lg border text-left transition-all hover:shadow-sm group"
                  style="background-color: var(--surface-primary); border-color: var(--border-primary);"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-5 h-5" style="color: var(--primary-600);">
                      {#if action.icon === 'download'}
                        <ArrowRight size="16" />
                      {:else if action.icon === 'history'}
                        <Clock size="16" />
                      {:else}
                        <Activity size="16" />
                      {/if}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-medium truncate" style="color: var(--text-primary);">
                        {action.title}
                      </div>
                    </div>
                    <ArrowRight size="14" class="transition-transform group-hover:translate-x-1" style="color: var(--text-secondary);" />
                  </div>
                </button>
              {/each}
            </div>
          </div>
        {/if}
      </section>
      
      <!-- Recent Activities -->
      <section class="activities-section">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold" style="color: var(--text-primary);">
            กิจกรรมล่าสุด
          </h2>
          {#if dashboardData.recentActivities.length > 5}
            <button
              onclick={toggleAllActivities}
              class="text-sm transition-colors"
              style="color: var(--primary-600);"
            >
              {showAllActivities ? 'แสดงน้อย' : `ดูทั้งหมด (${dashboardData.recentActivities.length})`}
            </button>
          {/if}
        </div>
        
        <div class="space-y-3">
          {#each visibleActivities as activity (activity.id)}
            <div class="activity-item p-4 rounded-lg border" style="background-color: var(--surface-primary); border-color: var(--border-primary);">
              <div class="flex items-start gap-3">
                
                <!-- Activity Icon -->
                <div class="p-2 rounded-lg flex-shrink-0 mt-0.5" style="background-color: var(--primary-100);">
                  {#if activity.type === 'patient_added'}
                    <Plus size="16" style="color: var(--primary-600);" />
                  {:else if activity.type === 'user_created'}
                    <Users size="16" style="color: var(--primary-600);" />
                  {:else if activity.type === 'report_generated'}
                    <ChartBar size="16" style="color: var(--primary-600);" />
                  {:else if activity.type === 'system_update'}
                    <RefreshCw size="16" style="color: var(--primary-600);" />
                  {:else}
                    <Activity size="16" style="color: var(--primary-600);" />
                  {/if}
                </div>
                
                <!-- Activity Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex-1 min-w-0">
                      <h4 class="font-medium text-sm" style="color: var(--text-primary);">
                        {activity.title}
                      </h4>
                      <p class="text-sm mt-1" style="color: var(--text-secondary);">
                        {activity.description}
                      </p>
                      {#if activity.user}
                        <p class="text-xs mt-1" style="color: var(--text-secondary);">
                          โดย {activity.user}
                          {#if activity.hospitalName}
                            • {activity.hospitalName}
                          {/if}
                        </p>
                      {/if}
                    </div>
                    <div class="text-xs flex-shrink-0" style="color: var(--text-secondary);">
                      {formatRelativeTime(activity.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          {/each}
          
          <!-- Empty State -->
          {#if dashboardData.recentActivities.length === 0}
            <div class="text-center py-8" style="color: var(--text-secondary);">
              <Activity size="48" class="mx-auto mb-3 opacity-50" />
              <p>ยังไม่มีกิจกรรมล่าสุด</p>
            </div>
          {/if}
        </div>
      </section>
    </div>
  </main>
</div>

<!-- ============================================ -->
<!-- COMPONENT STYLES -->
<!-- ============================================ -->

<style>
  .dashboard-layout {
    height: 100vh;
    overflow: hidden;
  }
  
  .dashboard-content {
    display: flex;
    flex-direction: column;
  }
  
  .dashboard-body {
    flex: 1;
    overflow-y: auto;
  }
  
  .stat-card:hover,
  .action-card:hover,
  .action-card-small:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  
  .action-card:hover {
    border-color: var(--primary-200);
  }
  
  .activity-item:hover {
    background-color: var(--surface-hover);
  }
  
  /* Custom scrollbar */
  .dashboard-body::-webkit-scrollbar {
    width: 6px;
  }
  
  .dashboard-body::-webkit-scrollbar-track {
    background: var(--surface-secondary);
  }
  
  .dashboard-body::-webkit-scrollbar-thumb {
    background: var(--border-primary);
    border-radius: 3px;
  }
  
  .dashboard-body::-webkit-scrollbar-thumb:hover {
    background: var(--text-secondary);
  }
  
  /* Animation */
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .dashboard-body {
      padding: 1rem;
    }
    
    .stats-section .grid {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .actions-section .grid {
      grid-template-columns: 1fr;
    }
  }
</style>