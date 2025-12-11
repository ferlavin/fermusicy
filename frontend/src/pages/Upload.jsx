import { Music, Github } from 'lucide-react';

function Upload() {
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

      <div style={{
        background: '#181818',
        padding: '2rem',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <Github size={64} style={{ color: '#1DB954', margin: '0 auto 1rem' }} />
        
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
          Subí tus canciones al repositorio
        </h2>
        
        <p style={{ color: '#b3b3b3', marginBottom: '1.5rem', lineHeight: '1.6' }}>
          Para agregar nuevas canciones a Fermusic:
        </p>

        <ol style={{ 
          color: '#b3b3b3', 
          textAlign: 'left', 
          lineHeight: '1.8',
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          <li>Subí tu archivo MP3 a <code style={{ 
            background: '#282828', 
            padding: '2px 6px', 
            borderRadius: '4px',
            color: '#1DB954'
          }}>backend/public/</code></li>
          <li>Agregá los datos de la canción a <code style={{ 
            background: '#282828', 
            padding: '2px 6px', 
            borderRadius: '4px',
            color: '#1DB954'
          }}>backend/data/songs.json</code></li>
          <li>Hacé commit y push a GitHub</li>
          <li>¡Listo! La canción aparecerá automáticamente</li>
        </ol>

        <a 
          href="https://github.com/ferlavin/fermusicy" 
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: '#1DB954',
            color: 'white',
            border: 'none',
            padding: '0.75rem 2rem',
            borderRadius: '24px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '2rem',
            textDecoration: 'none',
            transition: 'transform 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Github size={18} />
          Ir al Repositorio
        </a>
      </div>
    </div>
  );
}

export default Upload;