import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const songsPath = path.join(__dirname, '../data/songs.json');

// GET todas las canciones
router.get('/', (req, res) => {
  try {
    const songs = JSON.parse(fs.readFileSync(songsPath, 'utf8'));
    
    // Agregar la URL completa a cada canción
    const songsWithUrls = songs.map(song => ({
      ...song,
      url: `http://localhost:3000${song.file}` // ← IMPORTANTE
    }));
    
    res.json(songsWithUrls);
  } catch (error) {
    res.status(500).json({ error: 'Error al leer canciones' });
  }
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  if (!fs.existsSync(songsPath)) return res.status(404).json({ error: 'songs.json no existe' });

  const data = JSON.parse(fs.readFileSync(songsPath, 'utf-8'));
  const idx = data.findIndex(s => s.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Canción no encontrada' });

  const [removed] = data.splice(idx, 1);
  fs.writeFileSync(songsPath, JSON.stringify(data, null, 2));

  // Borra el archivo físico si está en /music
  if (removed.file && removed.file.startsWith('/music/')) {
    const filePath = path.join(__dirname, '../public', path.basename(removed.file));
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) { console.warn('No se pudo borrar el archivo:', e.message); }
    }
  }

  res.json({ success: true, removed });
});

export default router;