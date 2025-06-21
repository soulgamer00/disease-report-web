<!-- frontend/src/routes/dashboard/+page.svelte -->
<!-- ✅ ใช้ข้อมูลจริงจาก backend API -->

<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore, userDisplayInfo } from '$lib/stores/auth.store';
  import { themeStore } from '$lib/stores/theme.store';
  import { dashboardAPI } from '$lib/api/dashboard.api';
  import DashboardNav from '$lib/components/dashboard/DashboardNav.svelte';
  import type { PageData } from './$types';
  import type { UserInfo } from '$lib/types/auth.types';
  
  // Lucide icons
  import {
    TrendingUp,
    TrendingDown,
    Users,
    Building2,
    Activity,
    Clock,
    ChartBar,
    Plus,
    ArrowRight,
    RefreshCw,
    FileText,
    Settings,
    List,
    History,
    Download
  } from 'svelte-lucide';
  
  // ✅ Props from server (Svelte 5 runes syntax)
  const { data } = $props<{ data: PageData }>();
  
  // ✅ Real state from server data
  let loading = $state(false);
  let error = $state<string | null>(null);
  let isRefreshing = $state(false);
  let showAllActivities = $state(false);
  
  // ✅ ใช้ข้อมูลจาก server load (with safe access)
  let stats = $state(data.dashboard.stats);
  let backendConnected = $state(data.backendConnected ?? false);
  let timestamp = $state(data.timestamp ?? new Date().toISOString());
  
  // ✅ Real activities from API (will be loaded on mount)
  let activities = $state<any[]>([]);
  
  // ✅ Real quick actions based on user role
  let quickActions = $state<any[]>([]);
  
  // Auth state
  let userState = $derived($authStore);
  let displayInfo = $derived($userDisplayInfo);
  let currentTheme = $derived($themeStore);
  
  // Computed
  let visibleActivities = $derived(
    showAllActivities ? activities : activities.slice(0, 3)
  );
  
  let availableActions = $derived(
    quickActions.filter(action => {
      const userRole = userState.user?.userRoleId || 3;
      return userRole <= action.requiredRole;
    })
  );
  
  // Functions
  function formatActivityTime(timestamp: string): string {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMins < 1) return 'เมื่อสักครู่';
    if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
    if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
    
    return activityTime.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
  
  function getActivityIcon(type: string) {
    switch (type) {
      case 'patient_added': return Users;
      case 'user_created': return Users;
      case 'report_generated': return FileText;
      case 'system_update': return Activity;
      default: return Activity;
    }
  }
  
  function getStatIcon(key: string) {
    switch (key) {
      case 'totalPatients': return Users;
      case 'totalHospitals': return Building2;
      case 'totalDiseases': return Activity;
      case 'recentPatients': return TrendingUp;
      case 'monthlyGrowth': return TrendingUp;
      case 'activeUsers': return Users;
      default: return Activity;
    }
  }
  
  function getStatLabel(key: string): string {
    const labels = {
      totalPatients: 'ผู้ป่วยทั้งหมด',
      totalHospitals: 'โรงพยาบาล',
      totalDiseases: 'ประเภทโรค',
      recentPatients: 'ผู้ป่วยใหม่ (เดือนนี้)',
      monthlyGrowth: 'เพิ่มขึ้น (%)',
      activeUsers: 'ผู้ใช้งานปัจจุบัน'
    };
    return labels[key as keyof typeof labels] || key;
  }
  
  // ✅ Load real dashboard data
  async function loadDashboardData() {
    try {
      loading = true;
      const userRole = userState.user?.userRoleId || 3;
      
      // ใช้ dashboardAPI เพื่อดึงข้อมูลจริง
      const dashboardData = await dashboardAPI.getDashboardData(userRole);
      
      if (dashboardData.success) {
        // Update stats if available
        if (dashboardData.data.stats) {
          stats = dashboardData.data.stats;
        }
        
        // Set activities
        activities = dashboardData.data.recentActivities;
        
        // Set quick actions
        quickActions = dashboardData.data.quickActions;
        
        console.log('✅ Dashboard data loaded:', dashboardData.data);
      } else {
        error = dashboardData.message || 'ไม่สามารถโหลดข้อมูลได้';
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
      error = 'เกิดข้อผิดพลาดในการโหลดข้อมูล';
    } finally {
      loading = false;
    }
  }
  
  async function handleRefresh() {
    if (isRefreshing) return;
    
    try {
      isRefreshing = true;
      await loadDashboardData();
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      isRefreshing = false;
    }
  }
  
  // ✅ Load additional data on mount
  onMount(async () => {
    console.log('📊 Dashboard page mounted with initial data:', {
      stats,
      backendConnected,
      timestamp
    });
    
    // Load additional dashboard data (activities, actions)
    await loadDashboardData();
  });
</script>

<!-- HTML structure เหมือนเดิม -->
<div class="dashboard-layout flex h-screen" style="background-color: var(--surface-secondary);">
  
  <!-- Sidebar Navigation -->
  <DashboardNav />
  
  <!-- Main Content Area -->
  <main class="dashboard-content flex-1 overflow-hidden">
    
    <!-- Header Section -->
    <header class="dashboard-header p-6 border-b" style="background-color: var(--surface-primary); border-color: var(--border-primary);">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold" style="color: var(--text-primary);">
            แดชบอร์ด
          </h1>
          {#if displayInfo}
            <p class="text-sm mt-1" style="color: var(--text-secondary);">
              ยินดีต้อนรับ, {displayInfo.fullName}
            </p>
          {/if}
          
          <!-- Backend connection status -->
          <div class="flex items-center gap-2 mt-2">
            <div class="w-2 h-2 rounded-full {backendConnected ? 'bg-green-500' : 'bg-red-500'}"></div>
            <span class="text-xs" style="color: var(--text-secondary);">
              {backendConnected ? 'เชื่อมต่อ Backend' : 'ใช้ข้อมูล Fallback'}
            </span>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <button
            onclick={handleRefresh}
            disabled={isRefreshing}
            class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            style="background-color: var(--surface-secondary); color: var(--text-secondary);"
          >
            <RefreshCw size="16" class={isRefreshing ? 'animate-spin' : ''} />
            <span class="text-sm">{isRefreshing ? 'กำลังรีเฟรช...' : 'รีเฟรช'}</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Dashboard Body -->
    <div class="dashboard-body flex-1 overflow-y-auto p-6">
      
      <!-- Error Message -->
      {#if error}
        <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div class="flex items-center gap-2 text-red-700">
            <Activity size="16" />
            <span class="font-medium">เกิดข้อผิดพลาด:</span>
          </div>
          <p class="text-red-600 text-sm mt-1">{error}</p>
        </div>
      {/if}
      
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {#each Object.entries(stats) as [key, value]}
          {@const StatIcon = getStatIcon(key)}
          <div class="stats-card p-4 rounded-lg border transition-all duration-200"
               style="background-color: var(--surface-primary); border-color: var(--border-primary);">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center"
                   style="background-color: var(--accent-primary); color: var(--surface-primary);">
                <StatIcon size="20" />
              </div>
              <div>
                <div class="text-xs font-medium" style="color: var(--text-secondary);">
                  {getStatLabel(key)}
                </div>
                <div class="text-lg font-bold" style="color: var(--text-primary);">
                  {loading ? '...' : (typeof value === 'number' ? value.toLocaleString() : value)}
                  {#if key === 'monthlyGrowth'}%{/if}
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>

      <!-- Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Quick Actions -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg border p-6" style="background-color: var(--surface-primary); border-color: var(--border-primary);">
            <h2 class="text-lg font-semibold mb-4" style="color: var(--text-primary);">
              การดำเนินการด่วน
            </h2>
            
            <div class="space-y-3">
              {#if loading}
                <!-- Loading skeleton -->
                {#each Array(4) as _}
                  <div class="animate-pulse p-4 rounded-lg bg-gray-100 h-16"></div>
                {/each}
              {:else if availableActions.length > 0}
                {#each availableActions as action}
                  {@const ActionIcon = 
                    action.icon === 'plus' ? Plus
                    : action.icon === 'chart-bar' ? ChartBar
                    : action.icon === 'users' ? Users
                    : action.icon === 'settings' ? Settings
                    : Plus}
                  <a href={action.route}
                     class="action-card block p-4 rounded-lg border transition-all duration-200 hover:shadow-md"
                     style="background-color: var(--surface-secondary); border-color: var(--border-primary);">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                           style="background-color: var(--accent-primary); color: var(--surface-primary);">
                        <ActionIcon size="16" />
                      </div>
                      <div>
                        <div class="font-medium text-sm" style="color: var(--text-primary);">
                          {action.title}
                        </div>
                        <div class="text-xs" style="color: var(--text-secondary);">
                          {action.description}
                        </div>
                      </div>
                      <ArrowRight size="16" style="color: var(--text-tertiary);" class="ml-auto" />
                    </div>
                  </a>
                {/each}
              {:else}
                <div class="text-center py-8" style="color: var(--text-secondary);">
                  <Settings size="32" class="mx-auto mb-2 opacity-50" />
                  <p class="text-sm">ไม่มีการดำเนินการที่ใช้ได้</p>
                </div>
              {/if}
            </div>
          </div>
        </div>
        
        <!-- Recent Activities -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg border p-6" style="background-color: var(--surface-primary); border-color: var(--border-primary);">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold" style="color: var(--text-primary);">
                กิจกรรมล่าสุด
              </h2>
              {#if activities.length > 3}
                <button
                  onclick={() => showAllActivities = !showAllActivities}
                  class="text-sm font-medium transition-colors"
                  style="color: var(--accent-primary);"
                >
                  {showAllActivities ? 'แสดงน้อยลง' : 'ดูทั้งหมด'}
                </button>
              {/if}
            </div>
            
            <div class="activity-list space-y-3">
              {#if loading}
                <!-- Loading skeleton -->
                {#each Array(3) as _}
                  <div class="animate-pulse p-4 rounded-lg bg-gray-100 h-20"></div>
                {/each}
              {:else if visibleActivities.length > 0}
                {#each visibleActivities as activity}
                  {@const ActivityIcon = getActivityIcon(activity.type)}
                  <div class="activity-item p-4 rounded-lg border"
                       style="background-color: var(--surface-primary); border-color: var(--border-primary);">
                    <div class="flex items-start gap-3">
                      <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                           style="background-color: var(--surface-secondary); color: var(--accent-primary);">
                        <ActivityIcon size="16" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="font-medium" style="color: var(--text-primary);">
                          {activity.title}
                        </div>
                        <div class="text-sm mt-1" style="color: var(--text-secondary);">
                          {activity.description}
                        </div>
                        <div class="flex items-center gap-2 mt-2 text-xs" style="color: var(--text-tertiary);">
                          <Clock size="12" />
                          {formatActivityTime(activity.timestamp)}
                          {#if activity.user}
                            • {activity.user}
                          {/if}
                          {#if activity.hospitalName}
                            • {activity.hospitalName}
                          {/if}
                        </div>
                      </div>
                    </div>
                  </div>
                {/each}
              {:else}
                <div class="text-center py-8" style="color: var(--text-secondary);">
                  <Activity size="32" class="mx-auto mb-2 opacity-50" />
                  <p>ไม่มีกิจกรรมล่าสุด</p>
                </div>
              {/if}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  </main>
  
</div>

<!-- Styles เหมือนเดิม -->
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
  
  .stats-card:hover {
    transform: translateY(-2px);
  }
  
  .action-card:hover {
    transform: translateY(-1px);
  }
  
  .activity-item:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: .5; }
  }
  
  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  @media (max-width: 768px) {
    .dashboard-header {
      padding: 1rem;
    }
    
    .dashboard-body {
      padding: 1rem;
    }
  }
</style>