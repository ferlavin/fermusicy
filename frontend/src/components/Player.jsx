import { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

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
  }, [currentSong, isPlaying]); // 🔑 solo cuando cambia la canción

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
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />
      
      <div className="max-w-screen-xl mx-auto">
        {/* Info de la canción */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-4 flex-1">
            <img
              src={currentSong.cover}
              alt={currentSong.title}
              className="w-14 h-14 rounded"
            />
            <div className="min-w-0">
              <h3 className="text-white font-semibold truncate">{currentSong.title}</h3>
              <p className="text-gray-400 text-sm truncate">{currentSong.artist}</p>
            </div>
          </div>

          {/* Controles */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onPrev}
              className="text-gray-400 hover:text-white"
            >
              <SkipBack size={20} />
            </button>
            
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-green-500 text-white rounded-full p-2 hover:bg-green-600"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            
            <button
              onClick={onNext}
              className="text-gray-400 hover:text-white"
            >
              <SkipForward size={20} />
            </button>
          </div>

          {/* Control de volumen */}
          <div className="flex items-center space-x-2 ml-4">
            <Volume2 size={16} className="text-gray-400" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume * 100}
              onChange={handleVolumeChange}
              className="w-20"
            />
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400 w-10">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="flex-1"
          />
          <span className="text-xs text-gray-400 w-10">{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}