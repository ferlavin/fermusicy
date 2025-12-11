import app from '../server.js';

// Catch-all serverless function so /api/* routes hit Express
export default function handler(req, res) {
	req.url = req.url.startsWith('/api') ? req.url : `/api${req.url}`;
	return app(req, res);
}
