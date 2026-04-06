
import { BaseClaimData, User } from '../types';
import {
    collection, doc, getDocs, getDoc, addDoc, setDoc,
    updateDoc, deleteDoc, query, orderBy, serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

const COLLECTIONS = {
    CLAIMS: 'claims',
    USERS: 'users',
    BATCHES: 'batches',
    ROLES: 'roles',
    NOTIFICATIONS: 'notifications',
    PRODUCTS: 'products',
    VEHICLES: 'vehicles',
    STAFF: 'staff',
    STAFF_CLAIMS: 'staffClaims',
    GENERAL_ASSETS: 'generalAssets',
    VEHICLE_CLAIMS: 'vehicleClaims',
    GENERAL_ASSET_CLAIMS: 'generalAssetClaims',
};

export const apiService = {
    async healthCheck(): Promise<boolean> {
        try {
            await getDocs(collection(db, COLLECTIONS.CLAIMS));
            return true;
        } catch {
            return false;
        }
    },

    async getClaims(): Promise<BaseClaimData[]> {
        const q = query(collection(db, COLLECTIONS.CLAIMS), orderBy('timestamp', 'desc'));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as BaseClaimData));
    },

    async createClaim(formData: FormData): Promise<BaseClaimData> {
        const claimDataRaw = formData.get('data');
        if (!claimDataRaw) throw new Error('No claim data provided');

        const claimData = JSON.parse(claimDataRaw as string) as BaseClaimData;
        const { id, ...rest } = claimData;

        await setDoc(doc(db, COLLECTIONS.CLAIMS, id), {
            ...rest,
            createdAt: serverTimestamp(),
        });

        return claimData;
    },

    async updateClaim(id: string, updates: Partial<BaseClaimData>): Promise<void> {
        await updateDoc(doc(db, COLLECTIONS.CLAIMS, id), {
            ...updates,
            updatedAt: serverTimestamp(),
        });
    },

    async processBatch(batchData: { batchId: string; items: BaseClaimData[] }): Promise<void> {
        await setDoc(doc(db, COLLECTIONS.BATCHES, batchData.batchId), {
            ...batchData,
            processedAt: serverTimestamp(),
        });

        for (const item of batchData.items) {
            await this.updateClaim(item.id, { status: 'Cash Requested' });
        }
    },

    async getUsers(): Promise<User[]> {
        const snap = await getDocs(collection(db, COLLECTIONS.USERS));
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as User));
    },

    async createUser(user: User): Promise<void> {
        const { id, ...rest } = user;
        await setDoc(doc(db, COLLECTIONS.USERS, id), rest);
    },

    async updateUser(id: string, updates: Partial<User>): Promise<void> {
        await updateDoc(doc(db, COLLECTIONS.USERS, id), updates as Record<string, unknown>);
    },

    async deleteUser(id: string): Promise<void> {
        await deleteDoc(doc(db, COLLECTIONS.USERS, id));
    },

    async getCollection<T>(collectionName: string): Promise<T[]> {
        const snap = await getDocs(collection(db, collectionName));
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as T));
    },

    async setDocument<T extends { id: string }>(collectionName: string, data: T): Promise<void> {
        const { id, ...rest } = data;
        await setDoc(doc(db, collectionName, id), rest as Record<string, unknown>);
    },

    async updateDocument(collectionName: string, id: string, updates: Record<string, unknown>): Promise<void> {
        await updateDoc(doc(db, collectionName, id), updates);
    },

    async deleteDocument(collectionName: string, id: string): Promise<void> {
        await deleteDoc(doc(db, collectionName, id));
    },

    COLLECTIONS,
};
