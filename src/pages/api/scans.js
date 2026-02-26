export const prerender = false;

import { readScans } from '../../lib/sheets.js';

export async function GET() {
  let scans;
  try {
    scans = await readScans();
  } catch (err) {
    console.error('Sheets readScans error:', err);
    return new Response(JSON.stringify({ error: 'Failed to read scan log' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Return newest first
  scans.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return new Response(JSON.stringify({ scans }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
