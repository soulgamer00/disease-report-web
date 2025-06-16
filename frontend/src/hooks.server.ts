// src/hooks.server.ts
// Global server-side hooks for authentication and route protection

import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';
import type { UserInfo } from '$lib/types/backend';
import { buildApiUrl, API_ENDPOINTS } from '$lib/config';

// ============================================
// TYPES
// ============================================

interface AuthUser {
  id: string;
  username: string;
  userRoleId: number;
  userRole: string;
  hospitalCode9eDigit: string | null;
}

// Extend the App.Locals interface
declare global {
  namespace App {
    interface Locals {
      user: AuthUser | null;
      isAuthenticated: boolean;
    }
  }
}

// ============================================
// PROTECTED ROUTES CONFIGURATION
// ============================================

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/patients',
  '/dashboard',
  '/reports',
  '/profile',
  '/admin'
];

// Routes that require specific roles
const ADMIN_ROUTES = [
  '/admin'
];

// Routes that redirect to /patients if authenticated
const AUTH_ROUTES = [
  '/login'
];

// ============================================
// AUTHENTICATION HELPER FUNCTIONS
// ============================================

/**
 * Verify user authentication by calling backend API
 */
async function verifyAuthentication(cookies: any): Promise<UserInfo | null> {
  try {
    const accessToken = cookies.get('accessToken');
    const refreshToken = cookies.get('refreshToken');
    
    if (!accessToken && !refreshToken) {
      return null;
    }
    
    // Call backend verify endpoint
    const response = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.VERIFY), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `accessToken=${accessToken || ''}; refreshToken=${refreshToken || ''}`
      },
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data?.user) {
        return data.data.user;
      }
    }
    
    // If access token expired, try to refresh
    if (response.status === 401 && refreshToken) {
      const refreshResponse = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.REFRESH), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `refreshToken=${refreshToken}`
        },
        credentials: 'include'
      });
      
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        if (refreshData.success && refreshData.data?.user) {
          return refreshData.data.user;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Authentication verification failed:', error);
    return null;
  }
}

/**
 * Check if route requires authentication
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Check if route requires admin access
 */
function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Check if route is an auth route (login)
 */
function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Check if user has required role
 */
function hasRequiredRole(user: UserInfo, requiredRole: 'USER' | 'ADMIN' | 'SUPERADMIN'): boolean {
  const roleHierarchy = {
    'USER': 1,
    'ADMIN': 2,
    'SUPERADMIN': 3,
  };
  
  const userLevel = roleHierarchy[user.userRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole];
  
  return userLevel >= requiredLevel;
}

// ============================================
// MAIN HANDLE FUNCTION
// ============================================

export const handle: Handle = async ({ event, resolve }) => {
  const { url, cookies } = event;
  const pathname = url.pathname;
  
  // Initialize locals
  event.locals.user = null;
  event.locals.isAuthenticated = false;
  
  try {
    // Skip authentication for static assets and API routes
    if (pathname.startsWith('/_app/') || 
        pathname.startsWith('/favicon') || 
        pathname.startsWith('/api/')) {
      return await resolve(event);
    }
    
    // Verify user authentication
    const user = await verifyAuthentication(cookies);
    
    if (user) {
      // User is authenticated
      event.locals.user = {
        id: user.id,
        username: user.username,
        userRoleId: user.userRoleId,
        userRole: user.userRole,
        hospitalCode9eDigit: user.hospitalCode9eDigit
      };
      event.locals.isAuthenticated = true;
      
      // Redirect authenticated users away from login page
      if (isAuthRoute(pathname)) {
        const redirectTo = url.searchParams.get('redirect') || '/patients';
        throw redirect(302, redirectTo);
      }
    } else {
      // User is not authenticated
      event.locals.user = null;
      event.locals.isAuthenticated = false;
      
      // Redirect unauthenticated users to login for protected routes
      if (isProtectedRoute(pathname)) {
        const loginUrl = `/login?redirect=${encodeURIComponent(pathname + url.search)}`;
        throw redirect(302, loginUrl);
      }
    }
    
    // Check admin access for admin routes
    if (isAdminRoute(pathname) && user) {
      if (!hasRequiredRole(user, 'ADMIN')) {
        throw redirect(302, '/unauthorized');
      }
    }
    
    // Continue with the request
    const response = await resolve(event);
    
    // Add security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    return response;
    
  } catch (error) {
    // Handle redirects (expected behavior)
    if (error instanceof Response && error.status === 302) {
      throw error;
    }
    
    // Handle unexpected errors
    console.error('Hooks error:', error);
    
    // Don't block the request, just continue without authentication
    return await resolve(event);
  }
};