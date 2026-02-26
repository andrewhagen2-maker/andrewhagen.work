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

  // Log the scan — await so write completes before redirect
  // Adds ~500ms to redirect but guarantees the row is written
  const user_agent = headers.get('user-agent') || '';
  const country = headers.get('x-vercel-ip-country') || '';

  try {
    await writeScan({
      code_id: entry.code_id,
      distributor: entry.distributor,
      user_agent,
      country,
    });
  } catch (err) {
    // Log failure but still redirect — scan logging is non-blocking for the user
    console.error('Sheets writeScan error:', err);
  }

  return new Response(null, {
    status: 302,
    headers: { Location: entry.destination_url },
  });
}
