// src/lib/services/auth.ts
import { userRole, hasRole } from '$lib/stores/auth';
import { get } from 'svelte/store';

/**
 * Checks if the current user has admin privileges (Admin or SuperAdmin).
 */
export function isAdmin(): boolean {
  return hasRole('ADMIN');
}

/**
 * Checks if the current user is a SuperAdmin.
 */
export function isSuperAdmin(): boolean {
  return hasRole('SUPERADMIN');
}

/**
 * Gets the current user's role.
 */
export function getCurrentUserRole(): string | null {
  return get(userRole);
}