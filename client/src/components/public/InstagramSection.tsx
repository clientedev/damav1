import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, Maximize2, ChevronUp, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { InstagramIcon } from '../icons/InstagramIcon';
import { InstagramPost } from '../../types';

interface InstagramSectionProps {
  posts: InstagramPost[];
  instagramUrl: string;
}

function getDisplayTitle(post: InstagramPost): string {
  if (post.title && !post.title.startsWith('Publicação Instagram (')) {
    return post.title;
  }
  if (post.embed_html) {
    const match = post.embed_html.match(/(?:Uma publicação (?:partilhada|compartilhada) por|A post shared by)\s+([^<]+)/i);
    if (match && match[1]) return match[1].trim();
    const handleMatch = post.embed_html.match(/@([a-zA-Z0-9_.]+)/);
    if (handleMatch) return `Publicação de ${handleMatch[0]}`;
  }
  return 'G11 Conceito Financeiro (@g11conceitofinanceiro)';
}

// Dedicated Autoplay Video Card Component
interface InstagramVideoCardProps {
  post: InstagramPost;
  cleanUrl: string;
  displayTitle: string;
}

const InstagramVideoCard: React.FC<InstagramVideoCardProps> = ({ post, cleanUrl, displayTitle }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const posterUrl = post.poster || (post.image_url ? post.image_url.replace(/\.mp4$/i, '_poster.jpg') : undefined);

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
      video.playsInline = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
        }).catch((err) => {
          console.warn('Autoplay waiting for user touch:', err);
        });
      }
    };

    tryPlay();

    const unlockPlay = () => {
      const v = videoRef.current;
      if (v) {
        v.defaultMuted = true;
        v.muted = true;
        v.playsInline = true;
        const p = v.play();
        if (p !== undefined) {
          p.then(() => setIsPlaying(true)).catch(() => {});
        }
      }
    };

    window.addEventListener('click', unlockPlay, { passive: true });
    window.addEventListener('touchstart', unlockPlay, { passive: true });
    window.addEventListener('touchend', unlockPlay, { passive: true });
    window.addEventListener('scroll', unlockPlay, { passive: true });
    window.addEventListener('pointerdown', unlockPlay, { passive: true });

    return () => {
      window.removeEventListener('click', unlockPlay);
      window.removeEventListener('touchstart', unlockPlay);
      window.removeEventListener('touchend', unlockPlay);
      window.removeEventListener('scroll', unlockPlay);
      window.removeEventListener('pointerdown', unlockPlay);
    };
  }, [post.image_url]);

  const togglePlay = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleSound = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    const newMuted = !video.muted;
    video.muted = newMuted;
    setIsMuted(newMuted);
  };

  return (
    <div className="relative rounded-2xl overflow-hidden bg-black/90 aspect-[9/14] sm:aspect-[4/5] flex items-center justify-center group shadow-2xl border border-white/10 hover:border-sky-500/40 transition-all duration-300 keep-white media-card">
      {/* Autoplay Video Element */}
      <video
        ref={(el) => {
          videoRef.current = el;
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
        src={post.image_url}
        poster={posterUrl}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onClick={togglePlay}
        onLoadedData={(e) => {
          const el = e.currentTarget;
          el.defaultMuted = true;
          el.muted = true;
          el.play().then(() => setIsPlaying(true)).catch(() => {});
        }}
        onCanPlay={(e) => {
          const el = e.currentTarget;
          el.defaultMuted = true;
          el.muted = true;
          el.play().then(() => setIsPlaying(true)).catch(() => {});
        }}
        className="w-full h-full object-cover cursor-pointer select-none"
      />

      {/* Subtle Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050a14]/95 via-transparent to-black/40 pointer-events-none" />

      {/* Top Floating Badge: Status & Category */}
      <div className="absolute top-3 inset-x-3 flex items-center justify-between z-20 pointer-events-none keep-white">
        <span className="text-[10px] uppercase font-bold tracking-wider text-sky-400 bg-[#050a14]/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-sky-500/30">
          {post.category || 'Reel Oficial'}
        </span>

        <div className="flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-white font-medium border border-white/15">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white">Autoplay Ativo</span>
        </div>
      </div>

      {/* Floating Center Play/Pause button on hover / when paused */}
      {!isPlaying && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="Reproduzir vídeo"
          className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/70 hover:bg-sky-500 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all cursor-pointer z-30 shadow-xl keep-white"
        >
          <Play className="w-6 h-6 fill-white ml-1" />
        </button>
      )}

      {/* Floating Sound Control (Bottom Right of Media) */}
      <button
        type="button"
        onClick={toggleSound}
        title={isMuted ? 'Ativar som' : 'Silenciar'}
        aria-label={isMuted ? 'Ativar som' : 'Silenciar'}
        className="absolute bottom-16 right-3.5 z-30 w-9 h-9 rounded-full bg-black/75 hover:bg-sky-500 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-lg hover:scale-105 keep-white"
      >
        {isMuted ? <VolumeX className="w-4 h-4 text-slate-300" /> : <Volume2 className="w-4 h-4 text-white" />}
      </button>

      {/* Bottom Content Bar inside Card */}
      <div className="absolute bottom-0 inset-x-0 p-4 z-20 flex flex-col gap-2 keep-white">
        <p className="text-xs text-white font-medium line-clamp-2 leading-relaxed drop-shadow-sm keep-white">
          {displayTitle}
        </p>

        <div className="flex items-center justify-between pt-1 border-t border-white/10 keep-white">
          <div className="flex items-center gap-1.5 text-[11px] text-sky-400 font-medium">
            <InstagramIcon className="w-3.5 h-3.5" />
            <span>@g11conceitofinanceiro</span>
          </div>

          <a
            href={cleanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-slate-200 hover:text-white font-semibold transition-colors keep-white"
          >
            <span className="text-white">Ver no Insta</span>
            <ExternalLink className="w-3 h-3 text-sky-400" />
          </a>
        </div>
      </div>
    </div>
  );
};

export const InstagramSection: React.FC<InstagramSectionProps> = ({ posts, instagramUrl }) => {
  const activePosts = posts.filter((p) => p.is_active);
  const [expandedPosts, setExpandedPosts] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const processInstagram = () => {
      if (typeof window !== 'undefined' && (window as any).instgrm?.Embeds) {
        try {
          (window as any).instgrm.Embeds.process();
        } catch (e) {
          console.warn('Instagram embed process notice:', e);
        }
      } else {
        if (!document.getElementById('instagram-embed-script')) {
          const s = document.createElement('script');
          s.id = 'instagram-embed-script';
          s.src = 'https://www.instagram.com/embed.js';
          s.async = true;
          s.onload = () => {
            if ((window as any).instgrm?.Embeds) {
              (window as any).instgrm.Embeds.process();
            }
          };
          document.body.appendChild(s);
        }
      }
    };

    processInstagram();
    const t1 = setTimeout(processInstagram, 300);
    const t2 = setTimeout(processInstagram, 1000);
    const t3 = setTimeout(processInstagram, 2500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [activePosts]);

  if (activePosts.length === 0) return null;

  const toggleExpand = (postId: number) => {
    setExpandedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  return (
    <section className="py-16 sm:py-24 bg-[#050a14] border-t border-sky-500/15 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-14 gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] font-semibold text-sky-400 mb-2 flex items-center gap-2">
              <InstagramIcon className="w-4 h-4 text-sky-400" />
              Redes Sociais Oficiais
            </p>
            <h2 className="text-2xl sm:text-4xl font-light text-white tracking-tight">
              Acompanhe a <span className="font-semibold text-sky-400">@g11conceitofinanceiro</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 font-light max-w-xl">
              Conteúdos exclusivos, bastidores de eventos internacionais, insights sobre o mercado financeiro e oportunidades para corretores.
            </p>
          </div>

          <a
            href={instagramUrl || 'https://www.instagram.com/g11conceitofinanceiro/'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full border border-sky-500/40 bg-sky-500/10 hover:bg-sky-500 text-sky-300 hover:text-white transition-all text-xs uppercase tracking-wider font-semibold self-start md:self-auto shrink-0 shadow-lg hover:shadow-sky-500/20 cursor-pointer"
          >
            <InstagramIcon className="w-4 h-4" />
            <span>Seguir no Instagram</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Instagram Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {activePosts.map((post) => {
            const cleanUrl = post.post_url?.replace(/\/$/, '') || 'https://www.instagram.com/g11conceitofinanceiro/';
            const displayTitle = getDisplayTitle(post);
            const isExpanded = Boolean(expandedPosts[post.id]);
            const isVideoMedia = Boolean(
              post.image_url &&
              (post.image_url.toLowerCase().endsWith('.mp4') || post.image_url.toLowerCase().endsWith('.webm'))
            );

            return (
              <div
                key={post.id}
                className="rounded-2xl overflow-hidden bg-[#0a1324] border border-sky-500/15 hover:border-sky-400/40 transition-all p-5 shadow-xl flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-sky-500/10">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full">
                      {post.category || 'Institucional'}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">Instagram Official</span>
                  </div>

                  {/* Header Title */}
                  <h3 className="text-sm font-semibold text-white mb-4 line-clamp-2">
                    {displayTitle}
                  </h3>

                  {/* Prioritize Video in Autoplay if post has a video file */}
                  {isVideoMedia ? (
                    <InstagramVideoCard
                      post={post}
                      cleanUrl={cleanUrl}
                      displayTitle={displayTitle}
                    />
                  ) : post.embed_html ? (
                    <div className="relative">
                      <div
                        className={`w-full flex items-center justify-center bg-black/40 rounded-xl overflow-hidden transition-all duration-500 [&_iframe]:!w-full [&_iframe]:!min-w-0 [&_iframe]:rounded-xl [&_blockquote]:!w-full [&_blockquote]:!max-w-full [&_blockquote]:!min-w-0 ${
                          isExpanded ? 'max-h-none' : 'max-h-[440px]'
                        }`}
                        dangerouslySetInnerHTML={{ __html: post.embed_html }}
                      />
                      {!isExpanded && (
                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0a1324] via-[#0a1324]/90 to-transparent pointer-events-none rounded-b-xl z-10" />
                      )}
                    </div>
                  ) : post.image_url ? (
                    <div className="relative rounded-xl overflow-hidden bg-black/60 group aspect-square flex flex-col justify-end keep-white">
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                      <div className="relative p-4 z-10 keep-white">
                        <span className="text-[10px] text-white/90 line-clamp-2 mb-2 font-light">
                          {displayTitle}
                        </span>
                        <a
                          href={cleanUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-sky-400 font-medium hover:underline"
                        >
                          <InstagramIcon className="w-3.5 h-3.5" />
                          <span>Ver publicação</span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="min-h-[380px] w-full flex items-center justify-center bg-black/40 rounded-xl overflow-hidden">
                      <blockquote
                        className="instagram-media w-full"
                        data-instgrm-permalink={`${cleanUrl}/?utm_source=ig_embed&amp;utm_campaign=loading`}
                        data-instgrm-version="14"
                        style={{
                          background: '#FFF',
                          border: 0,
                          borderRadius: '12px',
                          boxShadow: 'none',
                          margin: '1px',
                          maxWidth: '540px',
                          minWidth: '0px',
                          padding: 0,
                          width: 'calc(100% - 2px)'
                        }}
                      >
                        <div className="p-8 text-center text-slate-400">
                          <InstagramIcon className="w-8 h-8 text-sky-400 mx-auto mb-2 opacity-80" />
                          <p className="text-xs font-medium text-slate-300">Carregando publicação do Instagram...</p>
                          <p className="text-[11px] text-slate-500 mt-1">Caso demore, você pode visualizar diretamente no app.</p>
                        </div>
                      </blockquote>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer for Embeds */}
                {!isVideoMedia && (
                  <div className="mt-4 pt-3 border-t border-white/5 space-y-2.5">
                    {post.embed_html && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(post.id)}
                        className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-sky-500/15 text-sky-400 border border-sky-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5" />
                            <span>Recolher Publicação</span>
                          </>
                        ) : (
                          <>
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>Ver Publicação Completa</span>
                          </>
                        )}
                      </button>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500">Instagram Oficial</span>
                      <a
                        href={cleanUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-sky-400 hover:underline flex items-center gap-1.5 font-medium"
                      >
                        <span>Abrir no Instagram</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
