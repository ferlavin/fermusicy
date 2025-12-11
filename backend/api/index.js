import app from '../server.js';

// Vercel serverless entry point. Re-agrega el prefijo /api para que
// las rutas definidas con app.use('/api/...') coincidan.
export default function handler(req, res) {
	req.url = req.url.startsWith('/api') ? req.url : `/api${req.url}`;
	return app(req, res);
}
