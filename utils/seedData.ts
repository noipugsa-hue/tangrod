import type { FloodArea, EmergencyPlace, FloodReport } from '~/types'

// Seed data for flood areas in Thailand (examples)
export const seedFloodAreas: FloodArea[] = [
  {
    id: '1',
    location: { lat: 13.4250, lng: 99.9500 }, // Amphawa District
    severity: 'MODERATE',
    waterLevel: 30,
    radius: 2,
    reportedAt: new Date('2024-10-01T08:00:00'),
    updatedAt: new Date('2024-10-01T10:00:00'),
    verified: true
  },
  {
    id: '2',
    location: { lat: 13.4125, lng: 100.0046 }, // Samut Sakhon
    severity: 'SEVERE',
    waterLevel: 60,
    radius: 3,
    reportedAt: new Date('2024-10-01T07:30:00'),
    updatedAt: new Date('2024-10-01T09:45:00'),
    verified: true
  },
  {
    id: '3',
    location: { lat: 13.3567, lng: 100.0289 }, // Near Amphawa
    severity: 'MODERATE',
    waterLevel: 25,
    radius: 1.5,
    reportedAt: new Date('2024-10-01T09:00:00'),
    updatedAt: new Date('2024-10-01T11:00:00'),
    verified: true
  },
  {
    id: '4',
    location: { lat: 14.9931, lng: 102.1008 }, // Nakhon Ratchasima
    severity: 'MINOR',
    waterLevel: 15,
    radius: 1,
    reportedAt: new Date('2024-10-01T10:00:00'),
    updatedAt: new Date('2024-10-01T10:30:00'),
    verified: false
  }
]

export const seedEmergencyPlaces: EmergencyPlace[] = [
  {
    id: '1',
    name: 'โรงพยาบาลจุฬาลงกรณ์',
    type: 'HOSPITAL',
    location: { lat: 13.7353, lng: 100.5327 },
    address: {
      province: 'กรุงเทพมหานคร',
      district: 'ปทุมวัน',
      subDistrict: 'วังใหม่'
    },
    phone: '02-256-4000',
    openingHours: '24 ชั่วโมง'
  },
  {
    id: '2',
    name: 'โรงพยาบาลศิริราช',
    type: 'HOSPITAL',
    location: { lat: 13.7572, lng: 100.4899 },
    address: {
      province: 'กรุงเทพมหานคร',
      district: 'บางกอกน้อย',
      subDistrict: 'ศิริราช'
    },
    phone: '02-419-7000',
    openingHours: '24 ชั่วโมง'
  },
  {
    id: '3',
    name: 'สถานีตำรวจนครบาลหลักสี่',
    type: 'POLICE',
    location: { lat: 13.8726, lng: 100.5766 },
    address: {
      province: 'กรุงเทพมหานคร',
      district: 'ดอนเมือง',
      subDistrict: 'หลักสี่'
    },
    phone: '02-573-0461'
  },
  {
    id: '4',
    name: 'ศูนย์พักพิงชั่วคราว วัดหัวลำโพง',
    type: 'SHELTER',
    location: { lat: 13.7533, lng: 100.5147 },
    address: {
      province: 'กรุงเทพมหานคร',
      district: 'พระนคร',
      subDistrict: 'หัวลำโพง'
    },
    capacity: 200,
    openingHours: 'ตามสถานการณ์'
  },
  {
    id: '5',
    name: 'ปั๊ม ปตท. สาขาพระราม 4',
    type: 'GAS_STATION',
    location: { lat: 13.7307, lng: 100.5418 },
    address: {
      province: 'กรุงเทพมหานคร',
      district: 'ปทุมวัน',
      subDistrict: 'ลุมพินี'
    },
    openingHours: '24 ชั่วโมง'
  }
]

export const seedFloodReports: FloodReport[] = [
  {
    id: '1',
    userId: 'user1',
    location: { lat: 13.3567, lng: 100.0289 },
    address: {
      province: 'สมุทรสงคราม',
      district: 'อัมพวา',
      subDistrict: 'อัมพวา'
    },
    severity: 'MODERATE',
    waterLevel: 25,
    description: 'คนเนื่องช่วงสองอัมพวา น้ำท่วมสูงประมาณ 20-30 ซม. รถยังผ่านได้แต่ระมัดระวัง',
    images: [],
    roadPassable: true,
    verified: true,
    likes: 12,
    createdAt: new Date('2024-10-01T08:30:00'),
    updatedAt: new Date('2024-10-01T08:30:00')
  },
  {
    id: '2',
    userId: 'user2',
    location: { lat: 13.7563, lng: 100.5018 },
    address: {
      province: 'กรุงเทพมหานคร',
      district: 'บางรัก',
      subDistrict: 'สีลม'
    },
    severity: 'MINOR',
    waterLevel: 10,
    description: 'ฝนตกหนักในพื้นที่ มีน้ำขังบนถนน',
    images: [],
    roadPassable: true,
    verified: false,
    likes: 5,
    createdAt: new Date('2024-10-01T09:15:00'),
    updatedAt: new Date('2024-10-01T09:15:00')
  }
]
