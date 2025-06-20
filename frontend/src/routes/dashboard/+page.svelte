<!-- frontend/src/routes/dashboard/+page.svelte -->
<!-- ✅ Fixed infinite loop issues and TypeScript errors -->
<!-- Complex dashboard with stats, actions, and activities -->

<script lang="ts">
  import { onMount } from 'svelte';
  import { userStore, userDisplay, userPermissions } from '$lib/stores/user.store';
  import { themeStore } from '$lib/stores/theme.store';
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
  
  // ============================================
  // TYPES FOR THIS COMPONENT
  // ============================================
  
  interface QuickAction {
    id: string;
    title: string;
    description: string;
    icon: string;
    route: string;
    requiredRole: number;
    category: 'primary' | 'secondary';
  }
  
  interface RecentActivity {
    id: string;
    type: 'patient_added' | 'user_created' | 'report_generated' | 'system_update';
    title: string;
    description: string;
    timestamp: string;
    user?: string;
    hospitalName?: string;
  }
  
  // ============================================
  // PROPS & DATA
  // ============================================
  
  let { data }: { data: PageData } = $props();
  
  // ============================================
  // REACTIVE STATE - แยก state ให้ชัดเจน
  // ============================================
  
  // Dashboard data from server
  let dashboardData = $state(data.dashboard);
  let isRefreshing = $state(false);
  let lastRefresh = $state(new Date());
  
  // UI state
  let selectedTimeRange = $state('30days');
  let showAllActivities = $state(false);
  
  // ============================================
  // DERIVED STATE - ใช้ $derived แทน $effect
  // ============================================
  
  // User state - derived from stores
  let userState = $derived($userStore);
  let displayInfo = $derived($userDisplay);
  let permissions = $derived($userPermissions);
  let currentTheme = $derived($themeStore);
  
  // Greeting based on time
  let greeting = $derived.by(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'สวัสดีตอนเช้า';
    if (hour < 17) return 'สวัสดีตอนบ่าย';
    return 'สวัสดีตอนเย็น';
  });
  
  // Quick actions based on user role
  let quickActions = $derived.by(() => {
    const userRoleId = data.user?.userRoleId || 3;
    
    const allActions: QuickAction[] = [
      // USER Actions
      {
        id: 'add-patient',
        title: 'เพิ่มรายงานผู้ป่วย',
        description: 'บันทึกข้อมูลผู้ป่วยใหม่',
        icon: 'plus-circle',
        route: '/patients/add',
        requiredRole: 3,
        category: 'primary'
      },
      {
        id: 'view-patients',
        title: 'ดูรายการผู้ป่วย',
        description: 'ดูรายการผู้ป่วยในโรงพยาบาล',
        icon: 'list',
        route: '/patients',
        requiredRole: 3,
        category: 'primary'
      },
      {
        id: 'view-reports',
        title: 'ดูรายงาน',
        description: 'ดูรายงานสถิติโรค',
        icon: 'chart-bar',
        route: '/reports',
        requiredRole: 3,
        category: 'primary'
      },
      {
        id: 'patient-history',
        title: 'ค้นหาประวัติผู้ป่วย',
        description: 'ค้นหาประวัติการรักษา',
        icon: 'history',
        route: '/patients/search',
        requiredRole: 3,
        category: 'secondary'
      },
      {
        id: 'export-data',
        title: 'ส่งออกข้อมูล',
        description: 'ส่งออกข้อมูลเป็น Excel',
        icon: 'download',
        route: '/reports/export',
        requiredRole: 3,
        category: 'secondary'
      },
      // ADMIN Actions
      {
        id: 'manage-users',
        title: 'จัดการผู้ใช้งาน',
        description: 'เพิ่ม แก้ไข ผู้ใช้งาน',
        icon: 'users',
        route: '/admin/users',
        requiredRole: 2,
        category: 'primary'
      },
      {
        id: 'generate-report',
        title: 'สร้างรายงาน',
        description: 'สร้างรายงานสถิติ',
        icon: 'chart',
        route: '/reports/generate',
        requiredRole: 2,
        category: 'secondary'
      },
      // SUPERADMIN Actions
      {
        id: 'manage-hospitals',
        title: 'จัดการโรงพยาบาล',
        description: 'เพิ่ม แก้ไข โรงพยาบาล',
        icon: 'building',
        route: '/admin/hospitals',
        requiredRole: 1,
        category: 'primary'
      },
      {
        id: 'manage-diseases',
        title: 'จัดการโรค',
        description: 'เพิ่ม แก้ไข ประเภทโรค',
        icon: 'virus',
        route: '/admin/diseases',
        requiredRole: 1,
        category: 'secondary'
      },
      {
        id: 'system-settings',
        title: 'ตั้งค่าระบบ',
        description: 'จัดการการตั้งค่าระบบ',
        icon: 'settings',
        route: '/admin/settings',
        requiredRole: 1,
        category: 'secondary'
      }
    ];
    
    return allActions.filter(action => userRoleId <= action.requiredRole);
  });
  
  // Quick actions arrays - derived from quickActions
  let primaryActions = $derived(
    quickActions.filter(action => action.category === 'primary')
  );
  let secondaryActions = $derived(
    quickActions.filter(action => action.category === 'secondary')
  );
  
  // Mock recent activities
  let recentActivities = $derived.by(() => {
    const activities: RecentActivity[] = [
      {
        id: '1',
        type: 'patient_added',
        title: 'เพิ่มรายงานผู้ป่วยใหม่',
        description: 'ผู้ป่วยโรคไข้เลือดออก - เพศหญิง อายุ 25 ปี',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        user: 'นางสาวสมหญิง ใจดี',
        hospitalName: 'โรงพยาบาลทดสอบ'
      },
      {
        id: '2',
        type: 'report_generated',
        title: 'สร้างรายงานรายเดือน',
        description: 'รายงานสถิติผู้ป่วยประจำเดือน',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        user: 'นายแพทย์สมชาย มั่นคง'
      },
      {
        id: '3',
        type: 'user_created',
        title: 'เพิ่มผู้ใช้งานใหม่',
        description: 'เจ้าหน้าที่ใหม่เข้าร่วมระบบ',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        user: 'ผู้ดูแลระบบ'
      },
      {
        id: '4',
        type: 'system_update',
        title: 'อัปเดตระบบ',
        description: 'อัปเดตระบบรายงานโรคเวอร์ชัน 1.2.0',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        user: 'ผู้ดูแลระบบ'
      }
    ];
    return activities;
  });
  
  // Visible activities - derived from show toggle
  let visibleActivities = $derived(
    showAllActivities 
      ? recentActivities
      : recentActivities.slice(0, 3)
  );
  
  // ============================================
  // EVENT HANDLERS
  // ============================================
  
  async function handleRefreshDashboard() {
    if (isRefreshing) return;
    
    try {
      isRefreshing = true;
      // Simulate API call - replace with actual refresh logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      lastRefresh = new Date();
      
      // In real app, you'd refetch data here:
      // const refreshedData = await api.getDashboardData();
      // dashboardData = refreshedData;
      
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
    } finally {
      isRefreshing = false;
    }
  }
  
  function handleQuickAction(action: QuickAction) {
    console.log('Quick action clicked:', action.id);
    // Navigate to action route
    window.location.href = action.route;
  }
  
  function toggleActivities() {
    showAllActivities = !showAllActivities;
  }
  
  function formatActivityTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'เมื่อสักครู่';
    if (diffInHours < 24) return `${diffInHours} ชั่วโมงที่แล้ว`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} วันที่แล้ว`;
    
    return date.toLocaleDateString('th-TH');
  }
  
  function getActivityIcon(type: RecentActivity['type']) {
    switch (type) {
      case 'patient_added': return Users;
      case 'user_created': return Plus;
      case 'report_generated': return ChartBar;
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
  
  // ============================================
  // LIFECYCLE - แยก logic ออกจาก effects
  // ============================================
  
  onMount(() => {
    // Initialize user store with server data if available
    if (data.user) {
      const userInfo = data.user as unknown as UserInfo;
      userStore.setUser(userInfo);
    }
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
              class="transition-transform {isRefreshing ? 'animate-spin' : ''}"
            />
            {isRefreshing ? 'กำลังโหลด...' : 'รีเฟรช'}
          </button>
          
        </div>
      </div>
      
      <!-- Last refresh info -->
      {#if lastRefresh}
        <div class="mt-2 text-xs" style="color: var(--text-tertiary);">
          อัปเดตล่าสุด: {lastRefresh.toLocaleTimeString('th-TH')}
        </div>
      {/if}
    </header>
    
    <!-- Dashboard Content -->
    <div class="dashboard-body flex-1 overflow-y-auto p-6">
      
      <!-- Stats Cards -->
      {#if dashboardData?.stats}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {#each Object.entries(dashboardData.stats) as [key, value]}
            {@const StatIcon = getStatIcon(key)}
            <div class="stats-card p-4 rounded-xl border transition-all hover:shadow-lg"
                 style="background-color: var(--surface-primary); border-color: var(--border-primary);">
              <div class="flex items-center justify-between mb-2">
                <StatIcon size="20" style="color: var(--accent-primary);" />
                {#if key === 'monthlyGrowth' && value > 0}
                  <TrendingUp size="16" style="color: var(--success);" />
                {:else if key === 'monthlyGrowth' && value < 0}
                  <TrendingDown size="16" style="color: var(--error);" />
                {/if}
              </div>
              <div class="text-2xl font-bold mb-1" style="color: var(--text-primary);">
                {#if key === 'monthlyGrowth'}
                  {value > 0 ? '+' : ''}{value}%
                {:else}
                  {value.toLocaleString()}
                {/if}
              </div>
              <div class="text-sm" style="color: var(--text-secondary);">
                {getStatLabel(key)}
              </div>
            </div>
          {/each}
        </div>
      {/if}
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <!-- Quick Actions -->
        <div class="space-y-6">
          
          <!-- Primary Actions -->
          {#if primaryActions.length > 0}
            <div class="actions-section">
              <h2 class="text-xl font-semibold mb-4" style="color: var(--text-primary);">
                การดำเนินการหลัก
              </h2>
              <div class="grid gap-3">
                {#each primaryActions as action}
                  <button
                    onclick={() => handleQuickAction(action)}
                    class="action-card p-4 rounded-lg border text-left transition-all hover:shadow-md hover:scale-[1.02]"
                    style="background-color: var(--surface-primary); border-color: var(--border-primary);"
                  >
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                           style="background-color: var(--accent-primary); color: var(--surface-primary);">
                        <Plus size="16" />
                      </div>
                      <div class="flex-1">
                        <div class="font-medium" style="color: var(--text-primary);">
                          {action.title}
                        </div>
                        <div class="text-sm" style="color: var(--text-secondary);">
                          {action.description}
                        </div>
                      </div>
                      <ArrowRight size="16" style="color: var(--text-tertiary);" />
                    </div>
                  </button>
                {/each}
              </div>
            </div>
          {/if}
          
          <!-- Secondary Actions -->
          {#if secondaryActions.length > 0}
            <div class="actions-section">
              <h2 class="text-xl font-semibold mb-4" style="color: var(--text-primary);">
                การดำเนินการเพิ่มเติม
              </h2>
              <div class="grid grid-cols-2 gap-3">
                {#each secondaryActions as action}
                  <button
                    onclick={() => handleQuickAction(action)}
                    class="action-card p-3 rounded-lg border text-center transition-all hover:shadow-md"
                    style="background-color: var(--surface-primary); border-color: var(--border-primary);"
                  >
                    <div class="w-6 h-6 mx-auto mb-2 rounded flex items-center justify-center"
                         style="background-color: var(--surface-secondary); color: var(--accent-primary);">
                      <Activity size="14" />
                    </div>
                    <div class="text-sm font-medium" style="color: var(--text-primary);">
                      {action.title}
                    </div>
                  </button>
                {/each}
              </div>
            </div>
          {/if}
          
        </div>
        
        <!-- Recent Activities -->
        <div class="recent-activities">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold" style="color: var(--text-primary);">
              กิจกรรมล่าสุด
            </h2>
            {#if recentActivities.length > 3}
              <button
                onclick={toggleActivities}
                class="text-sm px-3 py-1 rounded-md transition-colors"
                style="color: var(--accent-primary); background-color: var(--surface-secondary);"
              >
                {showAllActivities ? 'แสดงน้อยลง' : 'ดูทั้งหมด'}
              </button>
            {/if}
          </div>
          
          <div class="activity-list space-y-3">
            {#if visibleActivities.length > 0}
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
  </main>
  
</div>

<!-- ============================================ -->
<!-- STYLES -->
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
  
  .stats-card:hover {
    transform: translateY(-2px);
  }
  
  .action-card:hover {
    transform: translateY(-1px);
  }
  
  .activity-item:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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