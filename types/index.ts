export interface Branch {
  id: string;
  name: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoomHost {
  name: string;
  phone: string;
  address: string;
  idCardImage?: string;
}

export interface UtilityUsage {
  id: string;
  roomId: string;
  month: string;
  year: number;
  electricUsage: number;
  waterUsage: number;
  electricCost: number;
  waterCost: number;
  createdAt: string;
}

export interface Payment {
  id: string;
  roomId: string;
  month: string;
  year: number;
  amount: number;
  isPaid: boolean;
  paidAt?: string;
  createdAt: string;
}

export interface Room {
  id: string;
  branchId: string;
  name: string;
  host: RoomHost;
  monthlyRent: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoomWithDetails extends Room {
  utilities: UtilityUsage[];
  payments: Payment[];
}

export interface BranchWithRooms extends Branch {
  rooms: Room[];
}
