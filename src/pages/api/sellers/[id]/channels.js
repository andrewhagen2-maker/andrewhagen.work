import { supabase } from '../../../../lib/supabase.js';

export const prerender = false;

export async function GET({ params }) {
  const { id } = params;

  const { data, error } = await supabase
    .from('channel_authorizations')
    .select('*')
    .eq('seller_id', id)
    .order('created_at', { ascending: true });

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

export async function POST({ params, request }) {
  const { id } = params;
  const body = await request.json();

  const { data, error } = await supabase
    .from('channel_authorizations')
    .insert([{
      seller_id: id,
      channel_type: body.channel_type,
      date_authorized: body.date_authorized || new Date().toISOString().split('T')[0],
      domain_name: body.domain_name || null,
      marketplace_platform: body.marketplace_platform || null,
      seller_name: body.seller_name || null,
      seller_platform_id: body.seller_platform_id || null,
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
