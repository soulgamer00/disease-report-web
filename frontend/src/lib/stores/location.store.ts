// frontend/src/lib/stores/location.store.ts
// ✅ Location Store - จังหวัด อำเภอ ตำบล ของไทย
// Reusable across all components that need location data

import { writable, derived } from 'svelte/store';

// ============================================
// LOCATION TYPES
// ============================================

export interface Province {
  id: number;
  name: string;
  nameEn: string;
}

export interface District {
  id: number;
  name: string;
  nameEn: string;
  provinceId: number;
}

export interface SubDistrict {
  id: number;
  name: string;
  nameEn: string;
  districtId: number;
  postalCode?: string;
}

export interface LocationOption {
  value: string;
  label: string;
  id?: number;
}

// ============================================
// THAI PROVINCES DATA (77 จังหวัด)
// ============================================

export const THAI_PROVINCES: Province[] = [
  { id: 1, name: 'กระบี่', nameEn: 'Krabi' },
  { id: 2, name: 'กรุงเทพมหานคร', nameEn: 'Bangkok' },
  { id: 3, name: 'กาญจนบุรี', nameEn: 'Kanchanaburi' },
  { id: 4, name: 'กาฬสินธุ์', nameEn: 'Kalasin' },
  { id: 5, name: 'กำแพงเพชร', nameEn: 'Kamphaeng Phet' },
  { id: 6, name: 'ขอนแก่น', nameEn: 'Khon Kaen' },
  { id: 7, name: 'จันทบุรี', nameEn: 'Chanthaburi' },
  { id: 8, name: 'ฉะเชิงเทรา', nameEn: 'Chachoengsao' },
  { id: 9, name: 'ชลบุรี', nameEn: 'Chonburi' },
  { id: 10, name: 'ชัยนาท', nameEn: 'Chai Nat' },
  { id: 11, name: 'ชัยภูมิ', nameEn: 'Chaiyaphum' },
  { id: 12, name: 'ชุมพร', nameEn: 'Chumphon' },
  { id: 13, name: 'เชียงราย', nameEn: 'Chiang Rai' },
  { id: 14, name: 'เชียงใหม่', nameEn: 'Chiang Mai' },
  { id: 15, name: 'ตรัง', nameEn: 'Trang' },
  { id: 16, name: 'ตราด', nameEn: 'Trat' },
  { id: 17, name: 'ตาก', nameEn: 'Tak' },
  { id: 18, name: 'นครนายก', nameEn: 'Nakhon Nayok' },
  { id: 19, name: 'นครปฐม', nameEn: 'Nakhon Pathom' },
  { id: 20, name: 'นครพนม', nameEn: 'Nakhon Phanom' },
  { id: 21, name: 'นครราชสีมา', nameEn: 'Nakhon Ratchasima' },
  { id: 22, name: 'นครศรีธรรมราช', nameEn: 'Nakhon Si Thammarat' },
  { id: 23, name: 'นครสวรรค์', nameEn: 'Nakhon Sawan' },
  { id: 24, name: 'นนทบุรี', nameEn: 'Nonthaburi' },
  { id: 25, name: 'นราธิวาส', nameEn: 'Narathiwat' },
  { id: 26, name: 'น่าน', nameEn: 'Nan' },
  { id: 27, name: 'บึงกาฬ', nameEn: 'Bueng Kan' },
  { id: 28, name: 'บุรีรัมย์', nameEn: 'Buriram' },
  { id: 29, name: 'ปทุมธานี', nameEn: 'Pathum Thani' },
  { id: 30, name: 'ประจวบคีรีขันธ์', nameEn: 'Prachuap Khiri Khan' },
  { id: 31, name: 'ปราจีนบุรี', nameEn: 'Prachinburi' },
  { id: 32, name: 'ปัตตานี', nameEn: 'Pattani' },
  { id: 33, name: 'พระนครศรีอยุธยา', nameEn: 'Phra Nakhon Si Ayutthaya' },
  { id: 34, name: 'พะเยา', nameEn: 'Phayao' },
  { id: 35, name: 'พังงา', nameEn: 'Phang Nga' },
  { id: 36, name: 'พัทลุง', nameEn: 'Phatthalung' },
  { id: 37, name: 'พิจิตร', nameEn: 'Phichit' },
  { id: 38, name: 'พิษณุโลก', nameEn: 'Phitsanulok' },
  { id: 39, name: 'เพชรบุรี', nameEn: 'Phetchaburi' },
  { id: 40, name: 'เพชรบูรณ์', nameEn: 'Phetchabun' },
  { id: 41, name: 'แพร่', nameEn: 'Phrae' },
  { id: 42, name: 'ภูเก็ต', nameEn: 'Phuket' },
  { id: 43, name: 'มหาสารคาม', nameEn: 'Maha Sarakham' },
  { id: 44, name: 'มุกดาหาร', nameEn: 'Mukdahan' },
  { id: 45, name: 'แม่ฮ่องสอน', nameEn: 'Mae Hong Son' },
  { id: 46, name: 'ยโสธร', nameEn: 'Yasothon' },
  { id: 47, name: 'ยะลา', nameEn: 'Yala' },
  { id: 48, name: 'ร้อยเอ็ด', nameEn: 'Roi Et' },
  { id: 49, name: 'ระนอง', nameEn: 'Ranong' },
  { id: 50, name: 'ระยอง', nameEn: 'Rayong' },
  { id: 51, name: 'ราชบุรี', nameEn: 'Ratchaburi' },
  { id: 52, name: 'ลพบุรี', nameEn: 'Lopburi' },
  { id: 53, name: 'ลำปาง', nameEn: 'Lampang' },
  { id: 54, name: 'ลำพูน', nameEn: 'Lamphun' },
  { id: 55, name: 'เลย', nameEn: 'Loei' },
  { id: 56, name: 'ศรีสะเกษ', nameEn: 'Sisaket' },
  { id: 57, name: 'สกลนคร', nameEn: 'Sakon Nakhon' },
  { id: 58, name: 'สงขลา', nameEn: 'Songkhla' },
  { id: 59, name: 'สตูล', nameEn: 'Satun' },
  { id: 60, name: 'สมุทรปราการ', nameEn: 'Samut Prakan' },
  { id: 61, name: 'สมุทรสงคราม', nameEn: 'Samut Songkhram' },
  { id: 62, name: 'สมุทรสาคร', nameEn: 'Samut Sakhon' },
  { id: 63, name: 'สระแก้ว', nameEn: 'Sa Kaeo' },
  { id: 64, name: 'สระบุรี', nameEn: 'Saraburi' },
  { id: 65, name: 'สิงห์บุรี', nameEn: 'Sing Buri' },
  { id: 66, name: 'สุโขทัย', nameEn: 'Sukhothai' },
  { id: 67, name: 'สุพรรณบุรี', nameEn: 'Suphan Buri' },
  { id: 68, name: 'สุราษฎร์ธานี', nameEn: 'Surat Thani' },
  { id: 69, name: 'สุรินทร์', nameEn: 'Surin' },
  { id: 70, name: 'หนองคาย', nameEn: 'Nong Khai' },
  { id: 71, name: 'หนองบัวลำภู', nameEn: 'Nong Bua Lam Phu' },
  { id: 72, name: 'อ่างทอง', nameEn: 'Ang Thong' },
  { id: 73, name: 'อำนาจเจริญ', nameEn: 'Amnat Charoen' },
  { id: 74, name: 'อุดรธานี', nameEn: 'Udon Thani' },
  { id: 75, name: 'อุตรดิตถ์', nameEn: 'Uttaradit' },
  { id: 76, name: 'อุทัยธานี', nameEn: 'Uthai Thani' },
  { id: 77, name: 'อุบลราชธานี', nameEn: 'Ubon Ratchathani' },
] as const;

