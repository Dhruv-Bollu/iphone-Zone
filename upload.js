import { db, cors, authed } from './_lib.js';
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).end();
  if (!authed(req)) return res.status(401).json({ error: 'Unauthorised' });
  const m = /^data:image\/(jpeg|png|webp);base64,(.+)$/.exec(req.body?.dataUrl || '');
  if (!m) return res.status(400).json({ error: 'Invalid image' });
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > 3e6) return res.status(413).json({ error: 'Image too large' });
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${m[1] === 'jpeg' ? 'jpg' : m[1]}`;
  const { error } = await db.storage.from('product-images').upload(path, buf, { contentType: 'image/' + m[1] });
  if (error) return res.status(500).json({ error: 'Upload failed' });
  res.json({ url: db.storage.from('product-images').getPublicUrl(path).data.publicUrl });
}
