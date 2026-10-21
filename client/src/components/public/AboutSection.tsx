import React from 'react';
import { AboutContent } from '../../types';

interface AboutSectionProps {
  about: AboutContent;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ about }) => {
  return (
    <section id="sobre" className="py-28 bg-[#050a14] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-20">
          <p className="text-[11px] uppercase tracking-[0.3em] font-semibold text-sky-400 mb-3">
            Institucional & Governança
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight leading-tight">
            Assessoria de excelência para quem busca <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-500">solidez e legado</span>.
          </h2>
        </div>

        {/* Story & Team Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center mb-24">
          {/* Left Column: Authentic Team Photography */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden border border-sky-500/20 shadow-2xl">
              <img
                src={about.image_equipe || '/uploads/institucional/conheca_g11_equipe.jpg'}
                alt="Liderança e Equipe G11 Conceito Financeiro"
                className="w-full h-[460px] object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050a14] via-transparent to-transparent opacity-80" />

              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between border-t border-white/10 pt-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-sky-400 font-semibold">
                    Operação e Expansão
                  </p>
                  <p className="text-sm font-medium text-white">
                    São Paulo — Brasil
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white tracking-tight">2021</p>
                  <p className="text-[10px] text-sky-200/60 uppercase tracking-widest">Fundação</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-block px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 text-[11px] uppercase tracking-widest font-medium">
              Nossa Trajetória
            </div>

            <h3 className="text-2xl sm:text-3xl font-light text-slate-100 leading-snug">
              Auxiliando corretores de elite na transição de carreira e consolidação patrimonial.
            </h3>

            <p className="text-sky-100/80 text-sm sm:text-base leading-relaxed font-light">
              {about.text_conheca ||
                'Fundada em 10 de agosto de 2021, a G11 nasceu para auxiliar corretores de alta performance na transição de carreira, conectando-os às principais instituições do mercado.'}
            </p>

            <p className="text-sky-200/60 text-sm leading-relaxed font-light">
              Com infraestrutura completa e suporte técnico contínuo, a G11 se tornou referência no ecossistema segurador e financeiro, gerando oportunidades para que profissionais atuem de forma consultiva, estratégica e perene.
            </p>

            {/* Editorial Stats */}
            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-sky-500/15">
              <div>
                <p className="text-3xl font-light text-white tracking-tight">100%</p>
                <p className="text-xs text-sky-200/60 mt-1 uppercase tracking-wider">Independência Consultiva</p>
              </div>
              <div>
                <p className="text-3xl font-light text-sky-400 tracking-tight">+14</p>
                <p className="text-xs text-sky-200/60 mt-1 uppercase tracking-wider">Seguradoras Parceiras</p>
              </div>
            </div>
          </div>
        </div>

        {/* Strategic Pillars (Editorial Layout without generic AI icons) */}
        <div className="border-t border-sky-500/15 pt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* 01. Missão */}
            <div className="space-y-4">
              <span className="text-xs font-mono text-sky-400 font-bold tracking-widest uppercase">
                01 / Missão
              </span>
              <h4 className="text-xl font-medium text-white tracking-tight">
                Desenvolvimento e Conexão de Elite
              </h4>
              <p className="text-sm text-sky-100/70 font-light leading-relaxed">
                {about.missao ||
                  'Auxiliar corretores de alta performance na transição de carreira, conectando-os às principais instituições do mercado e proporcionando suporte para que atuem de forma estratégica e eficiente.'}
              </p>
            </div>

            {/* 02. Visão */}
            <div className="space-y-4">
              <span className="text-xs font-mono text-sky-400 font-bold tracking-widest uppercase">
                02 / Visão
              </span>
              <h4 className="text-xl font-medium text-white tracking-tight">
                Referência em Excelência Consultiva
              </h4>
              <p className="text-sm text-sky-100/70 font-light leading-relaxed">
                {about.visao ||
                  'Ser uma referência no setor, oferecendo oportunidades e soluções que contribuam para o crescimento e a consolidação dos corretores no mercado.'}
              </p>
            </div>

            {/* 03. Princípios e Valores */}
            <div className="space-y-4">
              <span className="text-xs font-mono text-sky-400 font-bold tracking-widest uppercase">
                03 / Princípios
              </span>
              <h4 className="text-xl font-medium text-white tracking-tight">
                Pilares de Atuação
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-sky-100/80 font-light">
                {(about.valores || []).slice(0, 4).map((val, idx) => (
                  <li key={idx} className="flex items-baseline gap-2.5">
                    <span className="text-sky-400 font-mono text-xs">•</span>
                    <span>
                      <strong className="text-white font-medium">{val.item}</strong> — {val.descricao}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


