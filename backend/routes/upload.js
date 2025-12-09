import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Crear carpeta public si no existe
const publicPath = path.join(__dirname, '../public');
if (!fs.existsSync(publicPath)) {
  fs.mkdirSync(publicPath, { recursive: true });
}

// Configurar multer para guardar archivos en backend/public
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, publicPath);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/mp3') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos MP3'));
    }
  }
});

router.post('/', upload.single('audioFile'), (req, res) => {
  try {
    const { title, artist, coverUrl } = req.body;
    const audioFile = req.file;

    if (!audioFile) {
      return res.status(400).json({ error: 'No se recibió archivo de audio' });
    }

    if (!title || !artist) {
      return res.status(400).json({ error: 'Título y artista son requeridos' });
    }

    // Leer songs.json
    const songsPath = path.join(__dirname, '../data/songs.json');
    let songs = [];
    
    if (fs.existsSync(songsPath)) {
      const data = fs.readFileSync(songsPath, 'utf-8');
      songs = JSON.parse(data);
    }

    // Crear nueva canción
    const newSong = {
      id: songs.length > 0 ? Math.max(...songs.map(s => s.id)) + 1 : 1,
      title: title,
      artist: artist,
      duration: '0:00',
      file: `/music/${audioFile.filename}`,
      cover: coverUrl || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300'
    };

    // Agregar a la lista
    songs.push(newSong);

    // Guardar en songs.json
    fs.writeFileSync(songsPath, JSON.stringify(songs, null, 2));

    res.json({ 
      success: true, 
      message: 'Canción subida exitosamente',
      song: newSong
    });

  } catch (error) {
    console.error('Error al subir canción:', error);
    res.status(500).json({ error: error.message || 'Error al subir la canción' });
  }
});

router.get('/', (_req, res) => {
  res.json({ ok: true, message: 'Upload API activa (usa POST para subir audio)' });
});

export default router;