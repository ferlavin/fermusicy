import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Navbar';
import Player from './components/Player';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Upload from './pages/Upload';
import Messages from './pages/Messages';
import Playlists from './pages/Playlists';
import PlaylistDetail from './pages/PlaylistDetail';
import { API_URL } from './config';
import './App.css';

function App() {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [songs, setSongs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState('off');

  const handleSongSelect = (song) => {
    const index = songs.findIndex(s => s._id === song._id || s.id === song.id);
    setCurrentIndex(index >= 0 ? index : 0);
    setCurrentSong(song);
    setIsPlaying(true);
  };

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

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh', 
        background: '#121212',
        overflow: 'hidden'
      }}>
        <Navbar />
        
        <main 
          className={currentSong ? 'with-player' : ''} 
          style={{ 
            flex: 1, 
            background: '#121212',
            overflow: 'auto',
            paddingBottom: currentSong ? '100px' : '0'
          }}
        >
          <Routes>
            <Route 
              path="/" 
              element={
                <Home 
                  setCurrentSong={handleSongSelect}
                  setIsPlaying={setIsPlaying}
                  currentSong={currentSong}
                  songs={songs}
                  setSongs={setSongs}
                />
              } 
            />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route 
              path="/playlists/:id" 
              element={
                <PlaylistDetail 
                  setCurrentSong={handleSongSelect}
                  setIsPlaying={setIsPlaying}
                  currentSong={currentSong}
                />
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {currentSong && (
          <Player 
            currentSong={currentSong}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            onNext={handleNext}
            onPrev={handlePrevious}
          />
        )}       

        <Footer />
      </div>
    </Router>
  );
}

export default App;