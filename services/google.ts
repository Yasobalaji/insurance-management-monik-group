import { GOOGLE_CLIENT_ID } from "../constants";

const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets';
const DISCOVERY_DOCS = [
    'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
    'https://sheets.googleapis.com/$discovery/rest?version=v4'
];

declare global {
    interface Window {
        gapi: any;
        google: any;
    }
}

class GoogleService {
    private tokenClient: any;
    private isInitialized: boolean = false;
    private accessToken: string | null = null;

    constructor() {
        this.loadScripts();
    }

    private loadScripts() {
        if (!GOOGLE_CLIENT_ID) {
            console.info("Google Client ID not set. App running in offline simulation mode.");
            return;
        }
    }

    public async init(): Promise<void> {
        if (!GOOGLE_CLIENT_ID) return;
        
        return new Promise((resolve, reject) => {
            window.gapi.load('client', async () => {
                try {
                    await window.gapi.client.init({
                        discoveryDocs: DISCOVERY_DOCS,
                    });
                    
                    this.tokenClient = window.google.accounts.oauth2.initTokenClient({
                        client_id: GOOGLE_CLIENT_ID,
                        scope: SCOPES,
                        callback: (resp: any) => {
                            if (resp.error) {
                                reject(resp);
                            }
                            this.accessToken = resp.access_token;
                        },
                    });
                    
                    this.isInitialized = true;
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });
    }

    public async signIn(): Promise<string> {
        if (!GOOGLE_CLIENT_ID) {
            return "simulated_token";
        }
        
        if (!this.isInitialized) {
            await this.init();
        }

        return new Promise((resolve) => {
            if (this.accessToken) {
                // Check if valid? For simplicity assume yes or let API fail and retry
                resolve(this.accessToken!);
            } else {
                this.tokenClient.callback = (resp: any) => {
                    if (resp.error) throw resp;
                    this.accessToken = resp.access_token;
                    resolve(resp.access_token);
                };
                this.tokenClient.requestAccessToken({ prompt: 'consent' });
            }
        });
    }

    // --- DRIVE OPERATIONS ---

    /**
     * Ensures the folder path exists in Drive. Returns the ID of the final folder.
     * Path format: "Root/FolderA/FolderB"
     */
    public async ensureFolderHierarchy(pathString: string): Promise<string> {
        if (!GOOGLE_CLIENT_ID) return "simulated_folder_id";

        const parts = pathString.split('/').filter(p => p && p !== 'Google Drive');
        let parentId = 'root';

        for (const part of parts) {
            parentId = await this.findOrCreateFolder(part, parentId);
        }

        return parentId;
    }

    private async findOrCreateFolder(name: string, parentId: string): Promise<string> {
        const query = `mimeType='application/vnd.google-apps.folder' and name='${name}' and '${parentId}' in parents and trashed=false`;
        const response = await window.gapi.client.drive.files.list({
            q: query,
            fields: 'files(id, name)',
            spaces: 'drive',
        });

        if (response.result.files && response.result.files.length > 0) {
            return response.result.files[0].id;
        } else {
            // Create
            const fileMetadata = {
                name: name,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [parentId],
            };
            const createResponse = await window.gapi.client.drive.files.create({
                resource: fileMetadata,
                fields: 'id',
            });
            return createResponse.result.id;
        }
    }

    public async uploadFile(file: File, folderId: string, customName?: string): Promise<void> {
        if (!GOOGLE_CLIENT_ID) {
            console.log(`[Simulated] Uploading ${file.name} to ${folderId} as ${customName}`);
            await new Promise(r => setTimeout(r, 500));
            return;
        }

        const metadata = {
            name: customName || file.name,
            parents: [folderId],
        };

        const accessToken = window.gapi.auth.getToken().access_token;
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', file);

        await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
            body: form,
        });
    }

    // --- SHEETS OPERATIONS ---

    public async appendToSpreadsheet(data: any): Promise<void> {
        if (!GOOGLE_CLIENT_ID) {
            console.log(`[Simulated] Appending row to Sheet:`, data);
            return;
        }

        const SPREADSHEET_NAME = "CMBSL Claims Database";
        const spreadsheetId = await this.findOrCreateSpreadsheet(SPREADSHEET_NAME);

        // Flatten data object to array
        // We'll define a standard header order.
        const headers = [
            "ID", "Timestamp", "Status", "Company", "Branch", "Loan No", "Customer Name", 
            "Claim Type", "Beneficiary", "Amount", "Collection Method", "Disbursed Date", "Total Paid", "Arrears"
        ];

        const row = [
            data.id, 
            new Date(data.timestamp).toISOString(), 
            data.status, 
            data.company, 
            data.branch, 
            data.loanNumber, 
            data.customerName,
            data.claimType,
            data.beneficiary,
            data.loanAmount,
            data.collectionMethod,
            data.loanDisbursedDate,
            data.totalPaid,
            data.arrears
        ];

        // Append
        await window.gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: spreadsheetId,
            range: 'Sheet1!A1',
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [row]
            }
        });
    }

    private async findOrCreateSpreadsheet(name: string): Promise<string> {
        const query = `mimeType='application/vnd.google-apps.spreadsheet' and name='${name}' and trashed=false`;
        const response = await window.gapi.client.drive.files.list({
            q: query,
            fields: 'files(id, name)',
        });

        if (response.result.files && response.result.files.length > 0) {
            return response.result.files[0].id;
        } else {
            // Create
            const resource = {
                properties: { title: name },
            };
            const createResp = await window.gapi.client.sheets.spreadsheets.create({
                resource,
                fields: 'spreadsheetId',
            });
            
            // Add Headers
            const spreadsheetId = createResp.result.spreadsheetId;
             const headers = [
                "ID", "Timestamp", "Status", "Company", "Branch", "Loan No", "Customer Name", 
                "Claim Type", "Beneficiary", "Amount", "Collection Method", "Disbursed Date", "Total Paid", "Arrears"
            ];
             await window.gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: spreadsheetId,
                range: 'Sheet1!A1',
                valueInputOption: 'USER_ENTERED',
                resource: { values: [headers] }
            });

            return spreadsheetId;
        }
    }
}

export const googleService = new GoogleService();