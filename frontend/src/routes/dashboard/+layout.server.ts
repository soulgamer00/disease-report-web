// frontend/src/routes/dashboard/+layout.server.ts
// ✅ Dashboard auth protection - ป้องกันการเข้าถึงโดยไม่ login
// Server-side authentication check for dashboard routes

import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

// ============================================
// AUTH PROTECTION FOR DASHBOARD
// ============================================

export const load: LayoutServerLoad = async ({ cookies, url, request }) => {
  console.log('🔐 Dashboard auth check...');
  
  // Check authentication tokens
  const accessToken = cookies.get('accessToken');
  const refreshToken = cookies.get('refreshToken');
  
  console.log('📋 Auth tokens:', {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    path: url.pathname
  });
  
  // If no tokens found, redirect to login
  if (!accessToken && !refreshToken) {
    console.log('❌ No auth tokens found, redirecting to login');
    
    // Build login URL with redirect parameter
    const loginUrl = `/login?redirect=${encodeURIComponent(url.pathname + url.search)}`;
    throw redirect(302, loginUrl);
  }
  
  // If we have tokens, assume user is authenticated
  // (In a real app, you might want to verify the token with backend here)
  console.log('✅ Auth tokens found, allowing access');
  
  return {
    // Pass any shared dashboard data here if needed
    isAuthenticated: true,
    currentPath: url.pathname
  };
};