<!-- frontend/src/lib/components/ui/ThemeToggle.svelte -->
<!-- Theme toggle component with beautiful animations and proper TypeScript -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { themeStore, type Theme } from '$lib/stores/theme.store';
  
  // ============================================
  // PROPS
  // ============================================
  
  interface Props {
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    variant?: 'button' | 'dropdown' | 'icon';
    position?: 'left' | 'right';
    className?: string;
  }
  
  let {
    size = 'md',
    showLabel = false,
    variant = 'button',
    position = 'right',
    className = ''
  }: Props = $props();
  
  // ============================================
  // STATE
  // ============================================
  
  let isOpen = $state(false);
  let mounted = $state(false);
  
  // Subscribe to theme store - properly typed
  let themeState = $state({
    theme: 'system' as Theme,
    systemTheme: 'light' as 'light' | 'dark',
    effectiveTheme: 'light' as 'light' | 'dark',
    isLoading: false
  });
  
  // ============================================
  // LIFECYCLE
  // ============================================
  
  onMount(() => {
    mounted = true;
    themeStore.initialize();
    
    // Subscribe to theme changes
    const unsubscribe = themeStore.subscribe(state => {
      themeState = state;
    });
    
    return unsubscribe;
  });
  
  // ============================================
  // COMPUTED VALUES (using $derived with proper typing)
  // ============================================
  
  let buttonSizeClasses = $derived.by(() => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8 text-sm';
      case 'lg':
        return 'w-12 h-12 text-lg';
      default:
        return 'w-10 h-10 text-base';
    }
  });
  
  let iconSizeClasses = $derived.by(() => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  });
  
  let currentIcon = $derived.by(() => {
    if (!mounted) return 'sun';
    return themeState.effectiveTheme === 'dark' ? 'moon' : 'sun';
  });
  
  let currentLabel = $derived.by(() => {
    if (!mounted) return 'โหมดสว่าง';
    
    switch (themeState.theme) {
      case 'light':
        return 'โหมดสว่าง';
      case 'dark':
        return 'โหมดมืด';
      case 'system':
        return 'ตามระบบ';
      default:
        return 'ไม่ทราบ';
    }
  });
  
  // ============================================
  // HANDLERS
  // ============================================
  
  function handleToggle() {
    if (variant === 'dropdown') {
      isOpen = !isOpen;
    } else {
      themeStore.toggleTheme();
    }
  }
  
  function handleThemeSelect(theme: Theme) {
    themeStore.setTheme(theme);
    isOpen = false;
  }
  
  function handleClickOutside(event: Event) {
    const target = event.target as Element;
    const dropdown = document.getElementById('theme-dropdown');
    const button = document.getElementById('theme-toggle-button');
    
    if (dropdown && !dropdown.contains(target) && !button?.contains(target)) {
      isOpen = false;
    }
  }
  
  // ============================================
  // EFFECTS
  // ============================================
  
  $effect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  });
</script>

<!-- ============================================ -->
<!-- BUTTON VARIANT -->
<!-- ============================================ -->

