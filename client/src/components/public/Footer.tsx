import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { InstagramIcon } from '../icons/InstagramIcon';
import { GeneralSettings } from '../../types';

interface FooterProps {
  settings: GeneralSettings;
}

export const Footer: React.FC<FooterProps> = ({ settings }) => {
  const [modalPolicy, setModalPolicy] = useState<'privacy' | 'cookies' | null>(null);

  return (
    <footer className="bg-[#050a14] border-t border-sky-500/15 pt-16 pb-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-sky-500/10">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4 md:col-span-1">
            <img
              src="/uploads/branding/logo_hero_central.png"
              alt="G11 Conceito Financeiro"
              className="h-10 w-auto object-contain filter drop-shadow-[0_0_10px_rgba(56,189,248,0.3)]"
            />
            <p className="text-xs text-sky-100/70 font-light leading-relaxed">
              Assessoria especializada para corretores de alta performance, conectando-os às principais instituições financeiras e de proteção do mercado.
            </p>
            <p className="text-[11px] text-sky-400 font-medium">
              Fundada em {settings.founded_date || '10 de agosto de 2021'}
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs uppercase tracking-widest font-semibold text-white mb-4">
              Navegação
            </h4>
            <ul className="space-y-2 text-xs text-sky-100/70 font-light">
              <li><a href="#inicio" className="hover:text-sky-400 transition-colors">Início</a></li>
              <li><a href="#sobre" className="hover:text-sky-400 transition-colors">Sobre a G11</a></li>
              <li><a href="#solucoes" className="hover:text-sky-400 transition-colors">Nossos Produtos</a></li>
              <li><a href="#realizacoes" className="hover:text-sky-400 transition-colors">Realizações & Viagens</a></li>
              <li><a href="#parceiros" className="hover:text-sky-400 transition-colors">Seguradoras Parceiras</a></li>
              <li><a href="#depoimentos" className="hover:text-sky-400 transition-colors">Depoimentos</a></li>
              <li><a href="#sinistro" className="hover:text-sky-400 transition-colors">Central de Sinistro</a></li>
              <li><a href="#contato" className="hover:text-sky-400 transition-colors">Contato & Localização</a></li>
            </ul>
          </div>

          {/* Col 3: Legal & Support */}
          <div>
            <h4 className="text-xs uppercase tracking-widest font-semibold text-white mb-4">
              Legal & Políticas
            </h4>
            <ul className="space-y-2 text-xs text-sky-100/70 font-light">
              <li>
                <button
                  onClick={() => setModalPolicy('privacy')}
                  className="hover:text-sky-400 transition-colors text-left cursor-pointer"
                >
                  Política de Privacidade
                </button>
              </li>
              <li>
                <button
                  onClick={() => setModalPolicy('cookies')}
                  className="hover:text-sky-400 transition-colors text-left cursor-pointer"
                >
                  Política de Cookies
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Social & WhatsApp */}
          <div>
            <h4 className="text-xs uppercase tracking-widest font-semibold text-white mb-4">
              Canais Oficiais
            </h4>
            <div className="flex items-center gap-3 mb-4">
              <a
                href={settings.instagram_url || 'https://www.instagram.com/g11conceitofinanceiro/'}
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram Oficial"
                className="w-9 h-9 rounded-full bg-sky-500/10 hover:bg-sky-500 text-sky-300 hover:text-black flex items-center justify-center transition-all border border-sky-500/20 shadow-md"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href={settings.whatsapp_url || `https://wa.me/${settings.whatsapp?.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp Oficial"
                className="w-9 h-9 rounded-full bg-sky-500/10 hover:bg-sky-500 text-sky-300 hover:text-black flex items-center justify-center transition-all border border-sky-500/20 shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
            <p className="text-xs text-sky-100/70 font-light">
              {settings.address_full || 'Av. Antártica 675, Perdizes, São Paulo - SP, 05003-020'}
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-sky-200/50 font-light gap-4">
          <p>© {new Date().getFullYear()} G11 Conceito Financeiro. Todos os direitos reservados.</p>
          <p className="text-sky-300/60">
            Plataforma Corporativa G11
          </p>
        </div>
      </div>

      {/* Policy Modals */}
      {modalPolicy && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0a1324] border border-sky-500/30 rounded-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-sky-500/15 pb-4">
              <h3 className="text-lg font-semibold text-white">
                {modalPolicy === 'privacy' ? 'Política de Privacidade' : 'Política de Cookies'}
              </h3>
              <button
                onClick={() => setModalPolicy(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-sky-100/80 font-light space-y-3 leading-relaxed">
              {modalPolicy === 'privacy' ? (
                <>
                  <p>
                    A <strong>G11 Conceito Financeiro</strong> valoriza a privacidade e a segurança dos dados de seus clientes, corretores parceiros e visitantes.
                  </p>
                  <p>
                    Todas as informações coletadas por meio de formulários, cadastros ou mensagens de WhatsApp são utilizadas estritamente para fins de atendimento comercial, cotação de serviços de seguros e previdência, e consultoria estratégica, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
                  </p>
                  <p>
                    Não compartilhamos seus dados com terceiros não autorizados. Seus dados estão seguros e protegidos em nossa infraestrutura.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Nosso site utiliza cookies essenciais para garantir o correto funcionamento da navegação, carregar preferências e oferecer uma experiência fluida aos usuários.
                  </p>
                  <p>
                    Cookies analíticos e de terceiros (como os serviços de incorporação do Instagram) podem ser utilizados para mensurar o alcance das publicações e otimizar nosso atendimento.
                  </p>
                  <p>
                    Você pode configurar seu navegador a qualquer momento para desativar ou limpar cookies armazenados.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

