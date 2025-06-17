<!-- src/lib/components/ui/Badge.svelte -->
<!-- Reusable Badge Component for entire application -->

<script lang="ts">
  import type { Snippet } from 'svelte';

  // ============================================
  // TYPES
  // ============================================

  type BadgeVariant = 'solid' | 'outline' | 'soft' | 'ghost';
  type BadgeColor = 'gray' | 'red' | 'yellow' | 'green' | 'blue' | 'indigo' | 'purple' | 'pink';
  type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';
  type BadgeShape = 'rounded' | 'pill' | 'square';

  interface Props {
    variant?: BadgeVariant;
    color?: BadgeColor;
    size?: BadgeSize;
    shape?: BadgeShape;
    removable?: boolean;
    clickable?: boolean;
    disabled?: boolean;
    dot?: boolean;
    pulse?: boolean;
    count?: number;
    max?: number;
    href?: string;
    target?: '_blank' | '_self' | '_parent' | '_top';
    onclick?: (event: MouseEvent) => void;
    onRemove?: () => void;
    children?: Snippet;
    leftIcon?: Snippet;
    rightIcon?: Snippet;
  }

  let {
    variant = 'solid',
    color = 'gray',
    size = 'md',
    shape = 'rounded',
    removable = false,
    clickable = false,
    disabled = false,
    dot = false,
    pulse = false,
    count,
    max = 99,
    href,
    target = '_self',
    onclick,
    onRemove,
    children,
    leftIcon,
    rightIcon
  }: Props = $props();

  // ============================================
  // REACTIVE COMPUTATIONS
  // ============================================

  // Display count
  const displayCount = $derived(() => {
    if (count === undefined || count === null) return '';
    if (count > max) return `${max}+`;
    return count.toString();
  });

  // Base classes
  const baseClasses = $derived(() => {
    return [
      'inline-flex',
      'items-center',
      'font-medium',
      'transition-all',
      'duration-200',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-2'
    ].join(' ');
  });

  // Size classes
  const sizeClasses = $derived(() => {
    const sizes = {
      xs: {
        padding: dot ? 'p-1' : 'px-2 py-0.5',
        text: 'text-xs',
        gap: 'gap-1',
        iconSize: 'w-3 h-3'
      },
      sm: {
        padding: dot ? 'p-1.5' : 'px-2.5 py-0.5',
        text: 'text-xs',
        gap: 'gap-1',
        iconSize: 'w-3 h-3'
      },
      md: {
        padding: dot ? 'p-2' : 'px-3 py-1',
        text: 'text-sm',
        gap: 'gap-1.5',
        iconSize: 'w-4 h-4'
      },
      lg: {
        padding: dot ? 'p-2.5' : 'px-4 py-1.5',
        text: 'text-base',
        gap: 'gap-2',
        iconSize: 'w-5 h-5'
      }
    };
    return sizes[size];
  });

  // Shape classes
  const shapeClasses = $derived(() => {
    const shapes = {
      rounded: 'rounded-md',
      pill: 'rounded-full',
      square: 'rounded-none'
    };
    return shapes[shape];
  });

  // Color and variant classes
  const colorVariantClasses = $derived(() => {
    const colorMap = {
      gray: {
        solid: 'bg-gray-600 text-white border-gray-600 hover:bg-gray-700 focus:ring-gray-500',
        outline: 'bg-transparent text-gray-600 border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
        soft: 'bg-gray-100 text-gray-800 border-gray-100 hover:bg-gray-200 focus:ring-gray-500',
        ghost: 'bg-transparent text-gray-600 border-transparent hover:bg-gray-100 focus:ring-gray-500'
      },
      red: {
        solid: 'bg-red-600 text-white border-red-600 hover:bg-red-700 focus:ring-red-500',
        outline: 'bg-transparent text-red-600 border-red-300 hover:bg-red-50 focus:ring-red-500',
        soft: 'bg-red-100 text-red-800 border-red-100 hover:bg-red-200 focus:ring-red-500',
        ghost: 'bg-transparent text-red-600 border-transparent hover:bg-red-100 focus:ring-red-500'
      },
      yellow: {
        solid: 'bg-yellow-600 text-white border-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
        outline: 'bg-transparent text-yellow-600 border-yellow-300 hover:bg-yellow-50 focus:ring-yellow-500',
        soft: 'bg-yellow-100 text-yellow-800 border-yellow-100 hover:bg-yellow-200 focus:ring-yellow-500',
        ghost: 'bg-transparent text-yellow-600 border-transparent hover:bg-yellow-100 focus:ring-yellow-500'
      },
      green: {
        solid: 'bg-green-600 text-white border-green-600 hover:bg-green-700 focus:ring-green-500',
        outline: 'bg-transparent text-green-600 border-green-300 hover:bg-green-50 focus:ring-green-500',
        soft: 'bg-green-100 text-green-800 border-green-100 hover:bg-green-200 focus:ring-green-500',
        ghost: 'bg-transparent text-green-600 border-transparent hover:bg-green-100 focus:ring-green-500'
      },
      blue: {
        solid: 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        outline: 'bg-transparent text-blue-600 border-blue-300 hover:bg-blue-50 focus:ring-blue-500',
        soft: 'bg-blue-100 text-blue-800 border-blue-100 hover:bg-blue-200 focus:ring-blue-500',
        ghost: 'bg-transparent text-blue-600 border-transparent hover:bg-blue-100 focus:ring-blue-500'
      },
      indigo: {
        solid: 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
        outline: 'bg-transparent text-indigo-600 border-indigo-300 hover:bg-indigo-50 focus:ring-indigo-500',
        soft: 'bg-indigo-100 text-indigo-800 border-indigo-100 hover:bg-indigo-200 focus:ring-indigo-500',
        ghost: 'bg-transparent text-indigo-600 border-transparent hover:bg-indigo-100 focus:ring-indigo-500'
      },
      purple: {
        solid: 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700 focus:ring-purple-500',
        outline: 'bg-transparent text-purple-600 border-purple-300 hover:bg-purple-50 focus:ring-purple-500',
        soft: 'bg-purple-100 text-purple-800 border-purple-100 hover:bg-purple-200 focus:ring-purple-500',
        ghost: 'bg-transparent text-purple-600 border-transparent hover:bg-purple-100 focus:ring-purple-500'
      },
      pink: {
        solid: 'bg-pink-600 text-white border-pink-600 hover:bg-pink-700 focus:ring-pink-500',
        outline: 'bg-transparent text-pink-600 border-pink-300 hover:bg-pink-50 focus:ring-pink-500',
        soft: 'bg-pink-100 text-pink-800 border-pink-100 hover:bg-pink-200 focus:ring-pink-500',
        ghost: 'bg-transparent text-pink-600 border-transparent hover:bg-pink-100 focus:ring-pink-500'
      }
    };
    return colorMap[color][variant];
  });

  // Combined classes
  const badgeClasses = $derived(() => {
    const classes = [
      baseClasses(),
      sizeClasses().padding,
      sizeClasses().text,
      sizeClasses().gap,
      shapeClasses(),
      colorVariantClasses(),
      'border'
    ];

    if (clickable || href) {
      classes.push('cursor-pointer');
    }

    if (disabled) {
      classes.push('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
    }

    if (pulse) {
      classes.push('animate-pulse');
    }

    return classes.join(' ');
  });

  // Dot classes
  const dotClasses = $derived(() => {
    if (!dot) return '';
    
    const dotSize = {
      xs: 'w-2 h-2',
      sm: 'w-2.5 h-2.5',
      md: 'w-3 h-3',
      lg: 'w-3.5 h-3.5'
    };
    
    return [
      dotSize[size],
      'rounded-full',
      colorVariantClasses().split(' ')[0] // Just take the background color
    ].join(' ');
  });

  // ============================================
  // EVENT HANDLERS
  // ============================================

  function handleClick(event: MouseEvent): void {
    if (disabled) return;
    onclick?.(event);
  }

  function handleRemove(event: MouseEvent): void {
    event.stopPropagation();
    if (disabled) return;
    onRemove?.();
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (disabled) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const mouseEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true
      });
      handleClick(mouseEvent);
    }
  }

  // ============================================
  // COMPUTED PROPERTIES
  // ============================================

  const isLink = $derived(!!href && !disabled);
  const showContent = $derived(!dot || (count !== undefined && count > 0));
