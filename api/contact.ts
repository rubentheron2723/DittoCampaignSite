/*
 * POST /api/contact: the "Book a demo" form. Checks the request again on the server, then emails it to the sales
 * inbox through Resend (https://resend.com), with Reply-To set to the person who asked, so a reply goes to them.
 *
 * Environment (Vercel → Project → Settings → Environment Variables, or .env.local for `npm run dev`):
 *   RESEND_API_KEY  required; without it the form shows its error and the "email us" fallback.
 *   CONTACT_TO      where requests go (comma-separated for several). Default hello@ditto.work.
 *   CONTACT_FROM    the sender, on a domain verified in Resend. Default "Ditto website <website@ditto.work>".
 *
 * Kept free of imports so Vercel can run it as it is.
 */

type Fields = {
  name: string;
  email: string;
  business: string;
  website: string;
  dial: string;
  phone: string;
  role: string;
  teamSize: string;
  interest: string;
  message: string;
  /** Hidden from people; a bot that fills it in is thanked and ignored. */
  company_fax: string;
};

const LIMITS: Record<keyof Fields, number> = {
  name: 120,
  email: 200,
  business: 160,
  website: 200,
  dial: 8,
  phone: 30,
  role: 80,
  teamSize: 80,
  interest: 80,
  message: 4000,
  company_fax: 200,
};

/** The same rules as the form (src/pages/contact.ts), so the server never accepts what the page would refuse. */
const RULES: Partial<Record<keyof Fields, (v: string) => boolean>> = {
  name: (v) => v.length > 1,
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v),
  business: (v) => v.length > 1,
  website: (v) => !v || /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/.*)?$/i.test(v),
  dial: (v) => /^\+\d{1,4}$/.test(v),
  phone: (v) => /^[\d\s()-]{5,}$/.test(v) && v.replace(/\D/g, '').length >= 6,
  role: (v) => !!v,
  teamSize: (v) => !!v,
  interest: (v) => !!v,
};

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Reads and trims every known field; anything else in the body is dropped. Null when a field is too long. */
function readFields(body: unknown): Fields | null {
  const src = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  const out = {} as Fields;
  for (const key of Object.keys(LIMITS) as (keyof Fields)[]) {
    const raw = src[key];
    const v = typeof raw === 'string' ? raw.trim() : '';
    if (v.length > LIMITS[key]) return null;
    out[key] = v;
  }
  return out;
}

function emailFor(f: Fields) {
  const rows: [string, string][] = [
    ['Name', f.name],
    ['Email', f.email],
    ['Business', f.business],
    ['Website', f.website || '—'],
    ['Phone', `${f.dial} ${f.phone}`],
    ['Role', f.role],
    ['Team size', f.teamSize],
    ['Interested in', f.interest],
    ['Message', f.message || '—'],
  ];
  const subject = `Demo request: ${f.business} (${f.name})`.replace(/[\r\n]+/g, ' ');
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n') + '\n\nSent from the Book a demo form on the Ditto website.';
  const html = `<table cellpadding="6" style="font:14px/1.5 -apple-system,Segoe UI,Arial,sans-serif;border-collapse:collapse">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="color:#667;vertical-align:top;white-space:nowrap">${k}</td><td style="white-space:pre-wrap">${escapeHtml(v)}</td></tr>`,
    )
    .join('')}</table><p style="font:12px -apple-system,Segoe UI,Arial,sans-serif;color:#889">Sent from the Book a demo form on the Ditto website. Reply to answer ${escapeHtml(f.name)} directly.</p>`;
  return { subject, text, html };
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: 'invalid' });
  }

  const f = readFields(body);
  if (!f) return json(400, { ok: false, error: 'invalid' });
  // A bot filled in the hidden field: look successful, send nothing.
  if (f.company_fax) return json(200, { ok: true });

  const bad = (Object.keys(RULES) as (keyof Fields)[]).filter((k) => !RULES[k]!(f[k]));
  if (bad.length) return json(400, { ok: false, error: 'invalid', fields: bad });

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error('contact: RESEND_API_KEY is not set, so the request was not sent');
    return json(503, { ok: false, error: 'not_configured' });
  }
  const to = (process.env.CONTACT_TO || 'hello@ditto.work')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const from = process.env.CONTACT_FROM || 'Ditto website <website@ditto.work>';

  const { subject, text, html } = emailFor(f);
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from, to, reply_to: f.email, subject, text, html }),
    });
    if (!res.ok) {
      console.error('contact: Resend refused the email', res.status, await res.text());
      return json(502, { ok: false, error: 'send_failed' });
    }
  } catch (err) {
    console.error('contact: could not reach Resend', err);
    return json(502, { ok: false, error: 'send_failed' });
  }
  return json(200, { ok: true });
}
