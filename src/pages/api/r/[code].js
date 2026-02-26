export const prerender = false;

import { lookupCode, writeScan } from '../../../lib/sheets.js';

export async function GET({ params, request }) {
  const { code } = params;
  const headers = request.headers;

  let entry;
  try {
    entry = await lookupCode(code);
  } catch (err) {
    console.error('Sheets lookupCode error:', err);
    // Silent fail — send to root
    return new Response(null, {
      status: 302,
      headers: { Location: 'https://andrewhagen.work' },
    });
  }

  if (!entry) {
    // Unknown code — silent redirect to root
    return new Response(null, {
      status: 302,
      headers: { Location: 'https://andrewhagen.work' },
    });
  }

  // Log the scan — fire and don't await so redirect is not delayed by the write
  const user_agent = headers.get('user-agent') || '';
  const country = headers.get('x-vercel-ip-country') || '';

  writeScan({
    code_id: entry.code_id,
    distributor: entry.distributor,
    user_agent,
    country,
  }).catch((err) => console.error('Sheets writeScan error:', err));

  return new Response(null, {
    status: 302,
    headers: { Location: entry.destination_url },
  });
}
