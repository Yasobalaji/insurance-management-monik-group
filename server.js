
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const admin = require('firebase-admin');

const app = express();
const PORT = 3001;

// --- CONFIGURATION ---
const ROOT_DRIVE_FOLDER_ID = '1J0q0JVQK2_vMomPoiF663SKIV0Fhq-mO';
const SPREADSHEET_ID = '1ht1xLxBs2zE0WfC-hsi88UxWb06SA2aq_vcaTID6Gvs';

app.use(cors());
app.use(express.json());

const UPLOADS_DIR = path.join(__dirname, 'uploads');
const FIREBASE_KEY_PATH = path.join(__dirname, 'firebase-adminsdk.json');
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

// --- Firebase Admin Setup ---
if (fs.existsSync(FIREBASE_KEY_PATH)) {
    try {
        const serviceAccount = require(FIREBASE_KEY_PATH);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("Firebase Admin: Firestore connected.");
    } catch (e) {
        console.error("Firebase Init Error:", e.message);
    }
} else {
    console.warn("WARNING: firebase-adminsdk.json missing. Using simulated db.");
}

const db = admin.apps.length > 0 ? admin.firestore() : null;

// --- Google Workspace Auth ---
let drive = null;
let sheets = null;

if (fs.existsSync(CREDENTIALS_PATH)) {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: CREDENTIALS_PATH,
            scopes: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets'],
        });
        drive = google.drive({ version: 'v3', auth });
        sheets = google.sheets({ version: 'v4', auth });
        console.log("Google Services: Drive & Sheets API ready.");
    } catch (e) {
        console.error("Google Auth Error:", e.message);
    }
}

// --- Helpers ---
async function logToSheet(sheetName, rows) {
    if (!sheets) return;
    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetName}!A1`,
            valueInputOption: 'USER_ENTERED',
            resource: { values: rows }
        });
    } catch (e) { console.error("Sheets Sync Error:", e.message); }
}

// --- API Routes ---

// Fetch All Claims from Firestore
app.get('/api/claims', async (req, res) => {
    if (!db) return res.status(500).json({ error: "DB Disconnected" });
    try {
        const snapshot = await db.collection('claims').orderBy('timestamp', 'desc').get();
        const claims = [];
        snapshot.forEach(doc => claims.push({ ...doc.data(), firebase_id: doc.id }));
        res.json(claims);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

const upload = multer({ dest: path.join(UPLOADS_DIR, 'temp') });

// Create New Claim
app.post('/api/claims', upload.array('files'), async (req, res) => {
    try {
        const claimData = JSON.parse(req.body.data);
        if (db) {
            await db.collection('claims').doc(claimData.id).set(claimData);
        }
        
        // Log basic info to Sheet1
        const row = [[
            claimData.id, 
            new Date(claimData.timestamp).toLocaleString(), 
            claimData.status, 
            claimData.branch, 
            claimData.customerName, 
            claimData.claimType, 
            claimData.loanAmount
        ]];
        await logToSheet('Sheet1', row);

        res.status(201).json(claimData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Process Batch and log to Sheet2
app.post('/api/process-batch', async (req, res) => {
    const { batchId, items } = req.body;
    if (!batchId || !items) return res.status(400).json({ error: "Missing batch data" });

    const rows = items.map(item => [
        new Date().toLocaleDateString(),
        batchId,
        item.branch,
        item.loanNumber,
        item.customerName,
        item.claimType,
        item.beneficiary,
        item.hospitalData?.dateAdmit || '',
        item.hospitalData?.dateDischarge || '',
        item.hospitalData?.totalAdmitedDays || '',
        item.approvedCashAmount || '0',
        item.bankDetails?.bankName || '',
        item.bankDetails?.branchNameOrCode || '',
        item.bankDetails?.accountNo || ''
    ]);

    try {
        await logToSheet('Sheet2', rows);
        res.json({ success: true, message: `Batch ${batchId} synced with Sheets.` });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Update Existing Claim
app.put('/api/claims/:id', async (req, res) => {
    if (!db) return res.status(500).json({ error: "DB Disconnected" });
    try {
        await db.collection('claims').doc(req.params.id).update(req.body);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Fix: Added user creation route
app.post('/api/users', async (req, res) => {
    if (!db) return res.json({ success: true, message: "Simulated user creation" });
    try {
        await db.collection('users').doc(req.body.id).set(req.body);
        res.status(201).json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Fix: Added user deletion route
app.delete('/api/users/:id', async (req, res) => {
    if (!db) return res.json({ success: true, message: "Simulated user deletion" });
    try {
        await db.collection('users').doc(req.params.id).delete();
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(PORT, () => console.log(`CMBSL Backend Operational: http://localhost:${PORT}`));
