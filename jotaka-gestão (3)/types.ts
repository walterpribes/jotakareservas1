
export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
  NOSHOW = 'NOSHOW'
}

export enum UnitId {
  ASA_SUL = 'asa_sul',
  AGUAS_CLARAS = 'aguas_claras',
  TAGUATINGA = 'taguatinga',
  CEILANDIA = 'ceilandia'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER'
}

export interface Unit {
  id: UnitId;
  name: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  assignedUnitId?: UnitId;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  visits: string[]; 
  isVip?: boolean;
  notes?: string;
  tags?: string[];
}

export interface HistoryEntry {
  user: string;
  action: string;
  timestamp: string;
}

export interface Reservation {
  id: string;
  unitId: UnitId;
  clientId: string;
  clientName: string;
  clientPhone: string;
  date: string;
  time: string;
  peopleCount: number;
  confirmedPeopleCount?: number;
  spentAmount?: number;
  eventType: string;
  status: ReservationStatus;
  area?: 'TERRACO' | 'SALAO';
  tableNumber?: string;
  specialNotes?: string;
  notesAuthor?: string; // NOVO
  createdAt: string;
  history: HistoryEntry[];
  lastModifiedBy?: string;
  lastModifiedAt?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  author_name: string;
  is_important: boolean;
  created_at: string;
}

export type DashboardFilterPeriod = 'day' | 'week' | 'month' | 'year';

export interface DailyCounts {
  scheduled: number;
  created: number;
  noshows: number;
}
