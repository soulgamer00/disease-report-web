<!-- frontend/src/routes/login/+page.svelte -->
<!-- ✅ THEME-COMPATIBLE Login Page -->
<!-- เปลี่ยนจาก hardcoded colors เป็น CSS variables -->

<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { authAPI, authUtils } from '$lib/api/auth.api';
  import { config, QUICK_ACCESS } from '$lib/config';
  import type { LoginFormState } from '$lib/types/auth.types';
  import type { ApiClientError } from '$lib/api/client';
  
  // ============================================
  // REACTIVE STATE
  // ============================================
  
  // Form state with proper typing
  let formState = $state<LoginFormState>({
    username: '',
    password: '',
    rememberMe: false,
    isSubmitting: false,
    errors: {}
  });
  
  // Success message
  let successMessage = $state<string>('');
  
  // Redirect URL after successful login
  let redirectTo = $state<string>(QUICK_ACCESS.defaultRedirect);
  
  // Login attempts tracking
  let loginAttempts = $state<number>(0);
  let isLocked = $state<boolean>(false);
  let lockoutTime = $state<number>(0);
  
  // Show password toggle
  let showPassword = $state<boolean>(false);
  
  // ============================================
  // LIFECYCLE
  // ============================================
  
  onMount(() => {
    // Check if already authenticated
    if (authUtils.isAuthenticated()) {
      goto(redirectTo);
      return;
    }
    
    // Get redirect URL from query params
    const redirectParam = $page.url.searchParams.get('redirect');
    if (redirectParam) {
      redirectTo = redirectParam;
    }
    
    // Check for logout message
    const logoutParam = $page.url.searchParams.get('logout');
    if (logoutParam === 'success') {
      successMessage = 'ออกจากระบบเรียบร้อยแล้ว';
    }
    
    // Clear any existing auth data
    authUtils.clearAuthData();
    
    // Focus on username field
    setTimeout(() => {
      const usernameInput = document.getElementById('username') as HTMLInputElement;
      if (usernameInput) {
        usernameInput.focus();
      }
    }, 100);
  });
  
  // ============================================
  // FORM VALIDATION
  // ============================================
  
  function validateForm(): boolean {
    const errors: LoginFormState['errors'] = {};
    
    // Username validation
    if (!formState.username.trim()) {
      errors.username = 'กรุณากรอกชื่อผู้ใช้';
    } else if (formState.username.length < 3) {
      errors.username = 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร';
    }
    
    // Password validation
    if (!formState.password) {
      errors.password = 'กรุณากรอกรหัสผ่าน';
    } else if (formState.password.length < 4) {
      errors.password = 'รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร';
    }
    
    formState.errors = errors;
    return Object.keys(errors).length === 0;
  }
  
  // ============================================
  // FORM SUBMISSION
  // ============================================
  
  async function handleSubmit(event: Event) {
    event.preventDefault();
    
    // Check if account is locked
    if (isLocked) {
      formState.errors.general = `บัญชีถูกล็อก กรุณารอ ${Math.ceil(lockoutTime / 60)} นาที`;
      return;
    }
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    // Set submitting state
    formState.isSubmitting = true;
    formState.errors = {};
    successMessage = '';
    
    try {
      // Attempt login
      const response = await authAPI.login({
        username: formState.username.trim(),
        password: formState.password,
        rememberMe: formState.rememberMe
      });
      
      if (response.success) {
        // Login successful
        successMessage = `ยินดีต้อนรับ ${response.data.user.fname || response.data.user.username}`;
        
        // Reset login attempts
        loginAttempts = 0;
        
        // Small delay to show success message
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Redirect to intended page
        goto(redirectTo);
      }
      
    } catch (error) {
      // Handle login errors
      handleLoginError(error);
    } finally {
      formState.isSubmitting = false;
    }
  }
  
  // ============================================
  // ERROR HANDLING
  // ============================================
  
  function handleLoginError(error: unknown) {
    console.error('Login error:', error);
    
    loginAttempts += 1;
    
    if (error instanceof Error) {
      // Check for specific error types
      if (error.message.includes('credentials')) {
        formState.errors.general = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
      } else if (error.message.includes('locked')) {
        formState.errors.general = 'บัญชีถูกล็อก กรุณาติดต่อผู้ดูแลระบบ';
        isLocked = true;
      } else if (error.message.includes('network')) {
        formState.errors.general = 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง';
      } else {
        formState.errors.general = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง';
      }
    } else {
      formState.errors.general = 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
    }
    
    // Lock account after too many attempts
    if (loginAttempts >= 5) {
      isLocked = true;
      lockoutTime = 300; // 5 minutes
      formState.errors.general = 'การเข้าสู่ระบบล้มเหลวหลายครั้ง บัญชีถูกล็อกชั่วคราว';
    }
  }
  
  // ============================================
  // FORM HELPERS
  // ============================================
  
  function clearErrors() {
    formState.errors = {};
    successMessage = '';
  }
  
  function handleUsernameInput() {
    if (formState.errors.username) {
      formState.errors.username = '';
    }
    if (formState.errors.general) {
      formState.errors.general = '';
    }
  }
  
  function handlePasswordInput() {
    if (formState.errors.password) {
      formState.errors.password = '';
    }
    if (formState.errors.general) {
      formState.errors.general = '';
    }
  }
  
  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }
  
  // Handle Enter key
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !formState.isSubmitting) {
      handleSubmit(event);
    }
  }
