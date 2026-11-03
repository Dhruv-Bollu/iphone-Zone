import { db, cors } from './_lib.js';
export default async function handler(req, res) {
  if (cors(req, res)) return;
  try {
    const [s, p, r] = await Promise.all([
      db.from('settings').select('value').eq('key', 'site').maybeSingle(),
      db.from('products').select('data').order('id'),
      db.from('reviews').select('data').order('id'),
    ]);
    if (s.error || p.error || r.error) throw new Error('db');
    const { name, phone, wa, diw, stale } = s.data?.value || {};
    res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=60');
    res.json({
      cfg: { name, phone, wa, diw, stale },
      products: p.data.map((x) => x.data).filter((x) => x.active !== false),
      reviews: r.data.map((x) => x.data).filter((x) => x.pub !== false),
    });
  } catch { res.status(500).json({ error: 'Could not load data' }); }
}
