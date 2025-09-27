import React, { useState, useRef, useEffect } from 'react';
import { Play, ArrowRight, Volume2, Mic, Music, Radio, Pause } from 'lucide-react';
import Visualizer from './Visualizer';

const Hero = ({ onGetStarted }) => {
  const [visualizerEnabled, setVisualizerEnabled] = useState(true);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const audioRef = useRef(null);

  // Floating icon data
  const floatingIcons = [
    { Icon: Volume2, position: 'top-20 left-10', delay: '0s', size: 20 },
    { Icon: Radio, position: 'top-32 right-16', delay: '1s', size: 24 },
    { Icon: Mic, position: 'bottom-40 left-20', delay: '2s', size: 18 },
    { Icon: Music, position: 'bottom-20 right-12', delay: '0.5s', size: 22 },
    { Icon: Volume2, position: 'top-1/2 left-4', delay: '1.5s', size: 16 },
    { Icon: Radio, position: 'top-1/3 right-8', delay: '2.5s', size: 20 },
  ];

  const handleTryDemo = async () => {
    if (isPlaying && audioRef.current) {
      // Stop current audio
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentAudio(null);
      return;
    }

    setIsDemoLoading(true);
    try {
      // Generate demo audio using the TTS API
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: "Welcome to Texti AI, where your stories come alive through the power of artificial intelligence and natural speech synthesis.",
          voiceName: 'Dave',
          language: 'en',
          atmosphere: 'none'
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Create and play audio
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        setCurrentAudio(audio);
        
        audio.onplay = () => setIsPlaying(true);
        audio.onended = () => {
          setIsPlaying(false);
          setCurrentAudio(null);
          URL.revokeObjectURL(audioUrl);
        };
        audio.onerror = () => {
          setIsPlaying(false);
          setCurrentAudio(null);
          URL.revokeObjectURL(audioUrl);
          // Fallback to opening modal if audio fails
          onGetStarted();
        };
        
        await audio.play();
      } else {
        // If API fails, open the modal instead
        onGetStarted();
      }
    } catch (error) {
      console.error('Demo audio failed:', error);
      // Fallback to opening modal
      onGetStarted();
    } finally {
      setIsDemoLoading(false);
    }
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Visualizer */}
      {visualizerEnabled && (
        <Visualizer
          audioElement={currentAudio}
          isPlaying={isPlaying}
          isEnabled={visualizerEnabled}
          className="absolute inset-0 w-full h-full"
        />
      )}

      {/* Floating Icons - Hidden on mobile for cleaner look */}
      <div className="hidden md:block">
        {floatingIcons.map((item, index) => (
          <div
            key={index}
            className={`floating-icon ${item.position}`}
            style={{
              animationDelay: item.delay,
              opacity: 0.15,
            }}
          >
            <item.Icon size={item.size} />
          </div>
        ))}
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Mobile-First Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[calc(100vh-10rem)]">
          
          {/* Left Column - Hero Content */}
          <div className="lg:col-span-7 text-center lg:text-left order-2 lg:order-1">
            <div className="space-y-6 md:space-y-8">
              
              {/* Main Headline - Responsive Typography */}
              <div className="space-y-4 md:space-y-6">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.1] tracking-tight">
                  <span className="block">Turn</span>
                  <span className="block hero-gradient-text">Stories</span>
                  <span className="block">Into Voices</span>
                </h1>
                
                <p className="text-lg sm:text-xl md:text-2xl lg:text-xl text-muted-text leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Transform your text into natural, expressive speech with AI-powered voices. 
                  Choose from multiple languages, accents, and atmospheric backgrounds.
                </p>
              </div>

              {/* Feature Highlights - Responsive Layout */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-6 text-sm sm:text-base">
                <div className="flex items-center gap-2 bg-gray-800 bg-opacity-50 px-3 py-2 rounded-full">
                  <div className="w-2 h-2 bg-accent-orange rounded-full animate-pulse" />
                  <span className="text-muted-text">Multiple Languages</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-800 bg-opacity-50 px-3 py-2 rounded-full">
                  <div className="w-2 h-2 bg-accent-orange rounded-full animate-pulse" style={{animationDelay: '0.5s'}} />
                  <span className="text-muted-text">Natural Voices</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-800 bg-opacity-50 px-3 py-2 rounded-full">
                  <div className="w-2 h-2 bg-accent-orange rounded-full animate-pulse" style={{animationDelay: '1s'}} />
                  <span className="text-muted-text">Instant Download</span>
                </div>
              </div>

              {/* CTA Buttons - Responsive Stacking */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                <button
                  onClick={onGetStarted}
                  className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 group text-lg px-8 py-4"
                >
                  Get Started
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                </button>
                
                <button
                  onClick={handleTryDemo}
                  disabled={isDemoLoading}
                  className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2 text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDemoLoading ? (
                    <>
                      <div className="spinner w-5 h-5" />
                      Loading...
                    </>
                  ) : isPlaying ? (
                    <>
                      <Pause size={20} />
                      Stop Demo
                    </>
                  ) : (
                    <>
                      <Play size={20} />
                      Try it out
                    </>
                  )}
                </button>
              </div>

              {/* Stats - Responsive Grid */}
              <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center lg:text-left pt-4 md:pt-8">
                <div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-headline-white">10K+</div>
                  <div className="text-muted-text text-xs sm:text-sm">Voices Generated</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-headline-white">3</div>
                  <div className="text-muted-text text-xs sm:text-sm">Languages</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-headline-white">99%</div>
                  <div className="text-muted-text text-xs sm:text-sm">Satisfaction</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Demo Preview Card */}
          <div className="lg:col-span-5 order-1 lg:order-2">
            <div className="relative max-w-md mx-auto lg:max-w-none">
              
              {/* Main Demo Card */}
              <div className="glass-effect rounded-2xl p-6 border border-gray-700 shadow-2xl">
                <div className="space-y-6">
                  
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Quick Preview</h3>
                    <button
                      onClick={() => setVisualizerEnabled(!visualizerEnabled)}
                      className="text-xs text-muted-text hover:text-accent-orange transition-colors duration-300 bg-gray-800 px-3 py-1 rounded-full"
                      title={visualizerEnabled ? 'Disable visualizer' : 'Enable visualizer'}
                    >
                      {visualizerEnabled ? '🎵 Effects ON' : '🔇 Effects OFF'}
                    </button>
                  </div>
                  
                  {/* Sample Text Display */}
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                    <p className="text-white text-sm leading-relaxed">
                      "Welcome to Texti AI, where your stories come alive through the power of artificial intelligence and natural speech synthesis."
                    </p>
                  </div>
                  
                  {/* Voice Info and Play Button */}
                  <div className="flex items-center justify-between bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-br from-accent-orange to-orange-600 rounded-full flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`}>
                        <Volume2 size={18} className="text-white" />
                      </div>
                      <div>
                        <div className="text-white font-medium">Dave</div>
                        <div className="text-muted-text text-xs">English • American</div>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleTryDemo}
                      disabled={isDemoLoading}
                      className={`p-3 rounded-full transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                        isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-accent-orange hover:bg-orange-600'
                      }`}
                      aria-label={isPlaying ? "Stop demo" : "Play demo"}
                    >
                      {isDemoLoading ? (
                        <div className="spinner w-5 h-5" />
                      ) : isPlaying ? (
                        <Pause size={18} className="text-white" />
                      ) : (
                        <Play size={18} className="text-white" />
                      )}
                    </button>
                  </div>

                  {/* Audio Visualization Indicator */}
                  {isPlaying && (
                    <div className="flex items-center justify-center space-x-1 py-2">
                      <div className="w-1 h-4 bg-accent-orange rounded-full animate-pulse"></div>
                      <div className="w-1 h-6 bg-accent-orange rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-1 h-8 bg-accent-orange rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                      <div className="w-1 h-6 bg-accent-orange rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
                      <div className="w-1 h-4 bg-accent-orange rounded-full animate-pulse" style={{animationDelay: '0.8s'}}></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-accent-orange to-transparent rounded-full opacity-20 animate-float" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-purple-500 to-transparent rounded-full opacity-20 animate-float" style={{ animationDelay: '1s' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator - Hidden on mobile */}
      <div className="hidden lg:block absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-muted-text rounded-full flex justify-center opacity-60">
          <div className="w-1 h-3 bg-muted-text rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;