// ============================================
// PHETCHABUN DISTRICTS DATA (ข้อมูลครบจังหวัดเพชรบูรณ์)
// ============================================

export const PHETCHABUN_DISTRICTS: District[] = [
  { id: 4001, name: 'เมืองเพชรบูรณ์', nameEn: 'Mueang Phetchabun', provinceId: 40 },
  { id: 4002, name: 'หล่มสัก', nameEn: 'Lom Sak', provinceId: 40 },
  { id: 4003, name: 'หล่มเก่า', nameEn: 'Lom Kao', provinceId: 40 },
  { id: 4004, name: 'วิเชียรบุรี', nameEn: 'Wichian Buri', provinceId: 40 },
  { id: 4005, name: 'หนองไผ่', nameEn: 'Nong Phai', provinceId: 40 },
  { id: 4006, name: 'บึงสามพัน', nameEn: 'Bueng Sam Phan', provinceId: 40 },
  { id: 4007, name: 'ศรีเทพ', nameEn: 'Si Thep', provinceId: 40 },
  { id: 4008, name: 'ชนแดน', nameEn: 'Chon Daen', provinceId: 40 },
  { id: 4009, name: 'เขาค้อ', nameEn: 'Khao Kho', provinceId: 40 },
  { id: 4010, name: 'น้ำหนาว', nameEn: 'Nam Nao', provinceId: 40 },
  { id: 4011, name: 'วังโป่ง', nameEn: 'Wang Pong', provinceId: 40 },
] as const;

