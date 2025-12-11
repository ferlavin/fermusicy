import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import songsRoutes from './routes/songs.js';
import contactRoutes from './routes/contact.js';
import uploadRoutes from './routes/upload.js';
import authRoutes from './routes/auth.js';
import playlistsRoutes from './routes/playlists.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Obtener __dirname en módulos ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde public
app.use('/music', express.static(path.join(__dirname, 'public')));

// Las rutas sin /api porque Vercel ya pone /api/ en el path
app.use('/songs', songsRoutes);
app.use('/contact', contactRoutes);
app.use('/upload', uploadRoutes);
app.use('/auth', authRoutes);
app.use('/playlists', playlistsRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Mini Spotify API funcionando!' });
});

// Exportar app para serverless (Vercel) y seguir soportando modo standalone
export default app;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🎵 Servidor corriendo en http://localhost:${PORT}`);
  });
}