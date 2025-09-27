import React, { useState, useEffect } from 'react';
import { Menu, X, Coffee } from 'lucide-react';

const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'About', href: '#about' },
  ];

  const buyMeACoffeeUrl = process.env.NEXT_PUBLIC_BUYME_URL || 'https://buymeacoffee.com/textiai';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'glass-effect' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-headline-white">
              Texti <span className="text-accent-orange">AI</span>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="nav-link"
              >
                {link.name}
              </a>
            ))}
            
            {/* Buy Me a Coffee Button */}
            <a
              href={buyMeACoffeeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded-full transition-all duration-300 hover:scale-105"
            >
              <Coffee size={16} />
              Buy me a Coffee
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-headline-white hover:text-accent-orange transition-colors duration-300"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 glass-effect rounded-lg mb-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block px-3 py-2 nav-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              
              {/* Mobile Buy Me a Coffee */}
              <a
                href={buyMeACoffeeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded-full transition-all duration-300 mx-3 mt-4 justify-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Coffee size={16} />
                Buy me a Coffee
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;