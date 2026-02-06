import AsyncStorage from '@react-native-async-storage/async-storage';
import { Branch, Room, UtilityUsage, Payment, RoomWithDetails, BranchWithRooms } from '@/types';

const STORAGE_KEYS = {
  BRANCHES: '@rooms_mgmt_branches',
  ROOMS: '@rooms_mgmt_rooms',
  UTILITIES: '@rooms_mgmt_utilities',
  PAYMENTS: '@rooms_mgmt_payments',
};

class DataStore {
  // Branches
  static async getBranches(): Promise<Branch[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.BRANCHES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting branches:', error);
      return [];
    }
  }

  static async saveBranches(branches: Branch[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(branches));
    } catch (error) {
      console.error('Error saving branches:', error);
    }
  }

  static async createBranch(branch: Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>): Promise<Branch> {
    const branches = await this.getBranches();
    const newBranch: Branch = {
      ...branch,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await this.saveBranches([...branches, newBranch]);
    return newBranch;
  }

  static async updateBranch(id: string, updates: Partial<Branch>): Promise<Branch | null> {
    const branches = await this.getBranches();
    const index = branches.findIndex(b => b.id === id);
    if (index === -1) return null;
    
    branches[index] = { ...branches[index], ...updates, updatedAt: new Date().toISOString() };
    await this.saveBranches(branches);
    return branches[index];
  }

  static async deleteBranch(id: string): Promise<boolean> {
    const branches = await this.getBranches();
    const rooms = await this.getRooms();
    
    // Delete all rooms in this branch
    const roomsToDelete = rooms.filter(r => r.branchId === id);
    for (const room of roomsToDelete) {
      await this.deleteRoom(room.id);
    }
    
    const filtered = branches.filter(b => b.id !== id);
    await this.saveBranches(filtered);
    return true;
  }

  // Rooms
  static async getRooms(): Promise<Room[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ROOMS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting rooms:', error);
      return [];
    }
  }

  static async getRoomsByBranch(branchId: string): Promise<Room[]> {
    const rooms = await this.getRooms();
    return rooms.filter(r => r.branchId === branchId);
  }

  static async saveRooms(rooms: Room[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
    } catch (error) {
      console.error('Error saving rooms:', error);
    }
  }

  static async createRoom(room: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>): Promise<Room> {
    const rooms = await this.getRooms();
    const newRoom: Room = {
      ...room,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await this.saveRooms([...rooms, newRoom]);
    return newRoom;
  }

  static async updateRoom(id: string, updates: Partial<Room>): Promise<Room | null> {
    const rooms = await this.getRooms();
    const index = rooms.findIndex(r => r.id === id);
    if (index === -1) return null;
    
    rooms[index] = { ...rooms[index], ...updates, updatedAt: new Date().toISOString() };
    await this.saveRooms(rooms);
    return rooms[index];
  }

  static async deleteRoom(id: string): Promise<boolean> {
    const rooms = await this.getRooms();
    
    // Delete related utilities and payments
    const utilities = await this.getUtilities();
    const payments = await this.getPayments();
    
    const filteredUtilities = utilities.filter(u => u.roomId !== id);
    const filteredPayments = payments.filter(p => p.roomId !== id);
    
    await this.saveUtilities(filteredUtilities);
    await this.savePayments(filteredPayments);
    
    const filtered = rooms.filter(r => r.id !== id);
    await this.saveRooms(filtered);
    return true;
  }

  // Utilities
  static async getUtilities(): Promise<UtilityUsage[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.UTILITIES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting utilities:', error);
      return [];
    }
  }

  static async getUtilitiesByRoom(roomId: string): Promise<UtilityUsage[]> {
    const utilities = await this.getUtilities();
    return utilities
      .filter(u => u.roomId === roomId)
      .sort((a, b) => {
        const dateA = new Date(a.year, this.getMonthNumber(a.month));
        const dateB = new Date(b.year, this.getMonthNumber(b.month));
        return dateB.getTime() - dateA.getTime();
      });
  }

  static async saveUtilities(utilities: UtilityUsage[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.UTILITIES, JSON.stringify(utilities));
    } catch (error) {
      console.error('Error saving utilities:', error);
    }
  }

  static async createUtility(utility: Omit<UtilityUsage, 'id' | 'createdAt'>): Promise<UtilityUsage> {
    const utilities = await this.getUtilities();
    const newUtility: UtilityUsage = {
      ...utility,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    await this.saveUtilities([...utilities, newUtility]);
    return newUtility;
  }

  static async updateUtility(id: string, updates: Partial<UtilityUsage>): Promise<UtilityUsage | null> {
    const utilities = await this.getUtilities();
    const index = utilities.findIndex(u => u.id === id);
    if (index === -1) return null;
    
    utilities[index] = { ...utilities[index], ...updates };
    await this.saveUtilities(utilities);
    return utilities[index];
  }

  // Payments
  static async getPayments(): Promise<Payment[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PAYMENTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting payments:', error);
      return [];
    }
  }

  static async getPaymentsByRoom(roomId: string): Promise<Payment[]> {
    const payments = await this.getPayments();
    return payments
      .filter(p => p.roomId === roomId)
      .sort((a, b) => {
        const dateA = new Date(a.year, this.getMonthNumber(a.month));
        const dateB = new Date(b.year, this.getMonthNumber(b.month));
        return dateB.getTime() - dateA.getTime();
      });
  }

  static async getPaymentForMonth(roomId: string, month: string, year: number): Promise<Payment | null> {
    const payments = await this.getPayments();
    return payments.find(p => p.roomId === roomId && p.month === month && p.year === year) || null;
  }

  static async savePayments(payments: Payment[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
    } catch (error) {
      console.error('Error saving payments:', error);
    }
  }

  static async createPayment(payment: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
    const payments = await this.getPayments();
    const newPayment: Payment = {
      ...payment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    await this.savePayments([...payments, newPayment]);
    return newPayment;
  }

  static async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | null> {
    const payments = await this.getPayments();
    const index = payments.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    payments[index] = { ...payments[index], ...updates };
    await this.savePayments(payments);
    return payments[index];
  }

  // Room with details
  static async getRoomWithDetails(roomId: string): Promise<RoomWithDetails | null> {
    const rooms = await this.getRooms();
    const room = rooms.find(r => r.id === roomId);
    if (!room) return null;

    const utilities = await this.getUtilitiesByRoom(roomId);
    const payments = await this.getPaymentsByRoom(roomId);

    return { ...room, utilities, payments };
  }

  // Branch with rooms
  static async getBranchWithRooms(branchId: string): Promise<BranchWithRooms | null> {
    const branches = await this.getBranches();
    const branch = branches.find(b => b.id === branchId);
    if (!branch) return null;

    const rooms = await this.getRoomsByBranch(branchId);
    return { ...branch, rooms };
  }

  // Helper
  private static getMonthNumber(month: string): number {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months.indexOf(month);
  }
}

export default DataStore;
