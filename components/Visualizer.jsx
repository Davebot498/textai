import React, { useRef, useEffect, useState, useCallback } from 'react';

const Visualizer = ({ 
  audioElement = null, 
  isPlaying = false, 
  isEnabled = true, 
  className = "" 
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);
  const particlesRef = useRef([]);
  const timeRef = useRef(0);
  
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  // Particle class for smooth wave animation
  class Particle {
    constructor(x, y, index) {
      this.x = x;
      this.y = y;
      this.baseY = y;
      this.index = index;
      this.amplitude = 0;
      this.frequency = 0.02 + (index * 0.001);
      this.phase = index * 0.1;
      this.size = Math.random() * 3 + 1;
      this.opacity = Math.random() * 0.8 + 0.2;
      this.color = this.getColor();
    }

    getColor() {
      const colors = [
        'rgba(255, 106, 0, 0.8)',   // Orange
        'rgba(255, 140, 0, 0.6)',   // Light orange
        'rgba(138, 43, 226, 0.4)',  // Purple
        'rgba(75, 0, 130, 0.3)',    // Indigo
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    }

    update(time, audioData = null) {
      if (audioData && this.index < audioData.length) {
        // React to audio frequency data
        const frequency = audioData[this.index] / 255;
        this.amplitude = frequency * 100;
      } else {
        // Idle breathing animation
        this.amplitude = Math.sin(time * 0.001 + this.phase) * 20 + 
                        Math.sin(time * 0.002 + this.phase * 2) * 10;
      }

      // Smooth wave motion
      this.y = this.baseY + 
               Math.sin(time * this.frequency + this.phase) * this.amplitude +
               Math.sin(time * 0.001 + this.phase) * 15;
      
      // Subtle horizontal drift
      this.x += Math.sin(time * 0.0005 + this.phase) * 0.5;
      
      // Keep particles within bounds
      if (this.x < 0) this.x = dimensions.width;
      if (this.x > dimensions.width) this.x = 0;
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      
      // Draw particle with glow effect
      ctx.shadowBlur = 20;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    }
  }

  // Initialize particles
  const initializeParticles = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const particleCount = Math.floor(canvas.width / 8); // Responsive particle density
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
      const x = (i / particleCount) * canvas.width;
      const y = canvas.height / 2;
      particles.push(new Particle(x, y, i));
    }
    
    particlesRef.current = particles;
  }, [dimensions]);

  // Setup audio context and analyser
  const setupAudioContext = useCallback(() => {
    if (!audioElement || !isEnabled) return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      if (!sourceRef.current && audioElement) {
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioElement);
        
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256; // Lower for better performance
        analyserRef.current.smoothingTimeConstant = 0.85;
        
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
        
        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);
      }
    } catch (error) {
      console.warn('Audio context setup failed:', error);
    }
  }, [audioElement, isEnabled]);

  // Animation loop
  const animate = useCallback(() => {
    if (!canvasRef.current || !isEnabled) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const time = Date.now();
    timeRef.current = time;

    // Clear canvas with subtle background
    ctx.fillStyle = 'rgba(11, 11, 13, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Get audio data if available
    let audioData = null;
    if (analyserRef.current && isPlaying) {
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      audioData = dataArrayRef.current;
    }

    // Update and draw particles
    particlesRef.current.forEach(particle => {
      particle.update(time, audioData);
      particle.draw(ctx);
    });

    // Draw connecting lines between nearby particles for wave effect
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 106, 0, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    for (let i = 0; i < particlesRef.current.length - 1; i++) {
      const current = particlesRef.current[i];
      const next = particlesRef.current[i + 1];
      const distance = Math.abs(current.x - next.x);
      
      if (distance < 100) {
        ctx.moveTo(current.x, current.y);
        ctx.lineTo(next.x, next.y);
      }
    }
    
    ctx.stroke();
    ctx.restore();

    animationRef.current = requestAnimationFrame(animate);
  }, [isEnabled, isPlaying]);

  // Handle canvas resize
  const handleResize = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const parent = canvas.parentElement;
    
    if (parent) {
      const rect = parent.getBoundingClientRect();
      const newWidth = rect.width;
      const newHeight = rect.height;
      
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      setDimensions({ width: newWidth, height: newHeight });
    }
  }, []);

  // Initialize and setup
  useEffect(() => {
    if (!isEnabled) return;

    handleResize();
    initializeParticles();
    setupAudioContext();
    
    const resizeObserver = new ResizeObserver(handleResize);
    if (canvasRef.current?.parentElement) {
      resizeObserver.observe(canvasRef.current.parentElement);
    }

    return () => {
      resizeObserver.disconnect();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isEnabled, handleResize, initializeParticles, setupAudioContext]);

  // Start/stop animation based on enabled state
  useEffect(() => {
    if (isEnabled && canvasRef.current) {
      animate();
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isEnabled, animate]);

  // Handle audio context resume (required for autoplay policies)
  useEffect(() => {
    if (audioContextRef.current && isPlaying) {
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    }
  }, [isPlaying]);

  if (!isEnabled) {
    return <div className={`${className} bg-gradient-to-br from-gray-800 to-gray-900`} />;
  }

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ mixBlendMode: 'screen' }}
      />
      {/* Overlay for text readability */}
      <div className="visualizer-overlay" />
    </div>
  );
};

export default Visualizer;