-- CreateEnum
CREATE TYPE "NamePrefixEnum" AS ENUM ('MR', 'MS', 'MRS', 'BOY', 'GIRL', 'OTHER');

-- CreateEnum
CREATE TYPE "GenderEnum" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "MaritalStatusEnum" AS ENUM ('SINGLE', 'UNKNOWN', 'MONK', 'WIDOWED', 'DIVORCED', 'MARRIED', 'SEPARATED');

-- CreateEnum
CREATE TYPE "OccupationEnum" AS ENUM ('STUDENT', 'DEPENDENT', 'GOVERNMENT_OFFICIAL', 'STATE_ENTERPRISE', 'GENERAL_LABOR', 'PRIVATE_BUSINESS', 'FARMER', 'GOV_EMPLOYEE', 'PRIVATE_EMPLOYEE', 'HOMEMAKER', 'CLERGY', 'TRADER', 'UNEMPLOYED', 'OTHER');

-- CreateEnum
CREATE TYPE "TreatmentAreaEnum" AS ENUM ('MUNICIPALITY', 'SAO', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "PatientTypeEnum" AS ENUM ('IPD', 'OPD', 'ACF');

-- CreateEnum
CREATE TYPE "PatientConditionEnum" AS ENUM ('UNKNOWN', 'RECOVERED', 'DIED', 'UNDER_TREATMENT');

-- CreateEnum
CREATE TYPE "UserRoleEnum" AS ENUM ('SUPERADMIN', 'ADMIN', 'USER');

-- CreateTable
CREATE TABLE "patient_visits" (
    "uuid" TEXT NOT NULL,
    "idCardCode" TEXT NOT NULL,
    "namePrefix" "NamePrefixEnum" NOT NULL,
    "fname" TEXT NOT NULL,
    "lname" TEXT NOT NULL,
    "gender" "GenderEnum" NOT NULL,
    "birthday" DATE NOT NULL,
    "ageAtIllness" INTEGER NOT NULL,
    "nationality" TEXT NOT NULL DEFAULT 'ไทย',
    "maritalStatus" "MaritalStatusEnum" NOT NULL,
    "occupation" "OccupationEnum" NOT NULL,
    "phoneNumber" TEXT,
    "currentHouseNumber" TEXT,
    "currentVillageNumber" TEXT,
    "currentRoadName" TEXT,
    "currentProvince" TEXT,
    "currentDistrict" TEXT,
    "currentSubDistrict" TEXT,
    "addressSickHouseNumber" TEXT,
    "addressSickVillageNumber" TEXT,
    "addressSickRoadName" TEXT,
    "addressSickProvince" TEXT NOT NULL DEFAULT 'เพชรบูรณ์',
    "addressSickDistrict" TEXT,
    "addressSickSubDistrict" TEXT,
    "diseaseId" TEXT NOT NULL,
    "symptomsOfDisease" TEXT,
    "treatmentArea" "TreatmentAreaEnum" NOT NULL,
    "treatmentHospital" TEXT,
    "illnessDate" DATE NOT NULL,
    "treatmentDate" DATE NOT NULL,
    "diagnosisDate" DATE NOT NULL,
    "diagnosis1" TEXT,
    "diagnosis2" TEXT,
    "patientType" "PatientTypeEnum" NOT NULL,
    "patientCondition" "PatientConditionEnum" NOT NULL,
    "deathDate" DATE,
    "causeOfDeath" TEXT,
    "receivingProvince" TEXT NOT NULL DEFAULT 'เพชรบูรณ์',
    "hospitalCode9eDigit" TEXT NOT NULL,
    "reportName" TEXT,
    "remarks" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "patient_visits_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "diseases" (
    "id" TEXT NOT NULL,
    "engName" TEXT NOT NULL,
    "thaiName" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "details" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "diseases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "symptoms" (
    "id" TEXT NOT NULL,
    "diseaseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "symptoms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospitals" (
    "id" TEXT NOT NULL,
    "hospitalName" TEXT NOT NULL,
    "hospitalCode9eDigit" TEXT NOT NULL,
    "hospitalCode9Digit" TEXT,
    "hospitalCode5Digit" TEXT,
    "organizationType" TEXT,
    "healthServiceType" TEXT,
    "affiliation" TEXT,
    "departmentDivision" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "hospitals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "populations" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "hospitalCode9eDigit" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "populations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "userRole" "UserRoleEnum" NOT NULL,
    "userRoleId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "hospitalCode9eDigit" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "lastLoginAt" TIMESTAMPTZ(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL,
    "permissionCode" TEXT NOT NULL,
    "canAccess" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "patient_visits_hospitalCode9eDigit_idx" ON "patient_visits"("hospitalCode9eDigit");

-- CreateIndex
CREATE INDEX "patient_visits_diseaseId_idx" ON "patient_visits"("diseaseId");

-- CreateIndex
CREATE INDEX "patient_visits_illnessDate_idx" ON "patient_visits"("illnessDate");

-- CreateIndex
CREATE INDEX "patient_visits_isActive_idx" ON "patient_visits"("isActive");

-- CreateIndex
CREATE INDEX "patient_visits_hospitalCode9eDigit_isActive_idx" ON "patient_visits"("hospitalCode9eDigit", "isActive");

-- CreateIndex
CREATE INDEX "patient_visits_createdAt_idx" ON "patient_visits"("createdAt");

-- CreateIndex
CREATE INDEX "patient_visits_idCardCode_idx" ON "patient_visits"("idCardCode");

-- CreateIndex
CREATE INDEX "diseases_isActive_idx" ON "diseases"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "diseases_engName_isActive_key" ON "diseases"("engName", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "diseases_thaiName_isActive_key" ON "diseases"("thaiName", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "diseases_shortName_isActive_key" ON "diseases"("shortName", "isActive");

-- CreateIndex
CREATE INDEX "symptoms_diseaseId_idx" ON "symptoms"("diseaseId");

-- CreateIndex
CREATE INDEX "symptoms_isActive_idx" ON "symptoms"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "symptoms_diseaseId_name_isActive_key" ON "symptoms"("diseaseId", "name", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "hospitals_hospitalCode9eDigit_key" ON "hospitals"("hospitalCode9eDigit");

-- CreateIndex
CREATE INDEX "hospitals_isActive_idx" ON "hospitals"("isActive");

-- CreateIndex
CREATE INDEX "hospitals_hospitalName_idx" ON "hospitals"("hospitalName");

-- CreateIndex
CREATE UNIQUE INDEX "hospitals_hospitalCode9eDigit_isActive_key" ON "hospitals"("hospitalCode9eDigit", "isActive");

-- CreateIndex
CREATE INDEX "populations_hospitalCode9eDigit_idx" ON "populations"("hospitalCode9eDigit");

-- CreateIndex
CREATE INDEX "populations_year_idx" ON "populations"("year");

-- CreateIndex
CREATE INDEX "populations_isActive_idx" ON "populations"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "populations_year_hospitalCode9eDigit_isActive_key" ON "populations"("year", "hospitalCode9eDigit", "isActive");

-- CreateIndex
CREATE INDEX "users_hospitalCode9eDigit_idx" ON "users"("hospitalCode9eDigit");

-- CreateIndex
CREATE INDEX "users_userRoleId_idx" ON "users"("userRoleId");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "users"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_isActive_key" ON "users"("username", "isActive");

-- CreateIndex
CREATE INDEX "permissions_roleId_idx" ON "permissions"("roleId");

-- CreateIndex
CREATE INDEX "permissions_permissionCode_idx" ON "permissions"("permissionCode");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_roleId_permissionCode_key" ON "permissions"("roleId", "permissionCode");

-- AddForeignKey
ALTER TABLE "patient_visits" ADD CONSTRAINT "patient_visits_diseaseId_fkey" FOREIGN KEY ("diseaseId") REFERENCES "diseases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_visits" ADD CONSTRAINT "patient_visits_hospitalCode9eDigit_fkey" FOREIGN KEY ("hospitalCode9eDigit") REFERENCES "hospitals"("hospitalCode9eDigit") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "symptoms" ADD CONSTRAINT "symptoms_diseaseId_fkey" FOREIGN KEY ("diseaseId") REFERENCES "diseases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "populations" ADD CONSTRAINT "populations_hospitalCode9eDigit_fkey" FOREIGN KEY ("hospitalCode9eDigit") REFERENCES "hospitals"("hospitalCode9eDigit") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_hospitalCode9eDigit_fkey" FOREIGN KEY ("hospitalCode9eDigit") REFERENCES "hospitals"("hospitalCode9eDigit") ON DELETE SET NULL ON UPDATE CASCADE;
