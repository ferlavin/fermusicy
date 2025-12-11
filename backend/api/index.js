import app from '../server.js';

// Vercel serverless entry point - strip /api prefix before passing to Express
export default function handler(req, res) {
  // Vercel calls with /api/songs, Express expects /songs
  req.url = req.url.replace(/^\/api/, '') || '/';
  return app(req, res);
}
