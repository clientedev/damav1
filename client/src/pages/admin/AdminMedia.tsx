import React, { useState, useEffect } from 'react';
import { Upload, Copy, Check, Image as ImageIcon, Search } from 'lucide-react';
import { fetchMediaLibrary, uploadMediaFile } from '../../services/api';

export const AdminMedia: React.FC = () => {
  const [mediaList, setMediaList] = useState<Array<{ url: string; filename: string; size: number; updatedAt: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadMedia = async () => {
    try {
      setLoading(true);
      const data = await fetchMediaLibrary();
      setMediaList(data);
    } catch (err) {
      console.error('Error fetching media:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      for (let i = 0; i < files.length; i++) {
        await uploadMediaFile(files[i], 'uploads_geral');
      }
      loadMedia();
    } catch (err: any) {
      alert('Erro no envio de arquivo: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const filteredMedia = mediaList.filter((m) =>
    m.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <ImageIcon className="w-6 h-6 text-[#c5a059]" />
            Biblioteca de Mídia ({mediaList.length} arquivos)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Central de armazenamento local persistente. Envie novos arquivos e copie as URLs para usar em qualquer seção.
          </p>
        </div>

        {/* Upload Button */}
        <label className="gold-gradient-bg text-black font-semibold px-5 py-2.5 rounded-full text-xs uppercase tracking-wider flex items-center gap-2 hover:opacity-95 transition-all shadow-md cursor-pointer shrink-0 self-start sm:self-auto">
          <Upload className="w-4 h-4" />
          <span>{uploading ? 'Enviando...' : 'Fazer Upload'}</span>
          <input
            type="file"
            multiple
            accept="image/*,video/mp4"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Buscar arquivo por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0f1115] border border-white/10 text-white placeholder-slate-500 text-xs focus:border-[#c5a059] focus:outline-none"
        />
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredMedia.map((m, idx) => {
          const isCopied = copiedUrl === m.url;
          return (
            <div
              key={idx}
              className="group rounded-xl bg-[#0f1115] border border-white/10 overflow-hidden flex flex-col justify-between shadow-md hover:border-[#c5a059]/40 transition-all"
            >
              <div className="relative aspect-square bg-black/50 overflow-hidden">
                <img
                  src={m.url}
                  alt={m.filename}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <button
                  onClick={() => handleCopy(m.url)}
                  className={`absolute bottom-2 right-2 p-1.5 rounded-lg text-xs flex items-center gap-1 backdrop-blur-md transition-all ${
                    isCopied
                      ? 'bg-emerald-500 text-black font-semibold'
                      : 'bg-black/70 text-slate-200 hover:bg-[#c5a059] hover:text-black'
                  }`}
                  title="Copiar URL"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="p-2.5">
                <p className="text-[11px] font-medium text-white truncate" title={m.filename}>
                  {m.filename}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {(m.size / 1024).toFixed(0)} KB
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
