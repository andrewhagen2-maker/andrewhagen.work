export const prerender = false;

export async function POST({ request }) {
  const body = await request.json();
  const correct = import.meta.env.REGISTRY_PASSWORD;

  if (!correct) {
    return new Response(JSON.stringify({ error: 'No password configured.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (body.password === correct) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}
