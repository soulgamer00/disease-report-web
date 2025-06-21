// frontend/src/routes/dashboard/+layout.server.ts
// ✅ FIXED Dashboard auth protection + Proper server-client sync
// Server-side authentication check with proper state passing

import { redirect, type Cookies } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { UserInfo } from '$lib/types/auth.types';

// ✅ Define parameter types explicitly
interface LoadParams {
  cookies: Cookies;
  url: URL;
  fetch: typeof fetch;
}

// ✅ Define return type explicitly and export it
export interface LayoutData {
  isAuthenticated: boolean;
  user: UserInfo | null;
  currentPath: string;
  currentSearch: string;
  debug?: {
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
    hasUserData: boolean;
    cookieUserData: boolean;
  };
}

// ============================================
// AUTH PROTECTION FOR DASHBOARD
// ============================================

export const load = async ({ cookies, url, fetch }: LoadParams): Promise<LayoutData> => {
  console.log('🔐 Dashboard auth check...', url.pathname);
  
  // Check authentication tokens from cookies
  const accessToken = cookies.get('accessToken');
  const refreshToken = cookies.get('refreshToken');
  
  console.log('📋 Cookie status:', {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    path: url.pathname
  });
  
  // ✅ ถ้าไม่มี token เลย -> redirect ไปหน้า login ทันที
  if (!accessToken && !refreshToken) {
    console.log('❌ No auth tokens found, redirecting to login');
    
    const loginUrl = `/login?redirect=${encodeURIComponent(url.pathname + url.search)}`;
    throw redirect(302, loginUrl);
  }
  
  // ✅ มี refreshToken แต่ไม่มี accessToken -> ลอง refresh
  if (!accessToken && refreshToken) {
    console.log('🔄 Access token missing, attempting refresh...');
    
    try {
      const refreshResponse = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `refreshToken=${refreshToken}`
        },
        body: JSON.stringify({})
      });
      
      if (!refreshResponse.ok) {
        console.log('❌ Token refresh failed, redirecting to login');
        const loginUrl = `/login?redirect=${encodeURIComponent(url.pathname + url.search)}`;
        throw redirect(302, loginUrl);
      }
      
      console.log('✅ Token refreshed successfully');
    } catch (error) {
      console.error('❌ Refresh error:', error);
      const loginUrl = `/login?redirect=${encodeURIComponent(url.pathname + url.search)}`;
      throw redirect(302, loginUrl);
    }
  }
  
  // ✅ Get user data from cookie (ถ้ามี)
  const userDataCookie = cookies.get('userData');
  let userData: UserInfo | null = null;
  
  if (userDataCookie) {
    try {
      userData = JSON.parse(decodeURIComponent(userDataCookie)) as UserInfo;
      console.log('👤 User data loaded from cookie:', {
        username: userData.username,
        fullName: userData.fname && userData.lname ? `${userData.fname} ${userData.lname}` : userData.username,
        role: userData.userRoleId,
        hospital: userData.hospital?.hospitalName
      });
    } catch (error) {
      console.warn('⚠️ Failed to parse userData cookie:', error);
      userData = null;
    }
  }
  
  // ✅ ถ้าไม่มี userData ใน cookie แต่มี token -> ลองดึงจาก API
  if (!userData && (accessToken || refreshToken)) {
    console.log('🔄 No user data in cookie, fetching from API...');
    
    try {
      const profileResponse = await fetch('/api/auth/profile', {
        headers: {
          'Cookie': `accessToken=${accessToken}; refreshToken=${refreshToken}`
        }
      });
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        if (profileData.success) {
          userData = profileData.data as UserInfo;
          console.log('✅ User data fetched from API');
          
          // ✅ Set userData cookie สำหรับครั้งต่อไป
          cookies.set('userData', encodeURIComponent(JSON.stringify(userData)), {
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            httpOnly: false, // ต้องให้ client อ่านได้
            secure: !dev, // secure ใน production เท่านั้น
            sameSite: 'strict'
          });
        }
      } else {
        console.warn('⚠️ Failed to fetch user profile');
      }
    } catch (error) {
      console.error('❌ Profile fetch error:', error);
    }
  }
  
  // ✅ ถ้าหลังจากพยายามทุกวิธีแล้วยังไม่มี userData -> อาจมีปัญหา
  if (!userData) {
    console.warn('⚠️ No user data available despite having tokens');
    
    // ✅ ให้โอกาสสุดท้าย - อาจจะเป็น data corruption
    // ไม่ redirect ทันที แต่ส่ง flag ให้ client handle
  }
  
  console.log('✅ Auth check completed:', {
    hasUserData: !!userData,
    isAuthenticated: !!(userData && (accessToken || refreshToken)),
    userId: userData?.id,
    username: userData?.username
  });
  
  // ✅ Return ข้อมูลที่ครบถ้วนสำหรับ client
  return {
    // ✅ Authentication state
    isAuthenticated: !!(userData && (accessToken || refreshToken)),
    user: userData,
    
    // ✅ Page metadata
    currentPath: url.pathname,
    currentSearch: url.search,
    
    // ✅ Debugging info (เฉพาะ development)
    ...(dev && {
      debug: {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        hasUserData: !!userData,
        cookieUserData: !!userDataCookie
      }
    })
  };
};