export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // En Vercel serverless no podemos guardar archivos permanentemente
    // Esta es una implementación de ejemplo que acepta el upload
    // Para persistencia real necesitarías Vercel Blob Storage o similar
    
    return res.status(200).json({ 
      success: true, 
      message: 'Canción recibida. Nota: En Vercel serverless los archivos no persisten. Para guardar permanentemente, sube los archivos al repositorio de GitHub en backend/public/ y actualiza backend/data/songs.json'
    });
  } catch (error) {
    console.error('Error en upload:', error);
    return res.status(500).json({ error: error.message });
  }
}
