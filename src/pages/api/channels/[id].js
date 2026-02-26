import { supabase } from '../../../lib/supabase.js';

export const prerender = false;

export async function PUT({ params, request }) {
  const { id } = params;
  const body = await request.json();

  const allowed = [
    'channel_type', 'date_authorized', 'domain_name',
    'marketplace_platform', 'seller_name', 'seller_platform_id',
  ];

  const updates = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  const { data, error } = await supabase
    .from('channel_authorizations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function DELETE({ params }) {
  const { id } = params;

  const { error } = await supabase
    .from('channel_authorizations')
    .delete()
    .eq('id', id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(null, { status: 204 });
}