</script>

<!-- ============================================ -->
<!-- PAGE TEMPLATE -->
<!-- ============================================ -->

<svelte:head>
  <title>เข้าสู่ระบบ - ระบบรายงานโรค</title>
  <meta name="description" content="เข้าสู่ระบบระบบรายงานโรค" />
</svelte:head>

<!-- ✅ แก้: เปลี่ยนจาก hardcoded gradient เป็น CSS variables -->
<div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300"
     style="background-color: var(--bg-secondary);">
  
  <div class="max-w-md w-full space-y-8">
    
    <!-- Header -->
    <div class="text-center">
      <!-- ✅ แก้: เปลี่ยนจาก bg-indigo-600 เป็น CSS variable -->
      <div class="mx-auto h-12 w-12 rounded-lg flex items-center justify-center mb-4 transition-colors duration-300"
           style="background-color: var(--primary-600);">
        <svg class="h-8 w-8" style="color: var(--text-inverse);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>
      
      <!-- ✅ แก้: เปลี่ยนจาก text-gray-900 เป็น CSS variable -->
      <h2 class="text-3xl font-bold mb-2 transition-colors duration-300" 
          style="color: var(--text-primary);">
        เข้าสู่ระบบ
      </h2>
      <p class="text-sm transition-colors duration-300" 
         style="color: var(--text-secondary);">
        ระบบรายงานโรค
      </p>
    </div>

    <!-- Success Message -->
    {#if successMessage}
      <!-- ✅ แก้: เปลี่ยนเป็น CSS variables -->
      <div class="rounded-md p-4 transition-colors duration-300"
           style="background-color: var(--success-bg); border: 1px solid var(--success);">
        <div class="flex">
          <svg class="h-5 w-5" style="color: var(--success);" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <p class="ml-3 text-sm font-medium" style="color: var(--success);">
            {successMessage}
          </p>
        </div>
      </div>
    {/if}

    <!-- General Error Message -->
    {#if formState.errors.general}
      <!-- ✅ แก้: เปลี่ยนเป็น CSS variables -->
      <div class="rounded-md p-4 transition-colors duration-300"
           style="background-color: var(--error-bg); border: 1px solid var(--error);">
        <div class="flex">
          <svg class="h-5 w-5" style="color: var(--error);" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <p class="ml-3 text-sm font-medium" style="color: var(--error);">
            {formState.errors.general}
          </p>
        </div>
      </div>
    {/if}

    <!-- Login Form -->
    <!-- ✅ แก้: เปลี่ยนจาก bg-white เป็น CSS variable -->
    <form class="mt-8 space-y-6 p-8 rounded-xl transition-all duration-300"
          style="background-color: var(--surface-primary); box-shadow: var(--shadow-lg);"
          onsubmit={handleSubmit}>
      
      <!-- Username Field -->
      <div>
        <!-- ✅ แก้: เปลี่ยนจาก text-gray-700 เป็น CSS variable -->
        <label for="username" class="block text-sm font-medium mb-2 transition-colors duration-300"
               style="color: var(--text-primary);">
          ชื่อผู้ใช้
        </label>
        <!-- ✅ แก้: เปลี่ยน input styling เป็น CSS variables -->
        <input
          id="username"
          name="username"
          type="text"
          autocomplete="username"
          required
          class="appearance-none relative block w-full px-3 py-3 rounded-lg focus:outline-none focus:ring-2 focus:z-10 sm:text-sm transition-all duration-200"
          style="background-color: var(--surface-secondary); 
                 border: 1px solid {formState.errors.username ? 'var(--error)' : 'var(--border-primary)'};
                 color: var(--text-primary);
                 {formState.errors.username ? 'border-color: var(--error); box-shadow: 0 0 0 1px var(--error);' : 'border-color: var(--border-primary);'}
                 focus:border-color: {formState.errors.username ? 'var(--error)' : 'var(--border-focus)'};
                 focus:box-shadow: 0 0 0 2px {formState.errors.username ? 'var(--error)' : 'var(--border-focus)'};"
          placeholder="กรอกชื่อผู้ใช้"
          bind:value={formState.username}
          oninput={handleUsernameInput}
          onkeydown={handleKeydown}
          disabled={formState.isSubmitting || isLocked}
        />
        {#if formState.errors.username}
          <p class="mt-2 text-sm transition-colors duration-300" style="color: var(--error);">
            {formState.errors.username}
          </p>
        {/if}
      </div>

      <!-- Password Field -->
      <div>
        <!-- ✅ แก้: เปลี่ยนจาก text-gray-700 เป็น CSS variable -->
        <label for="password" class="block text-sm font-medium mb-2 transition-colors duration-300"
               style="color: var(--text-primary);">
          รหัสผ่าน
        </label>
        <div class="relative">
          <!-- ✅ แก้: เปลี่ยน input styling เป็น CSS variables -->
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autocomplete="current-password"
            required
            class="appearance-none relative block w-full px-3 py-3 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:z-10 sm:text-sm transition-all duration-200"
            style="background-color: var(--surface-secondary); 
                   border: 1px solid {formState.errors.password ? 'var(--error)' : 'var(--border-primary)'};
                   color: var(--text-primary);
                   {formState.errors.password ? 'border-color: var(--error); box-shadow: 0 0 0 1px var(--error);' : 'border-color: var(--border-primary);'}
                   focus:border-color: {formState.errors.password ? 'var(--error)' : 'var(--border-focus)'};
                   focus:box-shadow: 0 0 0 2px {formState.errors.password ? 'var(--error)' : 'var(--border-focus)'};"
            placeholder="กรอกรหัสผ่าน"
            bind:value={formState.password}
            oninput={handlePasswordInput}
            onkeydown={handleKeydown}
            disabled={formState.isSubmitting || isLocked}
          />
          <!-- Show/Hide Password Button -->
          <button
            type="button"
            class="absolute inset-y-0 right-0 pr-3 flex items-center"
            onclick={togglePasswordVisibility}
            disabled={formState.isSubmitting || isLocked}
          >
            <svg class="h-5 w-5 transition-colors duration-200" 
                 style="color: var(--text-tertiary);" 
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {#if showPassword}
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              {:else}
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              {/if}
            </svg>
          </button>
        </div>
        {#if formState.errors.password}
          <p class="mt-2 text-sm transition-colors duration-300" style="color: var(--error);">
            {formState.errors.password}
          </p>
        {/if}
      </div>

      <!-- Remember Me -->
      <div class="flex items-center">
        <input
          id="remember-me"
          name="remember-me"
          type="checkbox"
          class="h-4 w-4 rounded focus:ring-2 focus:ring-offset-2"
          style="color: var(--primary-600); 
                 border-color: var(--border-primary);
                 focus:ring-color: var(--border-focus);"
          bind:checked={formState.rememberMe}
          disabled={formState.isSubmitting || isLocked}
        />
        <label for="remember-me" class="ml-2 block text-sm transition-colors duration-300"
               style="color: var(--text-secondary);">
          จดจำการเข้าสู่ระบบ
        </label>
      </div>

      <!-- Submit Button -->
      <div>
        <!-- ✅ แก้: เปลี่ยนปุ่มเป็น CSS variables -->
        <button
          type="submit"
          class="group relative w-full flex justify-center py-3 px-4 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style="background-color: var(--primary-600); 
                 color: var(--text-inverse);
                 border: 1px solid var(--primary-600);
                 focus:ring-color: var(--border-focus);
                 {formState.isSubmitting || isLocked ? 'opacity: 0.6; cursor: not-allowed;' : 'opacity: 1; cursor: pointer;'}"
          disabled={formState.isSubmitting || isLocked}
        >
          {#if formState.isSubmitting}
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            กำลังเข้าสู่ระบบ...
          {:else}
            เข้าสู่ระบบ
          {/if}
        </button>
      </div>

      <!-- Additional Info -->
      <div class="text-center">
        <p class="text-xs transition-colors duration-300" style="color: var(--text-tertiary);">
          หากมีปัญหาในการเข้าสู่ระบบ กรุณาติดต่อผู้ดูแลระบบ
        </p>
      </div>
    </form>
  </div>
</div>