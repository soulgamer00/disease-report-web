// src/lib/utils/clickOutside.ts
// Click outside utility for detecting clicks outside an element

export interface ClickOutsideOptions {
  enabled?: boolean;
  callback?: (event: MouseEvent | TouchEvent) => void;
}

/**
 * Svelte action to detect clicks outside an element
 * 
 * @param node - The DOM element to monitor
 * @param options - Configuration options
 * @returns Action object with update and destroy methods
 * 
 * @example
 * ```svelte
 * <div 
 *   use:clickOutside={{ enabled: true, callback: handleClickOutside }}
 *   onclickOutside={handleClickOutside}
 * >
 *   Content here
 * </div>
 * ```
 */
export function clickOutside(
  node: HTMLElement,
  options: ClickOutsideOptions = {}
) {
  const { enabled = true, callback } = options;

  /**
   * Handle click events on the document
   */
  function handleClick(event: MouseEvent) {
    // Only proceed if action is enabled
    if (!enabled) return;

    // Check if the clicked element is outside the target node
    if (node && !node.contains(event.target as Node) && !event.defaultPrevented) {
      // Call the callback if provided
      if (callback) {
        callback(event);
      }

      // Dispatch custom event
      node.dispatchEvent(
        new CustomEvent('clickOutside', {
          detail: { originalEvent: event },
          bubbles: false,
          cancelable: true
        })
      );
    }
  }

  /**
   * Handle touch events on the document
   */
  function handleTouch(event: TouchEvent) {
    // Only proceed if action is enabled
    if (!enabled) return;

    // Check if the touched element is outside the target node
    if (node && !node.contains(event.target as Node) && !event.defaultPrevented) {
      // Call the callback if provided
      if (callback) {
        callback(event);
      }

      // Dispatch custom event
      node.dispatchEvent(
        new CustomEvent('clickOutside', {
          detail: { originalEvent: event },
          bubbles: false,
          cancelable: true
        })
      );
    }
  }

  /**
   * Add event listener when action is applied
   */
  function addEventListeners() {
    if (enabled) {
      // Use capture phase to ensure we catch the event before other handlers
      document.addEventListener('click', handleClick, { capture: true });
      document.addEventListener('touchstart', handleTouch, { capture: true });
    }
  }

  /**
   * Remove event listeners
   */
  function removeEventListeners() {
    document.removeEventListener('click', handleClick, { capture: true });
    document.removeEventListener('touchstart', handleTouch, { capture: true });
  }

  // Initial setup
  addEventListeners();

  return {
    /**
     * Update the action when parameters change
     */
    update(newOptions: ClickOutsideOptions) {
      removeEventListeners();
      
      // Update options
      options.enabled = newOptions.enabled ?? true;
      options.callback = newOptions.callback;
      
      addEventListeners();
    },

    /**
     * Cleanup when element is destroyed
     */
    destroy() {
      removeEventListeners();
    }
  };
}

/**
 * Type declaration for the clickOutside event
 */
declare global {
  namespace svelte.JSX {
    interface HTMLAttributes<T> {
      onclickOutside?: (event: CustomEvent<{ originalEvent: MouseEvent | TouchEvent }>) => void;
    }
  }
}