# Texti AI - Turn Stories Into Voices

![Texti AI Logo](https://via.placeholder.com/400x100/ff6a00/ffffff?text=Texti+AI)

A modern, responsive Text-to-Speech web application built with Next.js, powered by ElevenLabs TTS API. Transform your text into natural, expressive speech with multiple languages, voice options, and atmospheric backgrounds.

## 🌟 Features

- **AI-Powered Voices**: Natural, expressive speech synthesis using ElevenLabs
- **Multi-Language Support**: English, Nigerian Pidgin, and Yoruba
- **Atmospheric Audio**: Add ambient backgrounds (rain, cafe, synth pad)
- **Real-time Visualizer**: Canvas-based audio visualization with particle effects
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Instant Download**: Generate and download audio files immediately
- **Usage Tracking**: Built-in analytics and rate limiting
- **Caching System**: Efficient caching for repeated requests

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0 or higher
- ElevenLabs API account and key
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/texti-ai.git
   cd texti-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env.local` file in the root directory:
   ```env
   # ElevenLabs API Configuration (REQUIRED)
   ELEVEN_KEY=your_elevenlabs_api_key_here
   
   # Site Configuration (Optional)
   NEXT_PUBLIC_SITE_TITLE="Texti AI"
   NEXT_PUBLIC_BUYME_URL="https://buymeacoffee.com/textiai"
   ```

   **⚠️ IMPORTANT SECURITY NOTES:**
   - Never commit `.env.local` or `.env` files to version control
   - The `ELEVEN_KEY` is server-only and never exposed to the client
   - Add `.env*` to your `.gitignore` file

4. **Configure Voice IDs**
   
   Open `lib/voiceMap.js` and replace placeholder voice IDs with actual ElevenLabs voice IDs:
   ```javascript
   export const voiceMap = {
     'Dave': 'your_dave_voice_id_here',
     'Chisom': 'your_chisom_voice_id_here', 
     'Alex': 'your_alex_voice_id_here',
   };
   ```

   **To get ElevenLabs voice IDs:**
   - Visit https://elevenlabs.io/voices
   - Select a voice and copy the voice ID from the URL or API documentation
   - Or use the ElevenLabs API: `GET https://api.elevenlabs.io/v1/voices`

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to http://localhost:3000

## 📁 Project Structure

```
texti-ai/
├── components/           # React components
│   ├── NavBar.jsx       # Navigation bar
│   ├── Hero.jsx         # Landing page hero section
│   ├── Visualizer.jsx   # Audio visualization component
│   ├── VoiceModal.jsx   # Voice selection modal
│   ├── VoiceCard.jsx    # Individual voice selection card
│   └── Toast.jsx        # Notification system
├── pages/               # Next.js pages
│   ├── _app.jsx        # App wrapper with global styles
│   ├── index.jsx       # Main landing page
│   ├── api/            # API routes
│   │   └── tts.js      # Text-to-speech API endpoint
│   └── admin/          # Admin pages
│       └── usage.jsx   # Usage analytics dashboard
├── lib/                # Utility libraries
│   └── voiceMap.js     # Voice ID mapping configuration
├── utils/              # Helper utilities
│   ├── cache.js        # Caching system
│   └── usageLogger.js  # Usage tracking and rate limiting
├── styles/             # Styling
│   └── globals.css     # Global styles and Tailwind
├── public/             # Static assets
│   ├── atmospheres/    # Background audio files
│   └── icons/          # SVG icons
└── README.md           # This file
```

## 🎨 Design System

### Color Palette
- **Background Base**: `#0b0b0d`
- **Accent Orange**: `#ff6a00`
- **Headline White**: `#ffffff`
- **Muted Text**: `#bdbdbd`
- **Subtle Glow**: `rgba(255,106,0,0.12)`

### Typography
- **Primary Font**: Inter (Google Fonts)
- **Fallback**: System UI, Sans-serif
- **Hero Text**: 72px (desktop), 56px (tablet), 36px (mobile)

## 🔧 Configuration

### Voice Configuration

Edit `lib/voiceMap.js` to customize available voices:

```javascript
export const voiceConfig = [
  {
    id: 'dave',
    name: 'Dave',
    description: 'Warm and professional male voice',
    gender: 'male',
    accent: 'american',
    language: 'en',
    languages: ['en'],
    premium: false,
    tags: ['professional', 'warm', 'narrator'],
  },
  // Add more voices...
];
```

### Atmosphere Audio

Replace placeholder files in `public/atmospheres/` with actual audio:

1. **Rain** (`rain.mp3`): Gentle rain sounds
2. **Cafe** (`cafe.mp3`): Coffee shop ambience  
3. **Pad** (`pad.mp3`): Ambient synth background

**Audio Requirements:**
- Format: MP3, 128kbps
- Duration: 10-30 seconds (seamlessly loopable)
- File size: Under 1MB each
- Royalty-free or licensed for commercial use

## 📊 Usage Analytics

Access the admin dashboard at `/admin/usage` to monitor:

- Daily/monthly request counts
- Character usage and estimated costs
- Error rates and system health
- Popular voices and languages
- Rate limiting statistics

**Note**: In production, protect this route with authentication.

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Set environment variables in Vercel dashboard:**
   ```
   ELEVEN_KEY=your_elevenlabs_api_key
   NEXT_PUBLIC_SITE_TITLE=Texti AI
   NEXT_PUBLIC_BUYME_URL=https://buymeacoffee.com/yourhandle
   ```
3. **Deploy automatically on push to main branch**

### Netlify

1. **Build command**: `npm run build`
2. **Publish directory**: `.next`
3. **Set environment variables in Netlify dashboard**

### Other Platforms

The app is compatible with any platform supporting Node.js and Next.js:
- Railway
- Heroku
- DigitalOcean App Platform
- AWS Amplify

## 🔒 Security & Rate Limiting

### Built-in Protection

- **Rate Limiting**: 10 requests/minute, 100/hour, 1000/day per IP
- **Input Validation**: Text sanitization and length limits (3000 chars max)
- **API Key Security**: Server-side only, never exposed to client
- **CORS Protection**: Configurable origin restrictions

### Production Recommendations

1. **Add Authentication**: Protect admin routes
2. **Use HTTPS**: Enforce SSL/TLS in production
3. **Monitor Usage**: Set up alerts for unusual activity
4. **Backup Data**: Regular backups of usage logs
5. **Update Dependencies**: Keep packages up to date

## 💰 Cost Management

### ElevenLabs Pricing
- Approximately **$0.30 per 1,000 characters**
- Free tier: 10,000 characters/month
- Paid plans: Starting at $5/month

### Cost Optimization

1. **Caching**: Enabled by default (reduces repeat requests)
2. **Character Limits**: 3,000 character maximum per request
3. **Usage Monitoring**: Track costs in admin dashboard
4. **Rate Limiting**: Prevents abuse and unexpected charges

## 🧪 Testing

### Manual Acceptance Tests

Run these tests to verify functionality:

1. **Basic Flow**:
   - Click "Get Started" → Select language → Choose voice → Test voice → Generate audio → Download works

2. **Responsive Design**:
   - Test on mobile (narrow viewport)
   - Verify all buttons and modals work on touch devices

3. **Audio Features**:
   - Visualizer toggle works without crashes
   - Atmosphere audio plays correctly
   - Download functionality works in all browsers

4. **API Security**:
   - Verify `ELEVEN_KEY` not visible in browser dev tools
   - Test rate limiting with rapid requests
   - Confirm API rejects empty text and oversized inputs (>3000 chars)

### Automated Testing (Optional)

Set up Jest and React Testing Library:

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

Example test structure:
```javascript
// __tests__/components/VoiceCard.test.jsx
import { render, screen } from '@testing-library/react';
import VoiceCard from '../components/VoiceCard';

test('renders voice card with correct information', () => {
  const mockVoice = { name: 'Dave', description: 'Test voice' };
  render(<VoiceCard voice={mockVoice} />);
  expect(screen.getByText('Dave')).toBeInTheDocument();
});
```

## 🔧 Advanced Configuration

### Production Caching with Redis

Replace in-memory cache with Redis for production:

```javascript
// utils/cache.js
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

export const redisCache = {
  async get(key) {
    return await redis.getBuffer(key);
  },
  async set(key, data, ttl = 3600) {
    await redis.setex(key, ttl, data);
  }
};
```

### S3 Storage for Audio Files

Store generated audio in S3 with CloudFront:

```bash
# Install AWS SDK
npm install aws-sdk

# Set environment variables
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET=your-texti-ai-bucket
CLOUDFRONT_URL=https://your-distribution.cloudfront.net
```

### Server-side Audio Mixing

Combine TTS with atmosphere using FFmpeg:

```bash
# Install FFmpeg
apt-get install ffmpeg

# Example mixing command
ffmpeg -i tts_audio.mp3 -i rain.mp3 -filter_complex "[1:a]volume=0.3[bg];[0:a][bg]amix=inputs=2:duration=first" output.mp3
```

## 📝 Legal Considerations

### Voice Cloning & Consent
- Only use voices with proper licensing
- Obtain consent for voice cloning
- Respect ElevenLabs terms of service
- Consider regional regulations (EU AI Act, etc.)

### Content Moderation
- Implement text content filtering
- Monitor for inappropriate usage
- Maintain usage logs for compliance
- Consider DMCA compliance for generated content

## 🐛 Troubleshooting

### Common Issues

**1. "TTS service not configured" error**
- Ensure `ELEVEN_KEY` is set in `.env.local`
- Verify the API key is valid and has sufficient credits
- Check ElevenLabs API status

**2. Voice not found errors**
- Update voice IDs in `lib/voiceMap.js`
- Verify voice IDs exist in your ElevenLabs account
- Check voice availability in selected language

**3. Audio playback issues**
- Ensure browser supports HTML5 audio
- Check file format compatibility (MP3 recommended)
- Verify CORS headers for audio files

**4. Visualizer not working**
- Check browser Web Audio API support
- Ensure Canvas is enabled
- Try disabling browser extensions

### Debug Mode

Enable detailed logging in development:

```javascript
// Add to next.config.js
module.exports = {
  env: {
    DEBUG_TTS: process.env.NODE_ENV === 'development'
  }
};
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and patterns
- Add tests for new functionality
- Update documentation for API changes
- Ensure responsive design compatibility
- Test across multiple browsers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **ElevenLabs** for providing excellent TTS API
- **Vercel** for seamless Next.js deployment
- **Tailwind CSS** for utility-first styling
- **Lucide React** for beautiful icons
- **Framer Motion** for smooth animations

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/texti-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/texti-ai/discussions)
- **Email**: support@texti-ai.com
- **Documentation**: [Wiki](https://github.com/yourusername/texti-ai/wiki)

---

**Made with ❤️ by the Texti AI Team**

Turn your stories into voices, one word at a time.