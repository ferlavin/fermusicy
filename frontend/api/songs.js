export default async function handler(req, res) {
  const url = 'https://raw.githubusercontent.com/ferlavin/fermusicy/main/backend/data/songs.json';
  try {
    const upstream = await fetch(url, { headers: { 'User-Agent': 'fermusicy' } });
    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: 'upstream error' });
    }
    const data = await upstream.json();
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'fetch failed' });
  }
}