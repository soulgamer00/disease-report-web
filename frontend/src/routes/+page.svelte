<!-- frontend/src/routes/+page.svelte -->
<!-- Simple theme test without complex components -->
<script lang="ts">
  import { onMount } from 'svelte';
  
  let currentTheme = $state('light');
  
  function toggleTheme() {
    console.log('🔥 Toggle clicked, current theme:', currentTheme);
    
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    currentTheme = newTheme;
    
    // Apply theme to document
    const root = document.documentElement;
    root.setAttribute('data-theme', newTheme);
    root.className = newTheme; // Replace all classes
    
    console.log('✅ Theme changed to:', newTheme);
    console.log('📝 HTML class:', root.className);
    console.log('📝 data-theme:', root.getAttribute('data-theme'));
  }
  
  onMount(() => {
    console.log('🚀 Component mounted');
    
    // Set initial theme
    const root = document.documentElement;
    root.setAttribute('data-theme', 'light');
    root.className = 'light';
    
    console.log('🎨 Initial theme set to light');
  });
</script>

<div class="min-h-screen p-8 transition-all duration-500" style="background-color: var(--bg-primary);">
  
  <!-- Header -->
  <div class="mb-8 text-center">
    <h1 class="text-4xl font-bold mb-4" style="color: var(--text-primary);">
      🌗 Dark Mode Test
    </h1>
    <p class="text-lg mb-6" style="color: var(--text-secondary);">
      ปัจจุบัน: <strong>{currentTheme}</strong> mode
    </p>
    
    <!-- Big Toggle Button -->
    <button
      type="button"
      onclick={toggleTheme}
      class="px-8 py-4 text-xl font-semibold rounded-xl border-2 transition-all duration-300 hover:scale-105 active:scale-95"
      style="
        background-color: var(--surface-primary);
        border-color: var(--primary-600);
        color: var(--text-primary);
      "
    >
      {currentTheme === 'light' ? '🌙 Switch to Dark Mode' : '☀️ Switch to Light Mode'}
    </button>
  </div>

  <!-- Test Cards -->
  <div class="max-w-4xl mx-auto grid gap-6 md:grid-cols-2">
    
    <!-- Card 1: Background Test -->
    <div class="p-6 rounded-xl border-2 transition-all duration-500" 
         style="background-color: var(--surface-primary); border-color: var(--border-primary);">
      <h2 class="text-2xl font-bold mb-4" style="color: var(--text-primary);">
        🎨 Background Test
      </h2>
      
      <div class="space-y-3">
        <div class="p-3 rounded-lg" style="background-color: var(--bg-secondary);">
          <span style="color: var(--text-secondary);">bg-secondary</span>
        </div>
        <div class="p-3 rounded-lg" style="background-color: var(--surface-secondary);">
          <span style="color: var(--text-secondary);">surface-secondary</span>
        </div>
        <div class="p-3 rounded-lg" style="background-color: var(--surface-hover);">
          <span style="color: var(--text-secondary);">surface-hover</span>
        </div>
      </div>
    </div>

    <!-- Card 2: Text Colors -->
    <div class="p-6 rounded-xl border-2 transition-all duration-500" 
         style="background-color: var(--surface-primary); border-color: var(--border-primary);">
      <h2 class="text-2xl font-bold mb-4" style="color: var(--text-primary);">
        📝 Text Colors
      </h2>
      
      <div class="space-y-3">
        <p class="text-lg" style="color: var(--text-primary);">Primary Text</p>
        <p class="text-lg" style="color: var(--text-secondary);">Secondary Text</p>
        <p class="text-lg" style="color: var(--text-tertiary);">Tertiary Text</p>
        <p class="text-lg" style="color: var(--text-quaternary);">Quaternary Text</p>
      </div>
    </div>

    <!-- Card 3: Colors -->
    <div class="p-6 rounded-xl border-2 transition-all duration-500" 
         style="background-color: var(--surface-primary); border-color: var(--border-primary);">
      <h2 class="text-2xl font-bold mb-4" style="color: var(--text-primary);">
        🌈 Brand Colors
      </h2>
      
      <div class="grid grid-cols-2 gap-3">
        <div class="p-3 text-center text-white font-semibold rounded-lg" style="background-color: var(--primary-600);">
          Primary
        </div>
        <div class="p-3 text-center text-white font-semibold rounded-lg" style="background-color: var(--success-600);">
          Success
        </div>
        <div class="p-3 text-center text-white font-semibold rounded-lg" style="background-color: var(--warning-600);">
          Warning
        </div>
        <div class="p-3 text-center text-white font-semibold rounded-lg" style="background-color: var(--error-600);">
          Error
        </div>
      </div>
    </div>

    <!-- Card 4: Interactive Elements -->
    <div class="p-6 rounded-xl border-2 transition-all duration-500" 
         style="background-color: var(--surface-primary); border-color: var(--border-primary);">
      <h2 class="text-2xl font-bold mb-4" style="color: var(--text-primary);">
        🔘 Interactive Elements
      </h2>
      
      <div class="space-y-4">
        <input 
          type="text" 
          placeholder="Type something..."
          class="w-full px-4 py-2 rounded-lg border transition-all duration-300"
          style="
            background-color: var(--surface-primary);
            border-color: var(--border-primary);
            color: var(--text-primary);
          "
        />
        
        <button 
          class="px-6 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
          style="background-color: var(--primary-600); color: white;"
        >
          Click Me
        </button>
        
        <button 
          class="px-6 py-2 rounded-lg font-semibold border transition-all duration-300 hover:scale-105"
          style="
            background-color: transparent;
            border-color: var(--border-primary);
            color: var(--text-primary);
          "
        >
          Secondary Button
        </button>
      </div>
    </div>

  </div>

  <!-- Debug Info -->
  <div class="mt-12 max-w-2xl mx-auto p-6 rounded-xl border" 
       style="background-color: var(--surface-secondary); border-color: var(--border-secondary);">
    <h3 class="text-lg font-bold mb-3" style="color: var(--text-primary);">
      🔍 Debug Info
    </h3>
    <div class="space-y-2 text-sm" style="color: var(--text-secondary);">
      <p><strong>Current Theme:</strong> {currentTheme}</p>
      <p><strong>Instructions:</strong> คลิกปุ่มด้านบนเพื่อเปลี่ยน theme</p>
      <p><strong>What to look for:</strong> สีพื้นหลัง, สีข้อความ, และสีของ cards ควรเปลี่ยนไป</p>
    </div>
  </div>

</div>