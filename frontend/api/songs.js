export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = 'https://raw.githubusercontent.com/ferlavin/fermusicy/main/backend/data/songs.json';
  
  try {
    const upstream = await fetch(url, { 
      headers: { 'User-Agent': 'fermusicy' },
      cache: 'no-store'
    });
    
    if (!upstream.ok) {
      console.error('Upstream error:', upstream.status);
      return res.status(upstream.status).json({ error: 'upstream error' });
    }
    
    const data = await upstream.json();
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(data);
  } catch (err) {
    console.error('Fetch failed:', err);
    return res.status(500).json({ error: 'fetch failed', message: err.message });
  }
}