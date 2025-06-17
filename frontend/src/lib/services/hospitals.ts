// src/lib/services/hospitals.ts
import { buildApiUrl, API_ENDPOINTS } from '$lib/config';
import { apiFetch, ApiError } from '$lib/api';
import type { Hospital, QueryParams, BaseResponse, PaginationMeta } from '$lib/types/backend';

/**
 * Get a paginated list of hospitals.
 * @param params - Query parameters for pagination, searching, and sorting.
 */
export async function getHospitals(params: QueryParams = {}): Promise<BaseResponse<{ hospitals: Hospital[]; pagination: PaginationMeta }>> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value.toString());
    }
  });

  const query = searchParams.toString();
  const endpoint = `${API_ENDPOINTS.HOSPITALS.LIST}${query ? `?${query}` : ''}`;

  return await apiFetch(endpoint);
}

/**
 * Get a single hospital by its ID.
 * @param id - The UUID of the hospital.
 */
export async function getHospitalById(id: string): Promise<BaseResponse<{ hospital: Hospital }>> {
  if (!id) throw new Error('Hospital ID is required.');
  return await apiFetch(API_ENDPOINTS.HOSPITALS.BY_ID(id));
}

/**
 * Create a new hospital.
 * @param hospitalData - The data for the new hospital.
 */
export async function createHospital(hospitalData: Partial<Hospital>): Promise<BaseResponse<{ hospital: Hospital }>> {
  return await apiFetch(API_ENDPOINTS.HOSPITALS.CREATE, {
    method: 'POST',
    body: JSON.stringify(hospitalData),
  });
}

/**
 * Update an existing hospital.
 * @param id - The ID of the hospital to update.
 * @param hospitalData - The updated data.
 */
export async function updateHospital(id: string, hospitalData: Partial<Hospital>): Promise<BaseResponse<{ hospital: Hospital }>> {
  return await apiFetch(API_ENDPOINTS.HOSPITALS.UPDATE(id), {
    method: 'PUT',
    body: JSON.stringify(hospitalData),
  });
}

/**
 * Delete a hospital.
 * @param id - The ID of the hospital to delete.
 */
export async function deleteHospital(id: string): Promise<BaseResponse<{ deleted: boolean }>> {
  return await apiFetch(API_ENDPOINTS.HOSPITALS.DELETE(id), {
    method: 'DELETE',
  });
}