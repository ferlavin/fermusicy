import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import './PlaylistDetail.css';

function PlaylistDetail({ setCurrentSong, setIsPlaying, currentSong }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlaylistDetails();
  }, [id]);

  const fetchPlaylistDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/playlists/${id}`);
      if (!response.ok) throw new Error('Error al cargar la playlist');
      const data = await response.json();
      setPlaylist(data);
      setSongs(data.canciones || []); // <- usa 'canciones' que viene del backend
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const handleRemoveSong = async (songId) => {
    try {
      const response = await fetch(`${API_URL}/playlists/${id}/songs/${songId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error al eliminar la canción');
      fetchPlaylistDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="playlist-detail-container">
        <p>Cargando playlist...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="playlist-detail-container">
        <p className="error">{error}</p>
        <button onClick={() => navigate('/playlists')}>Volver a Playlists</button>
      </div>
    );
  }

  return (
    <div className="playlist-detail-container">
      <button className="back-button" onClick={() => navigate('/playlists')}>
        ← Volver a Playlists
      </button>

      {playlist && (
        <>
          <div className="playlist-header">
            <h1>{playlist.nombre}</h1>
            {playlist.descripcion && <p>{playlist.descripcion}</p>}
            <p className="song-count">{songs.length} canciones</p>
          </div>

          {songs.length === 0 ? (
            <p className="no-songs">Esta playlist está vacía</p>
          ) : (
            <div className="songs-list">
              {songs.map((song, index) => (
                <div 
                  key={song.id}
                  className={`song-item ${currentSong?.id === song.id ? 'playing' : ''}`}
                >
                  <span className="song-number">{index + 1}</span>
                  <div className="song-info">
                    <h3>{song.title}</h3>
                    <p>{song.artist}</p>
                  </div>
                  <div className="song-actions">
                    <button 
                      onClick={() => handlePlay(song)}
                      className="play-button"
                    >
                      {currentSong?.id === song.id ? '⏸' : '▶'}
                    </button>
                    <button 
                      onClick={() => handleRemoveSong(song.id)}
                      className="remove-button"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PlaylistDetail;