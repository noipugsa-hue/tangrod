# Quick Start Guide - TANGROD

คู่มือเริ่มต้นใช้งานอย่างรวดเร็ว

## 1. ติดตั้งและรัน Development Server

```bash
# ติดตั้ง dependencies
pnpm install

# รัน dev server
pnpm dev
```

เปิด browser ไปที่ **http://localhost:3000**

แอปจะทำงานได้ทันทีด้วย Mock Data! 🎉

---

## 2. Setup Firebase (สำหรับใช้งานจริง)

### ขั้นตอนที่ 1: เปิดใช้งาน Firestore Database

1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. เลือกโปรเจกต์ **inbound-analogy-409510**
3. เมนูซ้าย: **Build** > **Firestore Database**
4. คลิก **Create database**
5. ตั้งค่า:
   - **Location:** `asia-southeast1 (Singapore)`
   - **Security rules:** เริ่มต้นด้วย **Production mode**
6. คลิก **Enable**

### ขั้นตอนที่ 2: ตั้งค่า Security Rules

1. ใน Firestore Database, ไปที่แท็บ **Rules**
2. คัดลอก Rules จาก `FIRESTORE_SCHEMA.md` (บรรทัด 175-227)
3. วาง Rules ลงในหน้า Editor
4. คลิก **Publish**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function isAdmin() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
    }

    // Flood Reports
    match /floodReports/{reportId} {
      allow read: if true;
      allow create: if true;
      allow update: if isOwner(resource.data.userId) || isAdmin();
      allow delete: if isOwner(resource.data.userId) || isAdmin();
    }

    // Flood Areas
    match /floodAreas/{areaId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Emergency Places
    match /emergencyPlaces/{placeId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Users
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isOwner(userId);
      allow delete: if isOwner(userId) || isAdmin();
    }

    // Notifications
    match /notifications/{notificationId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}
```

### ขั้นตอนที่ 3: เปิดใช้งาน Authentication

1. เมนูซ้าย: **Build** > **Authentication**
2. คลิก **Get started**
3. เลือก **Email/Password**
   - คลิก **Enable**
   - **Save**
4. เลือก **Google**
   - คลิก **Enable**
   - กรอก **Project support email**
   - **Save**

### ขั้นตอนที่ 4: เพิ่ม Authorized Domain (สำหรับ localhost)

1. ใน Authentication, ไปที่แท็บ **Settings**
2. เลื่อนลงไปที่ **Authorized domains**
3. ตรวจสอบว่ามี `localhost` อยู่ในรายการ
4. ถ้าไม่มี ให้คลิก **Add domain** และเพิ่ม `localhost`

---

## 3. ทดสอบการทำงาน

### ทดสอบ Submit Report

1. เปิดแอปที่ **http://localhost:3000**
2. ไปที่หน้า **รายงานจากผู้ใช้** (แท็บล่าง)
3. คลิก **รายงานสถานการณ์**
4. คลิก **ใช้ตำแหน่งปัจจุบัน** (อนุญาต Location permission)
5. เลือกระดับความรุนแรง
6. กรอกรายละเอียด
7. คลิก **ส่งรายงาน**
8. ✅ ถ้า Setup ถูกต้อง จะเห็นข้อความ "ส่งรายงานสำเร็จ!"

### ตรวจสอบข้อมูลใน Firestore

1. กลับไปที่ Firebase Console
2. Firestore Database
3. คลิกที่ collection **floodReports**
4. จะเห็นรายงานที่เพิ่งส่ง!

---

## 4. ทดสอบ Authentication (Optional)

### ทดสอบ Google Sign-in

1. แก้ไขหน้า **Profile** (`pages/profile.vue`)
2. เพิ่มปุ่ม Login:

```vue
<button @click="loginWithGoogle" class="btn btn-primary">
  เข้าสู่ระบบด้วย Google
</button>
```

3. เพิ่ม method:

```typescript
const authStore = useAuthStore()

const loginWithGoogle = async () => {
  try {
    await authStore.loginWithGoogle()
    alert('เข้าสู่ระบบสำเร็จ!')
  } catch (error) {
    alert('เกิดข้อผิดพลาด')
  }
}
```

---

## 5. Build สำหรับ Production

```bash
# Build
pnpm build

# Preview
pnpm preview
```

PWA จะทำงานเต็มที่ใน production build!

---

## 6. Deploy

### Deploy ไปยัง Vercel

```bash
# ติดตั้ง Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy ไปยัง Firebase Hosting

```bash
# ติดตั้ง Firebase CLI
npm i -g firebase-tools

# Login
firebase login

# Init
firebase init hosting

# Build และ Deploy
pnpm build
firebase deploy
```

---

## Troubleshooting

### ❌ Error: "Permission denied"

**สาเหตุ:** Security Rules ยังไม่ได้ตั้งค่า

**แก้ไข:** ทำตามขั้นตอนที่ 2 อีกครั้ง

### ❌ Error: "Firebase: Error (auth/unauthorized-domain)"

**สาเหตุ:** Domain ไม่อยู่ใน Authorized domains

**แก้ไข:** เพิ่ม `localhost` ใน Authentication Settings

### ❌ Warning: PWA glob patterns

**สาเหตุ:** เป็น warning ปกติใน dev mode

**แก้ไข:** ปิด PWA ใน dev mode (ทำแล้วใน `nuxt.config.ts`)

### ❌ Map ไม่แสดง

**สาเหตุ:** Leaflet CSS ไม่โหลด

**แก้ไข:** ตรวจสอบว่า `leaflet/dist/leaflet.css` อยู่ใน `nuxt.config.ts`

---

## Next Steps

1. ✅ เพิ่ม Seed Data ไปยัง Firestore (ดูตัวอย่างใน `utils/seedData.ts`)
2. ✅ ต่อ Real-time Weather API
3. ✅ เพิ่ม Image Upload สำหรับรายงาน (Firebase Storage)
4. ✅ สร้าง Admin Dashboard
5. ✅ เพิ่ม Push Notifications

---

## Resources

- 📖 [Nuxt Documentation](https://nuxt.com/docs)
- 🔥 [Firebase Documentation](https://firebase.google.com/docs)
- 🗺️ [Leaflet Documentation](https://leafletjs.com/)
- 💨 [Tailwind CSS Documentation](https://tailwindcss.com/)

---

**ยินดีต้อนรับสู่ TANGROD! 🎉**

หากมีปัญหาหรือคำถาม สามารถ open issue ใน GitHub ได้
