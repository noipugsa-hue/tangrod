# Firestore Database Schema

## Collections

### 1. floodReports

รายงานน้ำท่วมจากผู้ใช้

**Collection:** `floodReports`

**Document Structure:**

```typescript
{
  id: string                    // Auto-generated
  userId: string                // User ID from Firebase Auth (or 'guest')
  location: {
    lat: number
    lng: number
  }
  address: {
    province: string
    district: string
    subDistrict: string
    postalCode?: string
    fullAddress?: string
  }
  severity: 'NONE' | 'MINOR' | 'MODERATE' | 'SEVERE' | 'CRITICAL'
  waterLevel: number            // ซม.
  description: string
  images: string[]              // URLs
  roadPassable: boolean
  verified: boolean
  likes: number
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Indexes:**
- `createdAt` (DESC) - For fetching recent reports
- `userId` - For user's reports
- `severity` - For filtering by severity
- `verified` - For filtering verified reports

---

### 2. floodAreas

พื้นที่น้ำท่วมที่ได้รับการยืนยัน

**Collection:** `floodAreas`

**Document Structure:**

```typescript
{
  id: string
  location: {
    lat: number
    lng: number
  }
  severity: 'NONE' | 'MINOR' | 'MODERATE' | 'SEVERE' | 'CRITICAL'
  waterLevel: number            // ซม.
  radius: number                // กม.
  reportedAt: Timestamp
  updatedAt: Timestamp
  verified: boolean
}
```

**Indexes:**
- `verified` - For filtering verified areas
- `severity` - For filtering by severity

---

### 3. emergencyPlaces

จุดช่วยเหลือฉุกเฉิน

**Collection:** `emergencyPlaces`

**Document Structure:**

```typescript
{
  id: string
  name: string
  type: 'HOSPITAL' | 'POLICE' | 'FIRE_STATION' | 'SHELTER' | 'GAS_STATION'
  location: {
    lat: number
    lng: number
  }
  address: {
    province: string
    district: string
    subDistrict: string
  }
  phone?: string
  openingHours?: string
  capacity?: number             // For shelters
}
```

**Indexes:**
- `type` - For filtering by type

---

### 4. users

ข้อมูลผู้ใช้เพิ่มเติม (นอกเหนือจาก Firebase Auth)

**Collection:** `users`

**Document ID:** Same as Firebase Auth UID

**Document Structure:**

```typescript
{
  id: string                    // Same as Auth UID
  email: string
  name?: string
  photoURL?: string
  role: 'USER' | 'ADMIN'
  savedLocations: Array<{
    id: string
    name: string
    location: { lat: number; lng: number }
    address: Address
    type: 'HOME' | 'WORK' | 'OTHER'
  }>
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

---

### 5. notifications

แจ้งเตือนสถานการณ์

**Collection:** `notifications`

**Document Structure:**

```typescript
{
  id: string
  title: string
  message: string
  severity: 'INFO' | 'WARNING' | 'DANGER' | 'SUCCESS'
  location?: {
    lat: number
    lng: number
  }
  read: boolean
  createdAt: Timestamp
}
```

**Indexes:**
- `createdAt` (DESC)
- `read`

---

### 6. waterStations

สถานีวัดระดับน้ำ

**Collection:** `waterStations`

**Document Structure:**

```typescript
{
  id: string
  name: string
  location: {
    lat: number
    lng: number
  }
  address: {
    province: string
    district: string
    subDistrict: string
  }
  currentLevel: number          // เมตร
  criticalLevel: number         // เกณฑ์วิกฤต
  highRiskLevel: number         // เกณฑ์เสี่ยงสูง
  watchLevel: number            // เกณฑ์เฝ้าระวัง
  normalLevel: number           // ระดับปกติ
  waterLevel: 'CRITICAL' | 'HIGH_RISK' | 'WATCH' | 'NORMAL'
  trend: 'RISING' | 'FALLING' | 'STABLE'
  updatedAt: Timestamp
  province: string
  district: string
  active: boolean
}
```

**Indexes:**
- `province` - For filtering by province
- `waterLevel` - For filtering by status
- `active` - For filtering active stations
- `updatedAt` (DESC) - For sorting by last update

---

### 7. rainfallData

ข้อมูลปริมาณฝน

**Collection:** `rainfallData`

**Document Structure:**

```typescript
{
  id: string
  timestamp: Timestamp
  amount: number                // มิลลิเมตร
  location: {
    lat: number
    lng: number
  }
  stationName?: string
}
```

**Indexes:**
- `timestamp` (DESC) - For time-series queries
- `stationName` - For filtering by station

---

### 8. officialLinks

ลิงก์แหล่งข้อมูลทางการ

**Collection:** `officialLinks`

**Document Structure:**

```typescript
{
  id: string
  name: string
  nameEn: string
  description: string
  url: string
  category: 'WATER' | 'WEATHER' | 'DISASTER' | 'IRRIGATION' | 'EMERGENCY'
  icon?: string
  order: number
}
```

**Indexes:**
- `category` - For filtering by category
- `order` (ASC) - For sorting display order

---

## Security Rules

ตัวอย่าง Firestore Security Rules:

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
      allow read: if true;  // Anyone can read
      allow create: if true;  // Anyone can create (including guests)
      allow update: if isOwner(resource.data.userId) || isAdmin();
      allow delete: if isOwner(resource.data.userId) || isAdmin();
    }

    // Flood Areas
    match /floodAreas/{areaId} {
      allow read: if true;
      allow write: if isAdmin();  // Only admins can manage flood areas
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

    // Water Stations
    match /waterStations/{stationId} {
      allow read: if true;  // Anyone can read water levels
      allow write: if isAdmin();  // Only admins can update stations
    }

    // Rainfall Data
    match /rainfallData/{dataId} {
      allow read: if true;  // Anyone can read rainfall data
      allow write: if isAdmin();  // Only admins can add rainfall data
    }

    // Official Links
    match /officialLinks/{linkId} {
      allow read: if true;  // Anyone can read official links
      allow write: if isAdmin();  // Only admins can manage links
    }
  }
}
```

---

## Seed Data

ใช้ seed data จากไฟล์ `utils/seedData.ts` เพื่อเพิ่มข้อมูลเริ่มต้น

สามารถสร้าง script สำหรับ seed ข้อมูลไปยัง Firestore:

```bash
# สร้างไฟล์ scripts/seedFirestore.ts
pnpm tsx scripts/seedFirestore.ts
```

---

## Usage Examples

### Create a Flood Report

```typescript
import { useFirebaseService } from '~/services/firebaseService'

