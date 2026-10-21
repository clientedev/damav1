import React from 'react';
import { ArrowUpRight, MessageCircle } from 'lucide-react';
import { Product, ExclusiveBenefit } from '../../types';

interface ProductsSectionProps {
  products: Product[];
  benefits: ExclusiveBenefit[];
  whatsappUrl: string;
}

const PRODUCT_FALLBACK_IMAGES: Record<string, string> = {
  vida: '/uploads/produtos/card_produto_1_vida.jpg',
  viagem: '/uploads/produtos/card_produto_2_viagem.jpg',
  previdencia: '/uploads/produtos/card_produto_3_previdencia.jpg',
  saude: '/uploads/produtos/card_produto_4_saude.jpg'
};

export const ProductsSection: React.FC<ProductsSectionProps> = ({ products, benefits, whatsappUrl }) => {
  return (
    <section id="solucoes" className="py-28 bg-[#050a14] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <p className="text-[11px] uppercase tracking-[0.3em] font-semibold text-sky-400 mb-3">
            Portfólio & Soluções
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
            Estruturação patrimonial e <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-500">gestão de riscos</span>
          </h2>
          <p className="text-sm text-sky-100/70 mt-3 font-light max-w-2xl">
            Soluções desenhadas com arquitetura aberta para proteção familiar, blindagem jurídica e planejamento financeiro de longo prazo.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7 mb-24">
          {products.map((prod) => {
            const imageSrc = prod.card_image || PRODUCT_FALLBACK_IMAGES[prod.slug] || '/uploads/produtos/card_produto_1_vida.jpg';

            return (
              <div
                key={prod.id}
                className="group rounded-2xl bg-[#0a1324] border border-sky-500/15 hover:border-sky-400/50 overflow-hidden transition-all duration-500 flex flex-col justify-between hover:shadow-2xl hover:shadow-sky-500/10 hover:-translate-y-1.5"
              >
                <div>
                  {/* Distinct Ultra-HD Contextual Photo per Solution */}
                  <div className="relative h-56 w-full overflow-hidden bg-[#050a14]">
                    <img
                      src={imageSrc}
                      alt={prod.title}
                      className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 brightness-95 group-hover:brightness-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = PRODUCT_FALLBACK_IMAGES[prod.slug] || '/uploads/produtos/card_produto_1_vida.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a1324] via-transparent to-transparent opacity-90" />
                    <span className="absolute top-4 right-4 text-[10px] uppercase font-semibold tracking-widest px-3 py-1 rounded-full bg-[#050a14]/85 text-sky-300 border border-sky-400/30 backdrop-blur-md">
                      {prod.tag || 'Exclusivo'}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="p-6">
                    <h3 className="text-xl font-medium text-white group-hover:text-sky-300 transition-colors mb-2">
                      {prod.title}
                    </h3>
                    <p className="text-xs text-sky-100/70 font-light leading-relaxed mb-5">
                      {prod.description}
                    </p>

                  {/* Features List */}
                  {prod.features && prod.features.length > 0 && (
                    <ul className="space-y-2 pt-3 border-t border-sky-500/10">
                      {prod.features.map((feat, fIdx) => (
                        <li key={fIdx} className="text-xs text-sky-100/80 flex items-start gap-2">
                          <span className="text-sky-400 text-xs font-mono shrink-0">—</span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Bottom CTA */}
              <div className="p-6 pt-0">
                <a
                  href={`${whatsappUrl}&text=Olá%2C%20gostaria%20de%20consultoria%20sobre%20o%20${encodeURIComponent(prod.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-sky-500/10 hover:bg-sky-500 text-sky-200 hover:text-white font-medium text-xs tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 border border-sky-500/20 hover:border-sky-400"
                >
                  <span>Consultar Solução</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
        </div>

        {/* Exclusive Benefits Box - Editorial Layout */}
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-[#0a1324] via-[#08152c] to-[#050a14] border border-sky-500/20 shadow-2xl">
          <div className="max-w-3xl mb-10">
            <span className="text-[11px] uppercase tracking-[0.3em] font-semibold text-sky-400 block mb-2">
              Diferenciais de Cobertura
            </span>
            <h3 className="text-2xl sm:text-3xl font-light text-white leading-tight">
              Proteção adicional e extensões personalizadas de apólice
            </h3>
            <p className="text-xs sm:text-sm text-sky-100/70 mt-2 font-light">
              Além das coberturas essenciais, estruturamos cláusulas e assistências específicas para cada perfil e demanda patrimonial.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((ben, bIdx) => (
              <div
                key={ben.id}
                className="p-6 rounded-2xl bg-[#050a14]/60 border border-sky-500/15 hover:border-sky-400/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-mono text-sky-400 font-bold mb-2 block">
                    0{bIdx + 1}
                  </span>
                  <h4 className="text-sm font-semibold text-white mb-1.5">{ben.title}</h4>
                  <p className="text-xs text-sky-100/70 font-light leading-relaxed">{ben.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-8 border-t border-sky-500/15 flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-xs text-sky-100/60 text-center sm:text-left">
              Consulte nossos assessores para adequação técnica de cláusulas e apólices.
            </p>
            <a
              href={`${whatsappUrl}&text=Olá%2C%20gostaria%20de%20orientação%20sobre%20os%20Benefícios%20e%20Coberturas`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-sky-400 to-blue-600 text-white font-semibold px-7 py-3 rounded-full text-xs uppercase tracking-wider flex items-center gap-2 hover:opacity-95 transition-all shrink-0 shadow-lg shadow-sky-500/20"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-white" />
              <span>Falar com Assessor</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};


