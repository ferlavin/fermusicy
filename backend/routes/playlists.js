import express from 'express';
import pool from '../config/database.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Usuario fijo (sin autenticación)
const FIXED_USER_ID = 1;

// Obtener todas las playlists
router.get('/', async (req, res) => {
  try {
    const [playlists] = await pool.query(
      'SELECT * FROM playlists WHERE usuario_id = ? ORDER BY fecha_creacion DESC',
      [FIXED_USER_ID]
    );

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
router.get('/:id', async (req, res) => {
  try {
    const [playlists] = await pool.query(
      'SELECT * FROM playlists WHERE id = ? AND usuario_id = ?',
      [req.params.id, FIXED_USER_ID]
    );

    if (playlists.length === 0) {
      return res.status(404).json({ error: 'Playlist no encontrada' });
    }

    const playlist = playlists[0];

    const [playlistSongs] = await pool.query(
      'SELECT cancion_id, orden FROM playlist_canciones WHERE playlist_id = ? ORDER BY orden',
      [req.params.id]
    );

    const songsPath = path.join(__dirname, '../data/songs.json');
    const data = await fs.readFile(songsPath, 'utf-8');
    const allSongs = JSON.parse(data);

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
router.post('/', async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    const [result] = await pool.query(
      'INSERT INTO playlists (nombre, descripcion, usuario_id) VALUES (?, ?, ?)',
      [nombre, descripcion || '', FIXED_USER_ID]
    );

    res.json({
      success: true,
      message: 'Playlist creada exitosamente',
      playlist: {
        id: result.insertId,
        nombre,
        descripcion,
        usuario_id: FIXED_USER_ID
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al crear playlist' });
  }
});

// Agregar canción a playlist
router.post('/:id/songs', async (req, res) => {
  try {
    const playlistId = Number(req.params.id);
    const cancionId = Number(req.body.cancionId);
    if (!Number.isFinite(playlistId) || !Number.isFinite(cancionId)) {
      return res.status(400).json({ error: 'IDs inválidos' });
    }

    const [playlists] = await pool.query(
      'SELECT * FROM playlists WHERE id = ? AND usuario_id = ?',
      [playlistId, FIXED_USER_ID]
    );
    if (playlists.length === 0) {
      return res.status(404).json({ error: 'Playlist no encontrada' });
    }

    // Verifica que la canción exista en songs.json
    const songsPath = path.join(__dirname, '../data/songs.json');
    const allSongs = JSON.parse(await fs.readFile(songsPath, 'utf-8'));
    if (!allSongs.find(s => s.id === cancionId)) {
      return res.status(404).json({ error: 'Canción no encontrada' });
    }

    const [existing] = await pool.query(
      'SELECT * FROM playlist_canciones WHERE playlist_id = ? AND cancion_id = ?',
      [playlistId, cancionId]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'La canción ya está en la playlist' });
    }

    const [maxOrder] = await pool.query(
      'SELECT MAX(orden) as maxOrden FROM playlist_canciones WHERE playlist_id = ?',
      [playlistId]
    );
    const newOrder = (maxOrder[0].maxOrden || 0) + 1;

    await pool.query(
      'INSERT INTO playlist_canciones (playlist_id, cancion_id, orden) VALUES (?, ?, ?)',
      [playlistId, cancionId, newOrder]
    );

    res.json({ success: true, message: 'Canción agregada a la playlist' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al agregar canción' });
  }
});

// Eliminar canción de playlist
router.delete('/:id/songs/:cancionId', async (req, res) => {
  try {
    const [playlists] = await pool.query(
      'SELECT * FROM playlists WHERE id = ? AND usuario_id = ?',
      [req.params.id, FIXED_USER_ID]
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

// Eliminar playlist (deja solo una definición)
router.delete('/:id', async (req, res) => {
  try {
    const [playlists] = await pool.query(
      'SELECT * FROM playlists WHERE id = ? AND usuario_id = ?',
      [req.params.id, FIXED_USER_ID]
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

async function addSongToPlaylist(playlistId, songId) {
  await fetch(`http://localhost:3000/api/playlists/${playlistId}/songs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cancionId: songId })
  });
}

export default router;