import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Play, Pause, RotateCcw, Volume2 } from 'lucide-react';
import VoiceCard from './VoiceCard';
import { useToast } from './Toast';

const VoiceModal = ({ isOpen, onClose, voices = [], atmospheres = [] }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [selectedAtmosphere, setSelectedAtmosphere] = useState('none');
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [atmosphereAudio, setAtmosphereAudio] = useState(null);
  
  const audioRef = useRef(null);
  const atmosphereRef = useRef(null);
  const { showSuccess, showError, showWarning } = useToast();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'pidgin', name: 'Pidgin' },
    { code: 'yo', name: 'Yoruba' },
  ];

  const atmosphereOptions = [
    { id: 'none', name: 'None', description: 'Clean voice only' },
    { id: 'rain', name: 'Rain', description: 'Gentle rain sounds' },
    { id: 'cafe', name: 'Cafe Ambience', description: 'Cozy coffee shop atmosphere' },
    { id: 'pad', name: 'Soft Synth Pad', description: 'Ambient electronic background' },
  ];

  const maxChars = 3000;
  const charCount = text.length;
  const estimatedCost = Math.ceil(charCount / 1000) * 0.10; // $0.10 per 1000 chars (approximate)

  // Filter voices by selected language
  const filteredVoices = voices.filter(voice => 
    voice.language === selectedLanguage || voice.languages?.includes(selectedLanguage)
  );

  // Close modal and reset state
  const handleClose = () => {
    setCurrentStep(1);
    setSelectedLanguage('en');
    setSelectedVoice(null);
    setSelectedAtmosphere('none');
    setText('');
    setGeneratedAudio(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.pause();
      atmosphereRef.current.currentTime = 0;
    }
    onClose();
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'Enter' && e.ctrlKey) {
        if (currentStep === 4 && text.trim()) {
          handleGenerate();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep, text]);

  // Test voice with sample text
  const handleTestVoice = async (voiceId, sampleText = null) => {
    if (!selectedVoice) return;
    
    setIsTesting(true);
    try {
      const testText = sampleText || text.slice(0, 100) || `Hello, this is ${selectedVoice.name}`;
      
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: testText,
          voiceName: selectedVoice.name,
          language: selectedLanguage,
          atmosphere: 'none', // No atmosphere for testing
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Play the test audio
      const audio = new Audio(audioUrl);
      audio.play();
      
      showSuccess('Voice test completed!');
    } catch (error) {
      console.error('Error testing voice:', error);
      showError('Failed to test voice. Please try again.');
    } finally {
      setIsTesting(false);
    }
  };

  // Generate full audio
  const handleGenerate = async () => {
    if (!selectedVoice || !text.trim()) return;
    
    if (charCount > maxChars) {
      showWarning(`Text is too long. Maximum ${maxChars} characters allowed.`);
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          voiceName: selectedVoice.name,
          language: selectedLanguage,
          atmosphere: selectedAtmosphere,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      setGeneratedAudio(audioUrl);
      
      // Load atmosphere if selected
      if (selectedAtmosphere !== 'none') {
        const atmosphereFile = `/atmospheres/${selectedAtmosphere}.mp3`;
        setAtmosphereAudio(atmosphereFile);
      }
      
      showSuccess('Audio generated successfully!');
    } catch (error) {
      console.error('Error generating audio:', error);
      showError(error.message || 'Failed to generate audio. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Play/pause generated audio
  const handlePlayPause = () => {
    if (!generatedAudio) return;

    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (atmosphereRef.current) {
        atmosphereRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      if (audioRef.current) {
        audioRef.current.play();
      }
      if (atmosphereRef.current && selectedAtmosphere !== 'none') {
        atmosphereRef.current.play();
      }
      setIsPlaying(true);
    }
  };

  // Download generated audio
  const handleDownload = () => {
    if (!generatedAudio) return;

    const link = document.createElement('a');
    link.href = generatedAudio;
    link.download = `texti-ai-${selectedVoice?.name || 'voice'}-${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showSuccess('Audio download started!');
  };

  // Navigation helpers
  const canGoNext = () => {
    switch (currentStep) {
      case 1: return selectedLanguage;
      case 2: return selectedVoice;
      case 3: return selectedAtmosphere !== null;
      case 4: return text.trim().length > 0;
      default: return false;
    }
  };

  const handleNext = () => {
    if (canGoNext() && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Audio elements */}
      {generatedAudio && (
        <audio
          ref={audioRef}
          src={generatedAudio}
          onEnded={() => setIsPlaying(false)}
          onError={() => showError('Error playing audio')}
        />
      )}
      {atmosphereAudio && selectedAtmosphere !== 'none' && (
        <audio
          ref={atmosphereRef}
          src={atmosphereAudio}
          loop
          volume={0.3}
        />
      )}

      <div className="modal-backdrop" onClick={handleClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-headline-white">Get Started</h2>
              <p className="text-muted-text">Step {currentStep} of 4</p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors duration-200"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-700 rounded-full h-2 mb-8">
            <div
              className="bg-accent-orange h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>

          {/* Step 1: Language Selection */}
          {currentStep === 1 && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Choose Language</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={`
                      p-4 rounded-lg border-2 transition-all duration-300
                      ${selectedLanguage === lang.code
                        ? 'border-accent-orange bg-accent-orange bg-opacity-10'
                        : 'border-gray-600 hover:border-gray-500'
                      }
                    `}
                  >
                    <div className="text-white font-medium">{lang.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Voice Selection */}
          {currentStep === 2 && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Choose Voice</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {filteredVoices.map((voice) => (
                  <VoiceCard
                    key={voice.id}
                    voice={voice}
                    isSelected={selectedVoice?.id === voice.id}
                    onSelect={() => setSelectedVoice(voice)}
                    onTest={handleTestVoice}
                    isLoading={isTesting}
                  />
                ))}
              </div>
              {filteredVoices.length === 0 && (
                <p className="text-muted-text text-center py-8">
                  No voices available for {languages.find(l => l.code === selectedLanguage)?.name}
                </p>
              )}
            </div>
          )}

          {/* Step 3: Atmosphere Selection */}
          {currentStep === 3 && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Choose Atmosphere</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {atmosphereOptions.map((atmosphere) => (
                  <button
                    key={atmosphere.id}
                    onClick={() => setSelectedAtmosphere(atmosphere.id)}
                    className={`
                      p-4 rounded-lg border-2 text-left transition-all duration-300
                      ${selectedAtmosphere === atmosphere.id
                        ? 'border-accent-orange bg-accent-orange bg-opacity-10'
                        : 'border-gray-600 hover:border-gray-500'
                      }
                    `}
                  >
                    <div className="text-white font-medium mb-1">{atmosphere.name}</div>
                    <div className="text-muted-text text-sm">{atmosphere.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Text Input and Generation */}
          {currentStep === 4 && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Enter Your Text</h3>
              
              <div className="space-y-4">
                <div>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter the text you want to convert to speech..."
                    className="textarea-custom h-40"
                    maxLength={maxChars}
                  />
                  <div className="flex justify-between items-center mt-2 text-sm">
                    <span className={`${charCount > maxChars ? 'text-red-400' : 'text-muted-text'}`}>
                      {charCount} / {maxChars} characters
                    </span>
                    <span className="text-muted-text">
                      Estimated cost: ${estimatedCost.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleTestVoice(selectedVoice?.id)}
                    disabled={!text.trim() || isTesting}
                    className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isTesting ? (
                      <>
                        <div className="spinner w-4 h-4" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Volume2 size={16} />
                        Test Voice
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleGenerate}
                    disabled={!text.trim() || isGenerating || charCount > maxChars}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <div className="spinner w-4 h-4" />
                        Generating...
                      </>
                    ) : (
                      <>
                        Generate Audio
                      </>
                    )}
                  </button>
                </div>

                {/* Generated audio controls */}
                {generatedAudio && (
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                    <h4 className="text-white font-medium mb-3">Generated Audio</h4>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handlePlayPause}
                        className="bg-accent-orange hover:bg-orange-600 text-white p-2 rounded-full transition-colors duration-300"
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                      </button>
                      
                      <button
                        onClick={handleDownload}
                        className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full transition-colors duration-300"
                        aria-label="Download audio"
                      >
                        <Download size={16} />
                      </button>
                      
                      <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full transition-colors duration-300 disabled:opacity-50"
                        aria-label="Regenerate audio"
                      >
                        <RotateCcw size={16} />
                      </button>
                      
                      <span className="text-muted-text text-sm ml-auto">
                        Voice: {selectedVoice?.name} | Atmosphere: {atmosphereOptions.find(a => a.id === selectedAtmosphere)?.name}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-700">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center gap-2 text-muted-text hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            
            <div className="text-muted-text text-sm">
              Press <kbd className="bg-gray-700 px-2 py-1 rounded text-xs">Esc</kbd> to close
              {currentStep === 4 && (
                <span className="ml-2">
                  | <kbd className="bg-gray-700 px-2 py-1 rounded text-xs">Ctrl+Enter</kbd> to generate
                </span>
              )}
            </div>
            
            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                disabled={!canGoNext()}
                className="flex items-center gap-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleClose}
                className="btn-secondary"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default VoiceModal;