</script>

<!-- ============================================ -->
<!-- BADGE COMPONENT -->
<!-- ============================================ -->

{#if isLink}
  <!-- Render as Link -->
  <a
    {href}
    {target}
    class={badgeClasses()}
    onclick={handleClick}
    aria-label={typeof children === 'undefined' && displayCount() ? `Badge with count ${displayCount()}` : undefined}
  >
    <!-- Dot Only -->
    {#if dot && !showContent}
      <div class={dotClasses()} aria-hidden="true"></div>
    {:else}
      <!-- Left Icon -->
      {#if leftIcon}
        <div class={sizeClasses().iconSize} aria-hidden="true">
          {@render leftIcon()}
        </div>
      {/if}

      <!-- Content -->
      {#if children}
        {@render children()}
      {:else if displayCount()}
        {displayCount()}
      {/if}

      <!-- Right Icon -->
      {#if rightIcon}
        <div class={sizeClasses().iconSize} aria-hidden="true">
          {@render rightIcon()}
        </div>
      {/if}

      <!-- Remove Button -->
      {#if removable}
        <span
          class="ml-1 inline-flex items-center justify-center {sizeClasses().iconSize} rounded-full hover:bg-black hover:bg-opacity-20 focus:outline-none focus:bg-black focus:bg-opacity-20 cursor-pointer"
          onclick={handleRemove}
          onkeydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              handleRemove(new MouseEvent('click'));
            }
          }}
          role="button"
          tabindex="0"
          aria-label="ลบ"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </span>
      {/if}
    {/if}
  </a>
{:else if clickable}
  <!-- Render as clickable button -->
  <button
    type="button"
    class={badgeClasses()}
    onclick={handleClick}
    onkeydown={handleKeydown}
    {disabled}
    aria-label={typeof children === 'undefined' && displayCount() ? `Badge with count ${displayCount()}` : undefined}
  >
    <!-- Dot Only -->
    {#if dot && !showContent}
      <div class={dotClasses()} aria-hidden="true"></div>
    {:else}
      <!-- Left Icon -->
      {#if leftIcon}
        <div class={sizeClasses().iconSize} aria-hidden="true">
          {@render leftIcon()}
        </div>
      {/if}

      <!-- Content -->
      {#if children}
        {@render children()}
      {:else if displayCount()}
        {displayCount()}
      {/if}

      <!-- Right Icon -->
      {#if rightIcon}
        <div class={sizeClasses().iconSize} aria-hidden="true">
          {@render rightIcon()}
        </div>
      {/if}

      <!-- Remove Button -->
      {#if removable}
        <span
          class="ml-1 inline-flex items-center justify-center {sizeClasses().iconSize} rounded-full hover:bg-black hover:bg-opacity-20 focus:outline-none focus:bg-black focus:bg-opacity-20 cursor-pointer"
          onclick={handleRemove}
          onkeydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              handleRemove(new MouseEvent('click'));
            }
          }}
          role="button"
          tabindex="0"
          aria-label="ลบ"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </span>
      {/if}
    {/if}
  </button>
{:else}
  <!-- Render as static span -->
  <span
    class={badgeClasses()}
    aria-label={typeof children === 'undefined' && displayCount() ? `Badge with count ${displayCount()}` : undefined}
  >
    <!-- Dot Only -->
    {#if dot && !showContent}
      <div class={dotClasses()} aria-hidden="true"></div>
    {:else}
      <!-- Left Icon -->
      {#if leftIcon}
        <div class={sizeClasses().iconSize} aria-hidden="true">
          {@render leftIcon()}
        </div>
      {/if}

      <!-- Content -->
      {#if children}
        {@render children()}
      {:else if displayCount()}
        {displayCount()}
      {/if}

      <!-- Right Icon -->
      {#if rightIcon}
        <div class={sizeClasses().iconSize} aria-hidden="true">
          {@render rightIcon()}
        </div>
      {/if}

      <!-- Remove Button -->
      {#if removable}
        <span
          class="ml-1 inline-flex items-center justify-center {sizeClasses().iconSize} rounded-full hover:bg-black hover:bg-opacity-20 focus:outline-none focus:bg-black focus:bg-opacity-20 cursor-pointer"
          onclick={handleRemove}
          onkeydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              handleRemove(new MouseEvent('click'));
            }
          }}
          role="button"
          tabindex="0"
          aria-label="ลบ"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </span>
      {/if}
    {/if}
  </span>
{/if}