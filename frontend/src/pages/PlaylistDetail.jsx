import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    setLoading(true);
    const stored = JSON.parse(localStorage.getItem('userPlaylists') || '[]');
    const found = stored.find(p => String(p.id) === String(id));
    if (!found) {
      setError('Playlist no encontrada');
    } else {
      setPlaylist(found);
      setSongs(found.canciones || []);
    }
    setLoading(false);
  };

  const handlePlay = (song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const handleRemoveSong = (songId) => {
    const updatedPlaylists = JSON.parse(localStorage.getItem('userPlaylists') || '[]');
    const idx = updatedPlaylists.findIndex(p => String(p.id) === String(id));
    if (idx === -1) return;
    updatedPlaylists[idx].canciones = (updatedPlaylists[idx].canciones || []).filter(s => s.id !== songId);
    localStorage.setItem('userPlaylists', JSON.stringify(updatedPlaylists));
    setSongs(updatedPlaylists[idx].canciones || []);
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