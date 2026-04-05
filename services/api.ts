
import { BaseClaimData, User } from '../types';
import { MOCK_CLAIMS } from '../utils/mockData';

const STORAGE_KEYS = {
    CLAIMS: 'cmbsl_claims_db',
    USERS: 'cmbsl_users_db',
    BATCHES: 'cmbsl_batches_db'
};

// Internal helper to get/set local storage data
const getLocal = <T>(key: string, fallback: T): T => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
};

const setLocal = <T>(key: string, data: T): void => {
    localStorage.setItem(key, JSON.stringify(data));
};

export const apiService = {
    async healthCheck(): Promise<boolean> {
        return true; // Always healthy for device storage
    },

    async getClaims(): Promise<BaseClaimData[]> {
        return getLocal<BaseClaimData[]>(STORAGE_KEYS.CLAIMS, MOCK_CLAIMS);
    },

    async createClaim(formData: FormData): Promise<BaseClaimData> {
        // Since we are local, we parse the 'data' field from the FormData
        const claimDataRaw = formData.get('data');
        if (!claimDataRaw) throw new Error("No claim data provided");
        
        const claimData = JSON.parse(claimDataRaw as string) as BaseClaimData;
        const currentClaims = await this.getClaims();
        
        const updated = [claimData, ...currentClaims];
        setLocal(STORAGE_KEYS.CLAIMS, updated);
        return claimData;
    },

    async updateClaim(id: string, updates: Partial<BaseClaimData>): Promise<void> {
        const currentClaims = await this.getClaims();
        const updated = currentClaims.map(c => c.id === id ? { ...c, ...updates } : c);
        setLocal(STORAGE_KEYS.CLAIMS, updated);
    },

    async processBatch(batchData: { batchId: string, items: BaseClaimData[] }): Promise<void> {
        // Record batch locally
        const currentBatches = getLocal<any[]>(STORAGE_KEYS.BATCHES, []);
        const newBatch = {
            ...batchData,
            processedAt: new Date().toISOString(),
        };
        setLocal(STORAGE_KEYS.BATCHES, [...currentBatches, newBatch]);
        
        // Update statuses of individual claims
        for (const item of batchData.items) {
            await this.updateClaim(item.id, { status: 'Cash Requested' });
        }
    },

    async createUser(user: User): Promise<void> {
        const currentUsers = getLocal<User[]>(STORAGE_KEYS.USERS, []);
        setLocal(STORAGE_KEYS.USERS, [...currentUsers, user]);
    },

    async deleteUser(id: string): Promise<void> {
        const currentUsers = getLocal<User[]>(STORAGE_KEYS.USERS, []);
        setLocal(STORAGE_KEYS.USERS, currentUsers.filter(u => u.id !== id));
    }
};
