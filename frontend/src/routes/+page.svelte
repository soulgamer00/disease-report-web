<!-- frontend/src/routes/+page.svelte -->
<!-- ✅ Fixed home page with proper theme integration -->
<!-- Connected to theme store and using CSS variables -->

<script lang="ts">
  import { themeStore } from '$lib/stores/theme.store';
  
  // ============================================
  // STATE
  // ============================================
  
  // Theme state from store
  let themeState = $state($themeStore);
  
  // Update when store changes
  $effect(() => {
    themeState = $themeStore;
  });

  // ============================================
  // HANDLERS
  // ============================================
  
  function handleToggleTheme() {
    themeStore.toggle();
    console.log('🎨 Theme toggled to:', themeState.effectiveTheme);
  }
  
  function handleSetTheme(theme: 'light' | 'dark' | 'system') {
    themeStore.setTheme(theme);
    console.log('🎨 Theme set to:', theme);
  }
</script>

<!-- ============================================ -->
<!-- PAGE CONTENT -->
<!-- ============================================ -->

<div class="min-h-[calc(100vh-4rem)] p-8 transition-all duration-300">
  
  <!-- Header Section -->
  <div class="max-w-4xl mx-auto text-center mb-12">
    <h1 class="text-5xl font-bold mb-4" style="color: var(--text-primary);">
      🌗 Theme System Test
    </h1>
    <p class="text-xl mb-8" style="color: var(--text-secondary);">
      ทดสอบระบบ Dark/Light Mode สำหรับ SvelteKit 5
    </p>
    
    <!-- Current Theme Display -->
    <div class="inline-flex items-center gap-3 px-6 py-3 rounded-xl mb-8"
         style="background-color: var(--surface-primary); border: 2px solid var(--border-primary);">
      <span class="text-2xl">
        {#if themeState.effectiveTheme === 'dark'}
          🌙
        {:else}
          ☀️
        {/if}
      </span>
      <div class="text-left">
        <div class="font-semibold" style="color: var(--text-primary);">
          ธีมปัจจุบัน: {themeState.theme}
        </div>
        <div class="text-sm" style="color: var(--text-secondary);">
          แสดงผล: {themeState.effectiveTheme}
          {#if themeState.theme === 'system'}
            (ระบบ: {themeState.systemTheme})
          {/if}
        </div>
      </div>
    </div>
  </div>

  <!-- Action Buttons -->
  <div class="max-w-2xl mx-auto mb-12">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      <!-- Quick Toggle -->
      <button
        type="button"
        onclick={handleToggleTheme}
        class="px-6 py-4 rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
        style="background-color: var(--primary-600); color: white; border: 2px solid var(--primary-600);"
      >
        🔄 สลับธีม
      </button>
      
      <!-- Light Mode -->
      <button
        type="button"
        onclick={() => handleSetTheme('light')}
        class="px-6 py-4 rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95
               {themeState.theme === 'light' ? 'ring-2 ring-offset-2' : ''}"
        style="background-color: var(--surface-primary); color: var(--text-primary); 
               border: 2px solid var(--border-primary); 
               {themeState.theme === 'light' ? 'ring-color: var(--primary-500);' : ''}"
      >
        ☀️ โหมดสว่าง
      </button>
      
      <!-- Dark Mode -->
      <button
        type="button"
        onclick={() => handleSetTheme('dark')}
        class="px-6 py-4 rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95
               {themeState.theme === 'dark' ? 'ring-2 ring-offset-2' : ''}"
        style="background-color: var(--surface-primary); color: var(--text-primary); 
               border: 2px solid var(--border-primary);
               {themeState.theme === 'dark' ? 'ring-color: var(--primary-500);' : ''}"
      >
        🌙 โหมดมืด
      </button>
      
      <!-- System Mode -->
      <button
        type="button"
        onclick={() => handleSetTheme('system')}
        class="px-6 py-4 rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95
               {themeState.theme === 'system' ? 'ring-2 ring-offset-2' : ''}"
        style="background-color: var(--surface-primary); color: var(--text-primary); 
               border: 2px solid var(--border-primary);
               {themeState.theme === 'system' ? 'ring-color: var(--primary-500);' : ''}"
      >
        💻 ตามระบบ
      </button>
      
    </div>
  </div>

  <!-- Test Cards -->
  <div class="max-w-6xl mx-auto grid gap-8 lg:grid-cols-2">
    
    <!-- Background Colors Test -->
    <div class="p-6 rounded-xl transition-all duration-300" 
         style="background-color: var(--surface-primary); border: 2px solid var(--border-primary);">
      <h2 class="text-2xl font-bold mb-6" style="color: var(--text-primary);">
        🎨 Background Colors
      </h2>
      
      <div class="space-y-4">
        <div class="p-4 rounded-lg" style="background-color: var(--bg-primary);">
          <span class="font-medium" style="color: var(--text-primary);">bg-primary</span>
          <span class="text-sm block" style="color: var(--text-secondary);">หลักของหน้า</span>
        </div>
        <div class="p-4 rounded-lg" style="background-color: var(--bg-secondary);">
          <span class="font-medium" style="color: var(--text-primary);">bg-secondary</span>
          <span class="text-sm block" style="color: var(--text-secondary);">รองของหน้า</span>
        </div>
        <div class="p-4 rounded-lg" style="background-color: var(--surface-elevated);">
          <span class="font-medium" style="color: var(--text-primary);">surface-elevated</span>
          <span class="text-sm block" style="color: var(--text-secondary);">พื้นผิวที่ยกขึ้น</span>
        </div>
        <div class="p-4 rounded-lg" style="background-color: var(--surface-hover);">
          <span class="font-medium" style="color: var(--text-primary);">surface-hover</span>
          <span class="text-sm block" style="color: var(--text-secondary);">พื้นผิวเมื่อ hover</span>
        </div>
      </div>
    </div>

    <!-- Text Colors Test -->
    <div class="p-6 rounded-xl transition-all duration-300" 
         style="background-color: var(--surface-primary); border: 2px solid var(--border-primary);">
      <h2 class="text-2xl font-bold mb-6" style="color: var(--text-primary);">
        📝 Text Colors
      </h2>
      
      <div class="space-y-4">
        <div class="p-4 rounded-lg" style="background-color: var(--bg-secondary);">
          <p class="text-lg font-semibold" style="color: var(--text-primary);">
            Primary Text - ข้อความหลัก
          </p>
          <p class="text-base" style="color: var(--text-secondary);">
            Secondary Text - ข้อความรอง
          </p>
          <p class="text-sm" style="color: var(--text-tertiary);">
            Tertiary Text - ข้อความเสริม
          </p>
          <p class="text-xs" style="color: var(--text-disabled);">
            Disabled Text - ข้อความที่ปิดใช้งาน
          </p>
        </div>
      </div>
    </div>

    <!-- Interactive Elements Test -->
    <div class="p-6 rounded-xl transition-all duration-300" 
         style="background-color: var(--surface-primary); border: 2px solid var(--border-primary);">
      <h2 class="text-2xl font-bold mb-6" style="color: var(--text-primary);">
        🔘 Interactive Elements
      </h2>
      
      <div class="space-y-4">
        <!-- Input Field -->
        <div>
          <label class="block text-sm font-medium mb-2" style="color: var(--text-primary);">
            Input Field
          </label>
          <input 
            type="text" 
            placeholder="ทดสอบการพิมพ์..."
            class="w-full px-4 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2"
            style="background-color: var(--bg-primary); color: var(--text-primary); 
                   border: 2px solid var(--border-primary); 
                   focus:ring-color: var(--primary-500);"
          />
        </div>
        
        <!-- Select Field -->
        <div>
          <label class="block text-sm font-medium mb-2" style="color: var(--text-primary);">
            Select Field
          </label>
          <select 
            class="w-full px-4 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2"
            style="background-color: var(--bg-primary); color: var(--text-primary); 
                   border: 2px solid var(--border-primary);"
          >
            <option value="">เลือกตัวเลือก</option>
            <option value="1">ตัวเลือก 1</option>
            <option value="2">ตัวเลือก 2</option>
          </select>
        </div>
        
        <!-- Buttons -->
        <div class="flex gap-3 flex-wrap">
          <button 
            type="button"
            class="px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            style="background-color: var(--primary-600); color: white;"
          >
            Primary Button
          </button>
          <button 
            type="button"
            class="px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            style="background-color: var(--surface-primary); color: var(--text-primary); 
                   border: 2px solid var(--border-primary);"
          >
            Secondary Button
          </button>
        </div>
      </div>
    </div>

    <!-- Status Colors Test -->
    <div class="p-6 rounded-xl transition-all duration-300" 
         style="background-color: var(--surface-primary); border: 2px solid var(--border-primary);">
      <h2 class="text-2xl font-bold mb-6" style="color: var(--text-primary);">
        🌈 Status Colors
      </h2>
      
      <div class="grid grid-cols-2 gap-4">
        <div class="p-4 rounded-lg text-center text-white font-semibold" 
             style="background-color: var(--success);">
          ✅ Success
        </div>
        <div class="p-4 rounded-lg text-center text-white font-semibold" 
             style="background-color: var(--warning);">
          ⚠️ Warning
        </div>
        <div class="p-4 rounded-lg text-center text-white font-semibold" 
             style="background-color: var(--error);">
          ❌ Error
        </div>
        <div class="p-4 rounded-lg text-center text-white font-semibold" 
             style="background-color: var(--info);">
          ℹ️ Info
        </div>
      </div>
    </div>

  </div>

  <!-- Instructions -->
  <div class="max-w-4xl mx-auto mt-12 text-center">
    <div class="p-6 rounded-xl" style="background-color: var(--surface-secondary); border: 1px solid var(--border-primary);">
      <h3 class="text-lg font-semibold mb-4" style="color: var(--text-primary);">
        🎯 วิธีใช้งาน
      </h3>
      <div class="text-sm space-y-2" style="color: var(--text-secondary);">
        <p>• ใช้ปุ่มด้านบนเพื่อเปลี่ยนธีม</p>
        <p>• กด <kbd class="px-2 py-1 rounded" style="background-color: var(--surface-elevated);">Ctrl+Shift+D</kbd> เพื่อสลับธีมด้วยคีย์บอร์ด</p>
        <p>• ธีม "ตามระบบ" จะปรับตามการตั้งค่าของ OS</p>
        <p>• การตั้งค่าจะถูกบันทึกใน localStorage</p>
      </div>
    </div>
  </div>

</div>