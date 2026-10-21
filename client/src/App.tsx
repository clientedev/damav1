import React, { useState, useEffect } from 'react';
import { MessageCircle, Shield, Loader2 } from 'lucide-react';
import { SiteDataResponse } from './types';
import { fetchPublicSiteData, getAuthToken } from './services/api';
import { initialSiteData } from './data/initialSiteData';
import { Navbar } from './components/public/Navbar';
import { Hero } from './components/public/Hero';
import { AboutSection } from './components/public/AboutSection';
import { ProductsSection } from './components/public/ProductsSection';
import { PartnersMarquee } from './components/public/PartnersMarquee';
import { GallerySection } from './components/public/GallerySection';
import { InstagramSection } from './components/public/InstagramSection';
import { TestimonialsSection } from './components/public/TestimonialsSection';
import { ClaimsSection } from './components/public/ClaimsSection';
import { ContactSection } from './components/public/ContactSection';
import { Footer } from './components/public/Footer';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './pages/admin/AdminLayout';

export function App() {
  const [siteData, setSiteData] = useState<SiteDataResponse>(initialSiteData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Theme state (Dark Mode by default, toggleable to Light Mode)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('g11_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('g11_theme', next);
      if (next === 'light') {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
      }
      return next;
    });
  };

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  // Routing state
  const [currentView, setCurrentView] = useState<'public' | 'admin_login' | 'admin_dashboard'>('public');

  const loadData = async () => {
    try {
      const data = await fetchPublicSiteData();
      if (data) {
        setSiteData(data);
      }
    } catch (err: any) {
      console.warn('Backend API não disponível, utilizando dados fixados no código-fonte.', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Check if initial URL is /admin
    if (window.location.pathname.startsWith('/admin')) {
      const token = getAuthToken();
      if (token) {
        setCurrentView('admin_dashboard');
      } else {
        setCurrentView('admin_login');
      }
    }

    // Browser back/forward
    const handlePopState = () => {
      if (window.location.pathname.startsWith('/admin')) {
        const token = getAuthToken();
        setCurrentView(token ? 'admin_dashboard' : 'admin_login');
      } else {
        setCurrentView('public');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToAdmin = () => {
    const token = getAuthToken();
    if (token) {
      window.history.pushState({}, '', '/admin');
      setCurrentView('admin_dashboard');
    } else {
      window.history.pushState({}, '', '/admin/login');
      setCurrentView('admin_login');
    }
  };

  const navigateToPublic = () => {
    window.history.pushState({}, '', '/');
    setCurrentView('public');
    loadData();
  };

  // Loading Screen
  if (loading && !siteData) {
    return (
      <div className="min-h-screen bg-[#050a14] flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center mb-6 animate-pulse">
          <Shield className="w-8 h-8 text-sky-400" />
        </div>
        <Loader2 className="w-6 h-6 text-sky-400 animate-spin mb-3" />
        <p className="text-xs uppercase tracking-widest text-sky-200/60 font-light">
          Carregando G11 Conceito Financeiro...
        </p>
      </div>
    );
  }

  // Error Fallback
  if (error && !siteData) {
    return (
      <div className="min-h-screen bg-[#050a14] flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="max-w-md p-8 rounded-3xl bg-[#0a1324] border border-red-500/30 space-y-4">
          <Shield className="w-10 h-10 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold">Falha ao Conectar com o Servidor</h2>
          <p className="text-xs text-slate-300 font-light">{error}</p>
          <button
            onClick={loadData}
            className="blue-gradient-btn font-semibold px-6 py-2.5 rounded-full text-xs uppercase tracking-wider mt-4"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!siteData) return null;

  // ADMIN LOGIN VIEW
  if (currentView === 'admin_login') {
    return (
      <AdminLogin
        onLoginSuccess={() => {
          window.history.pushState({}, '', '/admin');
          setCurrentView('admin_dashboard');
        }}
        onBackToSite={navigateToPublic}
      />
    );
  }

  // ADMIN DASHBOARD VIEW
  if (currentView === 'admin_dashboard') {
    return (
      <AdminLayout
        siteData={siteData}
        onRefreshSiteData={loadData}
        onLogout={() => {
          window.history.pushState({}, '', '/admin/login');
          setCurrentView('admin_login');
        }}
        onOpenPublicSite={navigateToPublic}
      />
    );
  }

  // PUBLIC SITE VIEW
  return (
    <div className="min-h-screen bg-[#050a14] text-slate-100 flex flex-col relative selection:bg-sky-500 selection:text-black">
      {/* Navigation - Fixed Sticky Header with Theme Toggle */}
      <Navbar
        settings={siteData.settings}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Dynamic Ordered Sections Configured via Admin */}
      {(() => {
        const renderSection = (id: string) => {
          switch (id) {
            case 'hero':
              return <Hero key="hero" config={siteData.hero.config} slides={siteData.hero.slides} />;
            case 'parceiros':
              return <PartnersMarquee key="parceiros" />;
            case 'sobre':
              return <AboutSection key="sobre" about={siteData.about} />;
            case 'produtos':
              return (
                <ProductsSection
                  key="produtos"
                  products={siteData.products}
                  benefits={siteData.benefits}
                  whatsappUrl={siteData.settings.whatsapp_url}
                />
              );
            case 'galeria':
              return <GallerySection key="galeria" albums={siteData.albums} />;
            case 'instagram':
              return (
                <InstagramSection
                  key="instagram"
                  posts={siteData.instagram}
                  instagramUrl={siteData.settings.instagram_url}
                />
              );
            case 'depoimentos':
              return <TestimonialsSection key="depoimentos" testimonials={siteData.testimonials} />;
            case 'sinistros':
              return (
                <ClaimsSection
                  key="sinistros"
                  claims={siteData.claims}
                  whatsappUrl={siteData.settings.whatsapp_url}
                  phone={siteData.settings.whatsapp}
                />
              );
            case 'contato':
              return <ContactSection key="contato" settings={siteData.settings} />;
            default:
              return null;
          }
        };

        if (siteData.sections_order && siteData.sections_order.length > 0) {
          return siteData.sections_order
            .filter((sec) => sec.is_active !== false)
            .map((sec) => renderSection(sec.id));
        }

        // Default Recommended Order Fallback
        return (
          <>
            <Hero config={siteData.hero.config} slides={siteData.hero.slides} />
            <PartnersMarquee />
            <AboutSection about={siteData.about} />
            <ProductsSection
              products={siteData.products}
              benefits={siteData.benefits}
              whatsappUrl={siteData.settings.whatsapp_url}
            />
            <GallerySection albums={siteData.albums} />
            <InstagramSection
              posts={siteData.instagram}
              instagramUrl={siteData.settings.instagram_url}
            />
            <TestimonialsSection testimonials={siteData.testimonials} />
            <ClaimsSection
              claims={siteData.claims}
              whatsappUrl={siteData.settings.whatsapp_url}
              phone={siteData.settings.whatsapp}
            />
            <ContactSection settings={siteData.settings} />
          </>
        );
      })()}

      {/* Footer */}
      <Footer settings={siteData.settings} />

      {/* Floating Action Button for Direct WhatsApp */}
      <aside aria-label="Ações de Contato" className="fixed bottom-6 right-6 z-40">
        <a
          href={siteData.settings.whatsapp_url || `https://wa.me/${siteData.settings.whatsapp?.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Falar no WhatsApp"
          aria-label="Abrir conversa no WhatsApp com a G11 Conceito Financeiro"
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-sky-400 via-blue-600 to-cyan-400 text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-sky-500/30 group"
        >
          <MessageCircle className="w-7 h-7 fill-white" />
          <span className="sr-only">Falar no WhatsApp com a G11 Conceito Financeiro</span>
          <span className="absolute right-16 bg-[#0a1324] text-sky-300 border border-sky-400/30 text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none">
            Atendimento Rápido
          </span>
        </a>
      </aside>
    </div>
  );
}

export default App;

