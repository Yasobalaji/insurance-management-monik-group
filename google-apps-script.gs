
/**
 * CMBSL Insurance Management System - Apps Script Backend
 * Deploy this as a Web App with "Execute as me" and "Access: Anyone"
 */

const ROOT_DRIVE_FOLDER_ID = '1J0q0JVQK2_vMomPoiF663SKIV0Fhq-mO';
const SPREADSHEET_ID = '1ht1xLxBs2zE0WfC-hsi88UxWb06SA2aq_vcaTID6Gvs';

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    const data = payload.data;

    switch (action) {
      case 'CREATE_CLAIM':
        return handleCreateClaim(data);
      case 'GET_CLAIMS':
        return handleGetClaims();
      case 'UPDATE_CLAIM':
        return handleUpdateClaim(data.id, data.updates);
      case 'PROCESS_BATCH':
        return handleProcessBatch(data.batchId, data.items);
      case 'GET_USERS':
        return handleGetUsers();
      case 'UPSERT_USER':
        return handleUpsertUser(data);
      default:
        throw new Error('Unknown action: ' + action);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      error: err.message,
      success: false
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleCreateClaim(claim) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Sheet1') || ss.insertSheet('Sheet1');
  
  // 1. Handle File Uploads to Drive
  let folderId = ensureFolderHierarchy(claim.savedFolderPath);
  let driveFolderLink = DriveApp.getFolderById(folderId).getUrl();
  
  // Note: Files are expected as {name, type, base64} in claim.files
  if (claim.files && claim.files.length > 0) {
    claim.files.forEach(fileObj => {
      const blob = Utilities.newBlob(Utilities.base64Decode(fileObj.base64), fileObj.type, fileObj.name);
      DriveApp.getFolderById(folderId).createFile(blob);
    });
  }

  // 2. Append to Spreadsheet
  const row = [
    claim.id,
    new Date(claim.timestamp),
    claim.status,
    claim.company,
    claim.branch,
    claim.loanNumber,
    claim.customerName,
    claim.claimType,
    claim.beneficiary,
    claim.loanAmount,
    driveFolderLink,
    JSON.stringify(claim) // Full data for retrieval
  ];
  sheet.appendRow(row);

  return createJsonResponse({ success: true, data: { ...claim, driveFolderLink } });
}

function handleGetClaims() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Sheet1');
  if (!sheet) return createJsonResponse([]);
  
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return createJsonResponse([]); // Only headers
  
  // Skip headers, parse last column (JSON string)
  const claims = values.slice(1).map(row => {
    try {
      return JSON.parse(row[row.length - 1]);
    } catch (e) {
      return null;
    }
  }).filter(c => c !== null);
  
  return createJsonResponse(claims);
}

function handleUpdateClaim(id, updates) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Sheet1');
  const values = sheet.getDataRange().getValues();
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === id) {
      const existingData = JSON.parse(values[i][values[i].length - 1]);
      const newData = { ...existingData, ...updates };
      
      // Update basic columns and JSON column
      sheet.getRange(i + 1, 3).setValue(newData.status);
      sheet.getRange(i + 1, values[i].length).setValue(JSON.stringify(newData));
      return createJsonResponse({ success: true, data: newData });
    }
  }
  throw new Error('Claim not found: ' + id);
}

function handleProcessBatch(batchId, items) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Sheet2') || ss.insertSheet('Sheet2');
  
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
  
  const range = sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length);
  range.setValues(rows);
  
  return createJsonResponse({ success: true });
}

function handleGetUsers() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Users') || ss.insertSheet('Users');
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return createJsonResponse([]);
  
  const users = values.slice(1).map(row => ({
    id: row[0],
    name: row[1],
    email: row[2],
    role: row[3]
  }));
  return createJsonResponse(users);
}

function handleUpsertUser(user) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Users') || ss.insertSheet('Users');
  const values = sheet.getDataRange().getValues();
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][2] === user.email) {
      sheet.getRange(i + 1, 1, 1, 4).setValues([[user.id, user.name, user.email, user.role]]);
      return createJsonResponse({ success: true });
    }
  }
  sheet.appendRow([user.id, user.name, user.email, user.role]);
  return createJsonResponse({ success: true });
}

/** 
 * HELPER: Drive Folder Creation 
 */
function ensureFolderHierarchy(pathString) {
  const parts = pathString.split('/').filter(p => p);
  let parentId = ROOT_DRIVE_FOLDER_ID;
  let parent = DriveApp.getFolderById(parentId);

  for (const part of parts) {
    const folders = parent.getFoldersByName(part);
    if (folders.hasNext()) {
      parent = folders.next();
    } else {
      parent = parent.createFolder(part);
    }
  }
  return parent.getId();
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
