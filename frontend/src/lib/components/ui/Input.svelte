<!-- src/lib/components/ui/Input.svelte -->
<!-- Reusable Input Component for entire application -->

<script lang="ts">
  import type { Snippet } from 'svelte';

  // ============================================
  // PROPS & INTERFACE
  // ============================================

  interface Props {
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local';
    value?: string | number;
    placeholder?: string;
    label?: string;
    hint?: string;
    error?: string;
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    id?: string;
    name?: string;
    pattern?: string;
    min?: string | number;
    max?: string | number;
    step?: string | number;
    maxlength?: number;
    minlength?: number;
    ariaLabel?: string;
    ariaDescribedBy?: string;
    leftIcon?: Snippet;
    rightIcon?: Snippet;
    prefix?: Snippet;
    suffix?: Snippet;
    oninput?: (event: Event) => void;
    onchange?: (event: Event) => void;
    onfocus?: (event: FocusEvent) => void;
    onblur?: (event: FocusEvent) => void;
    onkeydown?: (event: KeyboardEvent) => void;
  }

  let {
    type = 'text',
    value = $bindable(''),
    placeholder,
    label,
    hint,
    error,
    disabled = false,
    readonly = false,
    required = false,
    size = 'md',
    fullWidth = false,
    id,
    name,
    pattern,
    min,
    max,
    step,
    maxlength,
    minlength,
    ariaLabel,
    ariaDescribedBy,
    leftIcon,
    rightIcon,
    prefix,
    suffix,
    oninput,
    onchange,
    onfocus,
    onblur,
    onkeydown
  }: Props = $props();

  // ============================================
  // REACTIVE STATE
  // ============================================

  let inputElement: HTMLInputElement;
  let isFocused = $state(false);

  // Generate unique ID if not provided
  const inputId = $derived(id || `input-${Math.random().toString(36).substr(2, 9)}`);
  const errorId = $derived(`${inputId}-error`);
  const hintId = $derived(`${inputId}-hint`);

  // ============================================
  // REACTIVE COMPUTATIONS
  // ============================================

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

  // Input wrapper classes
  const wrapperClasses = $derived(() => {
    const classes = ['relative', 'rounded-md', 'shadow-sm'];
    if (error) {
      classes.push('ring-1', 'ring-red-300');
    }
    return classes.join(' ');
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

  // Input base classes
  const inputBaseClasses = $derived(() => {
    return [
      'block',
      'w-full',
      'border',
      'rounded-md',
      'placeholder-gray-400',
      'transition-all',
      'duration-200',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-0'
    ].join(' ');
  });

  // Input state classes
  const inputStateClasses = $derived(() => {
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
    const leftPadding = leftIcon || prefix ? 'pl-10' : '';
    const rightPadding = rightIcon || suffix ? 'pr-10' : '';
    return [leftPadding, rightPadding].filter(Boolean).join(' ');
  });

  // Combined input classes
  const inputClasses = $derived(() => {
    return [
      inputBaseClasses,
      sizeClasses,
      inputStateClasses,
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
    if (ariaDescribedBy) describedBy.push(ariaDescribedBy);
    return describedBy.length > 0 ? describedBy.join(' ') : undefined;
  });

  // ============================================
  // EVENT HANDLERS
  // ============================================

  function handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    
    if (type === 'number') {
      const numValue = target.valueAsNumber;
      value = isNaN(numValue) ? '' : numValue;
    } else {
      value = target.value;
    }

    oninput?.(event);
  }

  function handleChange(event: Event): void {
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

  function handleKeydown(event: KeyboardEvent): void {
    onkeydown?.(event);
  }

  // ============================================
  // PUBLIC METHODS
  // ============================================

  export function focus(): void {
    inputElement?.focus();
  }

  export function blur(): void {
    inputElement?.blur();
  }

  export function select(): void {
    inputElement?.select();
  }
</script>

<!-- ============================================ -->
<!-- INPUT FIELD -->
<!-- ============================================ -->

<div class={containerClasses}>
  
  <!-- Label -->
  {#if label}
    <label for={inputId} class={labelClasses}>
      {label}
      {#if required}
        <span class="text-red-500 ml-1">*</span>
      {/if}
    </label>
  {/if}

  <!-- Input Wrapper -->
  <div class={wrapperClasses}>
    
    <!-- Left Icon/Prefix -->
    {#if leftIcon}
      <div class="{iconClasses} left-0">
        {@render leftIcon()}
      </div>
    {:else if prefix}
      <div class="{iconClasses} left-0 text-gray-500">
        {@render prefix()}
      </div>
    {/if}

    <!-- Input Element -->
    <input
      bind:this={inputElement}
      {type}
      {value}
      {placeholder}
      {disabled}
      {readonly}
      {required}
      {name}
      {pattern}
      {min}
      {max}
      {step}
      {maxlength}
      {minlength}
      id={inputId}
      class={inputClasses}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedByValue()}
      aria-invalid={error ? 'true' : 'false'}
      oninput={handleInput}
      onchange={handleChange}
      onfocus={handleFocus}
      onblur={handleBlur}
      onkeydown={handleKeydown}
    />

    <!-- Right Icon/Suffix -->
    {#if rightIcon}
      <div class="{iconClasses} right-0">
        {@render rightIcon()}
      </div>
    {:else if suffix}
      <div class="{iconClasses} right-0 text-gray-500">
        {@render suffix()}
      </div>
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
  /* Remove default number input arrows in Chrome/Safari/Edge */
  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  /* Remove default number input arrows in Firefox */
  input[type="number"] {
    appearance: textfield;
    -moz-appearance: textfield;
  }
  
  /* Ensure proper focus ring */
  input:focus {
    outline: 2px solid transparent;
    outline-offset: 2px;
  }
  
  /* Custom placeholder color */
  input::placeholder {
    opacity: 1;
  }
</style>