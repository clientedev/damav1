import React, { useState } from 'react';
import {
  LayoutDashboard,
  Sliders,
  FolderOpen,
  FileText,
  Settings,
  Image as ImageIcon,
  LogOut,
  ArrowUpRight,
  Shield,
  Menu,
  X
} from 'lucide-react';
import { InstagramIcon } from '../../components/icons/InstagramIcon';
import { SiteDataResponse } from '../../types';
import { removeAuthToken } from '../../services/api';
import { AdminDashboard } from './AdminDashboard';
import { AdminHero } from './AdminHero';
import { AdminAlbums } from './AdminAlbums';
import { AdminInstagram } from './AdminInstagram';
import { AdminContent } from './AdminContent';
import { AdminSettings } from './AdminSettings';
import { AdminMedia } from './AdminMedia';
import { AdminSectionsOrder } from './AdminSectionsOrder';
import { ArrowUpDown } from 'lucide-react';

interface AdminLayoutProps {
  siteData: SiteDataResponse;
  onRefreshSiteData: () => void;
  onLogout: () => void;
  onOpenPublicSite: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  siteData,
  onRefreshSiteData,
  onLogout,
  onOpenPublicSite
}) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Visão Geral & Métricas', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'hero', label: 'Hero Section & Logotipo', icon: <Sliders className="w-4 h-4" /> },
    { id: 'albums', label: 'Pastas & Galerias', icon: <FolderOpen className="w-4 h-4" /> },
    { id: 'instagram', label: 'Publicações Instagram', icon: <InstagramIcon className="w-4 h-4" /> },
    { id: 'content', label: 'Conteúdo & Produtos', icon: <FileText className="w-4 h-4" /> },
    { id: 'settings', label: 'Configurações & SEO', icon: <Settings className="w-4 h-4" /> },
    { id: 'sections-order', label: 'Ordem das Seções', icon: <ArrowUpDown className="w-4 h-4" /> },
    { id: 'media', label: 'Biblioteca de Mídia', icon: <ImageIcon className="w-4 h-4" /> },
  ];

  const handleLogoutClick = () => {
    removeAuthToken();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-[#08090b] text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#0f1115] border-b border-white/10 p-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-2.5">
          <Shield className="w-5 h-5 text-[#c5a059]" />
          <span className="text-xs font-bold uppercase tracking-wider text-white">G11 CMS Admin</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPublicSite}
            className="p-2 text-slate-400 hover:text-[#c5a059]"
            title="Ver site público"
          >
            <ArrowUpRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 text-slate-300 hover:text-white"
          >
            {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#0a0c10] border-r border-white/10 flex flex-col justify-between p-5 z-50 transition-transform duration-300 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Brand header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c5a059] to-[#987834] text-black flex items-center justify-center font-bold text-sm shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white tracking-wide">G11 Conceito</h1>
                <p className="text-[10px] text-[#c5a059] font-medium uppercase tracking-wider">Painel Administrativo</p>
              </div>
            </div>

            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'gold-gradient-bg text-black font-semibold shadow-md shadow-[#c5a059]/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <button
            onClick={onOpenPublicSite}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-slate-300 hover:text-[#c5a059] hover:bg-white/5 transition-colors"
          >
            <span>Ver Site Público</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full overflow-y-auto min-h-screen">
        {activeTab === 'dashboard' && (
          <AdminDashboard
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenPublicSite={onOpenPublicSite}
          />
        )}

        {activeTab === 'hero' && (
          <AdminHero
            initialConfig={siteData.hero.config}
            initialSlides={siteData.hero.slides}
            onRefresh={onRefreshSiteData}
          />
        )}

        {activeTab === 'albums' && <AdminAlbums />}

        {activeTab === 'instagram' && <AdminInstagram />}

        {activeTab === 'content' && (
          <AdminContent
            initialAbout={siteData.about}
            initialProducts={siteData.products}
            initialBenefits={siteData.benefits}
            initialTestimonials={siteData.testimonials}
            initialClaims={siteData.claims}
            onRefresh={onRefreshSiteData}
          />
        )}

        {activeTab === 'settings' && (
          <AdminSettings
            initialSettings={siteData.settings}
            onRefresh={onRefreshSiteData}
          />
        )}

        {activeTab === 'sections-order' && (
          <AdminSectionsOrder onRefreshSiteData={onRefreshSiteData} />
        )}

        {activeTab === 'media' && <AdminMedia />}
      </main>
    </div>
  );
};
