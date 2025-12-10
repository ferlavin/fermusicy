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
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 h-24">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />
      
      <div className="h-full px-4 flex items-center justify-between">
        {/* Izquierda - Info de la canción */}
        <div className="flex items-center w-1/3">
          <img
            src={currentSong.cover}
            alt={currentSong.title}
            className="w-14 h-14 rounded"
          />
          <div className="ml-3">
            <h3 className="text-white font-semibold text-sm">{currentSong.title}</h3>
            <p className="text-gray-400 text-xs">{currentSong.artist}</p>
          </div>
        </div>

        {/* Centro - Controles y barra */}
        <div className="flex flex-col items-center w-2/5 max-w-3xl">
          {/* Botones de control */}
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={onPrev}
              className="text-gray-400 hover:text-white transition"
            >
              <SkipBack size={20} />
            </button>
            
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-white text-black rounded-full p-2 hover:scale-105 transition"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
            </button>
            
            <button
              onClick={onNext}
              className="text-gray-400 hover:text-white transition"
            >
              <SkipForward size={20} />
            </button>
          </div>

          {/* Barra de progreso */}
          <div className="flex items-center gap-2 w-full">
            <span className="text-xs text-gray-400 min-w-[40px] text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="flex-1"
            />
            <span className="text-xs text-gray-400 min-w-[40px]">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Derecha - Control de volumen */}
        <div className="flex items-center justify-end gap-2 w-1/3">
          <Volume2 className="text-gray-400" size={20} />
          <input
            type="range"
            min="0"
            max="100"
            value={volume * 100}
            onChange={handleVolumeChange}
            className="w-24"
          />
        </div>
      </div>
    </div>
  );
}