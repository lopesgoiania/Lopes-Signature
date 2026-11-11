import { createHash } from 'node:crypto';
import type { Request } from "express";
import { isIP } from 'node:net';

export const eventIdPattern = /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i;
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
const letters = (value: string) => value.toLowerCase().replace(/[^\p{L}]/gu, '');
const postal = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

function readGeo(headers: Headers, suffix: string) {
  const value = headers.get('x-vercel-ip-' + suffix)?.slice(0, 240) || '';
  try {
    return decodeURIComponent(value);
  } catch {
    return '';
  }
}

export async function sendMetaEvent(request: Request, { name, id, url, lead }: { name: "PageView" | "Lead"; id: string; url: string; lead?: {name: string; email: string; phone: string; form_id: string; form_source?: string} }) {
  const token = process.env.META_CAPI_ACCESS_TOKEN?.trim();
  if (!token) {
    console.warn(`Meta ${name}: credencial de produção indisponível.`);
    return false;
  }

  const userData: Record<string, string | string[]> = {};
  const headers = new Headers();
  for (const [key, value] of Object.entries(request.headers)) {
    if (value) headers.set(key, Array.isArray(value) ? value.join(", ") : value);
  }
  const cookies = headers.get('cookie') || '';
  for (const key of ['fbp', 'fbc']) {
    const value = cookies.match(new RegExp('(?:^|;\\s*)_' + key + '=(fb\\.[^;\\s]{1,250})'))?.[1];
    if (value) userData[key] = value;
  }
  const visitorId = cookies.match(/(?:^|;\s*)meta_client_id=([a-f0-9]{64})(?:;|$)/)?.[1];
  if (visitorId) userData.external_id = [visitorId];

  const clientIp = headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim();
  const userAgent = headers.get('user-agent');
  if (clientIp && isIP(clientIp)) userData.client_ip_address = clientIp;
  if (userAgent) userData.client_user_agent = userAgent;

  const country = readGeo(headers, 'country').toLowerCase();
  const geo = {
    ct: letters(readGeo(headers, 'city')),
    st: postal(readGeo(headers, 'country-region')),
    zp: postal(readGeo(headers, 'postal-code')),
    country: /^[a-z]{2}$/.test(country) ? country : '',
  };
  for (const [field, value] of Object.entries(geo)) {
    if (value) userData[field] = [hash(value)];
  }

  if (lead) {
    const names = lead.name.split(/\s+/).map(letters).filter(Boolean);
    if (names.length) userData.fn = [hash(names[0])];
    if (names.length > 1) userData.ln = [hash(names[names.length - 1])];
    if (lead.phone) userData.ph = [hash(lead.phone.replace(/\D/g, ""))];
    if (lead.email) userData.em = [hash(lead.email)];
  }

  const event: {custom_data?: Record<string, string>} & Record<string, unknown> = {
    event_name: name,
    event_time: Math.floor(Date.now() / 1000),
    event_id: id,
    event_source_url: url,
    action_source: 'website',
    user_data: userData,
  };
  if (lead) {
    event.custom_data = { form_id: lead.form_id };
    if (lead.form_source) event.custom_data.form_source = lead.form_source;
  }

  const version = process.env.META_GRAPH_API_VERSION || 'v23.0';
  try {
    const result = await fetch(`https://graph.facebook.com/${version}/3195858410596854/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ data: [event] }),
      redirect: 'error',
      signal: AbortSignal.timeout(4000),
    });
    const confirmation = await result.json().catch(() => null) as {
      events_received?: number;
      error?: { code?: number; error_subcode?: number };
    } | null;
    if (result.ok && (confirmation?.events_received ?? 0) > 0) return true;
    console.warn(`Meta ${name}: recebimento não confirmado.`, {
      status: result.status,
      code: typeof confirmation?.error?.code === "number" ? confirmation.error.code : undefined,
      subcode: typeof confirmation?.error?.error_subcode === "number" ? confirmation.error.error_subcode : undefined,
    });
  } catch {
    console.warn(`Meta ${name}: falha na comunicação.`);
  }
  return false;
}

const siteOrigins = new Set(['https://www.lopessignature.com.br', 'https://lopessignature.com.br']);
const attribution = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_id', 'utm_term', 'utm_content',
  'gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid'];

export function signaturePage(value: unknown): string {
  if (typeof value !== 'string' || value.length > 3500) return '';
  try {
    const source = new URL(value);
    if (!siteOrigins.has(source.origin) || /^\/(admin|previa)(\/|$)/.test(source.pathname)) return '';
    const clean = new URL(source.origin);
    clean.pathname = source.pathname;
    for (const key of attribution) {
      const item = source.searchParams.get(key);
      if (item) clean.searchParams.set(key, item.slice(0, 200));
    }
    return clean.href;
  } catch {
    return '';
  }
}
