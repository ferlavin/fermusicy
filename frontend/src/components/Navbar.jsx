import { Link } from 'react-router-dom';
import { Music } from 'lucide-react';

function Navbar() {
  return (
    <nav style={{
      background: 'rgba(0, 0, 0, 0.9)',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #282828'
    }}>
      <Link to="/" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: '#1DB954',
        textDecoration: 'none',
        fontSize: '1.5rem',
        fontWeight: 'bold'
      }}>
        <Music size={32} />
        <span>Fermusic</span>
      </Link>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <Link to="/" style={linkStyle}>Inicio</Link>
        <Link to="/about" style={linkStyle}>Acerca de</Link>
        <Link to="/contact" style={linkStyle}>Contacto</Link>
        <Link to="/upload" style={linkStyle}>Subir</Link>
        <Link to="/messages" style={linkStyle}>Mensajes</Link>
        <Link to="/playlists" style={linkStyle}>Playlists</Link>
      </div>
    </nav>
  );
}

const linkStyle = {
  color: '#b3b3b3',
  textDecoration: 'none',
  fontSize: '1rem',
  fontWeight: '500',
  transition: 'color 0.3s',
};

export default Navbar;