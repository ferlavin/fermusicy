export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Esta es una función placeholder
  // Los mensajes se guardarán en localStorage del frontend
  res.json({ 
    success: true,
    message: 'Endpoint de contacto - los mensajes se guardan en localStorage'
  });
}
