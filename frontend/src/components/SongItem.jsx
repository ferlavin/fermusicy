import { Play, Pause, Trash2 } from 'lucide-react';
import { useState } from 'react';

function SongItem({ song, onClick, isActive, onDelete }) {
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation(); // Evitar que se reproduzca la canción al eliminar
    
    if (!window.confirm(`¿Estás seguro de eliminar "${song.title}"?`)) {
      return;
    }

    setDeleting(true);
    
    try {
      const response = await fetch(`http://localhost:3000/api/songs/${song.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        if (onDelete) {
          onDelete(song.id);
        }
      } else {
        alert('Error al eliminar la canción');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar la canción');
    } finally {
      setDeleting(false);
    }
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