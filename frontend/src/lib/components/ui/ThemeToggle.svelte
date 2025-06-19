<!-- frontend/src/lib/components/ui/ThemeToggle.svelte -->
<!-- ✅ Fixed Theme Toggle Component -->
<!-- Clean, working, and beautiful theme switcher -->

<script lang="ts">
  import { browser } from '$app/environment';
  import { themeStore, getThemeIcon, getThemeDisplayName } from '$lib/stores/theme.store';
  import type { Theme } from '$lib/stores/theme.store';

  // ============================================
  // PROPS
  // ============================================
  
  interface Props {
    size?: 'sm' | 'md' | 'lg';
    position?: 'left' | 'right';
    showLabel?: boolean;
    variant?: 'button' | 'dropdown';
  }

  let {
    size = 'md',
    position = 'right',
    showLabel = false,
    variant = 'dropdown'
  }: Props = $props();

  // ============================================
  // STATE
  // ============================================
  
  let isOpen = $state(false);
  let buttonRef = $state<HTMLButtonElement>();
  
  // Theme state from store
  let themeState = $state($themeStore);
  
  // Update when store changes
  $effect(() => {
    themeState = $themeStore;
  });

  // ============================================
  // COMPUTED VALUES
  // ============================================
  
  // Size classes
  let sizeClasses = $derived.by(() => {
    switch (size) {
      case 'sm': return 'w-8 h-8 text-sm';
      case 'lg': return 'w-12 h-12 text-lg';
      default: return 'w-10 h-10 text-base';
    }
  });
  
  // Current theme icon
  let currentIcon = $derived.by(() => {
    switch (themeState.effectiveTheme) {
      case 'dark': return '🌙';
      case 'light': return '☀️';
      default: return '💻';
    }
  });
  
  // Current theme display name
  let currentDisplayName = $derived.by(() => {
    return getThemeDisplayName(themeState.theme);
  });

  // ============================================
  // HANDLERS
  // ============================================
  
  function toggleDropdown() {
    isOpen = !isOpen;
  }
  
  function closeDropdown() {
    isOpen = false;
  }
  
  function handleThemeSelect(theme: Theme) {
    themeStore.setTheme(theme);
    closeDropdown();
    
    // Optional: Show feedback
    console.log(`🎨 Theme changed to: ${theme}`);
  }
  
  function handleSimpleToggle() {
    themeStore.toggle();
    console.log(`🔄 Theme toggled to: ${themeState.effectiveTheme}`);
  }
  
  // Click outside to close dropdown
  function handleClickOutside(event: MouseEvent) {
    if (!buttonRef?.contains(event.target as Node)) {
      closeDropdown();
    }
  }
  
  // Setup click outside listener
  $effect(() => {
    if (browser && isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  });
  
  // Close dropdown on Escape key
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && isOpen) {
      closeDropdown();
      buttonRef?.focus();
    }
  }
  
  $effect(() => {
    if (browser && isOpen) {
      document.addEventListener('keydown', handleKeydown);
      return () => {
        document.removeEventListener('keydown', handleKeydown);
      };
    }
  });
</script>

<!-- ============================================ -->
<!-- SIMPLE BUTTON VARIANT -->
<!-- ============================================ -->

