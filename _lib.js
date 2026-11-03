import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

export const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

export function cors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') { res.status(204).end(); return true; }
  return false;
}
const mac = (p) => crypto.createHmac('sha256', process.env.JWT_SECRET).update(p).digest('base64url');
export const sign = () => { const p = Buffer.from(JSON.stringify({ exp: Date.now() + 12 * 36e5 })).toString('base64url'); return p + '.' + mac(p); };
export function authed(req) {
  const [p, s] = (req.headers.authorization || '').replace('Bearer ', '').split('.');
  if (!p || !s) return false;
  const e = mac(p);
  if (s.length !== e.length || !crypto.timingSafeEqual(Buffer.from(s), Buffer.from(e))) return false;
  try { return JSON.parse(Buffer.from(p, 'base64url')).exp > Date.now(); } catch { return false; }
}
export const same = (a, b) => { const h = (x) => crypto.createHash('sha256').update(String(x)).digest(); return crypto.timingSafeEqual(h(a), h(b)); };
export const must = (r) => { if (r.error) throw new Error(r.error.message); return r; };
