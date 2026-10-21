import React, { useState, useEffect } from 'react';
import { Menu, X, MessageCircle, Sun, Moon } from 'lucide-react';
import { GeneralSettings } from '../../types';

interface NavbarProps {
  settings: GeneralSettings;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ settings, theme, onToggleTheme }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Início', href: '#inicio' },
    { name: 'Sobre', href: '#sobre' },
    { name: 'Soluções', href: '#solucoes' },
    { name: 'Realizações', href: '#realizacoes' },
    { name: 'Parceiros', href: '#parceiros' },
    { name: 'Depoimentos', href: '#depoimentos' },
    { name: 'Sinistro', href: '#sinistro' },
    { name: 'Contato', href: '#contato' },
  ];

  const isLight = theme === 'light';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isLight
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-md shadow-slate-900/5 py-2.5'
          : scrolled
            ? 'bg-[#050a14]/95 backdrop-blur-md border-b border-sky-500/20 shadow-xl shadow-black/40 py-2.5'
            : 'bg-[#050a14]/90 backdrop-blur-md border-b border-sky-500/10 py-3'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo prominently displayed as official shield emblem */}
          <div className="flex items-center">
            <a
              href="#inicio"
              className="transition-all duration-300 flex items-center hover:opacity-90 group"
              title="G11 Conceito Financeiro"
            >
              <img
                src={isLight ? '/uploads/branding/logo_icon_shield_navy.png' : '/uploads/branding/logo_icon_shield.png'}
                alt="G11 Conceito Financeiro"
                className={`h-9 sm:h-10 w-auto object-contain transition-all duration-300 ${
                  isLight
                    ? 'filter drop-shadow-[0_1px_4px_rgba(2,132,199,0.2)]'
                    : 'drop-shadow-[0_2px_14px_rgba(56,189,248,0.5)] group-hover:scale-105'
                }`}
              />
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-7">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`text-[11px] lg:text-xs uppercase tracking-widest font-semibold transition-colors relative group py-1 ${
                  isLight
                    ? 'text-slate-700 hover:text-sky-600'
                    : 'text-sky-100/80 hover:text-sky-300'
                }`}
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-sky-400 to-blue-600 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Action Buttons & Theme Selector */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Theme Toggle Button (Light/Dark Mode) */}
            <button
              onClick={onToggleTheme}
              title={isLight ? 'Alternar para Modo Escuro' : 'Alternar para Modo Claro'}
              className={`p-2 rounded-full transition-all text-xs flex items-center gap-1.5 border cursor-pointer ${
                isLight
                  ? 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
                  : 'bg-[#0a1324] border-sky-500/25 text-sky-300 hover:bg-sky-500/20'
              }`}
              aria-label="Alternar tema"
            >
              {isLight ? (
                <Moon className="w-4 h-4 text-sky-600" />
              ) : (
                <Sun className="w-4 h-4 text-sky-400" />
              )}
            </button>

            {/* Contact WhatsApp Button */}
            <a
              href={settings.whatsapp_url || `https://wa.me/${settings.whatsapp?.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-sky-400 via-blue-600 to-cyan-500 text-white font-semibold px-4 py-2 rounded-full text-xs tracking-wider uppercase flex items-center gap-2 hover:opacity-95 transition-all shadow-md shadow-sky-500/20 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Fale Conosco</span>
            </a>
          </div>

          {/* Mobile Menu & Theme Buttons */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-lg text-xs ${
                isLight ? 'text-slate-800' : 'text-sky-300'
              }`}
              aria-label="Alternar tema"
            >
              {isLight ? <Moon className="w-5 h-5 text-sky-600" /> : <Sun className="w-5 h-5 text-sky-400" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-200 hover:text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className={`md:hidden border-b px-6 pt-4 pb-8 space-y-4 animate-fade-in shadow-2xl ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#070e1c] border-sky-500/20'
        }`}>
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-xs uppercase tracking-wider font-semibold py-2 border-b ${
                  isLight
                    ? 'text-slate-800 hover:text-sky-600 border-slate-100'
                    : 'text-sky-100 hover:text-sky-400 border-white/5'
                }`}
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="pt-2">
            <a
              href={settings.whatsapp_url || `https://wa.me/${settings.whatsapp?.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full bg-gradient-to-r from-sky-400 to-blue-600 text-white font-semibold py-3 rounded-xl text-center text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Atendimento WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

