import React, { useState, useEffect } from 'react';
import { FolderOpen, Plus, Trash2, Edit3, Image as ImageIcon, MapPin, ArrowLeft, ArrowUp, ArrowDown, Eye, Upload, Save, CheckCircle2 } from 'lucide-react';
import { Album, Photo } from '../../types';
import { fetchAdminAlbums, createAlbum, updateAlbum, deleteAlbum, addPhotoToAlbum, deletePhoto, updatePhoto, reorderPhotos, uploadMediaFile } from '../../services/api';

export const AdminAlbums: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  // Modals
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [albumFormData, setAlbumFormData] = useState({
    title: '',
    destination: '',
    category: 'Viagens Internacionais',
    year: '2025',
    cover_image: '',
    description: '',
    is_active: true
  });

  // Photo upload
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoFormData, setPhotoFormData] = useState({
    url: '',
    title: '',
    alt_text: '',
    caption: ''
  });
  const [uploading, setUploading] = useState(false);

  const loadAlbums = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminAlbums();
      setAlbums(data);
      if (selectedAlbum) {
        const refreshed = data.find((a) => a.id === selectedAlbum.id);
        setSelectedAlbum(refreshed || null);
      }
    } catch (err) {
      console.error('Error loading albums:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlbums();
  }, []);

  const handleOpenAlbumModal = (album?: Album) => {
    if (album) {
      setEditingAlbum(album);
      setAlbumFormData({
        title: album.title,
        destination: album.destination,
        category: album.category,
        year: album.year || '2025',
        cover_image: album.cover_image,
        description: album.description || '',
        is_active: Boolean(album.is_active)
      });
    } else {
      setEditingAlbum(null);
      setAlbumFormData({
        title: '',
        destination: '',
        category: 'Viagens Internacionais',
        year: new Date().getFullYear().toString(),
        cover_image: '',
        description: '',
        is_active: true
      });
    }
    setShowAlbumModal(true);
  };

  const handleSaveAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAlbum) {
        await updateAlbum(editingAlbum.id, albumFormData);
      } else {
        await createAlbum(albumFormData);
      }
      setShowAlbumModal(false);
      loadAlbums();
    } catch (err: any) {
      alert('Erro ao salvar álbum: ' + err.message);
    }
  };

  const handleDeleteAlbum = async (id: number) => {
    if (!confirm('Deseja realmente excluir este álbum e todas as suas fotografias? Esta ação é irreversível.')) return;
    try {
      await deleteAlbum(id);
      if (selectedAlbum?.id === id) setSelectedAlbum(null);
      loadAlbums();
    } catch (err: any) {
      alert('Erro ao excluir álbum: ' + err.message);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const res = await uploadMediaFile(file, 'capas_eventos');
      setAlbumFormData({ ...albumFormData, cover_image: res.url });
    } catch (err: any) {
      alert('Erro no envio da capa: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const folderName = selectedAlbum?.slug || 'galeria';
      const res = await uploadMediaFile(file, `eventos_e_viagens/${folderName}`);
      setPhotoFormData({
        ...photoFormData,
        url: res.url,
        title: photoFormData.title || file.name.replace(/\.[^/.]+$/, ''),
        alt_text: photoFormData.alt_text || `Foto de ${selectedAlbum?.title}`
      });
    } catch (err: any) {
      alert('Erro no envio da foto: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAddPhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlbum) return;
    if (!photoFormData.url) {
      alert('A imagem é obrigatória.');
      return;
    }

    try {
      await addPhotoToAlbum(selectedAlbum.id, photoFormData);
      setShowPhotoModal(false);
      setPhotoFormData({ url: '', title: '', alt_text: '', caption: '' });
      loadAlbums();
    } catch (err: any) {
      alert('Erro ao adicionar foto: ' + err.message);
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (!confirm('Excluir esta foto?')) return;
    try {
      await deletePhoto(photoId);
      loadAlbums();
    } catch (err: any) {
      alert('Erro ao remover foto: ' + err.message);
    }
  };

  const handleMovePhoto = async (index: number, direction: 'up' | 'down') => {
    if (!selectedAlbum?.photos) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= selectedAlbum.photos.length) return;

    const newPhotos = [...selectedAlbum.photos];
    const [moved] = newPhotos.splice(index, 1);
    newPhotos.splice(targetIndex, 0, moved);

    try {
      await reorderPhotos(selectedAlbum.id, newPhotos.map((p) => p.id));
      loadAlbums();
    } catch (err: any) {
      alert('Erro ao reordenar fotos: ' + err.message);
    }
  };

  // IF AN ALBUM IS SELECTED, SHOW ITS PHOTO MANAGEMENT VIEW
  if (selectedAlbum) {
    const photos = selectedAlbum.photos || [];

    return (
      <div className="space-y-8 animate-fade-in">
        {/* Back and Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedAlbum(null)}
              className="p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
              title="Voltar para lista de álbuns"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#c5a059] bg-[#c5a059]/10 px-2 py-0.5 rounded-full">
                  {selectedAlbum.destination}
                </span>
                <span className="text-xs text-slate-400">({photos.length} fotos)</span>
              </div>
              <h2 className="text-2xl font-bold text-white mt-0.5">{selectedAlbum.title}</h2>
            </div>
          </div>

          <button
            onClick={() => setShowPhotoModal(true)}
            className="gold-gradient-bg text-black font-semibold px-5 py-2.5 rounded-full text-xs uppercase tracking-wider flex items-center gap-2 hover:opacity-95 transition-all shadow-md shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Foto ao Álbum</span>
          </button>
        </div>

        {/* Photos Grid */}
        {photos.length === 0 ? (
          <div className="text-center py-20 rounded-2xl bg-[#0f1115] border border-white/10 text-slate-400">
            <ImageIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p>Nenhuma foto cadastrada neste álbum ainda.</p>
            <button
              onClick={() => setShowPhotoModal(true)}
              className="mt-4 gold-gradient-bg text-black font-semibold px-5 py-2 rounded-full text-xs uppercase tracking-wider inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Enviar Primeira Foto</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {photos.map((photo, idx) => (
              <div
                key={photo.id}
                className="group rounded-2xl bg-[#0f1115] border border-white/10 overflow-hidden flex flex-col justify-between shadow-lg hover:border-[#c5a059]/40 transition-all"
              >
                <div className="relative aspect-[4/3] bg-black/40 overflow-hidden">
                  <img
                    src={photo.url}
                    alt={photo.alt_text || photo.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] text-slate-300 font-mono">
                    #{idx + 1}
                  </div>
                </div>

                <div className="p-3.5 space-y-2">
                  <p className="text-xs font-semibold text-white truncate">
                    {photo.title || `Foto #${idx + 1}`}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {photo.alt_text || 'Sem texto alternativo'}
                  </p>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMovePhoto(idx, 'up')}
                        className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-20"
                        title="Mover para esquerda/cima"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === photos.length - 1}
                        onClick={() => handleMovePhoto(idx, 'down')}
                        className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-20"
                        title="Mover para direita/baixo"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                      title="Excluir foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Photo Modal */}
        {showPhotoModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#0f1115] border border-white/15 rounded-2xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl">
              <h3 className="text-lg font-bold text-white">Adicionar Foto a {selectedAlbum.title}</h3>

              <form onSubmit={handleAddPhotoSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                    Selecionar Arquivo de Imagem
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="text-xs text-slate-400 mb-2"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Ou informe a URL da foto (/uploads/...)"
                    value={photoFormData.url}
                    onChange={(e) => setPhotoFormData({ ...photoFormData, url: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                    Título da Foto
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Cerimônia de Premiação Capri"
                    value={photoFormData.title}
                    onChange={(e) => setPhotoFormData({ ...photoFormData, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                    Texto Alternativo (Acessibilidade)
                  </label>
                  <input
                    type="text"
                    placeholder="Descrição da imagem para leitores de tela"
                    value={photoFormData.alt_text}
                    onChange={(e) => setPhotoFormData({ ...photoFormData, alt_text: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowPhotoModal(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || !photoFormData.url}
                    className="gold-gradient-bg text-black font-semibold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider disabled:opacity-50"
                  >
                    Salvar Foto
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ALBUMS LIST VIEW
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <FolderOpen className="w-6 h-6 text-[#c5a059]" />
            Gerenciamento de Pastas & Capas de Realizações
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Controle total das capas de eventos/viagens, álbuns e galerias de fotos da marca.
          </p>
        </div>

        <button
          onClick={() => handleOpenAlbumModal()}
          className="gold-gradient-bg text-black font-semibold px-5 py-2.5 rounded-full text-xs uppercase tracking-wider flex items-center gap-2 hover:opacity-95 transition-all shadow-md shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Álbum</span>
        </button>
      </div>

      {/* Albums Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {albums.map((album) => (
          <div
            key={album.id}
            className="rounded-2xl bg-[#0f1115] border border-white/10 hover:border-[#c5a059]/40 overflow-hidden flex flex-col justify-between shadow-xl transition-all group"
          >
            <div>
              {/* Cover */}
              <div className="relative h-48 w-full overflow-hidden bg-black/40">
                <img
                  src={album.cover_image}
                  alt={album.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/uploads/institucional/sobre_empresa_banner.jpg';
                  }}
                />
                <span className="absolute top-3 left-3 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-black/70 text-[#c5a059] border border-[#c5a059]/30">
                  {album.destination || album.category}
                </span>

                <span className="absolute top-3 right-3 text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/60 text-white border border-white/10 flex items-center gap-1">
                  <ImageIcon className="w-3 h-3 text-[#c5a059]" />
                  {album.photo_count || album.photos?.length || 0}
                </span>
              </div>

              {/* Info */}
              <div className="p-5">
                <span className="text-[10px] text-slate-400 font-mono">{album.year || '2025'}</span>
                <h3 className="text-lg font-bold text-white group-hover:text-[#c5a059] transition-colors leading-snug">
                  {album.title}
                </h3>
                <p className="text-xs text-slate-400 font-light line-clamp-2 mt-1">
                  {album.description || 'Sem descrição cadastrada.'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-5 pt-0 border-t border-white/5 flex items-center justify-between gap-2 mt-2">
              <button
                onClick={() => setSelectedAlbum(album)}
                className="gold-gradient-bg text-black font-semibold px-4 py-2 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 hover:opacity-95 transition-all"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Ver Fotos ({album.photo_count || album.photos?.length || 0})</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenAlbumModal(album)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
                  title="Editar capa e detalhes do álbum"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteAlbum(album.id)}
                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
                  title="Excluir álbum"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Album Edit/Create Modal */}
      {showAlbumModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f1115] border border-white/15 rounded-2xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white">
              {editingAlbum ? `Editar Álbum: ${editingAlbum.title}` : 'Cadastrar Novo Álbum'}
            </h3>

            <form onSubmit={handleSaveAlbum} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                  Título do Álbum
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Capri / Itália"
                  value={albumFormData.title}
                  onChange={(e) => setAlbumFormData({ ...albumFormData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                    Destino / Local
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Itália"
                    value={albumFormData.destination}
                    onChange={(e) => setAlbumFormData({ ...albumFormData, destination: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                    Categoria
                  </label>
                  <select
                    value={albumFormData.category}
                    onChange={(e) => setAlbumFormData({ ...albumFormData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
                  >
                    <option value="Viagens Internacionais">Viagens Internacionais</option>
                    <option value="Eventos & Premiações">Eventos & Premiações</option>
                    <option value="Convenções">Convenções</option>
                    <option value="Experiências">Experiências</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                  Foto de Capa do Álbum
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="text-xs text-slate-400 mb-2"
                />
                <input
                  type="text"
                  placeholder="URL da imagem da capa (/uploads/...)"
                  value={albumFormData.cover_image}
                  onChange={(e) => setAlbumFormData({ ...albumFormData, cover_image: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                  Descrição do Evento
                </label>
                <textarea
                  rows={3}
                  placeholder="Memórias, contexto e momentos especiais..."
                  value={albumFormData.description}
                  onChange={(e) => setAlbumFormData({ ...albumFormData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="album_active"
                  checked={albumFormData.is_active}
                  onChange={(e) => setAlbumFormData({ ...albumFormData, is_active: e.target.checked })}
                  className="rounded accent-[#c5a059]"
                />
                <label htmlFor="album_active" className="text-xs text-slate-300">
                  Álbum visível no site público
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAlbumModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="gold-gradient-bg text-black font-semibold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider disabled:opacity-50"
                >
                  Salvar Álbum
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
