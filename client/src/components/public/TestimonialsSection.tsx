import React from 'react';
import { Star, Quote } from 'lucide-react';
import { Testimonial } from '../../types';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ testimonials }) => {
  const activeTestimonials = testimonials.filter((t) => t.is_active);

  return (
    <section id="depoimentos" className="py-24 bg-[#050a14] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <p className="text-[11px] uppercase tracking-[0.3em] font-semibold text-sky-400 mb-3">
            Reconhecimento & Confiança
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
            Depoimentos de <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-500">clientes e corretores</span>
          </h2>
          <p className="text-sm text-sky-100/70 mt-3 font-light">
            Relatos de quem vivencia o suporte diário e a entrega de valor da G11 Conceito Financeiro.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
          {activeTestimonials.map((item) => (
            <div
              key={item.id}
              className="p-8 rounded-3xl bg-[#0a1324] border border-sky-500/15 hover:border-sky-400/40 transition-all duration-300 flex flex-col justify-between shadow-xl"
            >
              <div>
                {/* Rating Stars - Minimal */}
                <div className="flex items-center gap-1 mb-6">
                  {Array.from({ length: item.stars || 5 }).map((_, sIdx) => (
                    <Star key={sIdx} className="w-3.5 h-3.5 text-sky-400 fill-sky-400" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-sky-100/80 font-light leading-relaxed italic mb-8">
                  “{item.quote}”
                </p>
              </div>

              {/* Author Info */}
              <div className="pt-4 border-t border-sky-500/10 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#050a14] border border-sky-500/30 text-sky-300 font-semibold text-xs flex items-center justify-center shrink-0">
                  {item.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white">{item.name}</h3>
                  <p className="text-[11px] text-sky-400/80 font-light">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