// ============================================
// PHETCHABUN SUB-DISTRICTS DATA (ตำบลเพชรบูรณ์)
// ============================================

export const PHETCHABUN_SUB_DISTRICTS: SubDistrict[] = [
  // อำเภอเมืองเพชรบูรณ์
  { id: 400101, name: 'สะเดียง', nameEn: 'Sadiang', districtId: 4001 },
  { id: 400102, name: 'ชอนไพร', nameEn: 'Chon Phrai', districtId: 4001 },
  { id: 400103, name: 'ดองมูลเหล็ก', nameEn: 'Dong Mun Lek', districtId: 4001 },
  { id: 400104, name: 'ตะเบาะ', nameEn: 'Tabo', districtId: 4001 },
  { id: 400105, name: 'บ้านโตก', nameEn: 'Ban Tok', districtId: 4001 },
  { id: 400106, name: 'นาหั่ว', nameEn: 'Na Hua', districtId: 4001 },
  { id: 400107, name: 'ท่าพล', nameEn: 'Tha Phon', districtId: 4001 },
  { id: 400108, name: 'น้ำร้อน', nameEn: 'Nam Ron', districtId: 4001 },
  { id: 400109, name: 'ห้วยสะแก', nameEn: 'Huai Sakae', districtId: 4001 },
  { id: 400110, name: 'ห้วยใหญ่', nameEn: 'Huai Yai', districtId: 4001 },
  { id: 400111, name: 'ระวิง', nameEn: 'Rawing', districtId: 4001 },
  { id: 400112, name: 'วังชมภู', nameEn: 'Wang Chomphu', districtId: 4001 },
  { id: 400113, name: 'วังพิกุล', nameEn: 'Wang Phikun', districtId: 4001 },
  { id: 400114, name: 'ยางงาม', nameEn: 'Yang Ngam', districtId: 4001 },
  { id: 400115, name: 'นาป่า', nameEn: 'Na Pa', districtId: 4001 },
  { id: 400116, name: 'นายม', nameEn: 'Na Yom', districtId: 4001 },
  { id: 400117, name: 'ตะเบาะใต้', nameEn: 'Tabo Tai', districtId: 4001 },

  // อำเภอหล่มสัก
  { id: 400201, name: 'หล่มสัก', nameEn: 'Lom Sak', districtId: 4002 },
  { id: 400202, name: 'วัดป่า', nameEn: 'Wat Pa', districtId: 4002 },
  { id: 400203, name: 'ตาลเดี่ยว', nameEn: 'Tal Diao', districtId: 4002 },
  { id: 400204, name: 'น้ำเฮี้ย', nameEn: 'Nam Hia', districtId: 4002 },
  { id: 400205, name: 'บ้านติ้ว', nameEn: 'Ban Tio', districtId: 4002 },
  { id: 400206, name: 'บ้านกลาง', nameEn: 'Ban Klang', districtId: 4002 },
  { id: 400207, name: 'ช้างตะลูด', nameEn: 'Chang Talut', districtId: 4002 },
  { id: 400208, name: 'ห้วยไร่', nameEn: 'Huai Rai', districtId: 4002 },
  { id: 400209, name: 'ปากช่อง', nameEn: 'Pak Chong', districtId: 4002 },
  { id: 400210, name: 'น้ำก้อ', nameEn: 'Nam Ko', districtId: 4002 },
  { id: 400211, name: 'น้ำชุน', nameEn: 'Nam Chun', districtId: 4002 },
  { id: 400212, name: 'หนองสว่าง', nameEn: 'Nong Sawang', districtId: 4002 },
  { id: 400213, name: 'หนองไขว่', nameEn: 'Nong Khai Wa', districtId: 4002 },

  // อำเภอหล่มเก่า
  { id: 400301, name: 'หล่มเก่า', nameEn: 'Lom Kao', districtId: 4003 },
  { id: 400302, name: 'นาแซง', nameEn: 'Na Saeng', districtId: 4003 },
  { id: 400303, name: 'นาเกาะ', nameEn: 'Na Ko', districtId: 4003 },
  { id: 400304, name: 'ตาดกลอย', nameEn: 'Tat Kloi', districtId: 4003 },
  { id: 400305, name: 'บ้านเนิน', nameEn: 'Ban Noen', districtId: 4003 },
  { id: 400306, name: 'ศิลา', nameEn: 'Sila', districtId: 4003 },
  { id: 400307, name: 'หินฮาว', nameEn: 'Hin Hao', districtId: 4003 },
  { id: 400308, name: 'บ้านหวาย', nameEn: 'Ban Wai', districtId: 4003 },
  { id: 400309, name: 'ท่าโรง', nameEn: 'Tha Rong', districtId: 4003 },

  // อำเภอวิเชียรบุรี
  { id: 400401, name: 'วิเชียรบุรี', nameEn: 'Wichian Buri', districtId: 4004 },
  { id: 400402, name: 'สระประดู่', nameEn: 'Sa Pradu', districtId: 4004 },
  { id: 400403, name: 'สามแยก', nameEn: 'Sam Yaek', districtId: 4004 },
  { id: 400404, name: 'ท่าโรง', nameEn: 'Tha Rong', districtId: 4004 },
  { id: 400405, name: 'บ่อรัง', nameEn: 'Bo Rang', districtId: 4004 },
  { id: 400406, name: 'พุเตย', nameEn: 'Phuthoei', districtId: 4004 },
  { id: 400407, name: 'ยางสาว', nameEn: 'Yang Sao', districtId: 4004 },
  { id: 400408, name: 'สระกรวด', nameEn: 'Sa Krueat', districtId: 4004 },
  { id: 400409, name: 'บ้านไร่', nameEn: 'Ban Rai', districtId: 4004 },
  { id: 400410, name: 'โคกปรง', nameEn: 'Khok Prong', districtId: 4004 },
  { id: 400411, name: 'หนองแจง', nameEn: 'Nong Chaeng', districtId: 4004 },

  // อำเภอหนองไผ่
  { id: 400501, name: 'หนองไผ่', nameEn: 'Nong Phai', districtId: 4005 },
  { id: 400502, name: 'ท่าด้วง', nameEn: 'Tha Duang', districtId: 4005 },
  { id: 400503, name: 'วังโบสถ์', nameEn: 'Wang Bot', districtId: 4005 },
  { id: 400504, name: 'บ้านโภชน์', nameEn: 'Ban Phot', districtId: 4005 },
  { id: 400505, name: 'ห้วยโป่ง', nameEn: 'Huai Pong', districtId: 4005 },
  { id: 400506, name: 'วังหิน', nameEn: 'Wang Hin', districtId: 4005 },
  { id: 400507, name: 'ยางงาม', nameEn: 'Yang Ngam', districtId: 4005 },
  { id: 400508, name: 'ท่าแดง', nameEn: 'Tha Daeng', districtId: 4005 },
  { id: 400509, name: 'ดงขุย', nameEn: 'Dong Khui', districtId: 4005 },
  { id: 400510, name: 'วังท่าดี', nameEn: 'Wang Tha Di', districtId: 4005 },

  // อำเภอบึงสามพัน
  { id: 400601, name: 'บึงสามพัน', nameEn: 'Bueng Sam Phan', districtId: 4006 },
  { id: 400602, name: 'วังพิกุล', nameEn: 'Wang Phikun', districtId: 4006 },
  { id: 400603, name: 'ซับสมบูรณ์', nameEn: 'Sap Sombun', districtId: 4006 },
  { id: 400604, name: 'กันจุ', nameEn: 'Kan Chu', districtId: 4006 },
  { id: 400605, name: 'พญาวัง', nameEn: 'Phaya Wang', districtId: 4006 },
  { id: 400606, name: 'ศรีมงคล', nameEn: 'Si Mongkhon', districtId: 4006 },
  { id: 400607, name: 'หนองแจง', nameEn: 'Nong Chaeng', districtId: 4006 },

  // อำเภอศรีเทพ
  { id: 400701, name: 'ศรีเทพ', nameEn: 'Si Thep', districtId: 4007 },
  { id: 400702, name: 'สระกรวด', nameEn: 'Sa Krueat', districtId: 4007 },
  { id: 400703, name: 'โพธิ์กลาง', nameEn: 'Pho Klang', districtId: 4007 },
  { id: 400704, name: 'โพธิ์ประทับช้าง', nameEn: 'Pho Prathap Chang', districtId: 4007 },
  { id: 400705, name: 'หนองย่างทอย', nameEn: 'Nong Yang Thoi', districtId: 4007 },
  { id: 400706, name: 'หนองกระท้าว', nameEn: 'Nong Krathao', districtId: 4007 },

  // อำเภอชนแดน
  { id: 400801, name: 'ชนแดน', nameEn: 'Chon Daen', districtId: 4008 },
  { id: 400802, name: 'ดงขุย', nameEn: 'Dong Khui', districtId: 4008 },
  { id: 400803, name: 'ท่าข้าม', nameEn: 'Tha Kham', districtId: 4008 },
  { id: 400804, name: 'ตะกุดไร', nameEn: 'Takut Rai', districtId: 4008 },
  { id: 400805, name: 'บ้านกล้วย', nameEn: 'Ban Kluai', districtId: 4008 },
  { id: 400806, name: 'บ้านติ้ว', nameEn: 'Ban Tio', districtId: 4008 },
  { id: 400807, name: 'ซับพุทรา', nameEn: 'Sap Phutsa', districtId: 4008 },
  { id: 400808, name: 'วังใหญ่', nameEn: 'Wang Yai', districtId: 4008 },
  { id: 400809, name: 'วังทอง', nameEn: 'Wang Thong', districtId: 4008 },

  // อำเภอเขาค้อ
  { id: 400901, name: 'เขาค้อ', nameEn: 'Khao Kho', districtId: 4009 },
  { id: 400902, name: 'แคมป์สน', nameEn: 'Camp Son', districtId: 4009 },
  { id: 400903, name: 'ทุ่งสมอ', nameEn: 'Thung Samo', districtId: 4009 },
  { id: 400904, name: 'หนองแม่นา', nameEn: 'Nong Mae Na', districtId: 4009 },
  { id: 400905, name: 'สะเดาะพง', nameEn: 'Sado Phong', districtId: 4009 },

  // อำเภอน้ำหนาว
  { id: 401001, name: 'น้ำหนาว', nameEn: 'Nam Nao', districtId: 4010 },
  { id: 401002, name: 'หลักด่าน', nameEn: 'Lak Dan', districtId: 4010 },
  { id: 401003, name: 'วังกวาง', nameEn: 'Wang Kwang', districtId: 4010 },
  { id: 401004, name: 'โคกมน', nameEn: 'Khok Mon', districtId: 4010 },
  { id: 401005, name: 'ปากช่อง', nameEn: 'Pak Chong', districtId: 4010 },

  // อำเภอวังโป่ง
  { id: 401101, name: 'วังโป่ง', nameEn: 'Wang Pong', districtId: 4011 },
  { id: 401102, name: 'ซับเปิบ', nameEn: 'Sap Poep', districtId: 4011 },
  { id: 401103, name: 'วังหิน', nameEn: 'Wang Hin', districtId: 4011 },
  { id: 401104, name: 'ตาลเดี่ยว', nameEn: 'Tal Diao', districtId: 4011 },
  { id: 401105, name: 'ท้ายดง', nameEn: 'Thai Dong', districtId: 4011 },
] as const;

