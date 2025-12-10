import { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import './Player.css';

export default function Player({ 
  currentSong, 
  isPlaying, 
  setIsPlaying, 
  onNext, 
  onPrevious, 
  hasNext, 
  hasPrevious
}) {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  // Cargar y reproducir cuando cambia la canción o isPlaying
  useEffect(() => {
    if (audioRef.current && currentSong) {
      // Usar el proxy de Vercel en lugar de la URL directa
      const proxyUrl = `/api/audio?file=${encodeURIComponent(currentSong.file)}`;
      audioRef.current.src = proxyUrl;
      
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error('Error al reproducir:', error.message);
          setIsPlaying(false);
        });
      }
    }
  }, [currentSong]); // 🔑 solo cuando cambia la canción

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const handleEnded = () => {
    onNext();
  };

  const handleSeek = (e) => {
    const newTime = (e.target.value / 100) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value / 100;
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentSong) return null;

  const progress = (currentTime / duration) * 100 || 0;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#181818',
      borderTop: '1px solid #282828',
      padding: '1rem 2rem',
      zIndex: 1000
    }}>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '0.5rem'
      }}>
        <img 
          src={currentSong.cover} 
          alt={currentSong.title}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '4px'
          }}
        />
        
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
            {currentSong.title}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#b3b3b3' }}>
            {currentSong.artist}
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center'
        }}>
          <button 
            onClick={onPrevious}
            disabled={!hasPrevious}
            style={{
              ...controlButton,
              opacity: hasPrevious ? 1 : 0.3,
              cursor: hasPrevious ? 'pointer' : 'not-allowed'
            }}
          >
            <SkipBack size={20} />
          </button>
          
          <button 
            onClick={togglePlayPause}
            style={{
              ...controlButton,
              background: '#1DB954',
              width: '40px',
              height: '40px'
            }}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          
          <button 
            onClick={onNext}
            disabled={!hasNext}
            style={{
              ...controlButton,
              opacity: hasNext ? 1 : 0.3,
              cursor: hasNext ? 'pointer' : 'not-allowed'
            }}
          >
            <SkipForward size={20} />
          </button>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          width: '150px'
        }}>
          <Volume2 size={20} />
          <input
            type="range"
            min="0"
            max="100"
            value={volume * 100}
            onChange={handleVolumeChange}
            style={sliderStyle}
          />
        </div>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <span style={{ fontSize: '0.75rem', color: '#b3b3b3', minWidth: '40px' }}>
          {formatTime(currentTime)}
        </span>
        
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSeek}
          style={{ ...sliderStyle, flex: 1 }}
        />
        
        <span style={{ fontSize: '0.75rem', color: '#b3b3b3', minWidth: '40px' }}>
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}

const controlButton = {
  background: 'transparent',
  border: 'none',
  color: 'white',
  cursor: 'pointer',
  padding: '0.5rem',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s'
};

const sliderStyle = {
  width: '100%',
  cursor: 'pointer',
  accentColor: '#1DB954'
};