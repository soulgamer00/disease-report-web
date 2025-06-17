<!-- src/lib/components/ui/Select.svelte -->
<!-- Reusable Select Component for entire application -->

<script lang="ts">
  import type { Snippet } from 'svelte';

  // ============================================
  // TYPES
  // ============================================

  interface Option {
    value: string | number;
    label: string;
    disabled?: boolean;
  }

  interface Props {
    value?: string | number;
    options: Option[];
    placeholder?: string;
    label?: string;
    hint?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    id?: string;
    name?: string;
    ariaLabel?: string;
    multiple?: boolean;
    searchable?: boolean;
    clearable?: boolean;
    leftIcon?: Snippet;
    onchange?: (event: Event) => void;
    onfocus?: (event: FocusEvent) => void;
    onblur?: (event: FocusEvent) => void;
  }

  let {
    value = $bindable(''),
    options = [],
    placeholder = 'เลือก...',
    label,
    hint,
    error,
    disabled = false,
    required = false,
    size = 'md',
    fullWidth = false,
    id,
    name,
    ariaLabel,
    multiple = false,
    searchable = false,
    clearable = false,
    leftIcon,
    onchange,
    onfocus,
    onblur
  }: Props = $props();

  // ============================================
  // REACTIVE STATE
  // ============================================

  let selectElement: HTMLSelectElement;
  let isOpen = $state(false);
  let searchQuery = $state('');
  let isFocused = $state(false);

  // Generate unique ID if not provided
  const selectId = $derived(id || `select-${Math.random().toString(36).substr(2, 9)}`);
  const errorId = $derived(`${selectId}-error`);
  const hintId = $derived(`${selectId}-hint`);

  // ============================================
  // REACTIVE COMPUTATIONS
  // ============================================

  // Filter options based on search query
  const filteredOptions = $derived(() => {
    if (!searchable || !searchQuery.trim()) {
      return options;
    }
    
    return options.filter(option =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Find selected option
  const selectedOption = $derived(() => {
    return options.find(option => option.value === value);
  });

  // Base container classes
  const containerClasses = $derived(() => {
    const classes = ['relative'];
    if (fullWidth) classes.push('w-full');
    return classes.join(' ');
  });

  // Label classes
  const labelClasses = $derived(() => {
    return [
      'block',
      'text-sm',
      'font-medium',
      'mb-2',
      error ? 'text-red-700' : 'text-gray-700',
      disabled ? 'opacity-50' : ''
    ].filter(Boolean).join(' ');
  });

  // Size-specific classes
  const sizeClasses = $derived(() => {
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-3 py-2 text-sm', 
      lg: 'px-4 py-3 text-base'
    };
    return sizes[size];
  });

  // Select base classes
  const selectBaseClasses = $derived(() => {
    return [
      'block',
      'w-full',
      'border',
      'rounded-md',
      'bg-white',
      'transition-all',
      'duration-200',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-0',
      'appearance-none'
    ].join(' ');
  });

  // Select state classes
  const selectStateClasses = $derived(() => {
    if (error) {
      return [
        'border-red-300',
        'text-red-900',
        'focus:border-red-500',
        'focus:ring-red-500'
      ].join(' ');
    }

    if (disabled) {
      return [
        'bg-gray-50',
        'border-gray-200',
        'text-gray-500',
        'cursor-not-allowed'
      ].join(' ');
    }

    return [
      'border-gray-300',
      'text-gray-900',
      'focus:border-blue-500',
      'focus:ring-blue-500',
      'hover:border-gray-400'
    ].join(' ');
  });

  // Icon padding classes
  const iconPaddingClasses = $derived(() => {
    return leftIcon ? 'pl-10 pr-8' : 'pr-8';
  });

  // Combined select classes
  const selectClasses = $derived(() => {
    return [
      selectBaseClasses,
      sizeClasses,
      selectStateClasses,
      iconPaddingClasses
    ].filter(Boolean).join(' ');
  });

  // Icon container classes
  const iconClasses = $derived(() => {
    const baseClasses = 'absolute inset-y-0 flex items-center pointer-events-none';
    const sizeSpecific = size === 'sm' ? 'px-2' : size === 'lg' ? 'px-3' : 'px-3';
    return `${baseClasses} ${sizeSpecific}`;
  });

  // Aria described by
  const ariaDescribedByValue = $derived(() => {
    const describedBy: string[] = [];
    if (hint) describedBy.push(hintId);
    if (error) describedBy.push(errorId);
    return describedBy.length > 0 ? describedBy.join(' ') : undefined;
  });

  // ============================================
  // EVENT HANDLERS
  // ============================================

  function handleChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    value = target.value;
    onchange?.(event);
  }

  function handleFocus(event: FocusEvent): void {
    isFocused = true;
    onfocus?.(event);
  }

  function handleBlur(event: FocusEvent): void {
    isFocused = false;
    onblur?.(event);
  }

  function handleClear(): void {
    value = '';
    selectElement?.focus();
  }

  // ============================================
  // PUBLIC METHODS
  // ============================================

  export function focus(): void {
    selectElement?.focus();
  }

  export function blur(): void {
    selectElement?.blur();
  }
</script>

<!-- ============================================ -->
<!-- SELECT FIELD -->
<!-- ============================================ -->

<div class={containerClasses}>
  
  <!-- Label -->
  {#if label}
    <label for={selectId} class={labelClasses}>
      {label}
      {#if required}
        <span class="text-red-500 ml-1">*</span>
      {/if}
    </label>
  {/if}

  <!-- Select Wrapper -->
  <div class="relative">
    
    <!-- Left Icon -->
    {#if leftIcon}
      <div class="{iconClasses} left-0">
        {@render leftIcon()}
      </div>
    {/if}

    <!-- Select Element -->
    <select
      bind:this={selectElement}
      {value}
      {disabled}
      {required}
      {name}
      {multiple}
      id={selectId}
      class={selectClasses}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedByValue()}
      aria-invalid={error ? 'true' : 'false'}
      onchange={handleChange}
      onfocus={handleFocus}
      onblur={handleBlur}
    >
      <!-- Placeholder Option -->
      {#if placeholder && !multiple}
        <option value="" disabled={required}>
          {placeholder}
        </option>
      {/if}

      <!-- Options -->
      {#each filteredOptions() as option (option.value)}
        <option 
          value={option.value} 
          disabled={option.disabled}
        >
          {option.label}
        </option>
      {/each}
    </select>

    <!-- Dropdown Arrow -->
    <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>

    <!-- Clear Button -->
    {#if clearable && value && !disabled}
      <button
        type="button"
        class="absolute inset-y-0 right-6 flex items-center pr-1 text-gray-400 hover:text-gray-600"
        onclick={handleClear}
        tabindex="-1"
        aria-label="ล้างการเลือก"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    {/if}

  </div>

  <!-- Hint Text -->
  {#if hint && !error}
    <p id={hintId} class="mt-1 text-sm text-gray-500">
      {hint}
    </p>
  {/if}

  <!-- Error Message -->
  {#if error}
    <p id={errorId} class="mt-1 text-sm text-red-600" role="alert">
      {error}
    </p>
  {/if}

</div>

<!-- ============================================ -->
<!-- STYLES -->
<!-- ============================================ -->

<style>
  /* Remove default select arrow */
  select {
    background-image: none;
  }
  
  /* Ensure proper focus ring */
  select:focus {
    outline: 2px solid transparent;
    outline-offset: 2px;
  }
  
  /* Custom scrollbar for options */
  select::-webkit-scrollbar {
    width: 8px;
  }
  
  select::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  select::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }
  
  select::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
</style>