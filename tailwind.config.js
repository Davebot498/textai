/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Exact color scheme as specified
        'bg-base': '#0b0b0d',
        'accent-orange': '#ff6a00',
        'headline-white': '#ffffff',
        'muted-text': '#bdbdbd',
        'subtle-glow': 'rgba(255,106,0,0.12)',
      },
      fontFamily: {
        'inter': ['Inter', 'system-ui', 'sans-serif'],
        'poppins': ['Poppins', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'hero-desktop': ['72px', '1.1'],
        'hero-tablet': ['56px', '1.1'],
        'hero-mobile': ['36px', '1.2'],
        'subhead': ['20px', '1.4'],
        'subhead-mobile': ['18px', '1.4'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'dark-blend': 'linear-gradient(135deg, #0b0b0d 0%, #1a1a1f 50%, #0b0b0d 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite alternate',
        'breathe': 'breathe 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%': { boxShadow: '0 0 20px rgba(255,106,0,0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(255,106,0,0.6)' },
        },
        breathe: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        }
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}