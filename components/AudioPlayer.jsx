// AudioPlayer.jsx
import React, { useRef, useState } from 'react';

const AudioPlayer = ({ audioSrc }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="audio-player">
      <audio ref={audioRef} src={audioSrc} preload="auto" />
      <button onClick={togglePlayPause} className="play-pause-button">
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <span className="audio-file-path">{audioSrc}</span>
    </div>
  );
};

export default AudioPlayer;