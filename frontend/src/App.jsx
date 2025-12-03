import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Player from './components/Player';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Upload from './pages/Upload';
import Messages from './pages/Messages';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [songs, setSongs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

  // Verificar autenticación al cargar
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      fetch('http://localhost:3000/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setIsAuthenticated(true);
          setUser(data.user);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  // Cargar canciones
  useEffect(() => {
    if (isAuthenticated) {
      fetch('http://localhost:3000/api/songs')
        .then(res => res.json())
        .then(data => {
          setSongs(data);
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
  }, [isAuthenticated]);

  const handleSongSelect = (song) => {
    const index = songs.findIndex(s => s.id === song.id);
    setCurrentIndex(index);
    setCurrentSong(song);
    setIsPlaying(true);
  };

  // Función para siguiente canción
  const handleNext = () => {
    if (songs.length === 0) return;
    
    let nextIndex;
    
    if (shuffle) {
      do {
        nextIndex = Math.floor(Math.random() * songs.length);
      } while (nextIndex === currentIndex && songs.length > 1);
    } else {
      nextIndex = (currentIndex + 1) % songs.length;
    }
    
    setCurrentIndex(nextIndex);
    setCurrentSong(songs[nextIndex]);
    setIsPlaying(true);
  };

  // Función para canción anterior
  const handlePrevious = () => {
    if (songs.length === 0) return;
    
    let prevIndex;
    
    if (shuffle) {
      do {
        prevIndex = Math.floor(Math.random() * songs.length);
      } while (prevIndex === currentIndex && songs.length > 1);
    } else {
      prevIndex = currentIndex - 1 < 0 ? songs.length - 1 : currentIndex - 1;
    }
    
    setCurrentIndex(prevIndex);
    setCurrentSong(songs[prevIndex]);
    setIsPlaying(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setCurrentSong(null);
    setIsPlaying(false);
    setSongs([]);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '1.5rem'
      }}>
        Cargando...
      </div>
    );
  }

  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {isAuthenticated && <Navbar user={user} onLogout={handleLogout} />}
        
        <main style={{ flex: 1, paddingBottom: currentSong ? '100px' : '0' }}>
          <Routes>
            <Route 
              path="/login" 
              element={
                isAuthenticated ? 
                <Navigate to="/" replace /> : 
                <Login setIsAuthenticated={setIsAuthenticated} setUser={setUser} />
              } 
            />
            <Route 
              path="/register" 
              element={
                isAuthenticated ? 
                <Navigate to="/" replace /> : 
                <Register setIsAuthenticated={setIsAuthenticated} setUser={setUser} />
              } 
            />

            <Route 
              path="/" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Home 
                    setCurrentSong={handleSongSelect}
                    setIsPlaying={setIsPlaying}
                    currentSong={currentSong}
                    songs={songs}
                    setSongs={setSongs}
                  />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/about" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <About />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/contact" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Contact />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/upload" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Upload />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/messages" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Messages />
                </ProtectedRoute>
              } 
            />

            <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
          </Routes>
        </main>

        {currentSong && isAuthenticated && (
          <Player 
            song={currentSong}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            onNext={handleNext}
            onPrevious={handlePrevious}
            hasNext={songs.length > 0}
            hasPrevious={songs.length > 0}
            shuffle={shuffle}
            setShuffle={setShuffle}
            repeat={repeat}
            setRepeat={setRepeat}
          />
        )}       

        {isAuthenticated && <Footer />}
      </div>
    </Router>
  );
}

export default App;