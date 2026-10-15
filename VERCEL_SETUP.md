# Vercel Deployment Guide

## การตั้งค่า Environment Variables บน Vercel

เมื่อ deploy โปรเจค TANGROD บน Vercel คุณต้องตั้งค่า environment variables ต่อไปนี้:

### ขั้นตอนที่ 1: เข้าสู่ Vercel Dashboard

1. ไปที่ [Vercel Dashboard](https://vercel.com/dashboard)
2. เลือกโปรเจค `tangrod`
3. ไปที่ Settings → Environment Variables

### ขั้นตอนที่ 2: เพิ่ม Environment Variables

เพิ่ม variables ต่อไปนี้ (คัดลอกค่าจากไฟล์ `.env` ในเครื่อง):

#### Google Maps API
```
NUXT_PUBLIC_GOOGLE_MAPS_API_KEY = AIzaSyD0DOpFw9soIbl4SrRS61JfagNcvdOszsM
```

#### Weather API (OpenWeatherMap)
```
NUXT_PUBLIC_WEATHER_API_KEY = 47658676599a8010fa208814963a9a2f
```

#### GISTDA Flood API (Private - Server Only)
```
GISTDA_API_TOKEN = vscAcBCZcFqQh7AV1ZI1poUFpFwbpgh22j7in3CyXwsQyLEs1HXelKhKmkytCzxU
```

#### Firebase Configuration
```
NUXT_PUBLIC_FIREBASE_API_KEY = AIzaSyDA1z5xupZ9-ZEHiEe633_k66-_ItnYVVo
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN = inbound-analogy-409510.firebaseapp.com
NUXT_PUBLIC_FIREBASE_PROJECT_ID = inbound-analogy-409510
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET = inbound-analogy-409510.firebasestorage.app
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 712724017139
NUXT_PUBLIC_FIREBASE_APP_ID = 1:712724017139:web:2dd155fbbc6d59b25dac86
NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID = G-BEX051KZVL
```

### ขั้นตอนที่ 3: ตั้งค่าแต่ละ Environment

สำหรับแต่ละ environment variable:
1. กดปุ่ม "Add New"
2. ใส่ชื่อ variable (เช่น `NUXT_PUBLIC_GOOGLE_MAPS_API_KEY`)
3. ใส่ค่า (เช่น `AIzaSyD0DOpFw9soIbl4SrRS61JfagNcvdOszsM`)
4. เลือก Environment: **Production, Preview, Development** (เลือกทั้ง 3)
5. กด "Save"

### ขั้นตอนที่ 4: Redeploy

หลังจากตั้งค่า environment variables แล้ว:
1. ไปที่แท็บ "Deployments"
2. เลือก deployment ล่าสุด
3. กดปุ่ม "..." (three dots menu)
4. เลือก "Redeploy"
5. ติ๊กถูก "Use existing Build Cache" (ถ้าต้องการ build ใหม่ ให้ปิดติ๊กนี้)
6. กด "Redeploy"

## หมายเหตุสำคัญ

### GISTDA API
- GISTDA API อาจมีปัญหาการเชื่อมต่อจาก Vercel
- แอปมี fallback ไปใช้ mock data อัตโนมัติ
- ข้อมูล mock data อยู่ใน `utils/seedData.ts`

### Google Maps API
- ตรวจสอบว่า domain ของ Vercel ถูกเพิ่มใน Google Cloud Console
- ไปที่ Google Cloud Console → APIs & Services → Credentials
- เลือก API Key ของคุณ
- เพิ่ม domain: `*.vercel.app` และ `yourdomain.com` (ถ้ามี custom domain)

### Firebase Authentication
- ตรวจสอบว่า domain ของ Vercel ถูกเพิ่มใน Authorized domains
- ไปที่ Firebase Console → Authentication → Settings → Authorized domains
- เพิ่ม: `tangrod.vercel.app` (หรือ domain ของคุณ)

## การตรวจสอบว่าตั้งค่าสำเร็จ

เมื่อ deploy เสร็จแล้ว ให้ตรวจสอบ:

1. **เปิด Console ใน Browser**
   - กด F12 หรือ Right-click → Inspect
   - ไปที่แท็บ Console

2. **ตรวจสอบ Errors**
   - ไม่ควรมี error: "Google Maps API key is not configured"
   - GISTDA API อาจมี 503 error (ปกติ - ใช้ mock data)
   - Weather API ควรทำงานได้ (ตรวจสอบอุณหภูมิแสดงบนแผนที่)

3. **ทดสอบฟีเจอร์**
   - ✅ Dark/Light mode toggle ทำงาน
   - ✅ แผนที่แสดงผล (Google Maps)
   - ✅ สภาพอากาศแสดงผล
   - ✅ จุดน้ำท่วมแสดงบนแผนที่

## คำสั่ง Vercel CLI (Alternative)

หากต้องการใช้ Vercel CLI แทน:

```bash
# ติดตั้ง Vercel CLI
npm i -g vercel

# Login
vercel login

# ตั้งค่า environment variables
vercel env add NUXT_PUBLIC_GOOGLE_MAPS_API_KEY
vercel env add NUXT_PUBLIC_WEATHER_API_KEY
vercel env add GISTDA_API_TOKEN
vercel env add NUXT_PUBLIC_FIREBASE_API_KEY
vercel env add NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN
vercel env add NUXT_PUBLIC_FIREBASE_PROJECT_ID
vercel env add NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET
vercel env add NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
vercel env add NUXT_PUBLIC_FIREBASE_APP_ID
vercel env add NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID

# Deploy
vercel --prod
```

## Troubleshooting

### ปัญหา: Google Maps ไม่แสดง
**แก้ไข:**
- ตรวจสอบว่า API key ถูกตั้งค่าใน Vercel Environment Variables
- ตรวจสอบว่า domain ถูกเพิ่มใน Google Cloud Console
- Hard refresh browser: Ctrl+Shift+R (Windows/Linux) หรือ Cmd+Shift+R (Mac)

### ปัญหา: Firebase Authentication ไม่ทำงาน
**แก้ไข:**
- เพิ่ม domain ใน Firebase Console → Authentication → Authorized domains
- ตรวจสอบว่าทุก Firebase environment variables ถูกตั้งค่า

### ปัญหา: GISTDA API error 503
**แก้ไข:**
- ปกติ - GISTDA API อาจมีปัญหาการเชื่อมต่อจาก Vercel
- แอปจะใช้ mock data อัตโนมัติ
- ไม่มีผลต่อการใช้งานแอป

### ปัญหา: Weather API ไม่ทำงาน
**แก้ไข:**
- ตรวจสอบว่า `NUXT_PUBLIC_WEATHER_API_KEY` ถูกตั้งค่า
- ตรวจสอบว่า API key ยังใช้งานได้ที่ OpenWeatherMap
- เช็ค Console errors

## อ่านเพิ่มเติม

- [Vercel Environment Variables Documentation](https://vercel.com/docs/concepts/projects/environment-variables)
- [Nuxt 3 Deployment Documentation](https://nuxt.com/docs/getting-started/deployment)
- [Google Maps API Documentation](https://developers.google.com/maps/documentation)
