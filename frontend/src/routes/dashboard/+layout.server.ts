// frontend/src/routes/dashboard/+layout.server.ts
// ✅ Dashboard auth protection + User data from cookies
// Server-side authentication check for dashboard routes

import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import type { UserInfo } from '$lib/types/auth.types';

// ============================================
// AUTH PROTECTION FOR DASHBOARD
// ============================================

export const load: LayoutServerLoad = async ({ cookies, url }) => {
  console.log('🔐 Dashboard auth check...');
  
  // Check authentication tokens
  const accessToken = cookies.get('accessToken');
  const refreshToken = cookies.get('refreshToken');
  
  // Get user data from cookie
  const userDataCookie = cookies.get('userData');
  let userData: UserInfo | null = null;
  
  if (userDataCookie) {
    try {
      userData = JSON.parse(decodeURIComponent(userDataCookie)) as UserInfo;
      console.log('👤 User data loaded from cookie:', {
        username: userData.username,
        fullName: `${userData.fname} ${userData.lname}`,
        role: userData.userRoleId
      });
    } catch (error) {
      console.warn('⚠️ Failed to parse userData cookie:', error);
    }
  }
  
  console.log('📋 Auth status:', {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    hasUserData: !!userData,
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
  console.log('✅ Auth tokens found, allowing access');
  
  return {
    // Pass user data from cookie (this prevents hydration mismatch)
    user: userData,
    isAuthenticated: true,
    currentPath: url.pathname
  };
};