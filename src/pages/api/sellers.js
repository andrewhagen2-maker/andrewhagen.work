import { supabase } from '../../lib/supabase.js';

export const prerender = false;

export async function GET() {
  const { data, error } = await supabase
    .from('sellers')
    .select('*')
    .order('created_at', { ascending: false });

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

export async function POST({ request }) {
  const body = await request.json();

  const { data, error } = await supabase
    .from('sellers')
    .insert([{
      entity_name: body.entity_name,
      legal_names_dba: body.legal_names_dba || null,
      authorized_countries: body.authorized_countries || [],
      authorization_status: body.authorization_status || 'Authorized',
      date_authorized: body.date_authorized || new Date().toISOString().split('T')[0],
      approved_sale_locations: body.approved_sale_locations || [],
      policy: body.policy || null,
      product_categories: body.product_categories || [],
      emails: body.emails || [],
      addresses: body.addresses || [],
      internal_notes: body.internal_notes || null,
    }])
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(data), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
}
