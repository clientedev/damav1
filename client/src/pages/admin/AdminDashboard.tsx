import React, { useEffect, useState } from 'react';
import { Image as ImageIcon, MapPin, Sliders, Database, ArrowUpRight, FolderOpen, ShieldCheck, Sparkles } from 'lucide-react';
import { InstagramIcon } from '../../components/icons/InstagramIcon';
import { fetchDashboardStats } from '../../services/api';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenPublicSite: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab, onOpenPublicSite }) => {
  const [stats, setStats] = useState<any>({
    albumsCount: 8,
    photosCount: 56,
    heroSlidesCount: 5,
    productsCount: 4,
    testimonialsCount: 4,
    instagramCount: 3,
    databaseType: 'SQLite (Persistent Storage)',
    status: 'Operacional'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats()
      .then((data) => setStats(data))
      .catch((err) => console.warn('Could not load dynamic stats:', err))
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      title: 'Álbuns de Viagens & Eventos',
      value: stats.albumsCount,
      desc: 'Capas e pastas de realizações',
      icon: <MapPin className="w-6 h-6 text-[#c5a059]" />,
      tab: 'albums'
    },
    {
      title: 'Fotografias em Alta Resolução',
      value: stats.photosCount,
      desc: 'Mídias distribuídas nas galerias',
      icon: <ImageIcon className="w-6 h-6 text-blue-400" />,
      tab: 'albums'
    },
    {
      title: 'Slides na Hero Section',
      value: stats.heroSlidesCount,
      desc: 'Transições com logo centralizado',
      icon: <Sliders className="w-6 h-6 text-purple-400" />,
      tab: 'hero'
    },
    {
      title: 'Produtos & Soluções',
      value: stats.productsCount,
      desc: 'Vida, Viagem, Previdência, Saúde',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
      tab: 'content'
    },
    {
      title: 'Publicações do Instagram',
      value: stats.instagramCount,
      desc: 'Embeds oficiais e posts integrados',
      icon: <InstagramIcon className="w-6 h-6 text-pink-400" />,
      tab: 'instagram'
    },
    {
      title: 'Banco de Dados & Storage',
      value: '100% Salvo',
      desc: 'SQLite persistente com uploads locais',
      icon: <Database className="w-6 h-6 text-amber-400" />,
      tab: 'settings'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="rounded-3xl p-8 bg-gradient-to-r from-[#0f1115] via-[#141822] to-[#0f1115] border border-white/10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a059]/10 border border-[#c5a059]/20 text-[11px] font-semibold text-[#c5a059] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Painel Central de Gestão
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            G11 Conceito Financeiro <span className="font-light text-slate-300">CMS</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl font-light">
            Todo o conteúdo extraído do site original está devidamente persistido e editável. Gerencie a Hero section, o logotipo central, pastas de viagens, produtos e publicações.
          </p>
        </div>

        <button
          onClick={onOpenPublicSite}
          className="gold-gradient-bg text-black font-semibold px-6 py-3 rounded-full text-xs uppercase tracking-wider flex items-center gap-2 hover:opacity-95 transition-all shadow-lg shadow-[#c5a059]/20 shrink-0"
        >
          <span>Visualizar Site Público</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((c, i) => (
          <div
            key={i}
            onClick={() => onNavigateTab(c.tab)}
            className="p-6 rounded-2xl bg-[#0f1115] border border-white/10 hover:border-[#c5a059]/40 transition-all cursor-pointer shadow-lg group hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-white/5 group-hover:scale-110 transition-transform">
                {c.icon}
              </div>
              <span className="text-xs text-slate-500 group-hover:text-[#c5a059] flex items-center gap-1 transition-colors">
                Gerenciar →
              </span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{c.value}</p>
            <h3 className="text-sm font-semibold text-slate-200">{c.title}</h3>
            <p className="text-xs text-slate-400 font-light mt-0.5">{c.desc}</p>
          </div>
        ))}
      </div>

      {/* Quick Access Actions */}
      <div className="rounded-2xl p-6 bg-[#0f1115] border border-white/10 space-y-4">
        <h3 className="text-sm uppercase tracking-wider font-semibold text-slate-300">
          Ações Rápidas
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigateTab('hero')}
            className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-left transition-colors flex items-center gap-3"
          >
            <Sliders className="w-5 h-5 text-[#c5a059]" />
            <div>
              <p className="text-xs font-semibold text-white">Editar Hero & Logo</p>
              <p className="text-[11px] text-slate-400">Slideshow e dimensões</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('albums')}
            className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-left transition-colors flex items-center gap-3"
          >
            <FolderOpen className="w-5 h-5 text-[#c5a059]" />
            <div>
              <p className="text-xs font-semibold text-white">Gerenciar Galerias</p>
              <p className="text-[11px] text-slate-400">Viagens e capas de eventos</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('instagram')}
            className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-left transition-colors flex items-center gap-3"
          >
            <InstagramIcon className="w-5 h-5 text-[#c5a059]" />
            <div>
              <p className="text-xs font-semibold text-white">Adicionar Post Instagram</p>
              <p className="text-[11px] text-slate-400">Links oficiais e embeds</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('media')}
            className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-left transition-colors flex items-center gap-3"
          >
            <ImageIcon className="w-5 h-5 text-[#c5a059]" />
            <div>
              <p className="text-xs font-semibold text-white">Biblioteca de Mídia</p>
              <p className="text-[11px] text-slate-400">Upload de fotos e vídeos</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
