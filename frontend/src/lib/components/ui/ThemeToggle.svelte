<!-- frontend/src/lib/components/ui/ThemeToggle.svelte -->
<!-- ✅ FIXED Theme Toggle Component -->
<!-- Complete, working, and beautiful theme switcher -->

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
  }
  
  function handleToggleTheme() {
    if (variant === 'button') {
      themeStore.toggle();
    } else {
      toggleDropdown();
    }
  }
  
  // Close dropdown when clicking outside
  function handleOutsideClick(event: MouseEvent) {
    if (!buttonRef?.contains(event.target as Node)) {
      closeDropdown();
    }
  }
  
  // Handle keyboard navigation
  function handleKeydown(event: KeyboardEvent) {
    if (!isOpen) return;
    
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        closeDropdown();
        buttonRef?.focus();
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        closeDropdown();
        break;
    }
  }

  // ============================================
  // LIFECYCLE
  // ============================================
  
  // Add/remove event listeners for outside clicks
  $effect(() => {
    if (browser && isOpen) {
      document.addEventListener('click', handleOutsideClick);
      document.addEventListener('keydown', handleKeydown);
      
      return () => {
        document.removeEventListener('click', handleOutsideClick);
        document.removeEventListener('keydown', handleKeydown);
      };
    }
  });
</script>

<!-- ============================================ -->
<!-- COMPONENT TEMPLATE -->
<!-- ============================================ -->

<div class="theme-toggle-container relative">
  
  <!-- Toggle Button -->
  <button
    bind:this={buttonRef}
    type="button"
    onclick={handleToggleTheme}
    class="theme-toggle-button inline-flex items-center justify-center gap-2 rounded-lg font-medium 
           focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 
           hover:scale-105 active:scale-95 {sizeClasses}"
    class:ring-2={isOpen}
    style="background-color: var(--surface-primary); border: 1px solid var(--border-primary); 
           color: var(--text-primary);"
    aria-label="เปลี่ยนธีม"
    aria-expanded={variant === 'dropdown' ? isOpen : undefined}
    aria-haspopup={variant === 'dropdown' ? 'menu' : undefined}
  >
    
    <!-- Theme Icon -->
    <span class="flex-shrink-0 transition-transform duration-200" 
          class:rotate-180={themeState.effectiveTheme === 'dark'}>
      {currentIcon}
    </span>
    
    <!-- Theme Label (optional) -->
    {#if showLabel}
      <span class="hidden sm:inline-block text-sm font-medium">
        {currentDisplayName}
      </span>
    {/if}
    
    <!-- Dropdown Arrow (only for dropdown variant) -->
    {#if variant === 'dropdown'}
      <svg 
        class="w-4 h-4 transition-transform duration-200 {isOpen ? 'rotate-180' : ''}" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    {/if}
    
  </button>

  <!-- Dropdown Menu (only for dropdown variant) -->
  {#if variant === 'dropdown' && isOpen}
    <div 
      class="theme-dropdown-menu absolute z-50 mt-2 py-1 rounded-lg shadow-lg border animate-scale-in
             {position === 'right' ? 'right-0' : 'left-0'}"
      style="background-color: var(--surface-elevated); border-color: var(--border-primary); 
             box-shadow: var(--shadow-lg); min-width: 160px;"
      role="menu"
      aria-orientation="vertical"
    >
      
      <!-- Light Theme Option -->
      <button
        type="button"
        onclick={() => handleThemeSelect('light')}
        class="theme-option w-full px-4 py-2 text-left text-sm flex items-center gap-3 
               transition-colors duration-150 hover:scale-[1.02] focus:outline-none"
        class:font-semibold={themeState.theme === 'light'}
        style="color: var(--text-primary);"
        role="menuitem"
      >
        <span class="text-base">{getThemeIcon('light')}</span>
        <span>{getThemeDisplayName('light')}</span>
        {#if themeState.theme === 'light'}
          <span class="ml-auto text-xs" style="color: var(--primary-500);">✓</span>
        {/if}
      </button>
      
      <!-- Dark Theme Option -->
      <button
        type="button"
        onclick={() => handleThemeSelect('dark')}
        class="theme-option w-full px-4 py-2 text-left text-sm flex items-center gap-3 
               transition-colors duration-150 hover:scale-[1.02] focus:outline-none"
        class:font-semibold={themeState.theme === 'dark'}
        style="color: var(--text-primary);"
        role="menuitem"
      >
        <span class="text-base">{getThemeIcon('dark')}</span>
        <span>{getThemeDisplayName('dark')}</span>
        {#if themeState.theme === 'dark'}
          <span class="ml-auto text-xs" style="color: var(--primary-500);">✓</span>
        {/if}
      </button>
      
      <!-- System Theme Option -->
      <button
        type="button"
        onclick={() => handleThemeSelect('system')}
        class="theme-option w-full px-4 py-2 text-left text-sm flex items-center gap-3 
               transition-colors duration-150 hover:scale-[1.02] focus:outline-none"
        class:font-semibold={themeState.theme === 'system'}
        style="color: var(--text-primary);"
        role="menuitem"
      >
        <span class="text-base">{getThemeIcon('system')}</span>
        <div class="flex flex-col">
          <span>{getThemeDisplayName('system')}</span>
          <span class="text-xs opacity-75">
            ปัจจุบัน: {themeState.systemTheme === 'dark' ? 'มืด' : 'สว่าง'}
          </span>
        </div>
        {#if themeState.theme === 'system'}
          <span class="ml-auto text-xs" style="color: var(--primary-500);">✓</span>
        {/if}
      </button>
      
    </div>
  {/if}
  
</div>

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