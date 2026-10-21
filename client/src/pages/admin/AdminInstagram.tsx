import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Code2,
  Link2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Eye,
  Upload,
  Loader2,
  X,
  Sparkles
} from 'lucide-react';
import { InstagramIcon } from '../../components/icons/InstagramIcon';
import { InstagramPost } from '../../types';
import {
  fetchAdminInstagram,
  addInstagramPost,
  updateInstagramPost,
  deleteInstagramPost,
  uploadMediaFile,
  fetchMediaLibrary
} from '../../services/api';

function extractInstagramPermalink(text: string): string | null {
  if (!text) return null;
  const match = text.match(/https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/i);
  if (match) return `https://www.instagram.com/p/${match[1]}/`;
  return null;
}

function extractInstagramMetadata(text: string): {
  url: string | null;
  author: string | null;
  handle: string | null;
  cleanTitle: string | null;
} {
  if (!text) return { url: null, author: null, handle: null, cleanTitle: null };

  const urlMatch = text.match(/https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/i);
  const url = urlMatch ? `https://www.instagram.com/p/${urlMatch[1]}/` : null;

  // Extract author from embed text (PT and EN formats)
  let author: string | null = null;
  const authorMatch = text.match(/(?:Uma publicação (?:partilhada|compartilhada) por|A post shared by)\s+([^<]+)/i);
  if (authorMatch && authorMatch[1]) {
    author = authorMatch[1].trim();
  }

  // Extract handle
  let handle: string | null = null;
  const handleMatch = text.match(/@([a-zA-Z0-9_.]+)/);
  if (handleMatch) {
    handle = handleMatch[0];
  }

  let cleanTitle: string | null = null;
  if (author) {
    cleanTitle = author;
  } else if (handle) {
    cleanTitle = `Publicação de ${handle}`;
  }

  return { url, author, handle, cleanTitle };
}

