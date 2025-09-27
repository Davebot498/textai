import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import NavBar from '../components/NavBar';
import Hero from '../components/Hero';
import VoiceModal from '../components/VoiceModal';
import { useToast, ToastContainer } from '../components/Toast';
import { voiceConfig } from '../lib/voiceMap';

/**
 * Main landing page for Texti AI
 * 
 * This is the primary entry point that showcases the TTS functionality
 * and provides access to the voice generation modal.
 */
export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [voices, setVoices] = useState(voiceConfig);
  const [isLoading, setIsLoading] = useState(false);
  
  const { showSuccess, showError, showWarning, toasts, removeToast } = useToast();

  // Atmosphere options for the modal
  const atmospheres = [
    {
      id: 'none',
      name: 'None',
      description: 'Clean voice only',
      file: null,
    },
    {
      id: 'rain',
      name: 'Rain',
      description: 'Gentle rain sounds',
      file: '/atmospheres/rain.mp3',
    },
    {
      id: 'cafe',
      name: 'Cafe Ambience',
      description: 'Cozy coffee shop atmosphere',
      file: '/atmospheres/cafe.mp3',
    },
    {
      id: 'pad',
      name: 'Soft Synth Pad',
      description: 'Ambient electronic background',
      file: '/atmospheres/pad.mp3',
    },
  ];

  // Handle opening the Get Started modal
  const handleGetStarted = () => {
    setIsModalOpen(true);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Preload atmosphere files for better UX
  useEffect(() => {
    const preloadAudio = async () => {
      const audioFiles = atmospheres
        .filter(atm => atm.file)
        .map(atm => atm.file);

      audioFiles.forEach(file => {
        const audio = new Audio(file);
        audio.preload = 'metadata';
        // Don't await - just start preloading
        audio.load();
      });
    };

    preloadAudio();
  }, []);

  // Check if API is configured on component mount
  useEffect(() => {
    const checkConfiguration = async () => {
      try {
        // Test API endpoint with minimal request
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: 'test',
            voiceName: 'Dave',
            language: 'en',
          }),
        });

        if (response.status === 500) {
          const data = await response.json();
          if (data.message?.includes('ELEVEN_KEY')) {
            showWarning('TTS service not configured. Please set up your ElevenLabs API key.');
          }
        }
      } catch (error) {
        // Silently handle - don't show error for connectivity issues
        console.log('Configuration check failed:', error.message);
      }
    };

    // Only check in development or if user tries to use the service
    if (process.env.NODE_ENV === 'development') {
      setTimeout(checkConfiguration, 2000); // Delay to avoid showing warning immediately
    }
  }, [showWarning]);

  return (
    <>
      <Head>
        <title>Texti AI - Turn Stories Into Voices | AI-Powered Text-to-Speech</title>
        <meta 
          name="description" 
          content="Transform your text into natural, expressive speech with Texti AI. Choose from multiple languages including English, Pidgin, and Yoruba. Add atmospheric backgrounds and download instantly." 
        />
        <meta 
          name="keywords" 
          content="text to speech, AI voices, speech synthesis, multilingual TTS, Nigerian voices, Pidgin TTS, Yoruba TTS, ElevenLabs" 
        />
        
        {/* Additional page-specific meta tags */}
        <meta property="og:title" content="Texti AI - Turn Stories Into Voices" />
        <meta property="og:description" content="Transform your text into natural, expressive speech with AI-powered voices in multiple languages." />
        <link rel="canonical" href="https://texti-ai.vercel.app" />
      </Head>

      {/* Page Layout */}
      <div className="min-h-screen bg-dark-blend">
        {/* Navigation */}
        <NavBar />

        {/* Main Content */}
        <main className="relative">
          {/* Hero Section */}
          <Hero onGetStarted={handleGetStarted} />

          {/* Features Section (Optional - for future enhancement) */}
          <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-headline-white mb-4">
                  Why Choose <span className="text-accent-orange">Texti AI</span>?
                </h2>
                <p className="text-muted-text text-lg max-w-2xl mx-auto">
                  Experience the power of AI-driven speech synthesis with features designed for creators, storytellers, and content producers.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {/* Feature 1 */}
                <div className="glass-effect rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-accent-orange rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-headline-white mb-2">Natural Voices</h3>
                  <p className="text-muted-text">
                    AI-powered voices that sound natural and expressive, perfect for any content type.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="glass-effect rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-accent-orange rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-headline-white mb-2">Multiple Languages</h3>
                  <p className="text-muted-text">
                    Support for English, Nigerian Pidgin, and Yoruba with authentic accents and pronunciation.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="glass-effect rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-accent-orange rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-headline-white mb-2">Atmospheric Audio</h3>
                  <p className="text-muted-text">
                    Add ambient backgrounds like rain, cafe sounds, or synth pads to enhance your audio.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing Section Placeholder */}
          <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900 bg-opacity-50">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold text-headline-white mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-muted-text text-lg mb-8">
                Pay only for what you use. No subscriptions, no hidden fees.
              </p>
              
              <div className="glass-effect rounded-2xl p-8 max-w-md mx-auto">
                <h3 className="text-2xl font-bold text-headline-white mb-4">Pay Per Use</h3>
                <div className="text-4xl font-bold text-accent-orange mb-2">
                  $0.30<span className="text-lg text-muted-text">/1K chars</span>
                </div>
                <p className="text-muted-text mb-6">
                  Approximately $0.30 per 1,000 characters converted to speech
                </p>
                <ul className="text-left text-muted-text space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent-orange rounded-full"></div>
                    No monthly fees
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent-orange rounded-full"></div>
                    Instant downloads
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent-orange rounded-full"></div>
                    Commercial usage rights
                  </li>
                </ul>
                <button 
                  onClick={handleGetStarted}
                  className="btn-primary w-full"
                >
                  Get Started Now
                </button>
              </div>
            </div>
          </section>

          {/* About Section Placeholder */}
          <section id="about" className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold text-headline-white mb-8">
                About Texti AI
              </h2>
              <p className="text-muted-text text-lg leading-relaxed">
                Texti AI is powered by cutting-edge artificial intelligence to transform your written content 
                into natural, expressive speech. We specialize in multilingual support, bringing authentic 
                voices to English, Nigerian Pidgin, and Yoruba content. Whether you're creating audiobooks, 
                educational content, or accessibility features, Texti AI delivers professional-quality 
                results instantly.
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 bg-opacity-80 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-headline-white mb-4">
                Texti <span className="text-accent-orange">AI</span>
              </h3>
              <p className="text-muted-text mb-6">
                Turn Stories Into Voices
              </p>
              <div className="flex justify-center space-x-6 text-sm text-muted-text">
                <a href="#" className="hover:text-accent-orange transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-accent-orange transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-accent-orange transition-colors">Contact</a>
              </div>
              <div className="mt-8 pt-8 border-t border-gray-700 text-center text-muted-text text-sm">
                © {new Date().getFullYear()} Texti AI. All rights reserved.
              </div>
            </div>
          </div>
        </footer>

        {/* Voice Modal */}
        <VoiceModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          voices={voices}
          atmospheres={atmospheres}
        />

        {/* Toast Notifications */}
        <ToastContainer 
          toasts={toasts} 
          onRemoveToast={removeToast}
        />
      </div>
    </>
  );
}