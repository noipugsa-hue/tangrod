# ทางรอด (TANGROD)

รู้ก่อนมุ่ง เลี่ยงจุดเสี่ยง ถึงที่หมายปลอดภัย

Web Application สำหรับตรวจสอบสถานการณ์น้ำท่วม ประเมินความเสี่ยง และวางแผนเส้นทางปลอดภัย

![Nuxt 4](https://img.shields.io/badge/Nuxt-4.5.2-00DC82?style=flat&logo=nuxt.js)
![Vue 3](https://img.shields.io/badge/Vue-3.5.43-4FC08D?style=flat&logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=flat&logo=tailwind-css)

## คุณสมบัติหลัก

### ✅ ฟีเจอร์ที่พร้อมใช้งาน

- **หน้าแรก (Home)** - แสดงสถานะสถานการณ์และการประเมินความเสี่ยงในพื้นที่ปัจจุบัน
- **ระบบ Location** - ใช้ Geolocation API เพื่อระบุตำแหน่งผู้ใช้ พร้อม Reverse Geocoding
- **แผนที่ (Map)** - แสดงแผนที่น้ำท่วมแบบ Interactive ด้วย Leaflet และ OpenStreetMap
- **Risk Engine** - ประเมินความเสี่ยงจากข้อมูลพื้นที่น้ำท่วมโดยรอบ
- **วางแผนเส้นทาง (Route Planning)** - วางแผนเส้นทางและประเมินความเสี่ยง พร้อมตัวเลือกหลีกเลี่ยงพื้นที่น้ำท่วม
- **รายงานจากผู้ใช้ (Reports)** - แสดง feed รายงานสถานการณ์จากผู้ใช้
- **ฉุกเฉิน (Emergency)** - แสดงจุดช่วยเหลือและเบอร์โทรฉุกเฉิน
- **โปรไฟล์ (Profile)** - จัดการข้อมูลผู้ใช้และตั้งค่า
- **PWA Support** - รองรับการติดตั้งเป็น Progressive Web App
- **Responsive Design** - ใช้งานได้บนทุกอุปกรณ์ (Mobile, Tablet, Desktop)

## Tech Stack

- **Framework:** [Nuxt 4](https://nuxt.com/)
- **UI Framework:** [Vue 3](https://vuejs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **State Management:** [Pinia](https://pinia.vuejs.org/)
- **Maps:** [Leaflet](https://leafletjs.com/) + [OpenStreetMap](https://www.openstreetmap.org/)
- **Icons:** [Heroicons](https://heroicons.com/)
- **PWA:** [@vite-pwa/nuxt](https://vite-pwa-org.netlify.app/)

## การติดตั้ง

### 1. Clone repository

```bash
git clone <repository-url>
cd tangrod
```

### 2. ติดตั้ง dependencies

```bash
pnpm install
```

### 3. ตั้งค่า Environment Variables

```bash
cp .env.example .env
```

Firebase config ถูกตั้งค่าไว้แล้วใน `.env.example`

หากต้องการใช้งาน Firebase จริง ให้ไปที่ [Firebase Console](https://console.firebase.google.com/) และ:
1. เปิดใช้งาน **Firestore Database**
2. เปิดใช้งาน **Authentication** (Email/Password และ Google)
3. (Optional) เปิดใช้งาน **Storage** สำหรับอัปโหลดรูปภาพ

ดูรายละเอียดเพิ่มเติมใน `FIRESTORE_SCHEMA.md`

## การใช้งาน

### Development Server

```bash
pnpm dev
```

เปิด browser ไปที่ [http://localhost:3000](http://localhost:3000)

### Build สำหรับ Production

```bash
pnpm build
```

### Preview Production Build

```bash
pnpm preview
```

## โครงสร้างโปรเจกต์

```
tangrod/
├── assets/               # Assets (CSS, images, fonts)
├── components/          # Vue components
│   ├── layout/         # Layout components
│   └── map/            # Map components
├── composables/        # Vue composables
├── layouts/            # Nuxt layouts
├── pages/              # Pages (auto-routing)
├── stores/             # Pinia stores
├── types/              # TypeScript types
├── utils/              # Utility functions
└── nuxt.config.ts      # Nuxt configuration
```

## ฟีเจอร์หลัก

### 1. ระบบ Location & Risk Assessment

- Browser Geolocation API
- Reverse Geocoding
- Risk Score (0-100)
- Risk Level (LOW, MEDIUM, HIGH, CRITICAL)

### 2. แผนที่ Interactive

- Leaflet + OpenStreetMap
- พื้นที่น้ำท่วมด้วยสี
- Marker และ Popup
- Layer Control

### 3. วางแผนเส้นทาง

- เลือกประเภทรถ
- หลีกเลี่ยงพื้นที่น้ำท่วม
- แสดงคะแนนความเสี่ยง

### 4. Firebase Integration

- **Authentication** - Email/Password และ Google Sign-in
- **Firestore Database** - เก็บข้อมูลรายงานน้ำท่วม พื้นที่เสี่ยง และจุดช่วยเหลือ
- **Real-time Updates** - ข้อมูลอัปเดตแบบ Real-time
- **Submit Report** - ผู้ใช้สามารถรายงานสถานการณ์ได้จริง

ดู Database Schema และวิธี Setup ใน `FIRESTORE_SCHEMA.md`

### 5. PWA Support

- Service Worker
- Offline Mode
- Install to Home Screen

## การใช้งาน Firebase

### Setup Firestore

1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. เลือกโปรเจกต์ `inbound-analogy-409510`
3. Build > **Firestore Database** > Create database
4. เลือก Region: `asia-southeast1`
5. Start in **production mode**
6. คัดลอก Security Rules จาก `FIRESTORE_SCHEMA.md`

### Enable Authentication

1. Build > **Authentication** > Get started
2. เปิดใช้งาน:
   - Email/Password
   - Google

### Test Firebase Integration

```bash
# รัน dev server
pnpm dev

# ไปที่หน้า Create Report
http://localhost:3000/report/create

# ทดสอบส่งรายงาน
```

## License

MIT License

---

พัฒนาด้วย ❤️ เพื่อความปลอดภัยของทุกคน
