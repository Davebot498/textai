import React, { useState } from 'react';
import { Play, ArrowRight, Volume2, Mic, Music, Radio } from 'lucide-react';
import Visualizer from './Visualizer';

const Hero = ({ onGetStarted }) => {
  const [visualizerEnabled, setVisualizerEnabled] = useState(true);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Floating icon data
  const floatingIcons = [
    { Icon: Volume2, position: 'top-20 left-10', delay: '0s', size: 20 },
    { Icon: Radio, position: 'top-32 right-16', delay: '1s', size: 24 },
    { Icon: Mic, position: 'bottom-40 left-20', delay: '2s', size: 18 },
    { Icon: Music, position: 'bottom-20 right-12', delay: '0.5s', size: 22 },
    { Icon: Volume2, position: 'top-1/2 left-4', delay: '1.5s', size: 16 },
    { Icon: Radio, position: 'top-1/3 right-8', delay: '2.5s', size: 20 },
  ];

  const handleTryDemo = () => {
    // Demo functionality - could play a sample audio
    console.log('Demo clicked');
  };

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

      {/* Floating Icons */}
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

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-8">
            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="hero-text font-bold leading-tight">
                Turn{' '}
                <span className="hero-gradient-text">
                  Stories
                </span>{' '}
                Into Voices
              </h1>
              
              <p className="subhead-text text-muted-text max-w-2xl mx-auto lg:mx-0">
                Transform your text into natural, expressive speech with AI-powered voices. 
                Choose from multiple languages, accents, and atmospheric backgrounds to create 
                the perfect audio experience.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-muted-text">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent-orange rounded-full" />
                Multiple Languages
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent-orange rounded-full" />
                Natural Voices
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent-orange rounded-full" />
                Instant Download
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={onGetStarted}
                className="btn-primary flex items-center justify-center gap-2 group"
              >
                Get Started
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              
              <button
                onClick={handleTryDemo}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <Play size={16} />
                Try it out
              </button>
            </div>

            {/* Stats or Social Proof */}
            <div className="flex flex-col sm:flex-row gap-8 justify-center lg:justify-start text-center lg:text-left">
              <div>
                <div className="text-2xl font-bold text-headline-white">10K+</div>
                <div className="text-muted-text text-sm">Voices Generated</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-headline-white">3</div>
                <div className="text-muted-text text-sm">Languages</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-headline-white">99%</div>
                <div className="text-muted-text text-sm">Satisfaction</div>
              </div>
            </div>
          </div>

          {/* Right Column - Interactive Demo Area */}
          <div className="relative">
            {/* Demo Card */}
            <div className="glass-effect rounded-2xl p-6 border border-gray-700">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Quick Preview</h3>
                  <button
                    onClick={() => setVisualizerEnabled(!visualizerEnabled)}
                    className="text-muted-text hover:text-accent-orange transition-colors duration-300 text-sm"
                    title={visualizerEnabled ? 'Disable visualizer' : 'Enable visualizer'}
                  >
                    {visualizerEnabled ? 'Disable Effects' : 'Enable Effects'}
                  </button>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4 text-left">
                  <p className="text-white text-sm leading-relaxed">
                    "Welcome to Texti AI, where your stories come alive through the power of artificial intelligence and natural speech synthesis."
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-accent-orange to-orange-600 rounded-full flex items-center justify-center">
                      <Volume2 size={16} className="text-white" />
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">Dave</div>
                      <div className="text-muted-text text-xs">English • American</div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleTryDemo}
                    className="bg-accent-orange hover:bg-orange-600 text-white p-2 rounded-full transition-all duration-300 hover:scale-105"
                    aria-label="Play demo"
                  >
                    <Play size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-accent-orange to-transparent rounded-full opacity-20 animate-pulse" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-purple-500 to-transparent rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-muted-text rounded-full flex justify-center">
          <div className="w-1 h-3 bg-muted-text rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;