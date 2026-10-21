import React, { useState } from 'react';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { ClaimFaq } from '../../types';

interface ClaimsSectionProps {
  claims: ClaimFaq[];
  whatsappUrl: string;
  phone: string;
}

export const ClaimsSection: React.FC<ClaimsSectionProps> = ({ claims, whatsappUrl, phone }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="sinistro" className="py-28 bg-[#050a14] border-t border-sky-500/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Left Column: Context & Emergency CTA */}
          <div className="lg:col-span-5 space-y-6">
            <p className="text-[11px] uppercase tracking-[0.3em] font-semibold text-sky-400">
              Suporte Técnico & Pós-Venda
            </p>
            <h2 className="text-3xl sm:text-4xl font-light text-white tracking-tight">
              Central de <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-500">Sinistros & Assistência</span>
            </h2>
            <p className="text-sm text-sky-100/70 font-light leading-relaxed">
              Em momentos de acionamento, nossa equipe atua diretamente na intermediação técnica e documental junto às seguradoras parceiras, garantindo máxima celeridade no processo de indenização.
            </p>

            {/* Emergency Action Box */}
            <div className="p-7 rounded-3xl bg-[#0a1324] border border-sky-500/20 shadow-xl space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-sky-400">Canal de Emergência</span>
                <h3 className="text-lg font-medium text-white mt-1">Abertura e Triagem de Sinistro</h3>
                <p className="text-xs text-sky-200/60 font-light mt-1">
                  Atendimento direto aos segurados e corretores vinculados.
                </p>
              </div>

              <div className="pt-2">
                <a
                  href={`${whatsappUrl}&text=Olá%2C%20preciso%20de%20suporte%20urgente%20para%20abertura%20de%20Sinistro`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-sky-400 to-blue-600 text-white font-semibold py-3 px-5 rounded-full text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-lg shadow-sky-500/20 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Acionar Sinistro pelo WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive FAQ Accordion */}
          <div className="lg:col-span-7 space-y-4">
            {claims.map((claim, idx) => {
              const isOpen = openIndex === idx;

              return (
                <div
                  key={claim.id || idx}
                  className="rounded-2xl bg-[#0a1324] border border-sky-500/15 overflow-hidden transition-all duration-300 hover:border-sky-500/30"
                >
                  <button
                    onClick={() => toggleAccordion(idx)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-sky-500/5 transition-colors cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-medium text-white flex items-center gap-3">
                      <span className="text-xs font-mono text-sky-400 font-bold shrink-0">
                        0{idx + 1}
                      </span>
                      {claim.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-sky-400 transition-transform duration-300 shrink-0 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 text-xs sm:text-sm text-sky-100/80 font-light leading-relaxed border-t border-sky-500/10 pt-4 space-y-4">
                      <p>{claim.answer}</p>

                      {/* Step by step list if present */}
                      {claim.steps && claim.steps.length > 0 && (
                        <div className="space-y-2 mt-4 pt-3 border-t border-sky-500/10">
                          <p className="text-[11px] uppercase tracking-wider font-semibold text-sky-400">
                            Fluxo Orientado:
                          </p>
                          {claim.steps.map((step, sIdx) => (
                            <div key={sIdx} className="flex items-start gap-3 bg-[#050a14]/60 p-3 rounded-xl border border-sky-500/10">
                              <span className="text-sky-400 font-mono text-xs font-bold shrink-0 mt-0.5">
                                {sIdx + 1}.
                              </span>
                              <span className="text-sky-100/90 text-xs sm:text-sm font-light">{step}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};


