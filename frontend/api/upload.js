export default async function handler(req, res) {
  // Este endpoint solo valida el upload
  // El almacenamiento real se hace en el cliente (localStorage + IndexedDB)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json({ 
    success: true, 
    message: 'Canción guardada localmente'
  });
}
