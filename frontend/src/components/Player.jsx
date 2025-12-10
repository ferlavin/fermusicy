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
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Barra de progreso */}
      <div className="h-1 bg-gray-700 hover:bg-green-500 cursor-pointer group">
        <div
          className="h-full bg-green-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="px-6 py-4">
        {/* Fila principal: Info + Controles + Volumen */}
        <div className="flex items-center justify-between">
          {/* Info de la canción - Izquierda */}
          <div className="flex items-center w-1/4">
            <img
              src={currentSong.cover}
              alt={currentSong.title}
              className="w-14 h-14 rounded"
            />
            <div className="ml-4 min-w-0">
              <h3 className="text-white font-semibold text-sm truncate">
                {currentSong.title}
              </h3>
              <p className="text-gray-400 text-xs truncate">{currentSong.artist}</p>
            </div>
          </div>

          {/* Controles - Centro */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="flex items-center gap-6">
              <button
                onClick={onPrev}
                className="text-gray-400 hover:text-white transition"
              >
                <SkipBack size={20} fill="currentColor" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-white text-black rounded-full p-3 hover:scale-110 transition w-10 h-10 flex items-center justify-center"
              >
                {isPlaying ? (
                  <Pause size={20} fill="currentColor" />
                ) : (
                  <Play size={20} fill="currentColor" className="ml-0.5" />
                )}
              </button>

              <button
                onClick={onNext}
                className="text-gray-400 hover:text-white transition"
              >
                <SkipForward size={20} fill="currentColor" />
              </button>
            </div>

            {/* Tiempo - Debajo de controles */}
            <div className="flex items-center gap-2 text-xs text-gray-400 w-64">
              <span className="w-10 text-right">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleSeek}
                className="flex-1 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer accent-green-500"
              />
              <span className="w-10">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control de volumen - Derecha */}
          <div className="flex items-center justify-end gap-2 w-1/4">
            <Volume2 size={18} className="text-gray-400" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume * 100}
              onChange={handleVolumeChange}
              className="w-24 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer accent-green-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}