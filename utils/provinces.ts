import type { Location } from '~/types'

export interface Province {
  id: string
  name: string
  location: Location
  region: 'north' | 'northeast' | 'central' | 'east' | 'west' | 'south'
}

export const provinces: Province[] = [
  // ภาคเหนือ (North)
  { id: 'chiang-mai', name: 'เชียงใหม่', location: { lat: 18.7883, lng: 98.9853 }, region: 'north' },
  { id: 'chiang-rai', name: 'เชียงราย', location: { lat: 19.9105, lng: 99.8406 }, region: 'north' },
  { id: 'lamphun', name: 'ลำพูน', location: { lat: 18.5744, lng: 99.0087 }, region: 'north' },
  { id: 'lampang', name: 'ลำปาง', location: { lat: 18.2888, lng: 99.4922 }, region: 'north' },
  { id: 'mae-hong-son', name: 'แม่ฮ่องสอน', location: { lat: 19.3014, lng: 97.9658 }, region: 'north' },
  { id: 'nan', name: 'น่าน', location: { lat: 18.7838, lng: 100.7793 }, region: 'north' },
  { id: 'phayao', name: 'พะเยา', location: { lat: 19.1921, lng: 99.8988 }, region: 'north' },
  { id: 'phrae', name: 'แพร่', location: { lat: 18.1446, lng: 100.1403 }, region: 'north' },
  { id: 'uttaradit', name: 'อุตรดิตถ์', location: { lat: 17.6200, lng: 100.0933 }, region: 'north' },

  // ภาคตะวันออกเหนือ (Northeast)
  { id: 'nakhon-ratchasima', name: 'นครราชสีมา', location: { lat: 14.9799, lng: 102.0977 }, region: 'northeast' },
  { id: 'khon-kaen', name: 'ขอนแก่น', location: { lat: 16.4322, lng: 102.8236 }, region: 'northeast' },
  { id: 'udon-thani', name: 'อุดรธานี', location: { lat: 17.4138, lng: 102.7877 }, region: 'northeast' },
  { id: 'ubon-ratchathani', name: 'อุบลราชธานี', location: { lat: 15.2286, lng: 104.8561 }, region: 'northeast' },
  { id: 'buriram', name: 'บุรีรัมย์', location: { lat: 14.9935, lng: 103.1028 }, region: 'northeast' },
  { id: 'surin', name: 'สุรินทร์', location: { lat: 14.8830, lng: 103.4936 }, region: 'northeast' },
  { id: 'si-sa-ket', name: 'ศรีสะเกษ', location: { lat: 15.1186, lng: 104.3220 }, region: 'northeast' },
  { id: 'sakon-nakhon', name: 'สกลนคร', location: { lat: 17.1554, lng: 104.1486 }, region: 'northeast' },
  { id: 'nakhon-phanom', name: 'นครพนม', location: { lat: 17.3917, lng: 104.7695 }, region: 'northeast' },
  { id: 'mukdahan', name: 'มุกดาหาร', location: { lat: 16.5428, lng: 104.7235 }, region: 'northeast' },
  { id: 'roi-et', name: 'ร้อยเอ็ด', location: { lat: 16.0538, lng: 103.6528 }, region: 'northeast' },
  { id: 'kalasin', name: 'กาฬสินธุ์', location: { lat: 16.4322, lng: 103.5063 }, region: 'northeast' },
  { id: 'maha-sarakham', name: 'มหาสารคาม', location: { lat: 16.1849, lng: 103.3001 }, region: 'northeast' },
  { id: 'yasothon', name: 'ยโสธร', location: { lat: 15.7923, lng: 104.1453 }, region: 'northeast' },
  { id: 'amnat-charoen', name: 'อำนาจเจริญ', location: { lat: 15.8657, lng: 104.6259 }, region: 'northeast' },
  { id: 'nong-bua-lam-phu', name: 'หนองบัวลำภู', location: { lat: 17.2042, lng: 102.4260 }, region: 'northeast' },
  { id: 'nong-khai', name: 'หนองคาย', location: { lat: 17.8782, lng: 102.7412 }, region: 'northeast' },
  { id: 'loei', name: 'เลย', location: { lat: 17.4860, lng: 101.7223 }, region: 'northeast' },
  { id: 'chaiyaphum', name: 'ชัยภูมิ', location: { lat: 15.8069, lng: 102.0313 }, region: 'northeast' },
  { id: 'bueng-kan', name: 'บึงกาฬ', location: { lat: 18.3609, lng: 103.6469 }, region: 'northeast' },

  // ภาคกลาง (Central)
  { id: 'bangkok', name: 'กรุงเทพมหานคร', location: { lat: 13.7563, lng: 100.5018 }, region: 'central' },
  { id: 'nonthaburi', name: 'นนทบุรี', location: { lat: 13.8621, lng: 100.5144 }, region: 'central' },
  { id: 'pathum-thani', name: 'ปทุมธานี', location: { lat: 14.0208, lng: 100.5250 }, region: 'central' },
  { id: 'samut-prakan', name: 'สมุทรปราการ', location: { lat: 13.5990, lng: 100.5998 }, region: 'central' },
  { id: 'nakhon-pathom', name: 'นครปฐม', location: { lat: 13.8199, lng: 100.0377 }, region: 'central' },
  { id: 'samut-sakhon', name: 'สมุทรสาคร', location: { lat: 13.5475, lng: 100.2744 }, region: 'central' },
  { id: 'samut-songkhram', name: 'สมุทรสงคราม', location: { lat: 13.4097, lng: 100.0024 }, region: 'central' },
  { id: 'ratchaburi', name: 'ราชบุรี', location: { lat: 13.5282, lng: 99.8134 }, region: 'central' },
  { id: 'kanchanaburi', name: 'กาญจนบุรี', location: { lat: 14.0227, lng: 99.5328 }, region: 'central' },
  { id: 'suphan-buri', name: 'สุพรรณบุรี', location: { lat: 14.4745, lng: 100.1176 }, region: 'central' },
  { id: 'ayutthaya', name: 'พระนครศรีอยุธยา', location: { lat: 14.3692, lng: 100.5877 }, region: 'central' },
  { id: 'ang-thong', name: 'อ่างทอง', location: { lat: 14.5896, lng: 100.4550 }, region: 'central' },
  { id: 'lop-buri', name: 'ลพบุรี', location: { lat: 14.7995, lng: 100.6534 }, region: 'central' },
  { id: 'sing-buri', name: 'สิงห์บุรี', location: { lat: 14.8936, lng: 100.3967 }, region: 'central' },
  { id: 'chai-nat', name: 'ชัยนาท', location: { lat: 15.1851, lng: 100.1248 }, region: 'central' },
  { id: 'saraburi', name: 'สระบุรี', location: { lat: 14.5289, lng: 100.9103 }, region: 'central' },
  { id: 'nakhon-nayok', name: 'นครนายก', location: { lat: 14.2069, lng: 101.2130 }, region: 'central' },
  { id: 'prachin-buri', name: 'ปราจีนบุรี', location: { lat: 14.0504, lng: 101.3705 }, region: 'central' },
  { id: 'phetchaburi', name: 'เพชรบุรี', location: { lat: 13.1115, lng: 99.9395 }, region: 'central' },

  // ภาคตะวันออก (East)
  { id: 'chon-buri', name: 'ชลบุรี', location: { lat: 13.3611, lng: 100.9847 }, region: 'east' },
  { id: 'rayong', name: 'ระยอง', location: { lat: 12.6814, lng: 101.2816 }, region: 'east' },
  { id: 'chanthaburi', name: 'จันทบุรี', location: { lat: 12.6117, lng: 102.1038 }, region: 'east' },
  { id: 'trat', name: 'ตราด', location: { lat: 12.2428, lng: 102.5151 }, region: 'east' },
  { id: 'sa-kaeo', name: 'สระแก้ว', location: { lat: 13.8240, lng: 102.0645 }, region: 'east' },

  // ภาคตะวันตก (West)
  { id: 'tak', name: 'ตาก', location: { lat: 16.8800, lng: 99.1267 }, region: 'west' },
  { id: 'prachuap-khiri-khan', name: 'ประจวบคีรีขันธ์', location: { lat: 11.8123, lng: 99.7973 }, region: 'west' },

  // ภาคใต้ (South)
  { id: 'chumphon', name: 'ชุมพร', location: { lat: 10.4930, lng: 99.1800 }, region: 'south' },
  { id: 'ranong', name: 'ระนอง', location: { lat: 9.9657, lng: 98.6085 }, region: 'south' },
  { id: 'surat-thani', name: 'สุราษฎร์ธานี', location: { lat: 9.1382, lng: 99.3331 }, region: 'south' },
  { id: 'nakhon-si-thammarat', name: 'นครศรีธรรมราช', location: { lat: 8.4304, lng: 99.9631 }, region: 'south' },
  { id: 'krabi', name: 'กระบี่', location: { lat: 8.0863, lng: 98.9063 }, region: 'south' },
  { id: 'phang-nga', name: 'พังงา', location: { lat: 8.4504, lng: 98.5253 }, region: 'south' },
  { id: 'phuket', name: 'ภูเก็ต', location: { lat: 7.8804, lng: 98.3923 }, region: 'south' },
  { id: 'songkhla', name: 'สงขลา', location: { lat: 7.1894, lng: 100.5951 }, region: 'south' },
  { id: 'satun', name: 'สตูล', location: { lat: 6.6238, lng: 100.0673 }, region: 'south' },
  { id: 'trang', name: 'ตรัง', location: { lat: 7.5564, lng: 99.6233 }, region: 'south' },
  { id: 'phatthalung', name: 'พัทลุง', location: { lat: 7.6166, lng: 100.0742 }, region: 'south' },
  { id: 'pattani', name: 'ปัตตานี', location: { lat: 6.8681, lng: 101.2503 }, region: 'south' },
  { id: 'yala', name: 'ยะลา', location: { lat: 6.5410, lng: 101.2802 }, region: 'south' },
  { id: 'narathiwat', name: 'นราธิวาส', location: { lat: 6.4254, lng: 101.8253 }, region: 'south' },

  // ภาคกลางตอนล่าง
  { id: 'phetchabun', name: 'เพชรบูรณ์', location: { lat: 16.4192, lng: 101.1607 }, region: 'central' },
  { id: 'kamphaeng-phet', name: 'กำแพงเพชร', location: { lat: 16.4828, lng: 99.5226 }, region: 'central' },
  { id: 'phichit', name: 'พิจิตร', location: { lat: 16.4428, lng: 100.3489 }, region: 'central' },
  { id: 'phitsanulok', name: 'พิษณุโลก', location: { lat: 16.8211, lng: 100.2659 }, region: 'central' },
  { id: 'sukhothai', name: 'สุโขทัย', location: { lat: 17.0061, lng: 99.8230 }, region: 'central' },
  { id: 'nakhon-sawan', name: 'นครสวรรค์', location: { lat: 15.7047, lng: 100.1376 }, region: 'central' },
  { id: 'uthai-thani', name: 'อุทัยธานี', location: { lat: 15.3794, lng: 100.0244 }, region: 'central' },
]

export const getProvinceById = (id: string): Province | undefined => {
  return provinces.find(p => p.id === id)
}

export const getProvincesByRegion = (region: Province['region']): Province[] => {
  return provinces.filter(p => p.region === region)
}

export const searchProvinces = (query: string): Province[] => {
  const lowerQuery = query.toLowerCase()
  return provinces.filter(p => p.name.toLowerCase().includes(lowerQuery))
}
