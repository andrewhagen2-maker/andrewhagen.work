export const prerender = false;

import { writeCode } from '../../lib/sheets.js';

function generateCodeId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export async function POST({ request }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { distributor, destination_url, notes } = body;

  if (!distributor || !destination_url) {
    return new Response(JSON.stringify({ error: 'distributor and destination_url are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Basic URL validation
  try {
    new URL(destination_url);
  } catch {
    return new Response(JSON.stringify({ error: 'destination_url must be a valid URL' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const code_id = generateCodeId();

  try {
    await writeCode({ code_id, distributor, destination_url, notes: notes || '' });
  } catch (err) {
    console.error('Sheets writeCode error:', err);
    return new Response(JSON.stringify({ error: 'Failed to save code' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const qr_url = `https://andrewhagen.work/api/r/${code_id}`;

  return new Response(JSON.stringify({ code_id, qr_url, distributor }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
