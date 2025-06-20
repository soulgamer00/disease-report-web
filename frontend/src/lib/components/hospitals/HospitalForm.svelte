<!-- src/lib/components/hospitals/HospitalForm.svelte -->
<!-- ✅ Hospital form ตาม Backend Schema จริง (เฉพาะ 8 ฟิลด์) -->
<!-- แก้ไขให้ตรงกับ backend schema พอดี ไม่มั่วเพิ่ม -->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { 
    HospitalInfo, 
    CreateHospitalRequest, 
    UpdateHospitalRequest,
    HospitalDropdownOptions 
  } from '$lib/types/hospital.types';

  const dispatch = createEventDispatcher<{
    submit: CreateHospitalRequest | UpdateHospitalRequest;
    cancel: void;
  }>();

  // ============================================
  // PROPS
  // ============================================
  
  export let hospital: HospitalInfo | null = null; // null = create mode
  export let loading = false;
  export let errors: Record<string, string> = {};
  export let dropdownOptions: HospitalDropdownOptions = {
    organizationTypes: [],
    healthServiceTypes: [],
    affiliations: [],
    provinces: []
  };

  // ============================================
  // FORM STATE (เฉพาะฟิลด์ที่ Backend มี)
  // ============================================
  
  let formData: CreateHospitalRequest = {
    hospitalName: hospital?.hospitalName || '',
    hospitalCode9eDigit: hospital?.hospitalCode9eDigit || '',
    hospitalCode9Digit: hospital?.hospitalCode9Digit || '',
    hospitalCode5Digit: hospital?.hospitalCode5Digit || '',
    organizationType: hospital?.organizationType || '',
    healthServiceType: hospital?.healthServiceType || '',
    affiliation: hospital?.affiliation || '',
    departmentDivision: hospital?.departmentDivision || ''
  };

  let clientErrors: Record<string, string> = {};
  let touched: Record<string, boolean> = {};

  const isEditMode = hospital !== null;

  // ============================================
  // VALIDATION (ตาม Backend Schema)
  // ============================================
  
  function validateField(field: string, value: string): string {
    switch (field) {
      case 'hospitalName':
        if (!value.trim()) return 'กรุณากรอกชื่อโรงพยาบาล';
        if (value.length > 200) return 'ชื่อโรงพยาบาลต้องไม่เกิน 200 ตัวอักษร';
        return '';
        
      case 'hospitalCode9eDigit':
        if (!value.trim()) return 'กรุณากรอกรหัส 9 หลักใหม่';
        if (!/^[A-Z]{2}\d{7}$/.test(value)) return 'รหัส 9 หลักใหม่ต้องเป็นรูปแบบ XX0000000 (ตัวอักษร 2 ตัว + ตัวเลข 7 ตัว)';
        return '';
        
      case 'hospitalCode9Digit':
        if (value && !/^\d{9}$/.test(value)) return 'รหัส 9 หลักเก่าต้องเป็นตัวเลข 9 หลัก';
        return '';
        
      case 'hospitalCode5Digit':
        if (value && !/^\d{5}$/.test(value)) return 'รหัส 5 หลักต้องเป็นตัวเลข 5 หลัก';
        return '';
        
      case 'organizationType':
        if (value && value.length > 100) return 'ประเภทองค์กรต้องไม่เกิน 100 ตัวอักษร';
        return '';
        
      case 'healthServiceType':
        if (value && value.length > 100) return 'ประเภทหน่วยบริการสุขภาพต้องไม่เกิน 100 ตัวอักษร';
        return '';
        
      case 'affiliation':
        if (value && value.length > 100) return 'สังกัดต้องไม่เกิน 100 ตัวอักษร';
        return '';
        
      case 'departmentDivision':
        if (value && value.length > 100) return 'แผนก/กรมต้องไม่เกิน 100 ตัวอักษร';
        return '';
        
      default:
        return '';
    }
  }

  function handleBlur(field: string): void {
    touched[field] = true;
    const value = formData[field as keyof typeof formData] as string;
    clientErrors[field] = validateField(field, value || '');
  }

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};
    
    // Validate required fields
    newErrors.hospitalName = validateField('hospitalName', formData.hospitalName);
    newErrors.hospitalCode9eDigit = validateField('hospitalCode9eDigit', formData.hospitalCode9eDigit);
    
    // Validate optional fields if they have values
    if (formData.hospitalCode9Digit) {
      newErrors.hospitalCode9Digit = validateField('hospitalCode9Digit', formData.hospitalCode9Digit);
    }
    if (formData.hospitalCode5Digit) {
      newErrors.hospitalCode5Digit = validateField('hospitalCode5Digit', formData.hospitalCode5Digit);
    }
    if (formData.organizationType) {
      newErrors.organizationType = validateField('organizationType', formData.organizationType);
    }
    if (formData.healthServiceType) {
      newErrors.healthServiceType = validateField('healthServiceType', formData.healthServiceType);
    }
    if (formData.affiliation) {
      newErrors.affiliation = validateField('affiliation', formData.affiliation);
    }
    if (formData.departmentDivision) {
      newErrors.departmentDivision = validateField('departmentDivision', formData.departmentDivision);
    }

    clientErrors = newErrors;
    
    // Check if there are any errors
    return !Object.values(newErrors).some(error => error !== '');
  }

  // ============================================
  // FORM HANDLERS
  // ============================================
  
  function handleSubmit(): void {
    // Mark all fields as touched for validation display
    Object.keys(formData).forEach(key => {
      touched[key] = true;
    });

    if (!validateForm()) {
      return;
    }

    // Clean and submit data
    const submitData: Record<string, string> = {};
    Object.entries(formData).forEach(([key, value]) => {
      const trimmed = value.trim();
      if (trimmed !== '') {
        submitData[key] = trimmed;
      }
    });

    dispatch('submit', submitData as CreateHospitalRequest | UpdateHospitalRequest);
  }

  function handleCancel(): void {
    dispatch('cancel');
  }

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  
  function getFieldError(field: string): string {
    return errors[field] || (touched[field] ? clientErrors[field] : '') || '';
  }

  function hasError(field: string): boolean {
    return getFieldError(field) !== '';
  }

  function getInputClass(field: string): string {
    const baseClass = 'block w-full rounded-md border px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:ring-1';
    
    if (hasError(field)) {
      return `${baseClass} border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500`;
    }
    
    return `${baseClass} border-gray-300 focus:border-blue-500 focus:ring-blue-500`;
  }
