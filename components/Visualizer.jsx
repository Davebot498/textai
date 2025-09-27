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

  // Enhanced Particle class for better audio visualization
  class Particle {
    constructor(x, y, index) {
      this.x = x;
      this.y = y;
      this.baseY = y;
      this.index = index;
      this.amplitude = 0;
      this.frequency = 0.015 + (index * 0.0008);
      this.phase = index * 0.08;
      this.size = Math.random() * 4 + 2;
      this.opacity = Math.random() * 0.9 + 0.3;
      this.color = this.getColor();
      this.velocityY = 0;
      this.targetY = y;
      this.energy = 0;
    }

    getColor() {
      const colors = [
        'rgba(255, 106, 0, 0.9)',   // Bright Orange
        'rgba(255, 140, 0, 0.8)',   // Light orange
        'rgba(255, 69, 0, 0.7)',    // Red orange
        'rgba(255, 165, 0, 0.6)',   // Orange
        'rgba(138, 43, 226, 0.5)',  // Purple
        'rgba(75, 0, 130, 0.4)',    // Indigo
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    }

    update(time, audioData = null) {
      if (audioData && this.index < audioData.length) {
        // Enhanced audio reactivity
        const frequency = audioData[this.index] / 255;
        const bassBoost = this.index < audioData.length * 0.1 ? 1.5 : 1;
        this.energy = frequency * bassBoost;
        this.amplitude = this.energy * 120 + Math.sin(time * 0.003) * 20;
        
        // Dynamic size based on audio energy
        this.size = Math.max(1, (this.energy * 8) + 2);
        this.opacity = Math.min(1, 0.3 + (this.energy * 0.7));
      } else {
        // Enhanced idle breathing animation
        this.energy = 0.3;
        this.amplitude = Math.sin(time * 0.0008 + this.phase) * 25 + 
                        Math.sin(time * 0.0015 + this.phase * 1.5) * 15 +
                        Math.sin(time * 0.0025 + this.phase * 0.5) * 8;
        this.size = 2 + Math.sin(time * 0.002 + this.phase) * 1;
        this.opacity = 0.4 + Math.sin(time * 0.001 + this.phase) * 0.2;
      }

      // Smooth wave motion with physics
      this.targetY = this.baseY + 
                     Math.sin(time * this.frequency + this.phase) * this.amplitude +
                     Math.sin(time * 0.0012 + this.phase * 2) * 20;
      
      // Smooth interpolation for natural movement
      this.velocityY += (this.targetY - this.y) * 0.02;
      this.velocityY *= 0.85; // Damping
      this.y += this.velocityY;
      
      // Enhanced horizontal drift with bounds checking
      const driftAmount = Math.sin(time * 0.0008 + this.phase) * 0.8 + 
                         Math.sin(time * 0.0003 + this.phase * 3) * 0.3;
      this.x += driftAmount;
      
      // Smooth bounds wrapping
      if (this.x < -20) this.x = dimensions.width + 20;
      if (this.x > dimensions.width + 20) this.x = -20;
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      
      // Enhanced glow effect based on energy
      const glowIntensity = Math.max(10, this.energy * 40);
      ctx.shadowBlur = glowIntensity;
      ctx.shadowColor = this.color;
      
      // Draw main particle
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw inner bright core
      if (this.energy > 0.5) {
        ctx.shadowBlur = 5;
        ctx.fillStyle = `rgba(255, 255, 255, ${this.energy * 0.3})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    }
  }

  // Initialize particles with better distribution
  const initializeParticles = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const particleCount = Math.min(150, Math.floor(canvas.width / 6)); // Better density control
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
      const x = (i / particleCount) * canvas.width;
      const y = canvas.height / 2 + (Math.random() - 0.5) * 100; // Add some vertical spread
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
        analyserRef.current.fftSize = 512; // Better frequency resolution
        analyserRef.current.smoothingTimeConstant = 0.8; // More responsive
        
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

    // Clear canvas with dynamic background based on audio
    const bgAlpha = isPlaying ? 0.05 : 0.08;
    ctx.fillStyle = `rgba(11, 11, 13, ${bgAlpha})`;
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

    // Draw enhanced connecting lines with dynamic opacity
    ctx.save();
    ctx.lineWidth = 1;
    
    for (let i = 0; i < particlesRef.current.length - 1; i++) {
      const current = particlesRef.current[i];
      const next = particlesRef.current[i + 1];
      const distance = Math.abs(current.x - next.x);
      
      if (distance < 120) {
        const avgEnergy = (current.energy + next.energy) / 2;
        const opacity = Math.max(0.05, avgEnergy * 0.3);
        const gradient = ctx.createLinearGradient(current.x, current.y, next.x, next.y);
        gradient.addColorStop(0, `rgba(255, 106, 0, ${opacity})`);
        gradient.addColorStop(0.5, `rgba(255, 140, 0, ${opacity * 1.2})`);
        gradient.addColorStop(1, `rgba(255, 106, 0, ${opacity})`);
        
        ctx.strokeStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(current.x, current.y);
        ctx.lineTo(next.x, next.y);
        ctx.stroke();
      }
    }
    
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