{#if variant === 'button'}
  <button
    type="button"
    class="btn-ghost relative inline-flex items-center justify-center rounded-lg 
           transition-all duration-200 hover:bg-surface-hover focus:outline-none 
           focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 
           {buttonSizeClasses} {className}"
    onclick={handleToggle}
    aria-label="เปลี่ยนธีม"
    title={currentLabel}
  >
    <!-- Sun Icon -->
    <svg
      class="absolute transition-all duration-300 transform 
             {currentIcon === 'sun' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'}
             {iconSizeClasses}"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
    
    <!-- Moon Icon -->
    <svg
      class="absolute transition-all duration-300 transform 
             {currentIcon === 'moon' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}
             {iconSizeClasses}"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
    
    {#if showLabel}
      <span class="ml-2 text-sm font-medium text-primary">
        {currentLabel}
      </span>
    {/if}
  </button>
{/if}

<!-- ============================================ -->
<!-- DROPDOWN VARIANT -->
<!-- ============================================ -->

{#if variant === 'dropdown'}
  <div class="relative">
    <!-- Dropdown Toggle Button -->
    <button
      id="theme-toggle-button"
      type="button"
      class="btn-ghost relative inline-flex items-center justify-center rounded-lg 
             transition-all duration-200 hover:bg-surface-hover focus:outline-none 
             focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 
             {buttonSizeClasses} {className}"
      onclick={handleToggle}
      aria-label="เลือกธีม"
      aria-expanded={isOpen}
      aria-haspopup="true"
    >
      <!-- Current Theme Icon -->
      <svg
        class="transition-transform duration-200 {iconSizeClasses}
               {isOpen ? 'rotate-180' : ''}"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        {#if currentIcon === 'sun'}
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        {:else}
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        {/if}
      </svg>
      
      {#if showLabel}
        <span class="ml-2 text-sm font-medium text-primary">
          {currentLabel}
        </span>
        
        <!-- Dropdown Arrow -->
        <svg
          class="ml-1 w-4 h-4 transition-transform duration-200 
                 {isOpen ? 'rotate-180' : ''}"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      {/if}
    </button>
    
    <!-- Dropdown Menu -->
    {#if isOpen}
      <div
        id="theme-dropdown"
        class="absolute {position === 'left' ? 'left-0' : 'right-0'} mt-2 
               w-48 bg-elevated border border-primary rounded-lg shadow-lg 
               py-1 z-50 animate-scale-in"
        role="menu"
        aria-orientation="vertical"
      >
        <!-- Light Theme Option -->
        <button
          type="button"
          class="w-full px-3 py-2 text-left text-sm hover:bg-surface-hover 
                 transition-colors duration-150 flex items-center gap-3
                 {themeState.theme === 'light' ? 'bg-primary-50 text-primary-700' : 'text-primary'}"
          onclick={() => handleThemeSelect('light')}
          role="menuitem"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <span>โหมดสว่าง</span>
          {#if themeState.theme === 'light'}
            <svg class="w-4 h-4 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          {/if}
        </button>
        
        <!-- Dark Theme Option -->
        <button
          type="button"
          class="w-full px-3 py-2 text-left text-sm hover:bg-surface-hover 
                 transition-colors duration-150 flex items-center gap-3
                 {themeState.theme === 'dark' ? 'bg-primary-50 text-primary-700' : 'text-primary'}"
          onclick={() => handleThemeSelect('dark')}
          role="menuitem"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M20.354 15.354A9 9 0 718.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
          <span>โหมดมืด</span>
          {#if themeState.theme === 'dark'}
            <svg class="w-4 h-4 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          {/if}
        </button>
        
        <!-- System Theme Option -->
        <button
          type="button"
          class="w-full px-3 py-2 text-left text-sm hover:bg-surface-hover 
                 transition-colors duration-150 flex items-center gap-3
                 {themeState.theme === 'system' ? 'bg-primary-50 text-primary-700' : 'text-primary'}"
          onclick={() => handleThemeSelect('system')}
          role="menuitem"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span>ตามระบบ</span>
          {#if themeState.theme === 'system'}
            <svg class="w-4 h-4 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          {/if}
        </button>
        
        <!-- Current System Theme Indicator -->
        {#if themeState.theme === 'system'}
          <div class="px-3 py-1 text-xs text-tertiary border-t border-primary mt-1">
            ระบบ: {themeState.systemTheme === 'dark' ? 'โหมดมืด' : 'โหมดสว่าง'}
          </div>
        {/if}
      </div>
    {/if}
  </div>
{/if}

<!-- ============================================ -->
<!-- ICON ONLY VARIANT -->
<!-- ============================================ -->

{#if variant === 'icon'}
  <button
    type="button"
    class="inline-flex items-center justify-center rounded-full 
           transition-all duration-200 hover:bg-surface-hover 
           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 
           {buttonSizeClasses} {className}"
    onclick={handleToggle}
    aria-label="เปลี่ยนธีม"
    title={currentLabel}
  >
    <!-- Animated Icon Container -->
    <div class="relative {iconSizeClasses}">
      <!-- Sun Icon -->
      <svg
        class="absolute inset-0 transition-all duration-300 transform 
               {currentIcon === 'sun' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'}"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
      
      <!-- Moon Icon -->
      <svg
        class="absolute inset-0 transition-all duration-300 transform 
               {currentIcon === 'moon' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
    </div>
  </button>
{/if}

<!-- ============================================ -->
<!-- STYLES -->
<!-- ============================================ -->

<style>
  /* Additional component-specific styles if needed */
  button {
    -webkit-tap-highlight-color: transparent;
  }
  
  /* Ensure proper z-index layering */
  .z-50 {
    z-index: 50;
  }
  
  /* Custom animation for better performance */
  @keyframes theme-icon-spin {
    from {
      transform: rotate(0deg) scale(1);
    }
    to {
      transform: rotate(180deg) scale(0.8);
    }
  }
  
  /* Hover effect for better UX */
  button:hover svg {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }
</style>