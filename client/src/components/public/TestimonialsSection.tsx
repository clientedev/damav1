import React from 'react';
import { Star, Quote } from 'lucide-react';
import { Testimonial } from '../../types';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ testimonials }) => {
  const activeTestimonials = testimonials.filter((t) => t.is_active);

  return (
    <section id="depoimentos" className="py-16 sm:py-24 bg-[#050a14] relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <p className="text-[11px] uppercase tracking-[0.3em] font-semibold text-sky-400 mb-2 sm:mb-3">
            Reconhecimento & Confiança
          </p>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
            Depoimentos de <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-500">clientes e corretores</span>
          </h2>
          <p className="text-xs sm:text-sm text-sky-100/70 mt-2 sm:mt-3 font-light">
            Relatos de quem vivencia o suporte diário e a entrega de valor da G11 Conceito Financeiro.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
          {activeTestimonials.map((item) => (
            <div
              key={item.id}
              className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#0a1324] border border-sky-500/15 hover:border-sky-400/50 transition-all duration-300 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:-translate-y-1"
            >
              {/* Decorative Subtle Quote Watermark */}
              <Quote className="absolute top-4 right-4 w-12 h-12 text-sky-500/10 pointer-events-none group-hover:text-sky-400/20 transition-colors" />

              <div className="relative z-10">
                {/* Rating Stars */}
                <div className="flex items-center gap-1 mb-5">
                  {Array.from({ length: item.stars || 5 }).map((_, sIdx) => (
                    <Star key={sIdx} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-sky-100/80 font-light leading-relaxed italic mb-6 sm:mb-8">
                  “{item.quote}”
                </p>
              </div>

              {/* Author Info */}
              <div className="pt-4 border-t border-sky-500/10 flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#09283d] to-[#050a14] border border-sky-400/30 text-sky-300 font-semibold text-xs flex items-center justify-center shrink-0 shadow-inner">
                  {item.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white">{item.name}</h3>
                  <p className="text-[11px] text-sky-400 font-light">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

