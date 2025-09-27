import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, User } from 'lucide-react';

const VoiceCard = ({ 
  voice, 
  isSelected, 
  onSelect, 
  onTest,
  isLoading = false,
  className = "" 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef(null);

  const handlePlaySample = async (e) => {
    e.stopPropagation(); // Prevent card selection when clicking play
    
    if (isPlaying) {
      // Stop current audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      }
      return;
    }

    try {
      setAudioError(false);
      
      // If we have a sample URL, play it directly
      if (voice.sampleUrl) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        
        const audio = new Audio(voice.sampleUrl);
        audioRef.current = audio;
        
        audio.onplay = () => setIsPlaying(true);
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => {
          setAudioError(true);
          setIsPlaying(false);
        };
        
        await audio.play();
      } else if (onTest) {
        // Use the test function to generate sample
        setIsPlaying(true);
        await onTest(voice.id, voice.sampleText || `Hello, this is ${voice.name}`);
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error playing sample:', error);
      setAudioError(true);
      setIsPlaying(false);
    }
  };

  const getVoiceIcon = () => {
    if (voice.gender === 'male') {
      return <User className="text-blue-400" size={20} />;
    } else if (voice.gender === 'female') {
      return <User className="text-pink-400" size={20} />;
    }
    return <User className="text-gray-400" size={20} />;
  };

  const getAccentBadge = () => {
    const accentColors = {
      'american': 'bg-blue-500',
      'british': 'bg-red-500',
      'australian': 'bg-green-500',
      'nigerian': 'bg-green-600',
      'south-african': 'bg-yellow-500',
      'default': 'bg-gray-500'
    };
    
    const color = accentColors[voice.accent?.toLowerCase()] || accentColors.default;
    
    return (
      <span className={`inline-block px-2 py-1 text-xs rounded-full text-white ${color}`}>
        {voice.accent || 'Standard'}
      </span>
    );
  };

  return (
    <div
      onClick={onSelect}
      className={`
        voice-card
        ${isSelected ? 'selected' : ''}
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {getVoiceIcon()}
          <div>
            <h3 className="font-semibold text-white text-lg">{voice.name}</h3>
            <p className="text-muted-text text-sm">{voice.description}</p>
          </div>
        </div>
        
        <button
          onClick={handlePlaySample}
          disabled={isLoading}
          className={`
            p-2 rounded-full transition-all duration-300
            ${isPlaying 
              ? 'bg-accent-orange text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }
            ${isLoading ? 'cursor-not-allowed opacity-50' : 'hover:scale-105'}
            ${audioError ? 'bg-red-600' : ''}
          `}
          aria-label={isPlaying ? 'Stop sample' : 'Play sample'}
        >
          {isLoading ? (
            <div className="spinner w-4 h-4" />
          ) : audioError ? (
            <Volume2 size={16} className="text-red-200" />
          ) : isPlaying ? (
            <Pause size={16} />
          ) : (
            <Play size={16} />
          )}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getAccentBadge()}
          {voice.language && (
            <span className="text-xs text-muted-text">
              {voice.language}
            </span>
          )}
        </div>
        
        {voice.premium && (
          <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-1 rounded-full font-semibold">
            Premium
          </span>
        )}
      </div>

      {voice.tags && voice.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {voice.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
          {voice.tags.length > 3 && (
            <span className="text-xs text-muted-text">
              +{voice.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {isSelected && (
        <div className="mt-3 pt-3 border-t border-gray-600">
          <div className="flex items-center gap-2 text-accent-orange text-sm">
            <div className="w-2 h-2 bg-accent-orange rounded-full animate-pulse" />
            Selected Voice
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceCard;