import { Play, Pause, Trash2, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';

function SongItem({ song, onClick, isActive, onDelete, onAddedToPlaylist }) {
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    // Carga playlists desde localStorage
    const stored = JSON.parse(localStorage.getItem('userPlaylists') || '[]');
    setPlaylists(stored);
  }, []);

  const handleAddToPlaylist = async (playlistId, e) => {
    e.stopPropagation();
    setAdding(true);
    const stored = JSON.parse(localStorage.getItem('userPlaylists') || '[]');
    const idx = stored.findIndex(p => String(p.id) === String(playlistId));
    if (idx === -1) {
      alert('Playlist no encontrada');
      setAdding(false);
      return;
    }

    const canciones = stored[idx].canciones || [];
    const exists = canciones.some(c => c.id === song.id);
    if (!exists) {
      canciones.push(song);
      stored[idx].canciones = canciones;
      localStorage.setItem('userPlaylists', JSON.stringify(stored));
      setPlaylists(stored);
      if (onAddedToPlaylist) onAddedToPlaylist();
    }
    setShowPicker(false);
    setAdding(false);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!song.isLocal) {
      alert('Solo podés eliminar canciones locales.');
      return;
    }
    if (!window.confirm(`¿Estás seguro de eliminar "${song.title}"?`)) return;
    setDeleting(true);
    if (onDelete) onDelete(song.id);
    setDeleting(false);
  };

  return (
    <div 
      onClick={() => onClick(song)}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
      style={{
        background: '#181818',
        padding: '1rem',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.3s',
        border: isActive ? '2px solid #1DB954' : '2px solid transparent',
        position: 'relative'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = '#282828';
        e.currentTarget.style.transform = 'translateY(-4px)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = '#181818';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Botón eliminar */}
      {showDelete && !deleting && (
        <button
          onClick={handleDelete}
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            background: '#f44336',
            border: 'none',
            borderRadius: '50%',
            padding: '0.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#d32f2f';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#f44336';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <Trash2 size={16} color="white" />
        </button>
      )}

      {deleting && (
        <div style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          color: '#f44336',
          fontSize: '0.75rem',
          fontWeight: 'bold'
        }}>
          Eliminando...
        </div>
      )}

      {/* Botón agregar a playlist */}
      <button
        onClick={(e) => { e.stopPropagation(); setShowPicker(!showPicker); }}
        style={{
          position: 'absolute',
          top: '0.5rem',
          left: '0.5rem',
          background: '#1DB954',
          border: 'none',
          borderRadius: '50%',
          padding: '0.5rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10
        }}
        title="Agregar a playlist"
      >
        <Plus size={16} color="white" />
      </button>

      {showPicker && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: '2.5rem',
            left: '0.5rem',
            background: '#121212',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '0.5rem',
            zIndex: 20,
            minWidth: '180px'
          }}
        >
          <div style={{ color: '#b3b3b3', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
            Selecciona playlist
          </div>
          <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'grid', gap: '0.35rem' }}>
            {playlists.length === 0 && (
              <div style={{ color: '#777', fontSize: '0.85rem' }}>No hay playlists</div>
            )}
            {playlists.map((pl) => (
              <button
                key={pl.id}
                onClick={(e) => handleAddToPlaylist(pl.id, e)}
                disabled={adding}
                style={{
                  textAlign: 'left',
                  background: '#1e1e1e',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  padding: '0.5rem',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                {pl.nombre}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{
        position: 'relative',
        marginBottom: '1rem'
      }}>
        <img 
          src={song.cover} 
          alt={song.title}
          style={{
            width: '100%',
            aspectRatio: '1',
            objectFit: 'cover',
            borderRadius: '4px'
          }}
        />
        <div style={{
          position: 'absolute',
          bottom: '8px',
          right: '8px',
          background: '#1DB954',
          borderRadius: '50%',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isActive ? '1' : '0',
          transition: 'opacity 0.3s'
        }}>
          {isActive ? <Pause size={20} /> : <Play size={20} />}
        </div>
      </div>
      
      <h3 style={{
        fontSize: '1rem',
        marginBottom: '0.25rem',
        color: 'white',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {song.title}
      </h3>
      
      <p style={{
        fontSize: '0.875rem',
        color: '#b3b3b3'
      }}>
        {song.artist}
      </p>
    </div>
  );
}

export default SongItem;