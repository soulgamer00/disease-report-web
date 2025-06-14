# backend/Dockerfile

# =================
# STAGE 1: Builder - ขั้นตอนการสร้างและติดตั้ง Dependencies
# =================
FROM node:20-bookworm AS builder

# ตั้งค่า Working Directory
WORKDIR /app

# Copy package.json และ package-lock.json
COPY package.json ./
COPY package-lock.json ./

# ติดตั้ง Dependencies ทั้งหมด (รวม devDependencies ที่จำเป็นสำหรับการ build)
RUN npm install

# Copy โค้ดที่เหลือทั้งหมด
COPY . .

# Copy prisma schema เพื่อใช้ในการ generate client
COPY prisma ./prisma/

# Generate Prisma Client ให้ตรงกับ Engine ของ OS นี้
RUN npx prisma generate

# Build TypeScript เป็น JavaScript (ผลลัพธ์จะอยู่ในโฟลเดอร์ /dist)
RUN npm run build

# ลบ devDependencies ออก เพื่อให้ node_modules มีขนาดเล็กลง
RUN npm prune --production


# =================
# STAGE 2: Production - ขั้นตอนสุดท้ายสำหรับใช้งานจริง
# =================
FROM node:20-bookworm-slim

# ตั้งค่า Working Directory
WORKDIR /app

# Copy เฉพาะสิ่งที่จำเป็นจาก Stage 'builder'
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# บอกให้ Docker รู้ว่าแอปพลิเคชันของเราจะทำงานที่ Port 3000
EXPOSE 3000

# คำสั่งสำหรับรันแอปพลิเคชัน (รันจากไฟล์ JavaScript ที่ build แล้ว)
CMD ["node", "dist/main.js"]