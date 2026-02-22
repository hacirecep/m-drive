export interface Maintenance {
  id: string;
  tarih: string;
  islem: string;
  km: number;
  maliyet: string;
  sonraki?: number;
  not?: string;
}

export interface Alert {
  id: string;
  carId: string;
  plaka: string;
  baslik: string;
  not?: string;
  tip: 'tarih' | 'km';
  bitiseTarihi?: string;
  bitisKm?: number;
  oncesindanGun?: number;
  oncesindanKm?: number;
}

export interface Car {
  id: string;
  plaka: string;
  marka: string;
  model: string;
  yil?: string;
  km: number;
  nextKm?: number;
  sasi?: string;
  durum: 'green' | 'yellow' | 'red';
  bakimlar: Maintenance[];
  alerts?: Alert[];
  ownerEmail: string;
  createdAt?: Date;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
}

export interface DashboardStats {
  totalCars: number;
  totalMaintenances: number;
  totalCost: number;
  upcomingMaintenances: Maintenance[];
  averageKm: number;
}
