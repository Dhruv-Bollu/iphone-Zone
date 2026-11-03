import { db, cors, authed, must } from './_lib.js';
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!authed(req)) return res.status(401).json({ error: 'Unauthorised' });
  try {
    if (req.method === 'GET') {
      if (req.query.stats) {
        const { data } = must(await db.from('clicks').select('product_id').order('id', { ascending: false }).limit(5000));
        const m = {};
        (data || []).forEach((c) => { if (c.product_id) m[c.product_id] = (m[c.product_id] || 0) + 1; });
        return res.json({ total: (data || []).length, top: Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 6) });
      }
      const [s, p, r] = await Promise.all([
        db.from('settings').select('value').eq('key', 'site').maybeSingle(),
        db.from('products').select('data').order('id'),
        db.from('reviews').select('data').order('id'),
      ]);
      must(s); must(p); must(r);
      return res.json({ cfg: s.data?.value || {}, products: p.data.map((x) => x.data), reviews: r.data.map((x) => x.data) });
    }
    if (req.method === 'POST' && req.body?.action === 'save') {
      const { cfg, products, reviews } = req.body;
      if (!cfg || !Array.isArray(products) || !Array.isArray(reviews) || products.length > 500 || reviews.length > 200) return res.status(400).json({ error: 'Invalid data' });
      if (products.some((p) => typeof p.id !== 'number' || typeof p.name !== 'string' || !Array.isArray(p.v))) return res.status(400).json({ error: 'Invalid product' });
      const { pw, ...safeCfg } = cfg; // never store a password in the database
      must(await db.from('settings').upsert({ key: 'site', value: safeCfg }));
      if (products.length) must(await db.from('products').upsert(products.map((p) => ({ id: p.id, data: p, updated_at: new Date().toISOString() }))));
      const ids = products.map((p) => p.id);
      const ex = must(await db.from('products').select('id')).data || [];
      const gone = ex.map((x) => x.id).filter((i) => !ids.includes(i));
      if (gone.length) must(await db.from('products').delete().in('id', gone));
      must(await db.from('reviews').delete().gte('id', 0));
      if (reviews.length) must(await db.from('reviews').insert(reviews.map((r) => ({ data: r }))));
      return res.json({ ok: true });
    }
    res.status(400).json({ error: 'Bad request' });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
}