// ============================================
// STORE DEFINITION
// ============================================

interface LocationStoreState {
  provinces: Province[];
  districts: District[];
  subDistricts: SubDistrict[];
  isLoading: boolean;
  error: string | null;
}

const initialState: LocationStoreState = {
  provinces: THAI_PROVINCES,
  districts: PHETCHABUN_DISTRICTS, // Start with Phetchabun, can expand later
  subDistricts: PHETCHABUN_SUB_DISTRICTS,
  isLoading: false,
  error: null,
};

// Create the main store
const locationStore = writable<LocationStoreState>(initialState);

// ============================================
// DERIVED STORES (Computed values)
// ============================================

/**
 * Get all provinces as dropdown options
 */
export const provinceOptions = derived(
  locationStore,
  ($store): LocationOption[] => 
    $store.provinces.map(province => ({
      value: province.name,
      label: province.name,
      id: province.id,
    }))
);

/**
 * Get districts for a specific province
 */
export function getDistrictsByProvince(provinceId: number) {
  return derived(
    locationStore,
    ($store): LocationOption[] => 
      $store.districts
        .filter(district => district.provinceId === provinceId)
        .map(district => ({
          value: district.name,
          label: district.name,
          id: district.id,
        }))
  );
}

/**
 * Get sub-districts for a specific district
 */
