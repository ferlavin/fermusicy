export default async function handler(req, res) {
  const { file } = req.query;
  
  if (!file) {
    return res.status(400).json({ error: 'No file specified' });
  }

  const audioUrl = `https://raw.githubusercontent.com/ferlavin/fermusicy/main/backend/public${file}`;
  
  try {
    const upstream = await fetch(audioUrl);
    if (!upstream.ok) {
      return res.status(404).json({ error: 'File not found' });
    }

    const arrayBuffer = await upstream.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 's-maxage=31536000');
    res.setHeader('Accept-Ranges', 'bytes');
    
    return res.send(buffer);
  } catch (err) {
    return res.status(500).json({ error: 'Fetch failed' });
  }
}