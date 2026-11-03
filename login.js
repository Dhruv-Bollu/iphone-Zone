import { cors, sign, same } from './_lib.js';
const fails = {}; // best-effort limiter (resets on cold start); add Vercel Firewall rate limits for production
export default function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).end();
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || 'x';
  const f = fails[ip] || { n: 0, t: 0 };
  if (f.n >= 5 && Date.now() - f.t < 15 * 60e3) return res.status(429).json({ error: 'Too many attempts. Try again later.' });
  const { id, password } = req.body || {};
  const ok = typeof id === 'string' && typeof password === 'string' && process.env.ADMIN_ID && process.env.ADMIN_PASSWORD
    && same(id, process.env.ADMIN_ID) && same(password, process.env.ADMIN_PASSWORD);
  if (ok) { delete fails[ip]; return res.json({ token: sign() }); }
  fails[ip] = { n: f.n + 1, t: Date.now() };
  res.status(401).json({ error: 'Wrong ID or password' });
}