export function getSubDistrictsByDistrict(districtId: number) {
  return derived(
    locationStore,
    ($store): LocationOption[] => 
      $store.subDistricts
        .filter(subDistrict => subDistrict.districtId === districtId)
        .map(subDistrict => ({
          value: subDistrict.name,
          label: subDistrict.name,
          id: subDistrict.id,
        }))
  );
}

/**
 * Search provinces by name
 */
export function searchProvinces(query: string) {
  return derived(
    locationStore,
    ($store): LocationOption[] => {
      if (!query.trim()) return [];
      
      const normalizedQuery = query.toLowerCase().trim();
      return $store.provinces
        .filter(province => 
          province.name.toLowerCase().includes(normalizedQuery) ||
          province.nameEn.toLowerCase().includes(normalizedQuery)
        )
        .map(province => ({
          value: province.name,
          label: province.name,
          id: province.id,
        }))
        .slice(0, 10); // Limit results
    }
  );
}

// ============================================
// STORE ACTIONS
// ============================================

export const locationActions = {
  /**
   * Find province by name
   */
  findProvinceByName: (name: string): Province | undefined => {
    return THAI_PROVINCES.find(province => province.name === name);
  },

  /**
   * Find district by name and province
   */
  findDistrictByName: (name: string, provinceId: number): District | undefined => {
    return PHETCHABUN_DISTRICTS.find(
      district => district.name === name && district.provinceId === provinceId
    );
  },

  /**
   * Find sub-district by name and district
   */
  findSubDistrictByName: (name: string, districtId: number): SubDistrict | undefined => {
    return PHETCHABUN_SUB_DISTRICTS.find(
      subDistrict => subDistrict.name === name && subDistrict.districtId === districtId
    );
  },

  /**
   * Get full address hierarchy
   */
  getAddressHierarchy: (provinceName?: string, districtName?: string, subDistrictName?: string) => {
    const province = provinceName ? locationActions.findProvinceByName(provinceName) : undefined;
    const district = districtName && province 
      ? locationActions.findDistrictByName(districtName, province.id) 
      : undefined;
    const subDistrict = subDistrictName && district 
      ? locationActions.findSubDistrictByName(subDistrictName, district.id) 
      : undefined;

    return {
      province,
      district,
      subDistrict,
      isValid: !!(province && district && subDistrict),
    };
  },

  /**
   * Validate address completeness
   */
  validateAddress: (provinceName: string, districtName: string, subDistrictName: string): boolean => {
    const hierarchy = locationActions.getAddressHierarchy(provinceName, districtName, subDistrictName);
    return hierarchy.isValid;
  },
};

// ============================================
// EXPORT MAIN STORE AND UTILITIES
// ============================================

export { locationStore };

/**
 * Convenience function to get province options for dropdowns
 */
export function getProvinceOptions(): LocationOption[] {
  return THAI_PROVINCES.map(province => ({
    value: province.name,
    label: province.name,
    id: province.id,
  }));
}

/**
 * Convenience function to get district options for a province
 */
export function getDistrictOptions(provinceId: number): LocationOption[] {
  return PHETCHABUN_DISTRICTS
    .filter(district => district.provinceId === provinceId)
    .map(district => ({
      value: district.name,
      label: district.name,
      id: district.id,
    }));
}

/**
 * Convenience function to get sub-district options for a district
 */
export function getSubDistrictOptions(districtId: number): LocationOption[] {
  return PHETCHABUN_SUB_DISTRICTS
    .filter(subDistrict => subDistrict.districtId === districtId)
    .map(subDistrict => ({
      value: subDistrict.name,
      label: subDistrict.name,
      id: subDistrict.id,
    }));
}