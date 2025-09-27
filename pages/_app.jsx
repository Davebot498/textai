import React from 'react';
import Head from 'next/head';
import '../styles/globals.css';

/**
 * Root App component for Texti AI
 * 
 * This component wraps all pages and provides global functionality
 * including global styles and meta tags.
 */
function TextiAIApp({ Component, pageProps }) {

  return (
    <>
      <Head>
        {/* Basic Meta Tags */}
        <title>{process.env.NEXT_PUBLIC_SITE_TITLE || 'Texti AI - Turn Stories Into Voices'}</title>
        <meta name="description" content="Transform your text into natural, expressive speech with AI-powered voices. Choose from multiple languages, accents, and atmospheric backgrounds." />
        <meta name="keywords" content="text to speech, TTS, AI voices, speech synthesis, audio generation, ElevenLabs" />
        <meta name="author" content="Texti AI" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        
        {/* Open Graph Meta Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Texti AI - Turn Stories Into Voices" />
        <meta property="og:description" content="Transform your text into natural, expressive speech with AI-powered voices." />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:url" content="https://texti-ai.vercel.app" />
        <meta property="og:site_name" content="Texti AI" />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Texti AI - Turn Stories Into Voices" />
        <meta name="twitter:description" content="Transform your text into natural, expressive speech with AI-powered voices." />
        <meta name="twitter:image" content="/og-image.png" />
        
        {/* Theme Color */}
        <meta name="theme-color" content="#ff6a00" />
        <meta name="msapplication-TileColor" content="#ff6a00" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.elevenlabs.io" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Texti AI",
              "description": "Transform your text into natural, expressive speech with AI-powered voices",
              "url": "https://texti-ai.vercel.app",
              "applicationCategory": "MultimediaApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "creator": {
                "@type": "Organization",
                "name": "Texti AI"
              }
            })
          }}
        />
        
        {/* Security Headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
      </Head>

      {/* Global App Content */}
      <div className="min-h-screen bg-bg-base font-inter">
        {/* Main App Component */}
        <Component {...pageProps} />
      </div>

      {/* Global Scripts */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Prevent FOUC (Flash of Unstyled Content)
            document.documentElement.style.visibility = 'visible';
            
            // Basic error tracking
            window.addEventListener('error', function(e) {
              console.error('Global error:', e.error);
              // In production, send to error tracking service
            });
            
            // Service worker registration for PWA (optional)
            if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
              navigator.serviceWorker.register('/sw.js').catch(console.error);
            }
          `
        }}
      />
    </>
  );
}

export default TextiAIApp;

/**
 * Global error boundary component (optional enhancement)
 * Uncomment and use if you want to catch React errors globally
 */
/*
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React error boundary caught an error:', error, errorInfo);
    // Log to error tracking service in production
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg-base flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-headline-white mb-4">
              Something went wrong
            </h1>
            <p className="text-muted-text mb-6">
              We're sorry, but something unexpected happened. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
*/