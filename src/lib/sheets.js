import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: SCOPES,
  });
}

function getSheets() {
  const auth = getAuth();
  return google.sheets({ version: 'v4', auth });
}

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const CODES_TAB = 'Codes';
const SCANS_TAB = 'Scans';

// Write a new code row to the Codes tab
// Row: code_id | distributor | destination_url | created_date | notes
export async function writeCode({ code_id, distributor, destination_url, notes = '' }) {
  const sheets = getSheets();
  const created_date = new Date().toISOString().split('T')[0];
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${CODES_TAB}!A:E`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[code_id, distributor, destination_url, created_date, notes]],
    },
  });
}

// Look up a code in the Codes tab, return { distributor, destination_url } or null
export async function lookupCode(code_id) {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${CODES_TAB}!A:E`,
  });
  const rows = res.data.values || [];
  // Skip header row (row 0), search col A for code_id
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === code_id) {
      return {
        code_id: rows[i][0],
        distributor: rows[i][1],
        destination_url: rows[i][2],
        created_date: rows[i][3],
        notes: rows[i][4] || '',
      };
    }
  }
  return null;
}

// Write a scan event row to the Scans tab
// Row: timestamp | code_id | distributor | user_agent | country
export async function writeScan({ code_id, distributor, user_agent, country }) {
  const sheets = getSheets();
  const timestamp = new Date().toISOString();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${SCANS_TAB}!A:E`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[timestamp, code_id, distributor, user_agent, country]],
    },
  });
}

// Read all scan rows from the Scans tab, return array of objects
export async function readScans() {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SCANS_TAB}!A:E`,
  });
  const rows = res.data.values || [];
  if (rows.length <= 1) return []; // header only or empty
  return rows.slice(1).map((row) => ({
    timestamp: row[0] || '',
    code_id: row[1] || '',
    distributor: row[2] || '',
    user_agent: row[3] || '',
    country: row[4] || '',
  }));
}
