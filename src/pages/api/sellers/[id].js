import { supabase } from '../../../lib/supabase.js';

export const prerender = false;

export async function GET({ params }) {
  const { id } = params;

  const { data, error } = await supabase
    .from('sellers')
    .select('*, channel_authorizations(*)')
    .eq('id', id)
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.code === 'PGRST116' ? 404 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function PUT({ params, request }) {
  const { id } = params;
  const body = await request.json();

  const allowed = [
    'entity_name', 'legal_names_dba', 'authorized_countries',
    'authorization_status', 'date_authorized', 'approved_sale_locations',
    'policy', 'product_categories', 'emails', 'addresses', 'internal_notes',
  ];

  const updates = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  const { data, error } = await supabase
    .from('sellers')
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
    .from('sellers')
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
