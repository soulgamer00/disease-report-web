<!-- src/routes/login/+page.svelte -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { authStore, isAuthenticated } from '$lib/stores';
  import type { LoginRequest } from '$lib/types/backend';

  // ============================================
  // FORM STATE
  // ============================================

  let formData: LoginRequest = {
    username: '',
    password: ''
  };

  let isSubmitting = false;
  let errors: Record<string, string> = {};
  let touched: Record<string, boolean> = {};
  let showPassword = false;

  // ============================================
  // REACTIVE STATEMENTS
  // ============================================

  // Check if user is already authenticated
  $: if ($isAuthenticated) {
    goto('/patients');
  }

  // Basic validation
  $: isUsernameValid = formData.username.length >= 3;
  $: isPasswordValid = formData.password.length >= 6;
  $: isFormValid = isUsernameValid && isPasswordValid && !isSubmitting;

  // ============================================
  // VALIDATION FUNCTIONS
  // ============================================

  function validateField(field: keyof LoginRequest): void {
    errors = { ...errors };
    
    switch (field) {
      case 'username':
        if (!formData.username) {
          errors.username = 'กรุณากรอกชื่อผู้ใช้';
        } else if (formData.username.length < 3) {
          errors.username = 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร';
        } else {
          delete errors.username;
        }
        break;
        
      case 'password':
        if (!formData.password) {
          errors.password = 'กรุณากรอกรหัสผ่าน';
        } else if (formData.password.length < 6) {
          errors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
        } else {
          delete errors.password;
        }
        break;
    }
  }

  function markFieldAsTouched(field: keyof LoginRequest): void {
    touched = { ...touched, [field]: true };
    validateField(field);
  }

  // ============================================
  // EVENT HANDLERS
  // ============================================

  async function handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    
    if (!isFormValid) return;
    
    // Mark all fields as touched for validation
    touched = { username: true, password: true };
    validateField('username');
    validateField('password');
    
    // Check if there are validation errors
    if (Object.keys(errors).length > 0) return;
    
    isSubmitting = true;

    try {
      const success = await authStore.login(formData);
      
      if (success) {
        // Redirect handled by reactive statement above
        console.log('Login successful');
      }
      // Error handling is done by authStore
      
    } catch (error) {
      console.error('Login submission error:', error);
    } finally {
      isSubmitting = false;
    }
  }

  function togglePasswordVisibility(): void {
    showPassword = !showPassword;
  }

  function handleInputChange(field: keyof LoginRequest): (event: Event) => void {
    return (event: Event) => {
      const target = event.target as HTMLInputElement;
      formData = { ...formData, [field]: target.value };
      
      // Clear error when user starts typing
      if (errors[field]) {
        errors = { ...errors };
        delete errors[field];
      }
    };
  }

  // ============================================
  // LIFECYCLE
  // ============================================

  onMount(() => {
    // Clear any previous auth errors
    authStore.clearError();
    
    // Focus username field
    const usernameInput = document.getElementById('username');
    if (usernameInput) {
      usernameInput.focus();
    }
  });
</script>

<!-- ============================================ -->
<!-- PAGE TITLE -->
<!-- ============================================ -->

<svelte:head>
  <title>เข้าสู่ระบบ - ระบบรายงานโรค</title>
  <meta name="description" content="เข้าสู่ระบบจัดการข้อมูลผู้ป่วย" />
</svelte:head>

<!-- ============================================ -->
<!-- LOGIN PAGE LAYOUT -->
<!-- ============================================ -->

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
  <div class="w-full max-w-md">
    
    <!-- Login Card -->
    <div class="bg-white rounded-2xl shadow-xl p-8">
      
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">เข้าสู่ระบบ</h1>
        <p class="text-gray-600">ระบบรายงานโรคติดต่อ</p>
      </div>

      <!-- Global Error Message -->
      {#if $authStore.error}
        <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-red-700 text-sm">{$authStore.error}</p>
          </div>
        </div>
      {/if}

      <!-- Login Form -->
      <form on:submit={handleSubmit} novalidate>
        
        <!-- Username Field -->
        <div class="mb-6">
          <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
            ชื่อผู้ใช้
          </label>
          <div class="relative">
            <input
              id="username"
              type="text"
              autocomplete="username"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors
                     {errors.username && touched.username ? 'border-red-500' : ''}
                     {isUsernameValid && touched.username ? 'border-green-500' : ''}"
              placeholder="กรอกชื่อผู้ใช้"
              value={formData.username}
              on:input={handleInputChange('username')}
              on:blur={() => markFieldAsTouched('username')}
              disabled={isSubmitting}
            />
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          {#if errors.username && touched.username}
            <p class="mt-2 text-sm text-red-600">{errors.username}</p>
          {/if}
        </div>

        <!-- Password Field -->
        <div class="mb-6">
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
            รหัสผ่าน
          </label>
          <div class="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autocomplete="current-password"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-12
                     {errors.password && touched.password ? 'border-red-500' : ''}
                     {isPasswordValid && touched.password ? 'border-green-500' : ''}"
              placeholder="กรอกรหัสผ่าน"
              value={formData.password}
              on:input={handleInputChange('password')}
              on:blur={() => markFieldAsTouched('password')}
              disabled={isSubmitting}
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 pr-3 flex items-center"
              on:click={togglePasswordVisibility}
              disabled={isSubmitting}
            >
              {#if showPassword}
                <svg class="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              {:else}
                <svg class="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              {/if}
            </button>
          </div>
          {#if errors.password && touched.password}
            <p class="mt-2 text-sm text-red-600">{errors.password}</p>
          {/if}
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          disabled={!isFormValid}
          class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed
                 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          {#if isSubmitting}
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            กำลังเข้าสู่ระบบ...
          {:else}
            เข้าสู่ระบบ
          {/if}
        </button>
      </form>

      <!-- Footer -->
      <div class="mt-8 text-center">
        <p class="text-sm text-gray-500">
          ระบบรายงานโรคติดต่อ สำนักงานสาธารณสุขจังหวัดเพชรบูรณ์
        </p>
      </div>

    </div>

    <!-- Loading Overlay -->
    {#if $authStore.isLoading}
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 flex items-center">
          <svg class="animate-spin h-5 w-5 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-gray-700">กำลังประมวลผล...</span>
        </div>
      </div>
    {/if}

  </div>
</div>