const firebaseService = useFirebaseService()

await firebaseService.createFloodReport({
  userId: 'user123',
  location: { lat: 13.7563, lng: 100.5018 },
  address: {
    province: 'กรุงเทพมหานคร',
    district: 'บางรัก',
    subDistrict: 'สีลม'
  },
  severity: 'MODERATE',
  waterLevel: 30,
  description: 'น้ำท่วมสูงประมาณ 30 ซม.',
  images: [],
  roadPassable: true,
  verified: false,
  likes: 0
})
```

### Get Recent Reports

```typescript
const reports = await firebaseService.getFloodReports(20)
```

### Like a Report

```typescript
await firebaseService.likeFloodReport('reportId123')
```

---

## Firebase Setup Steps

1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. เลือกโปรเจกต์ `inbound-analogy-409510`
3. ไปที่ **Build > Firestore Database**
4. คลิก **Create database**
5. เลือก **Start in production mode** (แล้วตั้งค่า Security Rules ตามด้านบน)
6. เลือก Region: `asia-southeast1` (Singapore)
7. คลิก **Enable**
8. ไปที่ **Rules** และคัดลอก Security Rules จากด้านบน
9. Publish rules

### Enable Authentication

1. ไปที่ **Build > Authentication**
2. คลิก **Get started**
3. เปิดใช้งาน:
   - Email/Password
   - Google

### Enable Storage (Optional)

1. ไปที่ **Build > Storage**
2. คลิก **Get started**
3. ใช้สำหรับอัปโหลดรูปภาพรายงาน