{#if variant === 'button'}
  <button
    type="button"
    class="theme-toggle-button {sizeClasses} 
           inline-flex items-center justify-center
           rounded-lg border border-primary
           bg-surface text-primary
           hover:bg-surface-hover active:bg-surface-active
           transition-all duration-200 ease-in-out
           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
    onclick={handleSimpleToggle}
    title="สลับธีม (Ctrl+Shift+D)"
    aria-label="สลับธีม"
  >
    <span class="transition-transform duration-300 hover:scale-110">
      {currentIcon}
    </span>
    
    {#if showLabel}
      <span class="ml-2 text-sm font-medium">
        {currentDisplayName}
      </span>
    {/if}
  </button>

<!-- ============================================ -->
<!-- DROPDOWN VARIANT -->
<!-- ============================================ -->

{:else}
  <div class="theme-toggle-dropdown relative">
    
    <!-- Toggle Button -->
    <button
      bind:this={buttonRef}
      type="button"
      class="theme-toggle-button {sizeClasses}
             inline-flex items-center justify-center
             rounded-lg border border-primary
             bg-surface text-primary
             hover:bg-surface-hover active:bg-surface-active
             transition-all duration-200 ease-in-out
             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
             {isOpen ? 'ring-2 ring-primary-500' : ''}"
      onclick={toggleDropdown}
      aria-expanded={isOpen}
      aria-haspopup="menu"
      title="เลือกธีม"
      aria-label="เลือกธีม"
    >
      <span class="transition-transform duration-300 {isOpen ? 'scale-110' : ''}">
        {currentIcon}
      </span>
      
      <!-- Dropdown Arrow -->
      {#if size !== 'sm'}
        <svg 
          class="w-3 h-3 ml-1 transition-transform duration-200 {isOpen ? 'rotate-180' : ''}"
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
        class="theme-dropdown-menu absolute {position === 'left' ? 'left-0' : 'right-0'} mt-2 
               w-48 bg-elevated border border-primary rounded-lg shadow-lg 
               py-1 z-50 animate-scale-in"
        role="menu"
        aria-orientation="vertical"
      >
        
        <!-- Light Theme Option -->
        <button
          type="button"
          class="theme-option w-full px-3 py-2 text-left text-sm
                 hover:bg-surface-hover transition-colors duration-150 
                 flex items-center gap-3
                 {themeState.theme === 'light' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-primary'}"
          onclick={() => handleThemeSelect('light')}
          role="menuitem"
        >
          <span class="text-base">☀️</span>
          <span>โหมดสว่าง</span>
          {#if themeState.theme === 'light'}
            <svg class="w-4 h-4 ml-auto text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          {/if}
        </button>
        
        <!-- Dark Theme Option -->
        <button
          type="button"
          class="theme-option w-full px-3 py-2 text-left text-sm
                 hover:bg-surface-hover transition-colors duration-150 
                 flex items-center gap-3
                 {themeState.theme === 'dark' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-primary'}"
          onclick={() => handleThemeSelect('dark')}
          role="menuitem"
        >
          <span class="text-base">🌙</span>
          <span>โหมดมืด</span>
          {#if themeState.theme === 'dark'}
            <svg class="w-4 h-4 ml-auto text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          {/if}
        </button>
        
        <!-- System Theme Option -->
        <button
          type="button"
          class="theme-option w-full px-3 py-2 text-left text-sm
                 hover:bg-surface-hover transition-colors duration-150 
                 flex items-center gap-3
                 {themeState.theme === 'system' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-primary'}"
          onclick={() => handleThemeSelect('system')}
          role="menuitem"
        >
          <span class="text-base">💻</span>
          <span>ตามระบบ</span>
          {#if themeState.theme === 'system'}
            <svg class="w-4 h-4 ml-auto text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          {/if}
        </button>
        
        <!-- System Theme Indicator -->
        {#if themeState.theme === 'system'}
          <div class="px-3 py-1 text-xs text-tertiary border-t border-primary mt-1">
            ระบบ: {themeState.systemTheme === 'dark' ? '🌙 มืด' : '☀️ สว่าง'}
          </div>
        {/if}
        
      </div>
    {/if}
    
  </div>
{/if}

<!-- ============================================ -->
<!-- COMPONENT STYLES -->
<!-- ============================================ -->

<style>
  /* Theme toggle animations */
  .theme-toggle-button {
    background-color: var(--surface-primary);
    border-color: var(--border-primary);
    color: var(--text-primary);
  }
  
  .theme-toggle-button:hover {
    background-color: var(--surface-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
  
  .theme-toggle-button:active {
    transform: translateY(0);
    box-shadow: var(--shadow-sm);
  }
  
  /* Dropdown menu styling */
  .theme-dropdown-menu {
    background-color: var(--surface-elevated);
    border-color: var(--border-primary);
    box-shadow: var(--shadow-lg);
  }
  
  /* Theme option styling */
  .theme-option {
    color: var(--text-primary);
  }
  
  .theme-option:hover {
    background-color: var(--surface-hover);
  }
  
  /* Scale in animation */
  .animate-scale-in {
    animation: scaleIn 0.15s ease-out;
  }
  
  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(-8px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
  
  /* Focus states */
  .theme-toggle-button:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
  }
  
  .theme-option:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: -2px;
  }
  
  /* Smooth transitions */
  .theme-toggle-button,
  .theme-option {
    transition: all 0.2s ease-in-out;
  }
</style>