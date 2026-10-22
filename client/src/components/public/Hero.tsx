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
  const [isMobile, setIsMobile] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  const heroRef = useRef<HTMLElement | null>(null);
  const logoWrapperRef = useRef<HTMLDivElement | null>(null);
  const textWrapperRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const scrollCueRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const activeSlides = slides.filter((s) => s.is_active);
  const totalSlides = activeSlides.length;

  // Track viewport size cleanly
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

  // 100% fluid 60/120fps hardware-accelerated scroll engine with LERP physics
  useEffect(() => {
    let rafId: number | null = null;
    let isMob = window.innerWidth < 640;
    let totalScrollDistance = 0;
    let currentProgress = 0;
    let targetProgress = 0;
    let isRunning = false;

    // Optical centering: -24px on mobile (clears void below header), 35px on desktop
    const getTargetShift = (mob: boolean) => (mob ? -24 : 35);

    const measure = () => {
      isMob = window.innerWidth < 640;
      setIsMobile(isMob);
      const heroEl = heroRef.current;
      if (heroEl) {
        totalScrollDistance = Math.max(heroEl.offsetHeight - window.innerHeight, 1);
      } else {
        totalScrollDistance = window.innerHeight * 0.65;
      }
    };

    measure();

    const render = (progress: number) => {
      const mob = isMob;
      // 1. Scale: Mobile starts at 1.14 -> 0.78; Desktop starts at 1.32 -> 0.95
      const initialScale = mob ? 1.14 : 1.32;
      const finalScale = mob ? 0.78 : 0.95;
      const currentScale = finalScale + (1 - progress) * (initialScale - finalScale);

      // 2. Vertical offset: mobile -12px, desktop 105px, both glides to 0
      const baseShift = getTargetShift(mob);
      const currentOffset = (1 - progress) * baseShift;

      // 3. Text reveal curve: smooth ease-out quadratic
      const rawTextP = Math.min(Math.max((progress - 0.08) / 0.62, 0), 1);
      const textP = 1 - Math.pow(1 - rawTextP, 2);
      const textTranslateY = (1 - textP) * (mob ? 14 : 20);

      if (logoWrapperRef.current) {
        logoWrapperRef.current.style.transform = `translate3d(0, ${currentOffset.toFixed(1)}px, 0) scale(${currentScale.toFixed(3)})`;
      }

      if (glowRef.current) {
        glowRef.current.style.opacity = (0.7 + (1 - progress) * 0.45).toFixed(2);
      }

      if (textWrapperRef.current) {
        textWrapperRef.current.style.opacity = textP.toFixed(2);
        textWrapperRef.current.style.transform = `translate3d(0, ${textTranslateY.toFixed(1)}px, 0)`;
        textWrapperRef.current.style.pointerEvents = textP > 0.4 ? 'auto' : 'none';
      }

      if (scrollCueRef.current) {
        const cueOpacity = Math.max(0, 1 - progress * 3.5);
        scrollCueRef.current.style.opacity = cueOpacity.toFixed(2);
        if (cueOpacity <= 0.02) {
          scrollCueRef.current.style.display = 'none';
        } else {
          scrollCueRef.current.style.display = 'flex';
        }
      }
    };

    // Smooth physics loop - eliminates touch-scroll stutter and frame skips
    const animate = () => {
      const diff = targetProgress - currentProgress;
      if (Math.abs(diff) < 0.001) {
        currentProgress = targetProgress;
        render(currentProgress);
        isRunning = false;
        rafId = null;
        return;
      }

      // 0.22 damping factor provides instant responsiveness with zero jitter
      currentProgress += diff * 0.22;
      render(currentProgress);
      rafId = requestAnimationFrame(animate);
    };

    const onScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      targetProgress = totalScrollDistance > 0 
        ? Math.min(Math.max(scrollY / totalScrollDistance, 0), 1) 
        : 1;

      if (!isRunning) {
        isRunning = true;
        rafId = requestAnimationFrame(animate);
      }
    };

    const handleResize = () => {
      measure();
      onScroll();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    // Initial positioning
    measure();
    currentProgress = 0;
    targetProgress = 0;
    render(0);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [config.logo_size_desktop, config.logo_size_mobile]);

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % totalSlides);
  };

  // Ensure active slide video starts playing promptly on transition and user gestures
  useEffect(() => {
    const playCurrentSlide = () => {
      const activeVideo = document.querySelector<HTMLVideoElement>(
        `#inicio [data-slide-index="${currentSlideIndex}"] video`
      );
      if (activeVideo) {
        activeVideo.defaultMuted = true;
        activeVideo.muted = true;
        activeVideo.playsInline = true;
        const p = activeVideo.play();
        if (p !== undefined) {
          p.catch(() => {});
        }
      }
      if (videoRef.current) {
        videoRef.current.defaultMuted = true;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        const p2 = videoRef.current.play();
        if (p2 !== undefined) {
          p2.catch(() => {});
        }
      }
    };

    playCurrentSlide();

    // Unlock on any touch/scroll/click gesture on mobile devices
    const onGesture = () => {
      playCurrentSlide();
    };

    window.addEventListener('touchstart', onGesture, { passive: true });
    window.addEventListener('touchend', onGesture, { passive: true });
    window.addEventListener('scroll', onGesture, { passive: true });
    window.addEventListener('click', onGesture, { passive: true });
    window.addEventListener('pointerdown', onGesture, { passive: true });

    return () => {
      window.removeEventListener('touchstart', onGesture);
      window.removeEventListener('touchend', onGesture);
      window.removeEventListener('scroll', onGesture);
      window.removeEventListener('click', onGesture);
      window.removeEventListener('pointerdown', onGesture);
    };
  }, [currentSlideIndex]);

  const overlayOpacity = Math.min(Math.max((config.overlay_darkness ?? 65) / 100, 0.2), 0.95);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
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
  }, [config.video_url, config.video_enabled]);

  // Dimensions - prominent brand presence
  const logoDesktopWidth = config.logo_size_desktop || 440;
  const logoMobileWidth = Math.max(config.logo_size_mobile || 290, 280);

  return (
    <section
      ref={heroRef}
      id="inicio"
      className="relative w-full max-w-full bg-[#050a14] hero-dark-section min-h-[160vh] sm:min-h-[170vh]"
    >
      {/* Sticky full-screen viewport with stable small-viewport-height (svh) to avoid mobile URL bar jump bugs */}
      <div className="sticky top-0 w-full max-w-full h-screen h-[100svh] overflow-hidden flex flex-col justify-between bg-[#050a14]">
        {/* Background Slideshow / Video Layer */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {activeSlides.length > 0 ? (
            activeSlides.map((slide, index) => {
              const isActive = index === currentSlideIndex;
              return (
                <div
                  key={slide.id || index}
                  data-slide-index={index}
                  className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                    isActive ? 'opacity-100 scale-105' : 'opacity-0 scale-100 pointer-events-none'
                  }`}
                  style={{
                    transitionDuration: `${Math.min(config.transition_duration || 6000, 1500)}ms`
                  }}
                >
                  {slide.image_desktop.toLowerCase().endsWith('.mp4') || slide.image_desktop.toLowerCase().endsWith('.webm') ? (
                    <video
                      ref={(el) => {
                        if (el) {
                          el.defaultMuted = true;
                          el.muted = true;
                          el.playsInline = true;
                          el.setAttribute('playsinline', '');
                          el.setAttribute('webkit-playsinline', '');
                          el.setAttribute('muted', '');
                          el.setAttribute('autoplay', '');
                          el.setAttribute('loop', '');
                        }
                      }}
                      src={(index === currentSlideIndex || index === (currentSlideIndex + 1) % totalSlides) 
                        ? (isMobile && slide.image_mobile ? slide.image_mobile : slide.image_desktop)
                        : undefined
                      }
                      poster={slide.poster || `/uploads/hero/slide_${index + 1}_poster.jpg`}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload={isActive ? 'auto' : (index === (currentSlideIndex + 1) % totalSlides) ? 'metadata' : 'none'}
                      onLoadedData={(e) => {
                        const el = e.currentTarget;
                        el.defaultMuted = true;
                        el.muted = true;
                        if (isActive) {
                          el.play().catch(() => {});
                        }
                      }}
                      onLoadedMetadata={(e) => {
                        const el = e.currentTarget;
                        el.defaultMuted = true;
                        el.muted = true;
                        if (isActive) {
                          el.play().catch(() => {});
                        }
                      }}
                      onCanPlay={(e) => {
                        const el = e.currentTarget;
                        el.defaultMuted = true;
                        el.muted = true;
                        if (isActive) {
                          el.play().catch(() => {});
                        }
                      }}
                      className="w-full h-full object-cover object-center pointer-events-none"
                    />
                  ) : (
                    <img
                      src={isMobile && slide.image_mobile ? slide.image_mobile : slide.image_desktop}
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

        {/* 100% MATHEMATICALLY CENTERED UNIFIED HERO CONTENT CONTAINER */}
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full pt-14 sm:pt-16 pb-2">
          {/* THE OFFICIAL LOGO - STARTS PROMINENT & CENTERED, SMOOTHLY SHRINKS & LIFTS ON SCROLL */}
          <div
            ref={logoWrapperRef}
            className="relative flex flex-col items-center justify-center max-w-full mx-auto"
            style={{
              transform: `translate3d(0, ${isMobile ? -24 : 35}px, 0) scale(${isMobile ? 1.14 : 1.32})`,
              transformOrigin: 'center center',
              willChange: 'transform',
              WebkitBackfaceVisibility: 'hidden',
              backfaceVisibility: 'hidden'
            }}
          >
            {/* Ambient Cyan / Cobalt Radial Glow */}
            <div
              ref={glowRef}
              className="absolute w-[220px] sm:w-[520px] h-[220px] sm:h-[520px] rounded-full bg-[#38bdf8]/20 blur-[50px] sm:blur-[110px] -z-10 pointer-events-none animate-pulse-glow-blue"
              style={{
                opacity: 1.1
              }}
            />

            {/* Official Brand Logo */}
            <img
              src={config.logo_url || '/uploads/branding/logo_hero_central.png'}
              alt="G11 Conceito Financeiro"
              className="h-auto object-contain drop-shadow-[0_15px_45px_rgba(56,189,248,0.45)] max-w-[85vw] mx-auto select-none pointer-events-none"
              style={{
                width: isMobile
                  ? 'clamp(260px, 78vw, 310px)'
                  : `clamp(360px, 46vw, ${logoDesktopWidth}px)`
              }}
            />
          </div>

          {/* THE TEXT & CALL TO ACTIONS - REVEALED SMOOTHLY AS USER SCROLLS DOWN */}
          <div
            ref={textWrapperRef}
            className="w-full flex flex-col items-center mt-2 sm:mt-5"
            style={{
              opacity: 0,
              transform: `translate3d(0, ${isMobile ? 14 : 20}px, 0)`,
              pointerEvents: 'none',
              willChange: 'transform, opacity',
              WebkitBackfaceVisibility: 'hidden',
              backfaceVisibility: 'hidden'
            }}
          >
            {/* Tagline with Cyan Accent Lines */}
            <div className="mb-2 sm:mb-3 flex items-center justify-center gap-2 sm:gap-3">
              <span className="w-5 sm:w-12 h-px bg-gradient-to-r from-transparent to-[#38bdf8]" />
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] font-semibold text-[#38bdf8]">
                {config.tagline || 'G11 Conceito Financeiro'}
              </p>
              <span className="w-5 sm:w-12 h-px bg-gradient-to-l from-transparent to-[#38bdf8]" />
            </div>

            {/* Headline / Subtitle */}
            <h1 className="text-[15px] sm:text-2xl md:text-3xl lg:text-4xl font-light text-white tracking-tight leading-snug sm:leading-relaxed max-w-3xl mx-auto mb-3.5 sm:mb-7 drop-shadow-sm px-2">
              {config.subtitle || 'Assessoria de Alta Performance para Corretores e Clientes Estratégicos'}
            </h1>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-4 w-full sm:w-auto px-4">
              <a
                href={config.cta_primary_link || 'https://wa.me/5511991606951?text=Ol%C3%A1%2C%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es!'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto blue-gradient-btn font-semibold px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-full text-[11px] sm:text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-[#0047ab]/40 transition-all transform hover:-translate-y-0.5 keep-white cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span className="text-white">{config.cta_primary_text || 'Fale com um Especialista'}</span>
              </a>

              <a
                href={config.cta_secondary_link || '#solucoes'}
                className="w-full sm:w-auto bg-[#09283d]/80 hover:bg-[#09283d] text-white border border-[#38bdf8]/40 hover:border-[#38bdf8] px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-full text-[11px] sm:text-xs uppercase tracking-widest flex items-center justify-center backdrop-blur-sm transition-all keep-white cursor-pointer"
              >
                <span className="text-white">{config.cta_secondary_text || 'Conhecer Soluções'}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Floating Scroll Cue at bottom while logo is prominent */}
        <div
          ref={scrollCueRef}
          className="absolute bottom-12 sm:bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none z-30"
        >
          <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-[#38bdf8]/90 font-semibold animate-pulse">
            Role para baixo
          </span>
          <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#38bdf8] animate-bounce" />
        </div>

        {/* Bottom Bar: Slideshow controls & Status */}
        <div className="relative z-20 pb-3 sm:pb-6 px-4 sm:px-6 flex items-center justify-between max-w-7xl mx-auto w-full flex-shrink-0">
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
