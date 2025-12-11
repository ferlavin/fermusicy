import { useState } from 'react';
import { Upload as UploadIcon, Music } from 'lucide-react';

function Upload() {
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    coverUrl: '',
    audioFile: null
  });
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'audio/mpeg' && file.type !== 'audio/mp3') {
        setError('Solo se permiten archivos MP3');
        return;
      }
      setFormData({ ...formData, audioFile: file });
      setError('');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.audioFile) {
      setError('Por favor seleccioná un archivo MP3');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Leer el archivo como base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const audioData = event.target.result;
        
        // Obtener canciones existentes del localStorage
        const storedSongs = JSON.parse(localStorage.getItem('userSongs') || '[]');
        
        // Crear nueva canción
        const newSong = {
          id: Date.now(),
          title: formData.title,
          artist: formData.artist,
          duration: '0:00',
          file: audioData, // base64 del audio
          cover: formData.coverUrl || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300',
          isLocal: true // marca para identificar canciones locales
        };
        
        // Agregar a la lista
        storedSongs.push(newSong);
        
        // Guardar en localStorage
        localStorage.setItem('userSongs', JSON.stringify(storedSongs));
        
        setSuccess(true);
        setFormData({
          title: '',
          artist: '',
          coverUrl: '',
          audioFile: null
        });
        document.getElementById('audioFile').value = '';
        
        // Recargar la página para mostrar la nueva canción
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      };
      
      reader.readAsDataURL(formData.audioFile);
    } catch (error) {
      setError('Error al guardar la canción');
      console.error('Error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '3rem 2rem'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <Music size={48} style={{ color: '#1DB954', margin: '0 auto' }} />
        <h1 style={{ fontSize: '2.5rem', marginTop: '1rem', marginBottom: '0.5rem' }}>
          Subir Canción
        </h1>
        <p style={{ color: '#b3b3b3', fontSize: '1.1rem' }}>
          Agregá tu música a Fermusic
        </p>
      </div>

      {success && (
        <div style={{
          background: '#1DB954',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          ¡Canción subida exitosamente! 🎉
        </div>
      )}

      {error && (
        <div style={{
          background: '#f44336',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{
        background: '#181818',
        padding: '2rem',
        borderRadius: '8px'
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem',
            color: '#b3b3b3' 
          }}>
            Archivo MP3 *
          </label>
          <input
            type="file"
            id="audioFile"
            accept="audio/mp3,audio/mpeg"
            onChange={handleFileChange}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#282828',
              border: '1px solid #404040',
              borderRadius: '4px',
              color: 'white',
              fontSize: '1rem'
            }}
          />
          {formData.audioFile && (
            <p style={{ 
              color: '#1DB954', 
              fontSize: '0.875rem', 
              marginTop: '0.5rem' 
            }}>
              ✓ {formData.audioFile.name}
            </p>
          )}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem',
            color: '#b3b3b3' 
          }}>
            Título de la canción *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Ej: Mi canción favorita"
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#282828',
              border: '1px solid #404040',
              borderRadius: '4px',
              color: 'white',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem',
            color: '#b3b3b3' 
          }}>
            Artista *
          </label>
          <input
            type="text"
            name="artist"
            value={formData.artist}
            onChange={handleChange}
            required
            placeholder="Ej: Nombre del artista"
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#282828',
              border: '1px solid #404040',
              borderRadius: '4px',
              color: 'white',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem',
            color: '#b3b3b3' 
          }}>
            URL de la portada (opcional)
          </label>
          <input
            type="url"
            name="coverUrl"
            value={formData.coverUrl}
            onChange={handleChange}
            placeholder="https://ejemplo.com/imagen.jpg"
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#282828',
              border: '1px solid #404040',
              borderRadius: '4px',
              color: 'white',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={uploading}
          style={{
            background: uploading ? '#666' : '#1DB954',
            color: 'white',
            border: 'none',
            padding: '0.75rem 2rem',
            borderRadius: '24px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: uploading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            width: '100%',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
        >
          <UploadIcon size={18} />
          {uploading ? 'Subiendo...' : 'Subir canción'}
        </button>
      </form>
    </div>
  );
}

export default Upload;