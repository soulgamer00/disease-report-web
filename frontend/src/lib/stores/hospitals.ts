// src/lib/stores/hospitals.ts
import { writable } from 'svelte/store';
import type { Hospital, PaginationMeta } from '$lib/types/backend';
import * as hospitalService from '$lib/services/hospitals';
import { showError, showSuccess } from '$lib/services/notifications';

interface HospitalStore {
  hospitals: Hospital[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  currentHospital: Hospital | null;
}

const createHospitalStore = () => {
  const { subscribe, set, update } = writable<HospitalStore>({
    hospitals: [],
    pagination: null,
    isLoading: false,
    error: null,
    currentHospital: null,
  });

  const setLoading = (loading: boolean) => update(s => ({ ...s, isLoading: loading }));
  const setError = (error: string | null) => update(s => ({ ...s, error }));

  return {
    subscribe,
    fetchHospitals: async (params = {}) => {
      setLoading(true);
      setError(null);
      try {
        const response = await hospitalService.getHospitals(params);
        if (response.success) {
          update(s => ({
            ...s,
            hospitals: response.data.hospitals,
            pagination: response.data.pagination,
          }));
        }
      } catch (e: any) {
        setError(e.message);
        showError('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลโรงพยาบาลได้');
      } finally {
        setLoading(false);
      }
    },
    selectHospital: async (id: string) => {
      setLoading(true);
      try {
        const response = await hospitalService.getHospitalById(id);
        if (response.success) {
          update(s => ({...s, currentHospital: response.data.hospital}));
        }
      } catch (e: any) {
         showError('ข้อผิดพลาด', 'ไม่พบข้อมูลโรงพยาบาล');
      } finally {
        setLoading(false);
      }
    },
    saveHospital: async (hospitalData: Partial<Hospital>) => {
       setLoading(true);
       try {
         if (hospitalData.id) {
           await hospitalService.updateHospital(hospitalData.id, hospitalData);
           showSuccess('สำเร็จ', 'อัปเดตข้อมูลโรงพยาบาลเรียบร้อยแล้ว');
         } else {
           await hospitalService.createHospital(hospitalData);
           showSuccess('สำเร็จ', 'สร้างโรงพยาบาลใหม่เรียบร้อยแล้ว');
         }
       } catch (e: any) {
         showError('เกิดข้อผิดพลาด', e.message);
       } finally {
         setLoading(false);
       }
    },
    deleteHospital: async (id: string) => {
        setLoading(true);
        try {
            await hospitalService.deleteHospital(id);
            showSuccess('สำเร็จ', 'ลบโรงพยาบาลเรียบร้อยแล้ว');
        } catch (e: any) {
            showError('เกิดข้อผิดพลาด', e.message);
        } finally {
            setLoading(false);
        }
    },
    clearCurrentHospital: () => update(s => ({...s, currentHospital: null}))
  };
};

export const hospitalStore = createHospitalStore();