export const AdminInstagram: React.FC = () => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<InstagramPost | null>(null);
  const [deleteConfirmPost, setDeleteConfirmPost] = useState<InstagramPost | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    post_url: '',
    title: '',
    category: 'Institucional',
    embed_html: '',
    image_url: '',
    is_active: true
  });

  const [activeTab, setActiveTab] = useState<'embed' | 'url' | 'media'>('embed');
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Media upload & picker state
  const [uploadingCover, setUploadingCover] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaList, setMediaList] = useState<Array<{ url: string; filename: string }>>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [mediaFilter, setMediaFilter] = useState('');

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminInstagram();
      setPosts(data);
    } catch (err) {
      console.error('Error fetching Instagram posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // Trigger Instagram embed processing when preview is open
  useEffect(() => {
    if (showLivePreview && typeof window !== 'undefined' && (window as any).instgrm) {
      try {
        setTimeout(() => {
          (window as any).instgrm.Embeds.process();
        }, 300);
      } catch (e) {
        console.warn('Instagram embed preview notice:', e);
      }
    }
  }, [showLivePreview, formData.embed_html]);

  const handleOpenModal = (post?: InstagramPost) => {
    if (post) {
      setEditingPost(post);
      setFormData({
        post_url: post.post_url || '',
        title: post.title || '',
        category: post.category || 'Institucional',
        embed_html: post.embed_html || '',
        image_url: post.image_url || '',
        is_active: Boolean(post.is_active)
      });
      setActiveTab(post.embed_html ? 'embed' : 'url');
    } else {
      setEditingPost(null);
      setFormData({
        post_url: '',
        title: '',
        category: 'Institucional',
        embed_html: '',
        image_url: '',
        is_active: true
      });
      setActiveTab('embed');
    }
    setShowLivePreview(false);
    setStatusMessage(null);
    setShowModal(true);
  };

  // Auto extract URL and author name when embed code is pasted
  const handleEmbedChange = (code: string) => {
    const meta = extractInstagramMetadata(code);
    setFormData((prev) => {
      const isAutoOrEmpty = !prev.title || prev.title.startsWith('Publicação Instagram') || prev.title.trim() === '';
      return {
        ...prev,
        embed_html: code,
        post_url: meta.url || prev.post_url,
        title: isAutoOrEmpty && meta.cleanTitle ? meta.cleanTitle : prev.title
      };
    });
    if (meta.cleanTitle) {
      setStatusMessage(`Nome do perfil identificado: "${meta.cleanTitle}"`);
      setTimeout(() => setStatusMessage(null), 5000);
    } else if (meta.url) {
      setStatusMessage('Link do Instagram detectado e vinculado automaticamente!');
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingCover(true);
      const res = await uploadMediaFile(file, 'instagram');
      setFormData((prev) => ({ ...prev, image_url: res.url }));
    } catch (err: any) {
      alert('Erro no upload da capa: ' + err.message);
    } finally {
      setUploadingCover(false);
    }
  };

  const openMediaPicker = async () => {
    setShowMediaPicker(true);
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // If embed_html was provided without post_url, attempt extraction
    let finalPostUrl = formData.post_url.trim();
    const meta = extractInstagramMetadata(formData.embed_html);
    if (!finalPostUrl && meta.url) {
      finalPostUrl = meta.url;
    }

    if (!finalPostUrl && !formData.embed_html) {
      alert('Por favor, informe o link do post ou cole o código de incorporação do Instagram.');
      return;
    }

    let finalTitle = formData.title.trim();
    if (!finalTitle || finalTitle.startsWith('Publicação Instagram (')) {
      finalTitle = meta.cleanTitle || (formData.post_url.includes('g11conceitofinanceiro') ? 'G11 Conceito Financeiro (@g11conceitofinanceiro)' : 'Publicação Oficial do Instagram');
    }

    try {
      const payload = {
        ...formData,
        title: finalTitle,
        post_url: finalPostUrl || 'https://www.instagram.com/g11conceitofinanceiro/'
      };

      if (editingPost) {
        await updateInstagramPost(editingPost.id, payload);
      } else {
        await addInstagramPost(payload);
      }
      setShowModal(false);
      loadPosts();
    } catch (err: any) {
      alert('Erro ao salvar publicação: ' + err.message);
    }
  };

  const handleRequestDelete = (post: InstagramPost) => {
    setDeleteConfirmPost(post);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmPost) return;
    const targetId = deleteConfirmPost.id;
    try {
      setDeleting(true);
      // Optimistic removal from state
      setPosts((prev) => prev.filter((p) => p.id !== targetId));
      setDeleteConfirmPost(null);
      if (editingPost?.id === targetId) {
        setShowModal(false);
        setEditingPost(null);
      }
      await deleteInstagramPost(targetId);
      setStatusMessage('Publicação excluída com sucesso.');
      setTimeout(() => setStatusMessage(null), 3500);
      loadPosts();
    } catch (err: any) {
      alert('Erro ao excluir publicação: ' + (err.message || 'Falha na comunicação com o servidor'));
      loadPosts();
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (post: InstagramPost) => {
    try {
      await updateInstagramPost(post.id, { is_active: !post.is_active });
      loadPosts();
    } catch (err: any) {
      alert('Erro ao atualizar status: ' + err.message);
    }
  };

  const filteredMedia = mediaList.filter((m) =>
    m.filename.toLowerCase().includes(mediaFilter.toLowerCase()) ||
    m.url.toLowerCase().includes(mediaFilter.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <InstagramIcon className="w-6 h-6 text-[#c5a059]" />
            Gerenciamento do Instagram & Incorporações
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Cadastre o código de incorporação (embed oficial) ou links das publicações para exibição no site.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="gold-gradient-bg text-black font-semibold px-5 py-2.5 rounded-full text-xs uppercase tracking-wider flex items-center gap-2 hover:opacity-95 transition-all shadow-md shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Incorporação / Post</span>
        </button>
      </div>

      {/* Guide Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#18120b] to-[#0f1115] border border-[#c5a059]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-[#c5a059]/10 text-[#c5a059] shrink-0 mt-0.5">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Como obter a incorporação oficial do Instagram?</h4>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed font-light">
              Abra qualquer publicação ou Reel no Instagram pelo navegador ou celular &rarr; clique nos <strong>três pontinhos (...)</strong> &rarr; escolha <strong>Incorporar (Embed)</strong> &rarr; copie o código e cole no painel.
            </p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="text-xs font-semibold text-[#c5a059] hover:underline flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <span>Inserir Agora</span>
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 text-xs">
          <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#c5a059]" />
          Carregando publicações...
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-[#0f1115] border border-white/5 space-y-3">
          <InstagramIcon className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-white">Nenhuma publicação cadastrada</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Adicione publicações incorporadas para exibir os conteúdos oficiais da @g11conceitofinanceiro no site.
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl gold-gradient-bg text-black text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Cadastrar Primeiro Post
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post: InstagramPost) => (
            <div
              key={post.id}
              className="rounded-2xl bg-[#0f1115] border border-white/10 p-5 flex flex-col justify-between shadow-lg hover:border-[#c5a059]/40 transition-all space-y-4"
            >
              <div>
                {/* Header row */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#c5a059] bg-[#c5a059]/10 px-2.5 py-0.5 rounded-full">
                    {post.category || 'Institucional'}
                  </span>
                  <div className="flex items-center gap-2">
                    {post.embed_html ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1">
                        <Code2 className="w-3 h-3" /> Embed
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20 flex items-center gap-1">
                        <Link2 className="w-3 h-3" /> Link
                      </span>
                    )}
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        post.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {post.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>

                {/* Optional Cover Thumbnail */}
                {post.image_url && (
                  <div className="w-full h-36 rounded-xl overflow-hidden mb-3 bg-black/50 border border-white/5">
                    <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                )}

                <h3 className="text-sm font-semibold text-white line-clamp-2 mb-2">{post.title}</h3>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 break-all">
                  <p className="text-[11px] text-slate-400 font-mono truncate">{post.post_url}</p>
                  <a
                    href={post.post_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-xs text-[#c5a059] hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>Abrir no Instagram oficial</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggleActive(post)}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  {post.is_active ? 'Desativar' : 'Ativar'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenModal(post)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer"
                    title="Editar publicação / incorporação"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRequestDelete(post)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer transition-colors"
                    title="Remover publicação"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal with Incorporation & Preview */}
      {showModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden">
          <div className="bg-[#0f1115] border border-white/20 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 bg-[#14171f] shrink-0">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <InstagramIcon className="w-5 h-5 text-[#c5a059]" />
                  <span>{editingPost ? 'Editar Publicação do Instagram' : 'Subir Incorporação do Instagram'}</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Cole o código de incorporação oficial ou link direto da publicação.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input Mode Tabs */}
            <div className="px-5 pt-3 pb-2 bg-[#0f1115] shrink-0 border-b border-white/5">
              <div className="flex rounded-xl bg-black/60 p-1 border border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab('embed')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'embed'
                      ? 'bg-[#c5a059] text-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">1. Incorporação (Embed)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('url')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'url'
                      ? 'bg-[#c5a059] text-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Link2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">2. Link Direto (URL)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('media')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'media'
                      ? 'bg-[#c5a059] text-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">3. Capa (Opcional)</span>
                </button>
              </div>

              {statusMessage && (
                <div className="mt-2 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                  <span>{statusMessage}</span>
                </div>
              )}
            </div>

            {/* Scrollable Form Body */}
            <form id="instagram-form" onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 min-h-0">
              {/* TAB 1: EMBED CODE */}
              {activeTab === 'embed' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300">
                      Código de Incorporação Oficial do Instagram (HTML Embed)
                    </label>
                    <span className="text-[10px] text-purple-400 font-mono">Suporta &lt;blockquote&gt; e &lt;iframe&gt;</span>
                  </div>

                  <textarea
                    rows={4}
                    placeholder={`Cole aqui o código copiado do Instagram. Exemplo:\n<blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/..." ...>...</blockquote>\n<script async src="//www.instagram.com/embed.js"></script>`}
                    value={formData.embed_html}
                    onChange={(e) => handleEmbedChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-xs focus:border-[#c5a059] outline-none"
                  />

                  <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 text-xs text-purple-300 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 shrink-0 text-purple-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-purple-200">Detecção Automática Ativa</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Ao colar o código acima, o sistema detecta o link da postagem automaticamente e configura os botões de redirecionamento.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: DIRECT URL */}
              {activeTab === 'url' && (
                <div className="space-y-3">
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300">
                    Link Direto da Publicação (URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.instagram.com/p/..."
                    value={formData.post_url}
                    onChange={(e) => setFormData({ ...formData, post_url: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:border-[#c5a059] outline-none"
                  />
                  <p className="text-[10px] text-slate-500">
                    Insira o link direto de qualquer postagem ou Reel do Instagram.
                  </p>
                </div>
              )}

              {/* TAB 3: CUSTOM COVER / VIDEO MEDIA */}
              {activeTab === 'media' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                      Mídia de Vídeo MP4 ou Imagem de Capa (Opcional)
                    </label>
                    <p className="text-[10px] text-slate-500 mb-2">
                      Permite que a publicação exiba um vídeo MP4 em reprodução automática contínua (sem necessidade de clique no player do Instagram) ou uma foto de capa personalizada.
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        type="file"
                        accept="image/*,video/mp4,video/webm"
                        onChange={handleCoverUpload}
                        className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#c5a059] file:text-black hover:file:opacity-90 cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={openMediaPicker}
                        className="px-3 py-1.5 rounded-lg border border-[#c5a059]/30 text-[#c5a059] hover:bg-[#c5a059]/10 text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Escolher da Biblioteca</span>
                      </button>
                      {uploadingCover && (
                        <span className="text-xs text-[#c5a059] flex items-center gap-1">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Enviando...
                        </span>
                      )}
                      {formData.image_url && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image_url: '' })}
                          className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs cursor-pointer"
                        >
                          Remover Mídia
                        </button>
                      )}
                    </div>
                  </div>

                  {formData.image_url && (
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-black/50 border border-white/10">
                      {formData.image_url.toLowerCase().endsWith('.mp4') || formData.image_url.toLowerCase().endsWith('.webm') ? (
                        <video
                          src={formData.image_url}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      ) : (
                        <img
                          src={formData.image_url}
                          alt="Preview"
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                      <div className="text-xs text-slate-300 truncate">
                        <p className="font-semibold text-white">
                          {formData.image_url.toLowerCase().endsWith('.mp4') || formData.image_url.toLowerCase().endsWith('.webm')
                            ? 'Vídeo configurado (Autoplay ativo)'
                            : 'Capa configurada'}
                        </p>
                        <p className="font-mono text-[10px] text-slate-500 truncate">{formData.image_url}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* COMMON FIELDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                    Título Interno / Identificação *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Convenção Internacional Capri"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:border-[#c5a059] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                    Categoria
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:border-[#c5a059] outline-none"
                  >
                    <option value="Institucional">Institucional</option>
                    <option value="Viagens">Viagens & Experiências</option>
                    <option value="Soluções">Soluções Financeiras</option>
                    <option value="Reconhecimento">Reconhecimento & Eventos</option>
                    <option value="Destaque">Destaque Oficial</option>
                  </select>
                </div>
              </div>

              {/* URL fallback row if in embed tab */}
              {activeTab !== 'url' && formData.post_url && (
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs">
                  <div className="truncate mr-2">
                    <span className="text-slate-500 text-[10px] uppercase font-semibold block">Link Vinculado:</span>
                    <span className="text-slate-300 font-mono text-[11px] truncate">{formData.post_url}</span>
                  </div>
                  <a
                    href={formData.post_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#c5a059] hover:underline shrink-0 flex items-center gap-1 font-medium"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Testar Link</span>
                  </a>
                </div>
              )}

              {/* Live Preview Toggle */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowLivePreview(!showLivePreview)}
                  className="text-xs text-sky-400 hover:underline flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{showLivePreview ? 'Ocultar Pré-visualização' : 'Mostrar Pré-visualização ao Vivo'}</span>
                </button>

                {showLivePreview && (
                  <div className="mt-2.5 p-3 rounded-xl bg-black/80 border border-white/10 max-h-52 overflow-y-auto">
                    {formData.embed_html ? (
                      <div
                        className="[&_iframe]:w-full [&_iframe]:rounded-xl [&_blockquote]:w-full [&_blockquote]:!max-w-full"
                        dangerouslySetInnerHTML={{ __html: formData.embed_html }}
                      />
                    ) : formData.image_url ? (
                      <div className="relative rounded-xl overflow-hidden aspect-video bg-black/60">
                        <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                          <p className="text-white text-xs font-semibold">{formData.title}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 text-center py-4">
                        Cole o código de incorporação ou insira uma imagem para pré-visualizar.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1 pb-1">
                <input
                  type="checkbox"
                  id="post_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded accent-[#c5a059] cursor-pointer"
                />
                <label htmlFor="post_active" className="text-xs text-slate-300 cursor-pointer">
                  Publicação ativa no feed do site público
                </label>
              </div>
            </form>

            {/* Modal Footer (ALWAYS VISIBLE PINNED AT BOTTOM) */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-white/10 bg-[#12141a] shrink-0 z-30">
              {editingPost ? (
                <button
                  type="button"
                  onClick={() => handleRequestDelete(editingPost)}
                  className="px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir Publicação</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  form="instagram-form"
                  className="gold-gradient-bg text-black font-semibold px-6 py-2 rounded-xl text-xs uppercase tracking-wider cursor-pointer hover:opacity-95 shadow-lg flex items-center gap-2 transition-all transform active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingPost ? 'Salvar Alterações' : 'Salvar Publicação'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Media Picker Modal */}
      {showMediaPicker && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100000] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-hidden">
          <div className="bg-[#0f1115] border border-white/20 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col space-y-4 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#c5a059]" />
                <span>Escolher Imagem de Capa da Biblioteca</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowMediaPicker(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              placeholder="Filtrar por nome de arquivo..."
              value={mediaFilter}
              onChange={(e) => setMediaFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
            />

            <div className="flex-1 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 gap-3 pr-1">
              {loadingMedia ? (
                <div className="col-span-full py-12 text-center text-xs text-slate-500">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#c5a059]" />
                  Carregando biblioteca...
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="col-span-full py-12 text-center text-xs text-slate-500">
                  Nenhum arquivo encontrado.
                </div>
              ) : (
                filteredMedia.map((m) => (
                  <button
                    key={m.url}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, image_url: m.url }));
                      setShowMediaPicker(false);
                    }}
                    className="group relative aspect-square rounded-xl overflow-hidden bg-black/60 border border-white/10 hover:border-[#c5a059] transition-all cursor-pointer"
                  >
                    <img src={m.url} alt={m.filename} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center text-[10px] text-white">
                      Selecionar
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal (Native Portal) */}
      {deleteConfirmPost && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12151c] border border-red-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 shrink-0 mt-0.5">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Excluir Publicação?</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Tem certeza que deseja remover esta publicação do feed do site?
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/50 border border-white/5 text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-white truncate">{deleteConfirmPost.title || 'Sem título'}</p>
              <p className="font-mono text-[11px] text-slate-400 truncate">{deleteConfirmPost.post_url}</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteConfirmPost(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-red-600/20 disabled:opacity-50 transition-all"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>{deleting ? 'Removendo...' : 'Sim, Excluir Post'}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
