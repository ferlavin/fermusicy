export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { file } = req.query;
  
  if (!file) {
    return res.status(400).json({ error: 'No file specified' });
  }

  // file viene como "/music/archivo.mp3"
  // Pero los archivos están en backend/public/ directamente
  // Entonces quitamos "/music" y usamos solo el nombre del archivo
  const fileName = file.replace('/music/', '');
  const audioUrl = `https://raw.githubusercontent.com/ferlavin/fermusicy/main/backend/public/${fileName}`;
  
  try {
    const upstream = await fetch(audioUrl, { cache: 'no-store' });
    if (!upstream.ok) {
      console.error('Audio not found:', audioUrl);
      return res.status(404).json({ error: 'File not found' });
    }

    const arrayBuffer = await upstream.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 's-maxage=31536000');
    res.setHeader('Accept-Ranges', 'bytes');
    
    return res.send(buffer);
  } catch (err) {
    console.error('Audio fetch error:', err);
    return res.status(500).json({ error: err.message });
  }
}