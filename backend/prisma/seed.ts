// prisma/seed.ts

import { PrismaClient, Disease } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // ============================================
  // 1. SEED HOSPITALS DATA
  // ============================================
  console.log('🏥 Seeding hospitals...');

  const hospitalsData = [
    {
      hospitalName: 'สำนักงานสาธารณสุขอำเภอวิเชียรบุรี',
      hospitalCode9eDigit: 'BA0000712',
      hospitalCode9Digit: '000071200',
      hospitalCode5Digit: '00712',
      organizationType: 'รัฐบาล',
      healthServiceType: 'สำนักงานสาธารณสุขอำเภอ',
      affiliation: 'กระทรวงสาธารณสุข',
      departmentDivision: 'สำนักงานปลัดกระทรวงสาธารณสุข',
    },
    {
      hospitalName: 'โรงพยาบาลวิเชียรบุรี',
      hospitalCode9eDigit: 'EA0011266',
      hospitalCode9Digit: '001126600',
      hospitalCode5Digit: '11266',
      organizationType: 'รัฐบาล',
      healthServiceType: 'โรงพยาบาลทั่วไป',
      affiliation: 'กระทรวงสาธารณสุข',
      departmentDivision: 'สำนักงานปลัดกระทรวงสาธารณสุข',
    },
    {
      hospitalName: 'โรงพยาบาลส่งเสริมสุขภาพตำบลนาไร่เดียว ตำบลท่าโรง',
      hospitalCode9eDigit: 'GA0007787',
      hospitalCode9Digit: '000778700',
      hospitalCode5Digit: '07787',
      organizationType: 'รัฐบาล',
      healthServiceType: 'ศูนย์บริการสาธารณสุข อปท.',
      affiliation: 'องค์กรปกครองส่วนท้องถิ่น',
      departmentDivision: '-',
    },
    {
      hospitalName: 'โรงพยาบาลส่งเสริมสุขภาพตำบลท่าโรง ตำบลท่าโรง',
      hospitalCode9eDigit: 'GA0007788',
      hospitalCode9Digit: '000778800',
      hospitalCode5Digit: '07788',
      organizationType: 'รัฐบาล',
      healthServiceType: 'ศูนย์บริการสาธารณสุข อปท.',
      affiliation: 'องค์กรปกครองส่วนท้องถิ่น',
      departmentDivision: '-',
    },
    {
      hospitalName: 'โรงพยาบาลส่งเสริมสุขภาพตำบลแก่งหินปูน ตำบลสามแยก',
      hospitalCode9eDigit: 'GA0007789',
      hospitalCode9Digit: '000778900',
      hospitalCode5Digit: '07789',
      organizationType: 'รัฐบาล',
      healthServiceType: 'โรงพยาบาลส่งเสริมสุขภาพตำบล',
      affiliation: 'กระทรวงสาธารณสุข',
      departmentDivision: 'สำนักงานปลัดกระทรวงสาธารณสุข',
    },
    {
      hospitalName: 'โรงพยาบาลส่งเสริมสุขภาพตำบลโคกปรง ตำบลโคกปรง',
      hospitalCode9eDigit: 'GA0007790',
      hospitalCode9Digit: '000779000',
      hospitalCode5Digit: '07790',
      organizationType: 'รัฐบาล',
      healthServiceType: 'ศูนย์บริการสาธารณสุข อปท.',
      affiliation: 'องค์กรปกครองส่วนท้องถิ่น',
      departmentDivision: '-',
    },
    {
      hospitalName: 'โรงพยาบาลส่งเสริมสุขภาพตำบลน้ำร้อน ตำบลน้ำร้อน',
      hospitalCode9eDigit: 'GA0007791',
      hospitalCode9Digit: '000779100',
      hospitalCode5Digit: '07791',
      organizationType: 'รัฐบาล',
      healthServiceType: 'ศูนย์บริการสาธารณสุข อปท.',
      affiliation: 'องค์กรปกครองส่วนท้องถิ่น',
      departmentDivision: '-',
    },
    {
      hospitalName: 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ่อรัง ตำบลบ่อรัง',
      hospitalCode9eDigit: 'GA0007792',
      hospitalCode9Digit: '000779200',
      hospitalCode5Digit: '07792',
      organizationType: 'รัฐบาล',
      healthServiceType: 'โรงพยาบาลส่งเสริมสุขภาพตำบล',
      affiliation: 'กระทรวงสาธารณสุข',
      departmentDivision: 'สำนักงานปลัดกระทรวงสาธารณสุข',
    },
    {
      hospitalName: 'โรงพยาบาลส่งเสริมสุขภาพตำบลวังไผ่ ตำบลบ่อรัง',
      hospitalCode9eDigit: 'GA0007793',
      hospitalCode9Digit: '000779300',
      hospitalCode5Digit: '07793',
      organizationType: 'รัฐบาล',
      healthServiceType: 'โรงพยาบาลส่งเสริมสุขภาพตำบล',
      affiliation: 'กระทรวงสาธารณสุข',
      departmentDivision: 'สำนักงานปลัดกระทรวงสาธารณสุข',
    },
    {
      hospitalName: 'โรงพยาบาลส่งเสริมสุขภาพตำบลพุเตย ตำบลพุเตย',
      hospitalCode9eDigit: 'GA0007794',
      hospitalCode9Digit: '000779400',
      hospitalCode5Digit: '07794',
      organizationType: 'รัฐบาล',
      healthServiceType: 'โรงพยาบาลส่งเสริมสุขภาพตำบล',
      affiliation: 'กระทรวงสาธารณสุข',
      departmentDivision: 'สำนักงานปลัดกระทรวงสาธารณสุข',
    },
    {
      hospitalName: 'โรงพยาบาลส่งเสริมสุขภาพตำบลพุขาม ตำบลพุขาม',
      hospitalCode9eDigit: 'GA0007795',
      hospitalCode9Digit: '000779500',
      hospitalCode5Digit: '07795',
      organizationType: 'รัฐบาล',
      healthServiceType: 'ศูนย์บริการสาธารณสุข อปท.',
      affiliation: 'องค์กรปกครองส่วนท้องถิ่น',
      departmentDivision: '-',
    },
    {
      hospitalName: 'โรงพยาบาลส่งเสริมสุขภาพตำบลรวมทรัพย์ ตำบลภูน้ำหยด',
      hospitalCode9eDigit: 'GA0007796',
      hospitalCode9Digit: '000779600',
      hospitalCode5Digit: '07796',
      organizationType: 'รัฐบาล',
      healthServiceType: 'โรงพยาบาลส่งเสริมสุขภาพตำบล',
      affiliation: 'กระทรวงสาธารณสุข',
      departmentDivision: 'สำนักงานปลัดกระทรวงสาธารณสุข',
    },
    {
      hospitalName: 'โรงพยาบาลส่งเสริมสุขภาพตำบลยางจ่า ตำบลภูน้ำหยด',
      hospitalCode9eDigit: 'GA0007797',
      hospitalCode9Digit: '000779700',
      hospitalCode5Digit: '07797',
      organizationType: 'รัฐบาล',
      healthServiceType: 'โรงพยาบาลส่งเสริมสุขภาพตำบล',
      affiliation: 'กระทรวงสาธารณสุข',
      departmentDivision: 'สำนักงานปลัดกระทรวงสาธารณสุข',
    },
    {
      hospitalName: 'โรงพยาบาลส่งเสริมสุขภาพตำบลโพทะเล ตำบลซับสมบูรณ์',
      hospitalCode9eDigit: 'GA0007798',
      hospitalCode9Digit: '000779800',
      hospitalCode5Digit: '07798',
      organizationType: 'รัฐบาล',
      healthServiceType: 'โรงพยาบาลส่งเสริมสุขภาพตำบล',
      affiliation: 'กระทรวงสาธารณสุข',
      departmentDivision: 'สำนักงานปลัดกระทรวงสาธารณสุข',
    },
    {
      hospitalName: 'โรงพยาบาลส่งเสริมสุขภาพตำบลบึงกระจับ ตำบลบึงกระจับ',
      hospitalCode9eDigit: 'GA0007799',
      hospitalCode9Digit: '000779900',
      hospitalCode5Digit: '07799',
      organizationType: 'รัฐบาล',
      healthServiceType: 'โรงพยาบาลส่งเสริมสุขภาพตำบล',
      affiliation: 'กระทรวงสาธารณสุข',
      departmentDivision: 'สำนักงานปลัดกระทรวงสาธารณสุข',
    },
    {
      hospitalName: 'โรงพยาบาลส่งเสริมสุขภาพตำบลวังใหญ่ ตำบลวังใหญ่',
      hospitalCode9eDigit: 'GA0007800',
      hospitalCode9Digit: '000780000',
      hospitalCode5Digit: '07800',
      organizationType: 'รัฐบาล',
      healthServiceType: 'โรงพยาบาลส่งเสริมสุขภาพตำบล',
      affiliation: 'กระทรวงสาธารณสุข',
      departmentDivision: 'สำนักงานปลัดกระทรวงสาธารณสุข',
    },
    {
      hospitalName: 'โรงพยาบาลส่งเสริมสุขภาพตำบลโนนสง่า ตำบลยางสาว',
      hospitalCode9eDigit: 'GA0007801',
      hospitalCode9Digit: '000780100',
      hospitalCode5Digit: '07801',
      organizationType: 'รัฐบาล',
      healthServiceType: 'ศูนย์บริการสาธารณสุข อปท.',
      affiliation: 'องค์กรปกครองส่วนท้องถิ่น',
      departmentDivision: '-',
    },
    {
      hospitalName: 'โรงพยาบาลส่งเสริมสุขภาพตำบลซับน้อย ตำบลซับน้อย',
      hospitalCode9eDigit: 'GA0007802',
      hospitalCode9Digit: '000780200',
      hospitalCode5Digit: '07802',
      organizationType: 'รัฐบาล',
      healthServiceType: 'โรงพยาบาลส่งเสริมสุขภาพตำบล',
      affiliation: 'กระทรวงสาธารณสุข',
      departmentDivision: 'สำนักงานปลัดกระทรวงสาธารณสุข',
    },
    {
      hospitalName: 'โรงพยาบาลส่งเสริมสุขภาพตำบลวังวัด ตำบลยางสาว',
      hospitalCode9eDigit: 'GA0014069',
      hospitalCode9Digit: '001406900',
      hospitalCode5Digit: '14069',
      organizationType: 'รัฐบาล',
      healthServiceType: 'ศูนย์บริการสาธารณสุข อปท.',
      affiliation: 'องค์กรปกครองส่วนท้องถิ่น',
      departmentDivision: '-',
    },
  ];

  for (const hospitalData of hospitalsData) {
    await prisma.hospital.upsert({
      where: { hospitalCode9eDigit: hospitalData.hospitalCode9eDigit },
      update: hospitalData,
      create: hospitalData,
    });
  }

  console.log(`✅ Seeded ${hospitalsData.length} hospitals`);

  // ============================================
  // 2. SEED DISEASES DATA
  // ============================================
  console.log('🦠 Seeding diseases...');

  const diseasesData = [
    {
      engName: 'Dengue Fever',
      thaiName: 'ไข้เลือดออก',
      shortName: 'DF',
      details: 'โรคติดเชื้อไวรัสที่มียุงเป็นพาหะนำโรค อาการเริ่มต้นคล้ายไข้หวัดใหญ่',
    },
    {
      engName: 'Malaria',
      thaiName: 'มาลาเรีย',
      shortName: 'MAL',
      details: 'โรคติดเชื้อปรสิตที่มียุงก้นปล่องเป็นพาหะ',
    },
    {
      engName: 'Tuberculosis',
      thaiName: 'วัณโรค',
      shortName: 'TB',
      details: 'โรคติดเชื้อแบคทีเรียที่กระทบต่อปอดเป็นหลัก',
    },
    {
      engName: 'COVID-19',
      thaiName: 'โควิด-19',
      shortName: 'COVID',
      details: 'โรคติดเชื้อไวรัสโคโรนาสายพันธุ์ใหม่ 2019',
    },
    {
      engName: 'Influenza',
      thaiName: 'ไข้หวัดใหญ่',
      shortName: 'FLU',
      details: 'โรคติดเชื้อไวรัสทางเดินหายใจ',
    },
    {
      engName: 'Hand Foot and Mouth Disease',
      thaiName: 'โรคมือ เท้า ปาก',
      shortName: 'HFMD',
      details: 'โรคติดเชื้อไวรัสที่พบบ่อยในเด็กเล็ก',
    },
    {
      engName: 'Hepatitis A',
      thaiName: 'ตับอักเสบเอ',
      shortName: 'HAV',
      details: 'โรคติดเชื้อไวรัสที่กระทบต่อตับ',
    },
    {
      engName: 'Diarrhea',
      thaiName: 'โรคท้องเสีย',
      shortName: 'DIA',
      details: 'อาการถ่ายเหลวที่เกิดจากเชื้อโรคต่างๆ',
    },
  ];

  const createdDiseases: Disease[] = [];
  for (const diseaseData of diseasesData) {
    const disease = await prisma.disease.upsert({
      where: { 
        engName_isActive: { 
          engName: diseaseData.engName, 
          isActive: true 
        } 
      },
      update: diseaseData,
      create: diseaseData,
    });
    createdDiseases.push(disease);
  }

  console.log(`✅ Seeded ${diseasesData.length} diseases`);

  // ============================================
  // 3. SEED SYMPTOMS DATA
  // ============================================
  console.log('🌡️ Seeding symptoms...');

  const symptomsData = [
    // Dengue Fever symptoms
    { diseaseId: createdDiseases[0].id, name: 'ไข้สูง' },
    { diseaseId: createdDiseases[0].id, name: 'ปวดหัว' },
    { diseaseId: createdDiseases[0].id, name: 'ปวดเมื่อยตามตัว' },
    { diseaseId: createdDiseases[0].id, name: 'ผื่นแดง' },
    { diseaseId: createdDiseases[0].id, name: 'เลือดออกผิดปกติ' },
    
    // Malaria symptoms
    { diseaseId: createdDiseases[1].id, name: 'ไข้สั่น' },
    { diseaseId: createdDiseases[1].id, name: 'ปวดหัว' },
    { diseaseId: createdDiseases[1].id, name: 'คลื่นไส้อาเจียน' },
    
    // TB symptoms
    { diseaseId: createdDiseases[2].id, name: 'ไอเรื้อรัง' },
    { diseaseId: createdDiseases[2].id, name: 'เสมหะเป็นเลือด' },
    { diseaseId: createdDiseases[2].id, name: 'ไข้' },
    { diseaseId: createdDiseases[2].id, name: 'น้ำหนักลด' },
    
    // COVID-19 symptoms
    { diseaseId: createdDiseases[3].id, name: 'ไข้' },
    { diseaseId: createdDiseases[3].id, name: 'ไอแห้ง' },
    { diseaseId: createdDiseases[3].id, name: 'หายใจลำบาก' },
    { diseaseId: createdDiseases[3].id, name: 'สูญเสียรสชาติและกลิ่น' },
    
    // Influenza symptoms
    { diseaseId: createdDiseases[4].id, name: 'ไข้สูงกะทันหัน' },
    { diseaseId: createdDiseases[4].id, name: 'ไอ' },
    { diseaseId: createdDiseases[4].id, name: 'ปวดหัว' },
    { diseaseId: createdDiseases[4].id, name: 'เมื่อยกล้ามเนื้อ' },
  ];

  for (const symptomData of symptomsData) {
    await prisma.symptom.upsert({
      where: {
        diseaseId_name_isActive: {
          diseaseId: symptomData.diseaseId,
          name: symptomData.name,
          isActive: true,
        },
      },
      update: symptomData,
      create: symptomData,
    });
  }

  console.log(`✅ Seeded ${symptomsData.length} symptoms`);

  // ============================================
  // 4. SEED POPULATION DATA
  // ============================================
  console.log('👥 Seeding population data...');

  const currentYear = new Date().getFullYear();
  const populationData = hospitalsData.map((hospital) => ({
    year: currentYear,
    hospitalCode9eDigit: hospital.hospitalCode9eDigit,
    count: Math.floor(Math.random() * 50000) + 10000, // Random population between 10k-60k
  }));

  for (const popData of populationData) {
    await prisma.population.upsert({
      where: {
        year_hospitalCode9eDigit_isActive: {
          year: popData.year,
          hospitalCode9eDigit: popData.hospitalCode9eDigit,
          isActive: true,
        },
      },
      update: { count: popData.count },
      create: popData,
    });
  }

  console.log(`✅ Seeded population data for ${populationData.length} hospitals`);

  // ============================================
  // 5. SEED USERS DATA
  // ============================================
  console.log('👤 Seeding users...');

  const hashedPassword = await bcrypt.hash('password123', 12);

  const usersData = [
    {
      username: 'superadmin',
      password: hashedPassword,
      userRole: 'SUPERADMIN' as const,
      userRoleId: 1,
      name: 'ผู้ดูแลระบบหลัก',
      hospitalCode9eDigit: null,
    },
    {
      username: 'admin',
      password: hashedPassword,
      userRole: 'ADMIN' as const,
      userRoleId: 2,
      name: 'ผู้ดูแลระบบ',
      hospitalCode9eDigit: 'EA0011266', // โรงพยาบาลวิเชียรบุรี
    },
    {
      username: 'user1',
      password: hashedPassword,
      userRole: 'USER' as const,
      userRoleId: 3,
      name: 'เจ้าหน้าที่โรงพยาบาลวิเชียรบุรี',
      hospitalCode9eDigit: 'EA0011266', // โรงพยาบาลวิเชียรบุรี
    },
    {
      username: 'user2',
      password: hashedPassword,
      userRole: 'USER' as const,
      userRoleId: 3,
      name: 'เจ้าหน้าที่ รพ.สต.ท่าโรง',
      hospitalCode9eDigit: 'GA0007788', // รพ.สต.ท่าโรง
    },
  ];

  for (const userData of usersData) {
    await prisma.user.upsert({
      where: {
        username_isActive: {
          username: userData.username,
          isActive: true,
        },
      },
      update: {
        name: userData.name,
        userRole: userData.userRole,
        userRoleId: userData.userRoleId,
        hospitalCode9eDigit: userData.hospitalCode9eDigit,
      },
      create: userData,
    });
  }

  console.log(`✅ Seeded ${usersData.length} users`);

  // ============================================
  // 6. SEED PERMISSIONS DATA
  // ============================================
  console.log('🔐 Seeding permissions...');

  const permissionsData = [
    // Superadmin permissions (roleId: 1)
    { roleId: 1, permissionCode: 'PATIENT_VISIT_CREATE', canAccess: true },
    { roleId: 1, permissionCode: 'PATIENT_VISIT_READ', canAccess: true },
    { roleId: 1, permissionCode: 'PATIENT_VISIT_UPDATE', canAccess: true },
    { roleId: 1, permissionCode: 'PATIENT_VISIT_DELETE', canAccess: true },
    { roleId: 1, permissionCode: 'DISEASE_MANAGE', canAccess: true },
    { roleId: 1, permissionCode: 'HOSPITAL_MANAGE', canAccess: true },
    { roleId: 1, permissionCode: 'USER_MANAGE', canAccess: true },
    { roleId: 1, permissionCode: 'REPORT_EXPORT', canAccess: true },

    // Admin permissions (roleId: 2)
    { roleId: 2, permissionCode: 'PATIENT_VISIT_CREATE', canAccess: true },
    { roleId: 2, permissionCode: 'PATIENT_VISIT_READ', canAccess: true },
    { roleId: 2, permissionCode: 'PATIENT_VISIT_UPDATE', canAccess: true },
    { roleId: 2, permissionCode: 'PATIENT_VISIT_DELETE', canAccess: true },
    { roleId: 2, permissionCode: 'DISEASE_READ', canAccess: true },
    { roleId: 2, permissionCode: 'HOSPITAL_READ', canAccess: true },
    { roleId: 2, permissionCode: 'USER_MANAGE_LIMITED', canAccess: true },
    { roleId: 2, permissionCode: 'REPORT_EXPORT', canAccess: true },

    // User permissions (roleId: 3)
    { roleId: 3, permissionCode: 'PATIENT_VISIT_READ', canAccess: true },
    { roleId: 3, permissionCode: 'DISEASE_READ', canAccess: true },
    { roleId: 3, permissionCode: 'HOSPITAL_READ', canAccess: true },
    { roleId: 3, permissionCode: 'REPORT_EXPORT_LIMITED', canAccess: true },
    { roleId: 3, permissionCode: 'PASSWORD_CHANGE', canAccess: true },
  ];

  for (const permissionData of permissionsData) {
    await prisma.permission.upsert({
      where: {
        roleId_permissionCode: {
          roleId: permissionData.roleId,
          permissionCode: permissionData.permissionCode,
        },
      },
      update: { canAccess: permissionData.canAccess },
      create: permissionData,
    });
  }

  console.log(`✅ Seeded ${permissionsData.length} permissions`);

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📝 Default login credentials:');
  console.log('Superadmin: superadmin / password123');
  console.log('Admin: admin / password123');
  console.log('User: user1 / password123');
  console.log('User: user2 / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });