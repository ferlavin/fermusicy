import { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import './Player.css';

export default function Player({ 
  currentSong, 
  isPlaying, 
  setIsPlaying, 
  onNext, 
  onPrev 
}) {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    if (audioRef.current && currentSong) {
      const proxyUrl = `/api/audio?file=${encodeURIComponent(currentSong.file)}`;
      audioRef.current.src = proxyUrl;
      
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error('Error al reproducir:', error.message);
          setIsPlaying(false);
        });
      }
    }
  }, [currentSong]);

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

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentSong) return null;

  const progress = (currentTime / duration) * 100 || 0;

  return (
    <div className="player-container">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Barra de progreso en la parte superior */}
      <div className="player-progress-bar">
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSeek}
          className="progress-slider"
        />
      </div>

      {/* Contenido principal del player */}
      <div className="player-content">
        {/* Izquierda - Información de la canción */}
        <div className="player-left">
          <img
            src={currentSong.cover}
            alt={currentSong.title}
            className="player-cover"
          />
          <div className="player-info">
            <h3 className="player-title">{currentSong.title}</h3>
            <p className="player-artist">{currentSong.artist}</p>
          </div>
        </div>

        {/* Centro - Controles */}
        <div className="player-center">
          <div className="player-controls">
            <button className="control-btn" onClick={onPrev}>
              <SkipBack size={20} />
            </button>
            
            <button 
              className="play-btn" 
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            
            <button className="control-btn" onClick={onNext}>
              <SkipForward size={20} />
            </button>
          </div>

          {/* Tiempo y barra de progreso debajo */}
          <div className="player-time-bar">
            <span className="time">{formatTime(currentTime)}</span>
            <div className="time-progress">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleSeek}
                className="time-slider"
              />
            </div>
            <span className="time">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Derecha - Volumen */}
        <div className="player-right">
          <Volume2 size={18} className="volume-icon" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume * 100}
            onChange={handleVolumeChange}
            className="volume-slider"
          />
        </div>
      </div>
    </div>
  );
}