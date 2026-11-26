// Njofton me email mjeshtrat e aprovuar (profesioni + qyteti) kur një klient poston kërkesë.
// Thirret nga faqja /kerkese pas postimit, me sesionin e klientit. Dërgon vetëm një herë për kërkesë.
// Email-et dërgohen përmes Resend; pa sekretin RESEND_API_KEY funksioni nuk dërgon asgjë.
import { createClient } from 'npm:@supabase/supabase-js@2';

const SITE = 'https://thirremjeshtrin-ks.com';
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
const esc = (s: string) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });

  // Vetëm klienti që e postoi kërkesën mund ta nisë njoftimin.
  const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  const { data: u } = await admin.auth.getUser(token);
  if (!u?.user) return json({ error: 'auth' }, 401);

  const { id } = await req.json().catch(() => ({}));
  if (typeof id !== 'string') return json({ error: 'id' }, 400);

  const key = Deno.env.get('RESEND_API_KEY');
  if (!key) return json({ sent: 0, reason: 'email-not-configured' });

  // "Rezervojmë" kërkesën: vetëm një herë, vetëm kërkesa të freskëta (15 min) dhe vetëm të këtij klienti.
  const since = new Date(Date.now() - 15 * 60e3).toISOString();
  const { data: r } = await admin.from('requests').update({ notified_at: new Date().toISOString() })
    .eq('id', id).eq('client_id', u.user.id).is('notified_at', null).gte('created_at', since)
    .select('id,category_id,city_id,details,name').maybeSingle();
  if (!r) return json({ sent: 0, reason: 'already-or-not-found' });

  const [{ data: cat }, { data: city }, { data: list }] = await Promise.all([
    admin.from('categories').select('name').eq('id', r.category_id).single(),
    admin.from('cities').select('name').eq('id', r.city_id).single(),
    admin.from('craftsmen').select('user_id,full_name').eq('approved', true).eq('notify_requests', true)
      .eq('category_id', r.category_id).eq('city_id', r.city_id).neq('user_id', u.user.id).limit(50),
  ]);

  const from = Deno.env.get('MAIL_FROM') || 'Thirr Mjeshtrin <njoftime@thirremjeshtrin-ks.com>';
  const subject = `Kërkesë e re: ${cat?.name} në ${city?.name}`;
  const emails = [];
  for (const c of list || []) {
    const { data } = await admin.auth.admin.getUserById(c.user_id);
    const to = data?.user?.email;
    if (!to) continue;
    emails.push({
      from, to: [to], subject,
      html: `<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.5;color:#12213B">
<p>Përshëndetje ${esc(c.full_name)},</p>
<p>Një klient në <b>${esc(city?.name)}</b> kërkon <b>${esc(cat?.name)}</b>:</p>
<blockquote style="margin:0;padding:10px 14px;border-left:4px solid #C2410C;background:#F5F7FA">${esc(r.details).replace(/\n/g, '<br>')}</blockquote>
<p>Numrin e telefonit të ${esc(r.name || 'klientit')} e gjen te profili yt.</p>
<p><a href="${SITE}/profili" style="display:inline-block;background:#C2410C;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Shiko kërkesën</a></p>
<p style="font-size:13px;color:#55627A">Këto njoftime mund t'i ndalsh te <a href="${SITE}/profili">profili yt</a>.</p></div>`,
    });
  }
  if (!emails.length) return json({ sent: 0 });

  const res = await fetch('https://api.resend.com/emails/batch', {
    method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify(emails),
  });
  if (!res.ok) {
    console.error('resend', res.status, await res.text());
    await admin.from('requests').update({ notified_at: null }).eq('id', r.id); // provo sërish herën tjetër
    return json({ sent: 0, reason: 'mail-error' }, 502);
  }
  return json({ sent: emails.length });
});
