import React, { useState } from 'react';
import { Image as ImageIcon, MapPin, X, ChevronLeft, ChevronRight, Maximize2, Download, Eye, Sparkles } from 'lucide-react';
import { Album, Photo } from '../../types';

interface GallerySectionProps {
  albums: Album[];
}

export const GallerySection: React.FC<GallerySectionProps> = ({ albums }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [activeAlbum, setActiveAlbum] = useState<Album | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const activeAlbums = albums.filter((a) => a.is_active);

  // Extract unique categories
  const categories = ['Todas', ...Array.from(new Set(activeAlbums.map((a) => a.category).filter(Boolean)))];

  const filteredAlbums = selectedCategory === 'Todas'
    ? activeAlbums
    : activeAlbums.filter((a) => a.category === selectedCategory);

  // Duplicate for seamless infinite marquee loop
  const marqueeAlbums = [...filteredAlbums, ...filteredAlbums];

  // Lightbox navigation
  const currentPhotos = activeAlbum?.photos || [];
  const activePhoto: Photo | null = lightboxIndex !== null ? currentPhotos[lightboxIndex] : null;

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null && currentPhotos.length > 0) {
      setLightboxIndex(lightboxIndex === 0 ? currentPhotos.length - 1 : lightboxIndex - 1);
    }
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null && currentPhotos.length > 0) {
      setLightboxIndex((lightboxIndex + 1) % currentPhotos.length);
    }
  };

  return (
    <section id="realizacoes" className="py-16 sm:py-24 bg-[#050a14] relative overflow-hidden">
      {/* Background glow in Azul Petróleo & Celeste */}
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-[#0047ab]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#38bdf8]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-8 sm:mb-12">
          <p className="text-[11px] uppercase tracking-[0.3em] font-semibold text-[#38bdf8] mb-2 sm:mb-3">
            Experiências & Reconhecimento
          </p>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
            Nossas <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-500">Realizações</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#bae6fd]/80 mt-2 sm:mt-3 font-light">
            Convenções internacionais, premiações e viagens de relacionamento. Passe o mouse para pausar e clique para visualizar o acervo fotográfico de cada destino.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-8 sm:mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs uppercase tracking-wider font-semibold transition-all duration-300 cursor-pointer ${
                selectedCategory === cat
                  ? 'blue-gradient-btn text-white shadow-lg shadow-[#0047ab]/30 keep-white'
                  : 'bg-[#0a1324] text-slate-300 hover:text-[#38bdf8] hover:bg-[#0f1c35] border border-[#09283d]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* INFINITE MARQUEE TICKER OF ALBUM FOLDERS (PAUSES ON HOVER) - SLOWER LUXURY PACE */}
      <div className="marquee-container py-3 sm:py-4 relative z-10">
        <div className="marquee-track-albums flex items-center gap-5 sm:gap-6 px-4">
          {marqueeAlbums.map((album, idx) => (
            <div
              key={`${album.id}-${idx}`}
              onClick={() => setActiveAlbum(album)}
              className="group relative rounded-2xl overflow-hidden bg-[#0a1324] border border-[#09283d] hover:border-[#38bdf8] cursor-pointer shadow-2xl transition-all duration-500 transform hover:-translate-y-2 w-[270px] sm:w-[340px] shrink-0 media-card"
            >
              {/* Cover Image */}
              <div className="relative h-80 sm:h-96 w-full overflow-hidden bg-[#050a14]">
                <img
                  src={album.cover_image}
                  alt={album.title}
                  className="w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/uploads/institucional/sobre_empresa_banner.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050a14] via-[#050a14]/40 to-transparent opacity-90 group-hover:opacity-75 transition-opacity" />

                {/* Badge: Destination / Category */}
                <div className="absolute top-4 left-4 flex items-center gap-2 keep-white">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-[#050a14]/80 backdrop-blur-md text-[#38bdf8] border border-[#38bdf8]/40 flex items-center gap-1.5 shadow-md">
                    <MapPin className="w-3 h-3 text-[#38bdf8]" />
                    {album.destination || album.category}
                  </span>
                </div>

                {/* Photo Count Pill */}
                <div className="absolute top-4 right-4 keep-white">
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#050a14]/80 backdrop-blur-md text-white border border-white/10 flex items-center gap-1">
                    <ImageIcon className="w-3 h-3 text-[#38bdf8]" />
                    {album.photo_count || album.photos?.length || 0} fotos
                  </span>
                </div>

                {/* Bottom Title & Details */}
                <div className="absolute bottom-5 left-5 right-5 keep-white">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#38bdf8]">
                    {album.year || 'Edição Especial'}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-[#38bdf8] transition-colors leading-snug mt-0.5">
                    {album.title}
                  </h3>
                  <div className="mt-2.5 flex items-center gap-2 text-xs text-[#bae6fd] font-light opacity-90 group-hover:opacity-100">
                    <Eye className="w-3.5 h-3.5 text-[#38bdf8]" />
                    <span className="text-[#bae6fd]">Clique para abrir álbum completo</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ALBUM VIEW MODAL: DISPLAY ALL HIGH-RES PHOTOS OF THE SELECTED EVENT/TRIP */}
      {activeAlbum && (
        <div className="fixed inset-0 z-50 bg-[#050a14]/95 backdrop-blur-xl flex flex-col animate-fade-in keep-dark keep-white">
          {/* Modal Header */}
          <div className="p-6 border-b border-[#38bdf8]/20 flex items-center justify-between max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#38bdf8]/15 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8]">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#38bdf8] font-bold">
                  {activeAlbum.destination} • {activeAlbum.category}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                  {activeAlbum.title}
                </h3>
              </div>
            </div>

            <button
              onClick={() => setActiveAlbum(null)}
              className="p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all border border-[#38bdf8]/20"
              aria-label="Fechar álbum"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Gallery Body */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 max-w-7xl mx-auto w-full">
            {activeAlbum.description && (
              <p className="text-sm text-[#bae6fd] font-light mb-8 max-w-3xl leading-relaxed">
                {activeAlbum.description}
              </p>
            )}

            {currentPhotos.length === 0 ? (
              <div className="text-center py-20 text-slate-400 font-light">
                <ImageIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p>Nenhuma foto cadastrada neste álbum no momento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {currentPhotos.map((photo, idx) => (
                  <div
                    key={photo.id || idx}
                    onClick={() => setLightboxIndex(idx)}
                    className="group relative rounded-xl overflow-hidden aspect-[4/3] bg-[#0a1324] border border-[#09283d] hover:border-[#38bdf8] cursor-pointer shadow-md transition-all transform hover:scale-[1.02]"
                  >
                    <img
                      src={photo.url}
                      alt={photo.alt_text || photo.title || `${activeAlbum.title} ${idx + 1}`}
                      className="w-full h-full object-cover object-center"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-[#050a14]/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Maximize2 className="w-6 h-6 text-[#38bdf8]" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX COMPONENT */}
      {lightboxIndex !== null && activePhoto && (
        <div
          className="fixed inset-0 z-60 bg-[#050a14]/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-8 animate-fade-in"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Lightbox Header */}
          <div className="flex items-center justify-between text-white z-20" onClick={(e) => e.stopPropagation()}>
            <div className="text-xs text-[#bae6fd]">
              <span className="font-semibold text-white">{activeAlbum?.title}</span>
              <span className="text-[#38bdf8] ml-2 font-mono">
                ({lightboxIndex + 1} de {currentPhotos.length})
              </span>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={activePhoto.url}
                download
                target="_blank"
                rel="noopener noreferrer"
                title="Abrir imagem original"
                className="p-2 rounded-full bg-white/10 hover:bg-[#38bdf8] hover:text-black text-slate-200 transition-colors"
              >
                <Download className="w-4 h-4" />
              </a>
              <button
                onClick={() => setLightboxIndex(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-200"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Main Image & Prev/Next */}
          <div className="relative flex-1 flex items-center justify-center py-4 my-auto">
            {currentPhotos.length > 1 && (
              <button
                onClick={handlePrevPhoto}
                className="absolute left-2 sm:left-6 z-20 w-12 h-12 rounded-full bg-[#0a1324]/80 hover:bg-[#38bdf8] text-white hover:text-black border border-[#38bdf8]/30 flex items-center justify-center transition-all"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <img
              src={activePhoto.url}
              alt={activePhoto.alt_text || 'Foto ampliada'}
              className="max-h-[82vh] max-w-[90vw] object-contain rounded-xl shadow-2xl select-none border border-[#38bdf8]/20"
              onClick={(e) => e.stopPropagation()}
            />

            {currentPhotos.length > 1 && (
              <button
                onClick={handleNextPhoto}
                className="absolute right-2 sm:right-6 z-20 w-12 h-12 rounded-full bg-[#0a1324]/80 hover:bg-[#38bdf8] text-white hover:text-black border border-[#38bdf8]/30 flex items-center justify-center transition-all"
                aria-label="Próxima foto"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Lightbox Caption */}
          <div className="text-center text-xs text-slate-300 z-20" onClick={(e) => e.stopPropagation()}>
            <p className="text-white font-medium">{activePhoto.title || activeAlbum?.title}</p>
            {activePhoto.caption && <p className="text-[#bae6fd] text-[11px] mt-0.5">{activePhoto.caption}</p>}
          </div>
        </div>
      )}
    </section>
  );
};
