import { doc, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../services/firebase';
import { MOCK_USERS, DEFAULT_ROLES, MOCK_CLAIMS, MOCK_VEHICLES, MOCK_STAFF } from './mockData';
import { apiService } from '../services/api';

const SEED_FLAG_DOC = 'meta/seeded';

export async function seedFirestoreIfEmpty(): Promise<void> {
    try {
        const flagRef = doc(db, 'meta', 'seeded');
        const flagSnap = await getDoc(flagRef);
        if (flagSnap.exists()) return; // already seeded

        const batch = writeBatch(db);

        // Seed users
        for (const user of MOCK_USERS) {
            const { id, ...rest } = user;
            batch.set(doc(db, 'users', id), rest);
        }

        // Seed roles
        for (const role of DEFAULT_ROLES) {
            const { id, ...rest } = role;
            batch.set(doc(db, 'roles', id), rest);
        }

        // Seed claims
        for (const claim of MOCK_CLAIMS) {
            const { id, ...rest } = claim;
            batch.set(doc(db, 'claims', id), rest);
        }

        // Seed vehicles
        if (MOCK_VEHICLES) {
            for (const vehicle of MOCK_VEHICLES) {
                const { id, ...rest } = vehicle;
                batch.set(doc(db, 'vehicles', id), rest);
            }
        }

        // Seed staff
        if (MOCK_STAFF) {
            for (const member of MOCK_STAFF) {
                const { id, ...rest } = member;
                batch.set(doc(db, 'staff', id), rest);
            }
        }

        // Mark as seeded
        batch.set(flagRef, { seededAt: new Date().toISOString() });

        await batch.commit();
        console.log('Firestore seeded successfully');
    } catch (err) {
        console.error('Seed failed:', err);
    }
}
