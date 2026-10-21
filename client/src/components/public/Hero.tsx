import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { HeroConfig, HeroSlide } from '../../types';

interface HeroProps {
  config: HeroConfig;
  slides: HeroSlide[];
}

export const Hero: React.FC<HeroProps> = ({ config, slides }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const activeSlides = slides.filter((s) => s.is_active);
  const totalSlides = activeSlides.length;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Slideshow interval
  useEffect(() => {
    if (!config.slideshow_enabled || !isPlaying || totalSlides <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % totalSlides);
    }, config.transition_duration || 6000);

    return () => clearInterval(timer);
  }, [config.slideshow_enabled, isPlaying, totalSlides, config.transition_duration]);

  // Scroll listener for hero interaction: giant centered logo shrinks and reveals content on scroll
  useEffect(() => {
    const handleScroll = () => {
      const heroEl = document.getElementById('inicio');
      if (!heroEl) return;
      const rect = heroEl.getBoundingClientRect();
      const heroScrollDistance = heroEl.offsetHeight - window.innerHeight;
      if (heroScrollDistance <= 0) {
        setScrollProgress(1);
        return;
      }
      const scrolled = -rect.top;
      const progress = Math.min(Math.max(scrolled / heroScrollDistance, 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % totalSlides);
  };

  const overlayOpacity = Math.min(Math.max((config.overlay_darkness ?? 65) / 100, 0.2), 0.95);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('autoplay', '');
    video.setAttribute('loop', '');

    const tryPlay = () => {
      if (!video) return;
      video.defaultMuted = true;
      video.muted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Hero video autoplay waiting for user interaction:', err);
        });
      }
    };

    tryPlay();

    const unlockPlay = () => {
      if (videoRef.current) {
        videoRef.current.defaultMuted = true;
        videoRef.current.muted = true;
        videoRef.current.play().catch(() => {});
      }
    };

    window.addEventListener('click', unlockPlay, { once: true, passive: true });
    window.addEventListener('touchstart', unlockPlay, { once: true, passive: true });
    window.addEventListener('scroll', unlockPlay, { once: true, passive: true });
    window.addEventListener('mousemove', unlockPlay, { once: true, passive: true });

    return () => {
      window.removeEventListener('click', unlockPlay);
      window.removeEventListener('touchstart', unlockPlay);
      window.removeEventListener('scroll', unlockPlay);
      window.removeEventListener('mousemove', unlockPlay);
    };
  }, [config.video_url, config.video_enabled]);

  // Dimensions & Scale calculations
  const logoDesktopWidth = config.logo_size_desktop || 440;
  const logoMobileWidth = config.logo_size_mobile || Math.min(logoDesktopWidth, 220);

  // On desktop: starts giant and in optical center, then smoothly scales down and shifts up as text appears
  // On mobile: cleanly presented immediately with zero scroll-trap
  const initialScale = isMobile ? 1.0 : 1.45;
  const finalScale = 1.0;
  const logoScale = isMobile ? 1.0 : finalScale + (1 - scrollProgress) * (initialScale - finalScale);

  const initialLogoOffset = isMobile ? 0 : 120;
  const finalLogoOffset = 0;
  const logoOffset = isMobile ? 0 : finalLogoOffset + (1 - scrollProgress) * (initialLogoOffset - finalLogoOffset);

  // On mobile: text is immediately 100% visible and interactive
  // On desktop: text smoothly emerges from 0.15 to 0.75 scroll progress
  const textProgress = isMobile ? 1 : Math.min(Math.max((scrollProgress - 0.15) / 0.6, 0), 1);
  const textTranslateY = isMobile ? 0 : (1 - textProgress) * 20;
  const canInteractText = isMobile ? true : textProgress > 0.65;

  return (
    <section
      id="inicio"
      className={`relative w-full hero-dark-section ${isMobile ? 'min-h-[100dvh]' : 'min-h-[175vh]'}`}
    >
      {/* Sticky full-screen viewport */}
      <div className={`sticky top-0 w-full overflow-hidden flex flex-col justify-between bg-[#050a14] ${isMobile ? 'min-h-[100dvh]' : 'h-screen'}`}>
        {/* Background Slideshow / Video Layer */}
        <div className="absolute inset-0 z-0">
          {/* Background Slideshow / Video Layer: activeSlides always takes priority */}
          {activeSlides.length > 0 ? (
            activeSlides.map((slide, index) => {
              const isActive = index === currentSlideIndex;
              return (
                <div
                  key={slide.id || index}
                  className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                    isActive ? 'opacity-100 scale-105' : 'opacity-0 scale-100 pointer-events-none'
                  }`}
                  style={{
                    transitionDuration: `${Math.min(config.transition_duration || 6000, 1500)}ms`
                  }}
                >
                  {slide.image_desktop.toLowerCase().endsWith('.mp4') || slide.image_desktop.toLowerCase().endsWith('.webm') ? (
                    <video
                      src={slide.image_desktop}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="auto"
                      onLoadedMetadata={(e) => {
                        const el = e.currentTarget;
                        el.defaultMuted = true;
                        el.muted = true;
                        el.play().catch(() => {});
                      }}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <img
                      src={slide.image_desktop}
                      alt={slide.title || 'G11 Conceito Financeiro'}
                      className="w-full h-full object-cover object-center transform transition-transform duration-[8000ms] ease-out scale-100"
                    />
                  )}
                </div>
              );
            })
          ) : config.video_enabled && config.video_url ? (
            <video
              ref={videoRef}
              key={config.video_url}
              src={config.video_url}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              onLoadedData={(e) => {
                const el = e.currentTarget;
                el.defaultMuted = true;
                el.muted = true;
                el.play().catch(() => {});
              }}
              onLoadedMetadata={(e) => {
                const el = e.currentTarget;
                el.defaultMuted = true;
                el.muted = true;
                el.play().catch(() => {});
              }}
              className="w-full h-full object-cover object-center pointer-events-none"
            >
              <source src={config.video_url} type={config.video_url.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
            </video>
          ) : null}

          {/* Cinematic Vignette & Deep Navy Overlay */}
          <div
            className="absolute inset-0 hero-dark-film transition-opacity duration-700"
            style={{
              backgroundColor: '#050a14',
              opacity: overlayOpacity
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to top, #050a14 0%, transparent 50%, rgba(5,10,20,0.7) 100%)'
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 0%, rgba(5,10,20,0.4) 60%, rgba(5,10,20,0.9) 100%)'
            }}
          />
        </div>

        {/* Top Spacer to account for fixed navbar */}
        <div className="h-16 sm:h-20 w-full flex-shrink-0" />

        {/* 100% MATHEMATICALLY CENTERED UNIFIED HERO CONTENT CONTAINER */}
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full my-auto py-2 sm:py-4">
          
          {/* THE OFFICIAL LOGO */}
          <div
            className="flex flex-col items-center justify-center w-full will-change-transform"
            style={{
              transform: `translate3d(0, ${logoOffset}px, 0) scale(${logoScale})`,
              transformOrigin: 'center center',
              transition: isMobile ? 'none' : 'transform 80ms ease-out'
            }}
          >
            {/* Ambient Cyan / Cobalt Radial Glow */}
            <div
              className="absolute w-[280px] sm:w-[540px] h-[280px] sm:h-[540px] rounded-full bg-[#38bdf8]/20 blur-[90px] sm:blur-[120px] -z-10 pointer-events-none animate-pulse-glow-blue"
              style={{
                opacity: 0.7 + (1 - scrollProgress) * 0.4
              }}
            />

            {/* The Official Logo - Mobile: Shield Icon | Desktop: Full Brand Logo */}
            {/* Mobile Shield Emblem */}
            <img
              src="/uploads/branding/logo_icon_shield.png"
              alt="G11 Conceito Financeiro"
              className="block sm:hidden h-auto object-contain drop-shadow-[0_15px_45px_rgba(56,189,248,0.5)] mx-auto mb-2"
              style={{
                width: `clamp(100px, 30vw, ${logoMobileWidth}px)`
              }}
            />

            {/* Desktop Brand Logo */}
            <img
              src={config.logo_url || '/uploads/branding/logo_hero_central.png'}
              alt="G11 Conceito Financeiro"
              className="hidden sm:block h-auto object-contain drop-shadow-[0_15px_45px_rgba(56,189,248,0.45)] max-w-[88vw] mx-auto"
              style={{
                width: `clamp(320px, 45vw, ${logoDesktopWidth}px)`
              }}
            />
          </div>

          {/* THE TEXT & CALL TO ACTIONS - REVEALED AS USER SCROLLS DOWN OR IMMEDIATELY ON MOBILE */}
          <div
            className="w-full flex flex-col items-center will-change-transform mt-3 sm:mt-8"
            style={{
              opacity: textProgress,
              transform: `translate3d(0, ${textTranslateY}px, 0)`,
              pointerEvents: canInteractText ? 'auto' : 'none',
              transition: isMobile ? 'none' : 'opacity 120ms ease-out, transform 120ms ease-out'
            }}
          >
            {/* Tagline with Cyan Accent Lines */}
            <div className="mb-2.5 sm:mb-4 flex items-center justify-center gap-2 sm:gap-3">
              <span className="w-5 sm:w-12 h-px bg-gradient-to-r from-transparent to-[#38bdf8]" />
              <p className="text-[11px] sm:text-sm uppercase tracking-[0.25em] font-semibold text-[#38bdf8]">
                {config.tagline || 'G11 Conceito Financeiro'}
              </p>
              <span className="w-5 sm:w-12 h-px bg-gradient-to-l from-transparent to-[#38bdf8]" />
            </div>

            {/* Headline / Subtitle */}
            <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-light text-white tracking-tight leading-snug sm:leading-relaxed max-w-3xl mx-auto mb-6 sm:mb-9 drop-shadow-sm px-2">
              {config.subtitle || 'Assessoria de Alta Performance para Corretores e Clientes Estratégicos'}
            </h1>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto px-4">
              <a
                href={config.cta_primary_link || 'https://wa.me/5511991606951?text=Ol%C3%A1%2C%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es!'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto blue-gradient-btn font-semibold px-7 sm:px-8 py-3.5 rounded-full text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 hover:shadow-xl hover:shadow-[#0047ab]/40 transition-all transform hover:-translate-y-0.5 keep-white cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span className="text-white">{config.cta_primary_text || 'Fale com um Especialista'}</span>
              </a>

              <a
                href={config.cta_secondary_link || '#solucoes'}
                className="w-full sm:w-auto bg-[#09283d]/80 hover:bg-[#09283d] text-white border border-[#38bdf8]/40 hover:border-[#38bdf8] px-7 sm:px-8 py-3.5 rounded-full text-xs uppercase tracking-widest flex items-center justify-center backdrop-blur-sm transition-all keep-white cursor-pointer"
              >
                <span className="text-white">{config.cta_secondary_text || 'Conhecer Soluções'}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Floating Scroll Cue at bottom on desktop while logo is giant */}
        {!isMobile && scrollProgress < 0.4 && (
          <div
            className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none transition-opacity duration-300 z-30"
            style={{ opacity: Math.max(0, 1 - scrollProgress * 2.8) }}
          >
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#38bdf8]/90 font-semibold animate-pulse">
              Role para baixo
            </span>
            <ChevronDown className="w-4 h-4 text-[#38bdf8] animate-bounce" />
          </div>
        )}

        {/* Bottom Bar: Slideshow controls & Status */}
        <div className="relative z-20 pb-4 sm:pb-8 px-4 sm:px-6 flex items-center justify-between max-w-7xl mx-auto w-full flex-shrink-0">
          {/* Slideshow Navigation Buttons & Indicators */}
          <div className="flex items-center gap-2 sm:gap-3">
            {totalSlides > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  aria-label="Slide anterior"
                  className="w-8 h-8 rounded-full bg-[#0a1324]/80 hover:bg-[#38bdf8] text-white hover:text-black border border-[#38bdf8]/20 flex items-center justify-center transition-all cursor-pointer keep-white"
                >
                  <ChevronLeft className="w-4 h-4 text-white hover:text-black" />
                </button>
                <button
                  onClick={handleNext}
                  aria-label="Próximo slide"
                  className="w-8 h-8 rounded-full bg-[#0a1324]/80 hover:bg-[#38bdf8] text-white hover:text-black border border-[#38bdf8]/20 flex items-center justify-center transition-all cursor-pointer keep-white"
                >
                  <ChevronRight className="w-4 h-4 text-white hover:text-black" />
                </button>
                <span className="text-xs text-slate-400 font-mono ml-1 sm:ml-2">
                  0{currentSlideIndex + 1} / 0{totalSlides}
                </span>
              </>
            )}
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-pulse" />
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 font-medium">
              Assessoria Exclusiva
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
