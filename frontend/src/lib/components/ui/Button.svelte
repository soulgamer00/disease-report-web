<!-- src/lib/components/ui/Button.svelte -->
<!-- Reusable Button Component for entire application -->

<script lang="ts">
  import type { Snippet } from 'svelte';

  // ============================================
  // PROPS & INTERFACE
  // ============================================

  interface Props {
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'ghost' | 'outline';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    rounded?: boolean;
    type?: 'button' | 'submit' | 'reset';
    href?: string;
    target?: '_blank' | '_self' | '_parent' | '_top';
    ariaLabel?: string;
    title?: string;
    tabindex?: number;
    onclick?: (event: MouseEvent) => void;
    children?: Snippet;
    leftIcon?: Snippet;
    rightIcon?: Snippet;
  }

  let {
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    fullWidth = false,
    rounded = false,
    type = 'button',
    href,
    target = '_self',
    ariaLabel,
    title,
    tabindex,
    onclick,
    children,
    leftIcon,
    rightIcon
  }: Props = $props();

  // ============================================
  // REACTIVE COMPUTATIONS
  // ============================================

  // Base button classes
  const baseClasses = $derived(() => {
    return [
      'inline-flex',
      'items-center',
      'justify-center',
      'font-medium',
      'transition-all',
      'duration-200',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-2',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'disabled:pointer-events-none'
    ].join(' ');
  });

  // Size-specific classes
  const sizeClasses = $derived(() => {
    const sizes = {
      xs: 'px-2 py-1 text-xs gap-1',
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2',
      xl: 'px-8 py-4 text-lg gap-3'
    };
    return sizes[size];
  });

  // Variant-specific classes
  const variantClasses = $derived(() => {
    const variants = {
      primary: [
        'bg-blue-600',
        'hover:bg-blue-700',
        'active:bg-blue-800',
        'text-white',
        'border',
        'border-blue-600',
        'hover:border-blue-700',
        'focus:ring-blue-500'
      ].join(' '),
      
      secondary: [
        'bg-gray-600',
        'hover:bg-gray-700',
        'active:bg-gray-800',
        'text-white',
        'border',
        'border-gray-600',
        'hover:border-gray-700',
        'focus:ring-gray-500'
      ].join(' '),
      
      danger: [
        'bg-red-600',
        'hover:bg-red-700',
        'active:bg-red-800',
        'text-white',
        'border',
        'border-red-600',
        'hover:border-red-700',
        'focus:ring-red-500'
      ].join(' '),
      
      success: [
        'bg-green-600',
        'hover:bg-green-700',
        'active:bg-green-800',
        'text-white',
        'border',
        'border-green-600',
        'hover:border-green-700',
        'focus:ring-green-500'
      ].join(' '),
      
      warning: [
        'bg-yellow-600',
        'hover:bg-yellow-700',
        'active:bg-yellow-800',
        'text-white',
        'border',
        'border-yellow-600',
        'hover:border-yellow-700',
        'focus:ring-yellow-500'
      ].join(' '),
      
      info: [
        'bg-cyan-600',
        'hover:bg-cyan-700',
        'active:bg-cyan-800',
        'text-white',
        'border',
        'border-cyan-600',
        'hover:border-cyan-700',
        'focus:ring-cyan-500'
      ].join(' '),
      
      ghost: [
        'bg-transparent',
        'hover:bg-gray-100',
        'active:bg-gray-200',
        'text-gray-700',
        'border',
        'border-transparent',
        'focus:ring-gray-500'
      ].join(' '),
      
      outline: [
        'bg-transparent',
        'hover:bg-gray-50',
        'active:bg-gray-100',
        'text-gray-700',
        'border',
        'border-gray-300',
        'hover:border-gray-400',
        'focus:ring-gray-500'
      ].join(' ')
    };
    return variants[variant];
  });

  // Width classes
  const widthClasses = $derived(() => {
    return fullWidth ? 'w-full' : 'w-auto';
  });

  // Border radius classes
  const radiusClasses = $derived(() => {
    if (rounded) {
      const radiusSizes = {
        xs: 'rounded-full',
        sm: 'rounded-full',
        md: 'rounded-full',
        lg: 'rounded-full',
        xl: 'rounded-full'
      };
      return radiusSizes[size];
    }
    return 'rounded-md';
  });

  // Combined classes
  const buttonClasses = $derived(() => {
    return [
      baseClasses(),
      sizeClasses(),
      variantClasses(),
      widthClasses(),
      radiusClasses()
    ].join(' ');
  });

  // Determine if this should be rendered as a link
  const isLink = $derived(!!href && !disabled && !loading);

  // ============================================
  // EVENT HANDLERS
  // ============================================

  function handleClick(event: MouseEvent): void {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }

    onclick?.(event);
  }

  // ============================================
  // LOADING SPINNER
  // ============================================

  const spinnerSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3 h-3', 
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  const spinnerClass = $derived(`animate-spin ${spinnerSizes[size]}`);
</script>

<!-- ============================================ -->
<!-- BUTTON/LINK ELEMENT -->
<!-- ============================================ -->

{#if isLink}
  <!-- Render as Link -->
  <a
    {href}
    {target}
    class={buttonClasses}
    aria-label={ariaLabel}
    {title}
    {tabindex}
    role="button"
    onclick={handleClick}
  >
    <!-- Left Icon -->
    {#if leftIcon && !loading}
      {@render leftIcon()}
    {/if}

    <!-- Loading Spinner -->
    {#if loading}
      <svg class={spinnerClass} fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    {/if}

    <!-- Button Content -->
    {#if children}
      {@render children()}
    {/if}

    <!-- Right Icon -->
    {#if rightIcon && !loading}
      {@render rightIcon()}
    {/if}
  </a>
{:else}
  <!-- Render as Button -->
  <button
    {type}
    class={buttonClasses}
    {disabled}
    aria-label={ariaLabel}
    {title}
    {tabindex}
    onclick={handleClick}
  >
    <!-- Left Icon -->
    {#if leftIcon && !loading}
      {@render leftIcon()}
    {/if}

    <!-- Loading Spinner -->
    {#if loading}
      <svg class={spinnerClass} fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    {/if}

    <!-- Button Content -->
    {#if children}
      {@render children()}
    {/if}

    <!-- Right Icon -->
    {#if rightIcon && !loading}
      {@render rightIcon()}
    {/if}
  </button>
{/if}

<!-- ============================================ -->
<!-- STYLES -->
<!-- ============================================ -->

<style>
  /* Ensure smooth transitions */
  :global(.animate-spin) {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  /* Prevent text selection on button */
  button, a[role="button"] {
    user-select: none;
    -webkit-user-select: none;
  }
  
  /* Focus ring improvements */
  button:focus-visible, a[role="button"]:focus-visible {
    outline: 2px solid transparent;
    outline-offset: 2px;
  }
</style>