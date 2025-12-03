import express from 'express';
import pool from '../config/database.js';
import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware para verificar token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Obtener todas las playlists del usuario
router.get('/', verifyToken, async (req, res) => {
  try {
    const [playlists] = await pool.query(
      'SELECT * FROM playlists WHERE usuario_id = ? ORDER BY fecha_creacion DESC',
      [req.userId]
    );

    // Obtener cantidad de canciones por playlist
    for (let playlist of playlists) {
      const [count] = await pool.query(
        'SELECT COUNT(*) as total FROM playlist_canciones WHERE playlist_id = ?',
        [playlist.id]
      );
      playlist.total_canciones = count[0].total;
    }

    res.json(playlists);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener playlists' });
  }
});

// Obtener una playlist con sus canciones
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const [playlists] = await pool.query(
      'SELECT * FROM playlists WHERE id = ? AND usuario_id = ?',
      [req.params.id, req.userId]
    );

    if (playlists.length === 0) {
      return res.status(404).json({ error: 'Playlist no encontrada' });
    }

    const playlist = playlists[0];

    // Obtener canciones de la playlist
    const [playlistSongs] = await pool.query(
      'SELECT cancion_id, orden FROM playlist_canciones WHERE playlist_id = ? ORDER BY orden',
      [req.params.id]
    );

    // Leer songs.json para obtener info completa de las canciones
    const songsPath = path.join(__dirname, '../data/songs.json');
    const data = await fs.readFile(songsPath, 'utf-8');
    const allSongs = JSON.parse(data);

    // Mapear las canciones con su info completa
    const songs = playlistSongs
      .map(ps => {
        const song = allSongs.find(s => s.id === ps.cancion_id);
        return song ? { ...song, orden: ps.orden } : null;
      })
      .filter(s => s !== null);

    playlist.canciones = songs;

    res.json(playlist);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener playlist' });
  }
});

// Crear nueva playlist
router.post('/', verifyToken, async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    const [result] = await pool.query(
      'INSERT INTO playlists (nombre, descripcion, usuario_id) VALUES (?, ?, ?)',
      [nombre, descripcion || '', req.userId]
    );

    res.json({
      success: true,
      message: 'Playlist creada exitosamente',
      playlist: {
        id: result.insertId,
        nombre,
        descripcion,
        usuario_id: req.userId
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al crear playlist' });
  }
});

// Agregar canción a playlist
router.post('/:id/songs', verifyToken, async (req, res) => {
  try {
    const { cancionId } = req.body;

    // Verificar que la playlist pertenece al usuario
    const [playlists] = await pool.query(
      'SELECT * FROM playlists WHERE id = ? AND usuario_id = ?',
      [req.params.id, req.userId]
    );

    if (playlists.length === 0) {
      return res.status(404).json({ error: 'Playlist no encontrada' });
    }

    // Verificar si la canción ya está en la playlist
    const [existing] = await pool.query(
      'SELECT * FROM playlist_canciones WHERE playlist_id = ? AND cancion_id = ?',
      [req.params.id, cancionId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'La canción ya está en la playlist' });
    }

    // Obtener el orden máximo actual
    const [maxOrder] = await pool.query(
      'SELECT MAX(orden) as maxOrden FROM playlist_canciones WHERE playlist_id = ?',
      [req.params.id]
    );

    const newOrder = (maxOrder[0].maxOrden || 0) + 1;

    await pool.query(
      'INSERT INTO playlist_canciones (playlist_id, cancion_id, orden) VALUES (?, ?, ?)',
      [req.params.id, cancionId, newOrder]
    );

    res.json({
      success: true,
      message: 'Canción agregada a la playlist'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al agregar canción' });
  }
});

// Eliminar canción de playlist
router.delete('/:id/songs/:cancionId', verifyToken, async (req, res) => {
  try {
    // Verificar que la playlist pertenece al usuario
    const [playlists] = await pool.query(
      'SELECT * FROM playlists WHERE id = ? AND usuario_id = ?',
      [req.params.id, req.userId]
    );

    if (playlists.length === 0) {
      return res.status(404).json({ error: 'Playlist no encontrada' });
    }

    await pool.query(
      'DELETE FROM playlist_canciones WHERE playlist_id = ? AND cancion_id = ?',
      [req.params.id, req.params.cancionId]
    );

    res.json({
      success: true,
      message: 'Canción eliminada de la playlist'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al eliminar canción' });
  }
});

// Eliminar playlist
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const [playlists] = await pool.query(
      'SELECT * FROM playlists WHERE id = ? AND usuario_id = ?',
      [req.params.id, req.userId]
    );

    if (playlists.length === 0) {
      return res.status(404).json({ error: 'Playlist no encontrada' });
    }

    await pool.query('DELETE FROM playlists WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Playlist eliminada'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al eliminar playlist' });
  }
});

export default router;