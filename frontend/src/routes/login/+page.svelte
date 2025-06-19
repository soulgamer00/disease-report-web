<!-- frontend/src/routes/login/+page.svelte -->
<!-- Login page with type-safe authentication -->
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
    const usernameInput = document.getElementById('username') as HTMLInputElement;
    if (usernameInput) {
      usernameInput.focus();
    }
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
    
    // Increment login attempts
    loginAttempts++;
    
    if (error && typeof error === 'object' && 'data' in error) {
      const authError = error.data as any;
      
      // Handle specific auth errors
      switch (authError?.code) {
        case 'INVALID_CREDENTIALS':
          formState.errors.general = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
          break;
          
        case 'ACCOUNT_LOCKED':
          isLocked = true;
          lockoutTime = authError.authDetails?.lockoutDuration || 900; // 15 minutes default
          formState.errors.general = `บัญชีถูกล็อกเนื่องจากเข้าสู่ระบบผิดหลายครั้ง กรุณารอ ${Math.ceil(lockoutTime / 60)} นาที`;
          startLockoutTimer();
          break;
          
        case 'ACCOUNT_DISABLED':
          formState.errors.general = 'บัญชีผู้ใช้ถูกปิดใช้งาน กรุณาติดต่อผู้ดูแลระบบ';
          break;
          
        default:
          formState.errors.general = authError?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
      }
      
      // Show remaining attempts if available
      if (authError?.authDetails?.remainingAttempts) {
        formState.errors.general += ` (เหลือ ${authError.authDetails.remainingAttempts} ครั้ง)`;
      }
      
    } else if (error instanceof Error) {
      formState.errors.general = error.message;
    } else {
      formState.errors.general = 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
    }
    
    // Auto-lock after too many attempts (client-side protection)
    if (loginAttempts >= config.auth.security.maxLoginAttempts) {
      isLocked = true;
      lockoutTime = config.auth.security.lockoutDuration / 1000; // Convert to seconds
      formState.errors.general = 'เข้าสู่ระบบผิดหลายครั้ง บัญชีถูกล็อกชั่วคราว';
      startLockoutTimer();
    }
  }
  
  // ============================================
  // LOCKOUT TIMER
  // ============================================
  
  function startLockoutTimer() {
    const timer = setInterval(() => {
      lockoutTime--;
      
      if (lockoutTime <= 0) {
        clearInterval(timer);
        isLocked = false;
        loginAttempts = 0;
        formState.errors = {};
      }
    }, 1000);
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
    clearErrors();
  }
  
  function handlePasswordInput() {
    if (formState.errors.password) {
      formState.errors.password = '';
    }
    clearErrors();
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
  <title>เข้าสู่ระบบ - {QUICK_ACCESS.appName}</title>
  <meta name="description" content="เข้าสู่ระบบ {QUICK_ACCESS.appName}" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    
    <!-- Header -->
    <div class="text-center">
      <div class="mx-auto h-12 w-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
        <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>
      
      <h2 class="text-3xl font-bold text-gray-900 mb-2">เข้าสู่ระบบ</h2>
      <p class="text-sm text-gray-600">{QUICK_ACCESS.appName}</p>
    </div>

    <!-- Success Message -->
    {#if successMessage}
      <div class="bg-green-50 border border-green-200 rounded-md p-4">
        <div class="flex">
          <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <p class="ml-3 text-sm text-green-700">{successMessage}</p>
        </div>
      </div>
    {/if}

    <!-- Login Form -->
    <form class="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg" onsubmit={handleSubmit}>
      
      <!-- Username Field -->
      <div>
        <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
          ชื่อผู้ใช้
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autocomplete="username"
          required
          class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-colors"
          class:border-red-500={formState.errors.username}
          class:focus:ring-red-500={formState.errors.username}
          class:focus:border-red-500={formState.errors.username}
          placeholder="กรอกชื่อผู้ใช้"
          bind:value={formState.username}
          oninput={handleUsernameInput}
          onkeydown={handleKeydown}
          disabled={formState.isSubmitting || isLocked}
        />
        {#if formState.errors.username}
          <p class="mt-2 text-sm text-red-600">{formState.errors.username}</p>
        {/if}
      </div>

      <!-- Password Field -->
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
          รหัสผ่าน
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autocomplete="current-password"
          required
          class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-colors"
          class:border-red-500={formState.errors.password}
          class:focus:ring-red-500={formState.errors.password}
          class:focus:border-red-500={formState.errors.password}
          placeholder="กรอกรหัสผ่าน"
          bind:value={formState.password}
          oninput={handlePasswordInput}
          onkeydown={handleKeydown}
          disabled={formState.isSubmitting || isLocked}
        />
        {#if formState.errors.password}
          <p class="mt-2 text-sm text-red-600">{formState.errors.password}</p>
        {/if}
      </div>

      <!-- Remember Me -->
      {#if config.auth.features.rememberMe}
        <div class="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            bind:checked={formState.rememberMe}
            disabled={formState.isSubmitting || isLocked}
          />
          <label for="remember-me" class="ml-2 block text-sm text-gray-700">
            จดจำการเข้าสู่ระบบ
          </label>
        </div>
      {/if}

      <!-- General Error -->
      {#if formState.errors.general}
        <div class="bg-red-50 border border-red-200 rounded-md p-4">
          <div class="flex">
            <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <p class="ml-3 text-sm text-red-700">{formState.errors.general}</p>
          </div>
        </div>
      {/if}

      <!-- Lockout Timer -->
      {#if isLocked && lockoutTime > 0}
        <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div class="flex">
            <svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <div class="ml-3">
              <p class="text-sm text-yellow-700">
                บัญชีถูกล็อกชั่วคราว 
                <span class="font-medium">{Math.floor(lockoutTime / 60)}:{(lockoutTime % 60).toString().padStart(2, '0')}</span>
              </p>
            </div>
          </div>
        </div>
      {/if}

      <!-- Submit Button -->
      <button
        type="submit"
        class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        disabled={formState.isSubmitting || isLocked}
      >
        {#if formState.isSubmitting}
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          กำลังเข้าสู่ระบบ...
        {:else if isLocked}
          <svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
          </svg>
          บัญชีถูกล็อก
        {:else}
          เข้าสู่ระบบ
        {/if}
      </button>
    </form>

    <!-- Footer -->
    <div class="text-center text-xs text-gray-500">
      <p>เวอร์ชัน {QUICK_ACCESS.appVersion}</p>
      <p class="mt-1">© 2025 {QUICK_ACCESS.appName}</p>
    </div>
  </div>
</div>

<style>
  /* Custom styles for better UX */
  .transition-colors {
    transition-property: color, background-color, border-color;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }
</style>