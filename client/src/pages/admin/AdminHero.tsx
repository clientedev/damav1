import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Upload,
  AlertCircle,
  Edit2,
  Image as ImageIcon,
  Loader2,
  Video,
  X
} from 'lucide-react';
import { HeroConfig, HeroSlide } from '../../types';
import {
  updateHeroConfig,
  addHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  reorderHeroSlides,
  uploadMediaFile,
  fetchMediaLibrary
} from '../../services/api';

interface AdminHeroProps {
  initialConfig: HeroConfig;
  initialSlides: HeroSlide[];
  onRefresh: () => void;
}

export const AdminHero: React.FC<AdminHeroProps> = ({ initialConfig, initialSlides, onRefresh }) => {
  const [config, setConfig] = useState<HeroConfig>(initialConfig);
  const [slides, setSlides] = useState<HeroSlide[]>(initialSlides);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New slide modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSlide, setNewSlide] = useState({
    image_desktop: '',
    image_mobile: '',
    title: '',
    subtitle: ''
  });

  // Edit slide modal
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);

  // Media Library Picker Modal
  const [showMediaPicker, setShowMediaPicker] = useState<'new_desktop' | 'new_mobile' | 'edit_desktop' | 'edit_mobile' | 'logo' | 'video' | null>(null);
  const [mediaList, setMediaList] = useState<Array<{ url: string; filename: string }>>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [mediaFilter, setMediaFilter] = useState('');

  // Upload state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    setConfig(initialConfig);
    setSlides(initialSlides);
  }, [initialConfig, initialSlides]);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      await updateHeroConfig(config);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar configurações da Hero.');
    } finally {
      setSaving(false);
    }
  };

  const openMediaPicker = async (target: 'new_desktop' | 'new_mobile' | 'edit_desktop' | 'edit_mobile' | 'logo' | 'video') => {
    setShowMediaPicker(target);
    setLoadingMedia(true);
    try {
      const data = await fetchMediaLibrary();
      setMediaList(data);
    } catch (err: any) {
      console.error('Erro ao carregar galeria:', err);
    } finally {
      setLoadingMedia(false);
    }
  };

  const handleSelectMedia = (url: string) => {
    if (!showMediaPicker) return;

    if (showMediaPicker === 'logo') {
      setConfig({ ...config, logo_url: url });
    } else if (showMediaPicker === 'video') {
      setConfig({ ...config, video_url: url, video_enabled: true });
    } else if (showMediaPicker === 'new_desktop') {
      setNewSlide((prev) => ({ ...prev, image_desktop: url }));
    } else if (showMediaPicker === 'new_mobile') {
      setNewSlide((prev) => ({ ...prev, image_mobile: url }));
    } else if (showMediaPicker === 'edit_desktop' && editingSlide) {
      setEditingSlide({ ...editingSlide, image_desktop: url });
    } else if (showMediaPicker === 'edit_mobile' && editingSlide) {
      setEditingSlide({ ...editingSlide, image_mobile: url });
    }

    setShowMediaPicker(null);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setUploadError(null);
      const res = await uploadMediaFile(file, 'branding');
      setConfig((prev) => ({ ...prev, logo_url: res.url }));
    } catch (err: any) {
      setUploadError('Erro no envio do logo: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setUploadError(null);
      const res = await uploadMediaFile(file, 'hero');
      setConfig((prev) => ({ ...prev, video_url: res.url, video_enabled: true }));
    } catch (err: any) {
      setUploadError('Erro no envio do vídeo: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleNewSlideUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMobile = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setUploadError(null);
      const res = await uploadMediaFile(file, 'hero');
      if (isMobile) {
        setNewSlide((prev) => ({ ...prev, image_mobile: res.url }));
      } else {
        setNewSlide((prev) => ({ ...prev, image_desktop: res.url }));
      }
    } catch (err: any) {
      setUploadError('Erro no envio do arquivo: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEditSlideUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMobile = false) => {
    const file = e.target.files?.[0];
    if (!file || !editingSlide) return;

    try {
      setUploadingImage(true);
      setUploadError(null);
      const res = await uploadMediaFile(file, 'hero');
      if (isMobile) {
        setEditingSlide((prev) => (prev ? { ...prev, image_mobile: res.url } : null));
      } else {
        setEditingSlide((prev) => (prev ? { ...prev, image_desktop: res.url } : null));
      }
    } catch (err: any) {
      setUploadError('Erro no envio do arquivo: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlide.image_desktop) {
      setUploadError('A imagem ou vídeo principal (Desktop) é obrigatório.');
      return;
    }

    try {
      setSaving(true);
      await addHeroSlide(newSlide);
      setShowAddModal(false);
      setNewSlide({ image_desktop: '', image_mobile: '', title: '', subtitle: '' });
      setUploadError(null);
      onRefresh();
    } catch (err: any) {
      setUploadError('Erro ao adicionar slide: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEditedSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;

    try {
      setSaving(true);
      await updateHeroSlide(editingSlide.id, {
        image_desktop: editingSlide.image_desktop,
        image_mobile: editingSlide.image_mobile,
        title: editingSlide.title,
        subtitle: editingSlide.subtitle,
        is_active: editingSlide.is_active
      });
      setEditingSlide(null);
      onRefresh();
    } catch (err: any) {
      alert('Erro ao atualizar slide: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlide = async (id: number) => {
    if (!confirm('Tem certeza que deseja remover este slide da Hero?')) return;
    try {
      await deleteHeroSlide(id);
      onRefresh();
    } catch (err: any) {
      alert('Erro ao excluir slide: ' + err.message);
    }
  };

  const handleToggleSlideActive = async (slide: HeroSlide) => {
    try {
      await updateHeroSlide(slide.id, { is_active: !slide.is_active });
      onRefresh();
    } catch (err: any) {
      alert('Erro ao atualizar status do slide: ' + err.message);
    }
  };

  const handleMoveSlide = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const newSlides = [...slides];
    const [moved] = newSlides.splice(index, 1);
    newSlides.splice(targetIndex, 0, moved);

    setSlides(newSlides);
    try {
      await reorderHeroSlides(newSlides.map((s) => s.id));
      onRefresh();
    } catch (err: any) {
      alert('Erro ao reordenar slides: ' + err.message);
    }
  };

  const isVideo = (url?: string) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov');
  };

  const filteredMedia = mediaList.filter((m) =>
    m.filename.toLowerCase().includes(mediaFilter.toLowerCase()) ||
    m.url.toLowerCase().includes(mediaFilter.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-sky-400" />
            Configuração da Hero Section & Slideshow
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Personalize o logotipo centralizado, fotos/vídeos de fundo da Hero, velocidade de transição e opacidade do overlay.
          </p>
        </div>

        <button
          onClick={() => {
            setShowAddModal(true);
            setUploadError(null);
          }}
          className="bg-gradient-to-r from-sky-400 to-blue-600 text-white font-semibold px-5 py-2.5 rounded-full text-xs uppercase tracking-wider flex items-center gap-2 hover:opacity-95 transition-all shadow-md shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Slide (Foto / Vídeo)</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2.5 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Configurações da Hero salvas e sincronizadas com sucesso com o banco de dados!</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2.5 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSaveConfig} className="space-y-8">
        {/* Module 1: Logo Centralization & Sizing */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0f1115] border border-white/10 space-y-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-sky-400 flex items-center gap-2">
            <span>1. Logotipo Exclusivo Centralizado</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed font-light">
            O logotipo oficial da G11 Conceito Financeiro fica posicionado no centro da Hero Section com fundo transparente.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Logo Preview */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-xl bg-black/60 border border-white/10 min-h-[160px]">
              <img
                src={config.logo_url || '/uploads/branding/logo_hero_central.png'}
                alt="Logo Preview"
                className="max-h-24 w-auto object-contain"
                style={{ width: `${Math.min(config.logo_size_desktop || 420, 280)}px` }}
              />
              <span className="text-[10px] text-slate-500 mt-3">Pré-visualização do logotipo atual</span>
            </div>

            {/* Controls */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                  Substituir Arquivo do Logotipo
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-500 file:text-white hover:file:opacity-90 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => openMediaPicker('logo')}
                    className="px-3 py-1.5 rounded-lg border border-sky-500/30 text-sky-300 hover:bg-sky-500/10 text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Escolher da Biblioteca</span>
                  </button>
                  {uploadingImage && (
                    <span className="text-xs text-sky-400 flex items-center gap-1">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Enviando...
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                    Largura Desktop: {config.logo_size_desktop || 420}px
                  </label>
                  <input
                    type="range"
                    min="200"
                    max="650"
                    step="10"
                    value={config.logo_size_desktop || 420}
                    onChange={(e) => setConfig({ ...config, logo_size_desktop: Number(e.target.value) })}
                    className="w-full accent-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                    Largura Mobile: {config.logo_size_mobile || 280}px
                  </label>
                  <input
                    type="range"
                    min="160"
                    max="400"
                    step="10"
                    value={config.logo_size_mobile || 280}
                    onChange={(e) => setConfig({ ...config, logo_size_mobile: Number(e.target.value) })}
                    className="w-full accent-sky-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Module 2: Slideshow & Visual Transition Controls */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0f1115] border border-white/10 space-y-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-sky-400">
            2. Comportamento do Slideshow & Overlay
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                Slideshow Ativo
              </label>
              <select
                value={config.slideshow_enabled ? 'true' : 'false'}
                onChange={(e) => setConfig({ ...config, slideshow_enabled: e.target.value === 'true' })}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
              >
                <option value="true">Sim (Transição Automática)</option>
                <option value="false">Não (Fixo no Primeiro Slide)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                Duração de cada Slide
              </label>
              <select
                value={config.transition_duration || 6000}
                onChange={(e) => setConfig({ ...config, transition_duration: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
              >
                <option value={4000}>4 Segundos (Rápido)</option>
                <option value={6000}>6 Segundos (Padrão)</option>
                <option value={8000}>8 Segundos (Suave)</option>
                <option value={10000}>10 Segundos (Cinematográfico)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                Escurecimento do Fundo: {config.overlay_darkness ?? 65}%
              </label>
              <input
                type="range"
                min="20"
                max="95"
                step="5"
                value={config.overlay_darkness ?? 65}
                onChange={(e) => setConfig({ ...config, overlay_darkness: Number(e.target.value) })}
                className="w-full accent-sky-500"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                Intensidade do Blur
              </label>
              <select
                value={config.overlay_blur || 'sm'}
                onChange={(e) => setConfig({ ...config, overlay_blur: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
              >
                <option value="none">Nenhum</option>
                <option value="sm">Suave (Recomendado)</option>
                <option value="md">Médio</option>
                <option value="lg">Intenso</option>
              </select>
            </div>
          </div>
        </div>

        {/* Module: Continuous Background Video */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0f1115] border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-sky-400 flex items-center gap-2">
                <Video className="w-4 h-4 text-sky-400" />
                <span>Vídeo de Fundo Contínuo da Hero (Cinematográfico)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Quando ativado, o vídeo roda em loop contínuo sob a película escura cinematográfica (inclusive no modo claro), com áudio mudo e sem travar a navegação.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={!!config.video_enabled}
                onChange={(e) => setConfig({ ...config, video_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
              <span className="ml-3 text-xs font-medium text-slate-300">
                {config.video_enabled ? 'Vídeo Ativo' : 'Desativado'}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-7 space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                  URL do Vídeo (MP4 ou WebM)
                </label>
                <input
                  type="text"
                  placeholder="Ex: /uploads/hero/hero_video.mp4 ou URL direta"
                  value={config.video_url || ''}
                  onChange={(e) => setConfig({ ...config, video_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                  Enviar Arquivo de Vídeo (.mp4 / .webm)
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="file"
                    accept="video/mp4,video/webm"
                    onChange={handleVideoUpload}
                    className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-500 file:text-white hover:file:opacity-90 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => openMediaPicker('video')}
                    className="px-3 py-1.5 rounded-lg border border-sky-500/30 text-sky-300 hover:bg-sky-500/10 text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Escolher da Biblioteca</span>
                  </button>
                  {config.video_url && (
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, video_url: '', video_enabled: false })}
                      className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      Remover Vídeo
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl bg-black/60 border border-white/10 min-h-[160px]">
              {config.video_url ? (
                <div className="w-full space-y-2">
                  <video
                    src={config.video_url}
                    controls
                    muted
                    className="w-full h-36 rounded-lg bg-black object-cover"
                  />
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Vídeo configurado para a Hero
                  </span>
                </div>
              ) : (
                <div className="text-center text-slate-500 text-xs py-8">
                  <Video className="w-8 h-8 mx-auto mb-2 opacity-40 text-sky-400" />
                  Nenhum vídeo configurado. O slideshow de imagens será utilizado.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Module 3: Texts and Action CTAs */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0f1115] border border-white/10 space-y-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-sky-400">
            3. Frases de Destaque & Botões de Ação
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                Tagline Superior
              </label>
              <input
                type="text"
                value={config.tagline || ''}
                onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
                placeholder="Ex: G11 Conceito Financeiro"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                Subtítulo Principal
              </label>
              <input
                type="text"
                value={config.subtitle || ''}
                onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
                placeholder="Ex: Assessoria de Alta Performance para Corretores"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                Botão Primário (Texto)
              </label>
              <input
                type="text"
                value={config.cta_primary_text || ''}
                onChange={(e) => setConfig({ ...config, cta_primary_text: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
                placeholder="Fale com um Especialista"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                Botão Primário (Link/WhatsApp)
              </label>
              <input
                type="text"
                value={config.cta_primary_link || ''}
                onChange={(e) => setConfig({ ...config, cta_primary_link: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
                placeholder="https://wa.me/5511..."
              />
            </div>
          </div>
        </div>

        {/* Save Config Button */}
        <button
          type="submit"
          disabled={saving}
          className="bg-gradient-to-r from-sky-400 to-blue-600 text-white font-bold px-8 py-3.5 rounded-full text-xs uppercase tracking-wider flex items-center gap-2 hover:opacity-95 transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Salvando...' : 'Salvar Todas as Configurações da Hero'}</span>
        </button>
      </form>

      {/* Module 4: Individual Slide Management */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0f1115] border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-sky-400">
              4. Mídia do Slideshow ({slides.length} cadastrados)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Fotos ou vídeos em alta resolução que compõem o fundo da Hero Section.
            </p>
          </div>

          <button
            onClick={() => {
              setShowAddModal(true);
              setUploadError(null);
            }}
            className="bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Foto / Vídeo</span>
          </button>
        </div>

        <div className="space-y-3">
          {slides.map((slide, idx) => (
            <div
              key={slide.id}
              className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-sky-500/30 transition-all"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-24 h-16 rounded-lg overflow-hidden bg-slate-900 border border-white/10 shrink-0 relative flex items-center justify-center">
                  {isVideo(slide.image_desktop) ? (
                    <div className="relative w-full h-full">
                      <video src={slide.image_desktop} className="w-full h-full object-cover" muted />
                      <Video className="w-4 h-4 text-sky-400 absolute bottom-1 right-1 drop-shadow" />
                    </div>
                  ) : (
                    <img
                      src={slide.image_desktop}
                      alt={slide.title || 'Slide'}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white">
                    {slide.title || `Slide #${idx + 1}`}
                  </h4>
                  <p className="text-xs text-slate-400 font-light line-clamp-1">
                    {slide.subtitle || 'Sem legenda adicional'}
                  </p>
                  <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-1 ${
                    slide.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {slide.is_active ? 'Visível' : 'Oculto'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMoveSlide(idx, 'up')}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30 cursor-pointer"
                  title="Mover para cima"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={idx === slides.length - 1}
                  onClick={() => handleMoveSlide(idx, 'down')}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30 cursor-pointer"
                  title="Mover para baixo"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSlide(slide)}
                  className="p-2 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 cursor-pointer"
                  title="Editar slide"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleSlideActive(slide)}
                  className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-slate-200 cursor-pointer"
                >
                  {slide.is_active ? 'Ocultar' : 'Ativar'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteSlide(slide.id)}
                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer"
                  title="Remover slide"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Slide Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0f1115] border border-white/15 rounded-2xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-sky-400" />
                Adicionar Novo Slide à Hero
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleAddSlide} className="space-y-4">
              {/* Media File Upload Area */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                  Mídia Desktop (Imagem ou Vídeo MP4) *
                </label>

                {/* Preview if media is selected/uploaded */}
                {newSlide.image_desktop && (
                  <div className="mb-3 rounded-xl overflow-hidden border border-sky-500/40 relative max-h-48 bg-black flex items-center justify-center">
                    {isVideo(newSlide.image_desktop) ? (
                      <video src={newSlide.image_desktop} className="w-full h-44 object-cover" controls autoPlay muted loop />
                    ) : (
                      <img src={newSlide.image_desktop} alt="Preview" className="w-full h-44 object-cover" />
                    )}
                    <span className="absolute top-2 right-2 bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      ✓ Mídia Carregada
                    </span>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-black/50 border border-dashed border-white/20 hover:border-sky-400 transition-all flex flex-col items-center justify-center text-center">
                  <Upload className="w-6 h-6 text-sky-400 mb-2" />
                  <p className="text-xs text-white font-medium mb-1">
                    Clique abaixo para selecionar do computador
                  </p>
                  <p className="text-[10px] text-slate-400 mb-3">
                    Formatos aceitos: JPG, PNG, WEBP, MP4
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <input
                      type="file"
                      accept="image/*,video/mp4,video/webm"
                      onChange={(e) => handleNewSlideUpload(e, false)}
                      className="text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-500 file:text-white hover:file:opacity-90 cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => openMediaPicker('new_desktop')}
                      className="px-3 py-1.5 rounded-lg border border-sky-500/30 text-sky-300 hover:bg-sky-500/10 text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Escolher da Galeria</span>
                    </button>
                  </div>

                  {uploadingImage && (
                    <div className="mt-3 text-xs text-sky-400 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enviando arquivo para o servidor... aguarde</span>
                    </div>
                  )}
                </div>

                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Ou cole a URL direta (/uploads/...)"
                    value={newSlide.image_desktop}
                    onChange={(e) => setNewSlide({ ...newSlide, image_desktop: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
                  />
                </div>
              </div>

              {/* Title and Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                    Título / Destino (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Convenção Suíça"
                    value={newSlide.title}
                    onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                    Subtítulo / Ano (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 2026"
                    value={newSlide.subtitle}
                    onChange={(e) => setNewSlide({ ...newSlide, subtitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage || !newSlide.image_desktop || saving}
                  className="bg-gradient-to-r from-sky-400 to-blue-600 text-white font-semibold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Adicionar Slide</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Slide Modal */}
      {editingSlide && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0f1115] border border-white/15 rounded-2xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-sky-400" />
                Editar Slide da Hero
              </h3>
              <button
                onClick={() => setEditingSlide(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedSlide} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                  Mídia Atual
                </label>
                <div className="mb-3 rounded-xl overflow-hidden border border-white/10 relative max-h-48 bg-black flex items-center justify-center">
                  {isVideo(editingSlide.image_desktop) ? (
                    <video src={editingSlide.image_desktop} className="w-full h-44 object-cover" controls muted />
                  ) : (
                    <img src={editingSlide.image_desktop} alt="Preview" className="w-full h-44 object-cover" />
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <input
                    type="file"
                    accept="image/*,video/mp4,video/webm"
                    onChange={(e) => handleEditSlideUpload(e, false)}
                    className="text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-500 file:text-white hover:file:opacity-90 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => openMediaPicker('edit_desktop')}
                    className="px-3 py-1.5 rounded-lg border border-sky-500/30 text-sky-300 hover:bg-sky-500/10 text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Escolher da Galeria</span>
                  </button>
                </div>

                {uploadingImage && (
                  <div className="text-xs text-sky-400 flex items-center gap-2 mb-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Enviando nova mídia...</span>
                  </div>
                )}

                <input
                  type="text"
                  value={editingSlide.image_desktop}
                  onChange={(e) => setEditingSlide({ ...editingSlide, image_desktop: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                    Título / Destino
                  </label>
                  <input
                    type="text"
                    value={editingSlide.title || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                    Subtítulo / Ano
                  </label>
                  <input
                    type="text"
                    value={editingSlide.subtitle || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingSlide(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="bg-gradient-to-r from-sky-400 to-blue-600 text-white font-semibold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                >
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f1115] border border-white/15 rounded-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] flex flex-col space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-sky-400" />
                Selecione uma Mídia da Biblioteca
              </h3>
              <button
                onClick={() => setShowMediaPicker(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <input
              type="text"
              placeholder="Buscar pelo nome do arquivo..."
              value={mediaFilter}
              onChange={(e) => setMediaFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
            />

            <div className="flex-1 overflow-y-auto pr-1">
              {loadingMedia ? (
                <div className="flex items-center justify-center py-12 text-sky-400 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-xs">Carregando mídias...</span>
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Nenhuma mídia encontrada com esse filtro.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredMedia.map((m, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectMedia(m.url)}
                      className="group relative rounded-xl overflow-hidden border border-white/10 hover:border-sky-400 bg-black aspect-video flex items-center justify-center transition-all cursor-pointer"
                    >
                      {isVideo(m.url) ? (
                        <div className="relative w-full h-full">
                          <video src={m.url} className="w-full h-full object-cover" muted />
                          <Video className="w-4 h-4 text-sky-400 absolute bottom-1 right-1" />
                        </div>
                      ) : (
                        <img src={m.url} alt={m.filename} className="w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center">
                        <span className="text-[11px] font-semibold text-white truncate max-w-full">
                          {m.filename}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowMediaPicker(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:text-white"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
