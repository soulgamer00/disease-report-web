// frontend/src/routes/login/+page.server.ts
// Server-side logic for login page

import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// ============================================
// PAGE SERVER LOAD
// ============================================

/**
 * Server-side load function for login page
 * Redirects to dashboard if already authenticated
 */
export const load: PageServerLoad = async ({ cookies, url }) => {
  // Check if user is already authenticated
  const accessToken = cookies.get('accessToken');
  const refreshToken = cookies.get('refreshToken');
  
  if (accessToken || refreshToken) {
    // User appears to be logged in, redirect to intended page
    const redirectTo = url.searchParams.get('redirect') || '/patients';
    throw redirect(302, redirectTo);
  }
  
  // Not authenticated, allow access to login page
  return {
    title: 'เข้าสู่ระบบ',
    // Pass any server-side data needed for the login page
    redirectTo: url.searchParams.get('redirect') || '/patients',
    logoutSuccess: url.searchParams.get('logout') === 'success'
  };
};