import { db, cors } from './_lib.js';
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).end();
  const id = Number(req.body?.id) || null;
  const kind = String(req.body?.k || '').slice(0, 30);
  await db.from('clicks').insert({ product_id: id, kind });
  res.status(204).end();
}
