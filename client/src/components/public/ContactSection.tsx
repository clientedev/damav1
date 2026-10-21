import React, { useState } from 'react';
import { MapPin, Clock, Phone, Send, CheckCircle2, MessageCircle, Navigation, ExternalLink } from 'lucide-react';
import { GeneralSettings } from '../../types';

interface ContactSectionProps {
  settings: GeneralSettings;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ settings }) => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Gostaria de mais informações',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const encodedMsg = encodeURIComponent(
      `Olá! Meu nome é ${formState.name}.\nEmail: ${formState.email}\nTelefone: ${formState.phone}\nAssunto: ${formState.subject}\nMensagem: ${formState.message}`
    );
    setSubmitted(true);
    setTimeout(() => {
      window.open(`https://wa.me/5511991606951?text=${encodedMsg}`, '_blank');
    }, 1200);
  };

  const address = settings.address_full || 'Av. Antártica, 675 - Perdizes, São Paulo - SP, 05003-020';
  const mapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent('Av. Antártica, 675, Perdizes, São Paulo - SP, 05003-020')}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  const mapsDirectUrl = settings.google_maps_url || 'https://maps.google.com/?q=Av+Antartica+675+Perdizes+Sao+Paulo';

  return (
    <section id="contato" className="py-24 bg-[#050a14] relative">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <p className="text-[11px] uppercase tracking-[0.3em] font-semibold text-sky-400 mb-3">
            Atendimento & Sede
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
            Nossa <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-500">Localização & Contato</span>
          </h2>
          <p className="text-sm text-sky-100/70 mt-3 font-light">
            Visite nossa sede em Perdizes ou inicie um diálogo com nossos assessores financeiros.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          {/* Left Column: Location & Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 rounded-2xl bg-[#0a1324] border border-sky-500/15 space-y-6 shadow-xl">
              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Endereço</h4>
                  <p className="text-xs text-sky-100/80 font-light mt-1">
                    {address}
                  </p>
                  <p className="text-[11px] text-sky-200/50 mt-0.5">Jardim das Perdizes — São Paulo / SP</p>
                  <a
                    href={mapsDirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2.5 text-xs text-sky-400 hover:text-cyan-300 font-medium transition-colors"
                  >
                    <span>Abrir no Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-4 pt-4 border-t border-sky-500/10">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Horário de Atendimento</h4>
                  <p className="text-xs text-sky-100/80 font-light mt-1">
                    {settings.business_hours || 'De segunda a sexta-feira, das 9h às 18h (horário comercial)'}
                  </p>
                </div>
              </div>

              {/* WhatsApp & Phone */}
              <div className="flex items-start gap-4 pt-4 border-t border-sky-500/10">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Telefone & WhatsApp</h4>
                  <p className="text-xs text-sky-100/80 font-light mt-1 font-mono">
                    {settings.whatsapp || '+55 11 99160-6951'}
                  </p>
                  <a
                    href={settings.whatsapp_url || `https://wa.me/${settings.whatsapp?.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 text-xs text-sky-400 hover:text-cyan-300 font-medium transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Iniciar conversa no WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-2xl bg-[#0a1324] border border-sky-500/15 shadow-xl">
              <h3 className="text-xl font-semibold text-white mb-2">Envie uma Mensagem</h3>
              <p className="text-xs text-sky-100/70 font-light mb-6">
                Preencha o formulário abaixo para que nossos especialistas possam entender suas necessidades.
              </p>

              {submitted ? (
                <div className="p-8 rounded-xl bg-sky-500/10 border border-sky-500/30 text-center space-y-3 animate-fade-in">
                  <CheckCircle2 className="w-12 h-12 text-sky-400 mx-auto" />
                  <h4 className="text-lg font-semibold text-white">Mensagem preparada com sucesso!</h4>
                  <p className="text-xs text-sky-100/80 font-light">
                    Redirecionando você diretamente para o WhatsApp oficial da G11 Conceito Financeiro...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-medium text-sky-200/80 mb-1">
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        required
                        value={formState.name}
                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                        placeholder="Seu nome"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#050a14]/60 border border-sky-500/20 text-white placeholder-slate-500 text-xs focus:border-sky-400 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-medium text-sky-200/80 mb-1">
                        E-mail
                      </label>
                      <input
                        type="email"
                        required
                        value={formState.email}
                        onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                        placeholder="seu@email.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#050a14]/60 border border-sky-500/20 text-white placeholder-slate-500 text-xs focus:border-sky-400 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-medium text-sky-200/80 mb-1">
                        Telefone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        required
                        value={formState.phone}
                        onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                        placeholder="(11) 99999-9999"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#050a14]/60 border border-sky-500/20 text-white placeholder-slate-500 text-xs focus:border-sky-400 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-medium text-sky-200/80 mb-1">
                        Interesse Principal
                      </label>
                      <select
                        value={formState.subject}
                        onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#050a14]/80 border border-sky-500/20 text-white text-xs focus:border-sky-400 focus:outline-none transition-colors"
                      >
                        <option value="Transição de Carreira para Corretor" className="bg-[#0a1324] text-white">Transição de Carreira para Corretor</option>
                        <option value="Seguro de Vida" className="bg-[#0a1324] text-white">Seguro de Vida</option>
                        <option value="Seguro Viagem" className="bg-[#0a1324] text-white">Seguro Viagem</option>
                        <option value="Previdência Privada" className="bg-[#0a1324] text-white">Previdência Privada</option>
                        <option value="Plano de Saúde" className="bg-[#0a1324] text-white">Plano de Saúde</option>
                        <option value="Sinistro e Assistência" className="bg-[#0a1324] text-white">Sinistro e Assistência</option>
                        <option value="Outros Assuntos" className="bg-[#0a1324] text-white">Outros Assuntos</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-medium text-sky-200/80 mb-1">
                      Mensagem
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                      placeholder="Como podemos te ajudar?"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#050a14]/60 border border-sky-500/20 text-white placeholder-slate-500 text-xs focus:border-sky-400 focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-sky-400 via-blue-600 to-cyan-500 text-white font-semibold py-3 px-6 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-lg shadow-sky-500/20 hover:shadow-sky-500/35 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar Mensagem</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Google Map of Location */}
        <div className="rounded-3xl overflow-hidden border border-sky-500/25 bg-[#0a1324] shadow-2xl relative">
          <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0a1324] via-[#09283d] to-[#0a1324] border-b border-sky-500/20 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Sede Corporativa — Perdizes</h4>
                <p className="text-xs text-sky-100/70">{address}</p>
              </div>
            </div>
            <a
              href={mapsDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold px-4 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-2 transition-all"
            >
              <span>Como Chegar</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="w-full h-[400px] relative bg-[#050a14]">
            <iframe
              title="Localização G11 Conceito Financeiro"
              src={mapsEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full grayscale-[25%] contrast-[110%] hover:grayscale-0 transition-all duration-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