</script>

<!-- ============================================ -->
<!-- HOSPITAL FORM COMPONENT -->
<!-- ============================================ -->

<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
  <!-- Form Header -->
  <div class="mb-6">
    <h3 class="text-lg font-medium text-gray-900">
      {isEditMode ? 'แก้ไขข้อมูลโรงพยาบาล' : 'เพิ่มโรงพยาบาลใหม่'}
    </h3>
    <p class="mt-1 text-sm text-gray-500">
      {isEditMode ? 'แก้ไขข้อมูลโรงพยาบาลที่มีอยู่' : 'กรอกข้อมูลโรงพยาบาลใหม่ที่ต้องการเพิ่ม'}
    </p>
  </div>

  <!-- Form -->
  <form on:submit|preventDefault={handleSubmit} class="space-y-6">
    
    <!-- ข้อมูลพื้นฐาน -->
    <div>
      <h4 class="mb-4 text-base font-medium text-gray-900">ข้อมูลพื้นฐาน</h4>
      
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <!-- Hospital Name (Required) -->
        <div class="sm:col-span-2">
          <label for="hospitalName" class="block text-sm font-medium text-gray-700 mb-2">
            ชื่อโรงพยาบาล <span class="text-red-500">*</span>
          </label>
          <input
            id="hospitalName"
            type="text"
            bind:value={formData.hospitalName}
            on:blur={() => handleBlur('hospitalName')}
            placeholder="ระบุชื่อโรงพยาบาล"
            class={getInputClass('hospitalName')}
            disabled={loading}
            required
            maxlength="200"
          />
          {#if hasError('hospitalName')}
            <p class="mt-1 text-sm text-red-600">{getFieldError('hospitalName')}</p>
          {/if}
        </div>

        <!-- Hospital Code 9e Digit (Required) -->
        <div>
          <label for="hospitalCode9eDigit" class="block text-sm font-medium text-gray-700 mb-2">
            รหัส 9 หลักใหม่ <span class="text-red-500">*</span>
          </label>
          <input
            id="hospitalCode9eDigit"
            type="text"
            bind:value={formData.hospitalCode9eDigit}
            on:blur={() => handleBlur('hospitalCode9eDigit')}
            placeholder="XX1234567"
            class={getInputClass('hospitalCode9eDigit')}
            disabled={loading}
            required
            maxlength="9"
            style="font-family: monospace;"
          />
          {#if hasError('hospitalCode9eDigit')}
            <p class="mt-1 text-sm text-red-600">{getFieldError('hospitalCode9eDigit')}</p>
          {/if}
        </div>

        <!-- Hospital Code 9 Digit (Optional) -->
        <div>
          <label for="hospitalCode9Digit" class="block text-sm font-medium text-gray-700 mb-2">
            รหัส 9 หลักเก่า
          </label>
          <input
            id="hospitalCode9Digit"
            type="text"
            bind:value={formData.hospitalCode9Digit}
            on:blur={() => handleBlur('hospitalCode9Digit')}
            placeholder="123456789"
            class={getInputClass('hospitalCode9Digit')}
            disabled={loading}
            maxlength="9"
            style="font-family: monospace;"
          />
          {#if hasError('hospitalCode9Digit')}
            <p class="mt-1 text-sm text-red-600">{getFieldError('hospitalCode9Digit')}</p>
          {/if}
        </div>

        <!-- Hospital Code 5 Digit (Optional) -->
        <div>
          <label for="hospitalCode5Digit" class="block text-sm font-medium text-gray-700 mb-2">
            รหัส 5 หลัก
          </label>
          <input
            id="hospitalCode5Digit"
            type="text"
            bind:value={formData.hospitalCode5Digit}
            on:blur={() => handleBlur('hospitalCode5Digit')}
            placeholder="12345"
            class={getInputClass('hospitalCode5Digit')}
            disabled={loading}
            maxlength="5"
            style="font-family: monospace;"
          />
          {#if hasError('hospitalCode5Digit')}
            <p class="mt-1 text-sm text-red-600">{getFieldError('hospitalCode5Digit')}</p>
          {/if}
        </div>
      </div>
    </div>

    <!-- ข้อมูลประเภทและสังกัด -->
    <div>
      <h4 class="mb-4 text-base font-medium text-gray-900">ประเภทและสังกัด</h4>
      
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <!-- Organization Type -->
        <div>
          <label for="organizationType" class="block text-sm font-medium text-gray-700 mb-2">
            ประเภทองค์กร
          </label>
          <select
            id="organizationType"
            bind:value={formData.organizationType}
            on:blur={() => handleBlur('organizationType')}
            class={getInputClass('organizationType')}
            disabled={loading}
          >
            <option value="">เลือกประเภทองค์กร</option>
            {#each dropdownOptions.organizationTypes as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
          {#if hasError('organizationType')}
            <p class="mt-1 text-sm text-red-600">{getFieldError('organizationType')}</p>
          {/if}
        </div>

        <!-- Health Service Type -->
        <div>
          <label for="healthServiceType" class="block text-sm font-medium text-gray-700 mb-2">
            ประเภทหน่วยบริการสุขภาพ
          </label>
          <select
            id="healthServiceType"
            bind:value={formData.healthServiceType}
            on:blur={() => handleBlur('healthServiceType')}
            class={getInputClass('healthServiceType')}
            disabled={loading}
          >
            <option value="">เลือกประเภทบริการ</option>
            {#each dropdownOptions.healthServiceTypes as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
          {#if hasError('healthServiceType')}
            <p class="mt-1 text-sm text-red-600">{getFieldError('healthServiceType')}</p>
          {/if}
        </div>

        <!-- Affiliation -->
        <div>
          <label for="affiliation" class="block text-sm font-medium text-gray-700 mb-2">
            สังกัด
          </label>
          <select
            id="affiliation"
            bind:value={formData.affiliation}
            on:blur={() => handleBlur('affiliation')}
            class={getInputClass('affiliation')}
            disabled={loading}
          >
            <option value="">เลือกสังกัด</option>
            {#each dropdownOptions.affiliations as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
          {#if hasError('affiliation')}
            <p class="mt-1 text-sm text-red-600">{getFieldError('affiliation')}</p>
          {/if}
        </div>

        <!-- Department Division -->
        <div>
          <label for="departmentDivision" class="block text-sm font-medium text-gray-700 mb-2">
            แผนก/กรม
          </label>
          <input
            id="departmentDivision"
            type="text"
            bind:value={formData.departmentDivision}
            on:blur={() => handleBlur('departmentDivision')}
            placeholder="ระบุแผนก/กรม"
            class={getInputClass('departmentDivision')}
            disabled={loading}
            maxlength="100"
          />
          {#if hasError('departmentDivision')}
            <p class="mt-1 text-sm text-red-600">{getFieldError('departmentDivision')}</p>
          {/if}
        </div>
      </div>
    </div>

    <!-- Form Actions -->
    <div class="flex items-center justify-end space-x-3 border-t border-gray-200 pt-6">
      <button
        type="button"
        on:click={handleCancel}
        class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        disabled={loading}
      >
        ยกเลิก
      </button>
      
      <button
        type="submit"
        class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {#if loading}
          <div class="flex items-center">
            <div class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            {isEditMode ? 'กำลังบันทึก...' : 'กำลังเพิ่ม...'}
          </div>
        {:else}
          {isEditMode ? 'บันทึกการแก้ไข' : 'เพิ่มโรงพยาบาล'}
        {/if}
      </button>
    </div>
  </form>
</div>