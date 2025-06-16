// src/routes/login/+page.server.ts
// Server-side logic for login page - redirect if already authenticated

import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Cookies } from '@sveltejs/kit';
import { buildApiUrl, API_ENDPOINTS } from '$lib/config';

// ============================================
// HELPER FUNCTION - CHECK AUTHENTICATION
// ============================================

/**
 * Check if user is authenticated by verifying cookies with backend
 */
async function checkAuthentication(cookies: Cookies): Promise<boolean> {
  try {
    // Get authentication cookies
    const accessToken = cookies.get('accessToken');
    const refreshToken = cookies.get('refreshToken');
    
    // If no cookies, user is not authenticated
    if (!accessToken && !refreshToken) {
      return false;
    }
    
    // Verify authentication with backend
    const response = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.VERIFY), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward cookies to backend for verification
        'Cookie': `accessToken=${accessToken || ''}; refreshToken=${refreshToken || ''}`
      },
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.success && data.data?.authenticated === true;
    }
    
    return false;
  } catch (error) {
    console.error('Authentication check failed:', error);
    return false;
  }
}

// ============================================
// PAGE SERVER LOAD FUNCTION
// ============================================

/**
 * Server-side load function for login page
 * Redirects to patients page if user is already authenticated
 */
export const load: PageServerLoad = async ({ cookies, url }) => {
  try {
    // Check if user is already authenticated
    const isAuthenticated = await checkAuthentication(cookies);
    
    if (isAuthenticated) {
      // Get redirect parameter from URL (if any)
      const redirectTo = url.searchParams.get('redirect') || '/patients';
      
      // Validate redirect URL to prevent open redirect attacks
      const allowedRedirects = [
        '/',
        '/patients',
        '/dashboard', 
        '/reports',
        '/profile'
      ];
      
      const finalRedirect = allowedRedirects.includes(redirectTo) ? redirectTo : '/patients';
      
      // Redirect authenticated user
      throw redirect(302, finalRedirect);
    }
    
    // User is not authenticated, allow access to login page
    return {
      // Pass any data needed by the login page
      redirectTo: url.searchParams.get('redirect') || null,
      message: url.searchParams.get('message') || null,
    };
    
  } catch (error) {
    // Handle redirect (this is expected behavior)
    if (error instanceof Response && error.status === 302) {
      throw error;
    }
    
    // Handle unexpected errors
    console.error('Login page load error:', error);
    
    // Don't block login page if authentication check fails
    return {
      redirectTo: null,
      message: null,
      error: 'เกิดข้อผิดพลาดในการตรวจสอบสถานะการเข้าสู่ระบบ'
    };
  }
};