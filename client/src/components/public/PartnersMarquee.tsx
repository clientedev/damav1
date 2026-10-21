import React from 'react';

interface Partner {
  name: string;
  url: string;
  logo: string;
  logoLight: string;
}

const PARTNERS: Partner[] = [
  { name: 'Porto Seguro', url: 'https://www.portoseguro.com.br', logo: '/uploads/seguradoras/porto_real_dark.svg', logoLight: '/uploads/seguradoras/porto_real_light.svg' },
  { name: 'Allianz Seguros', url: 'https://www.allianz.com.br', logo: '/uploads/seguradoras/allianz_real_dark.svg', logoLight: '/uploads/seguradoras/allianz_real_light.svg' },
  { name: 'Omint', url: 'https://www.omint.com.br', logo: '/uploads/seguradoras/omint_real_dark.png', logoLight: '/uploads/seguradoras/omint_real_light.png' },
  { name: 'SulAmérica', url: 'https://portal.sulamericaseguros.com.br', logo: '/uploads/seguradoras/sulamerica_real_dark.svg', logoLight: '/uploads/seguradoras/sulamerica_real_light.svg' },
  { name: 'Bradesco Seguros', url: 'https://www.bradescoseguros.com.br', logo: '/uploads/seguradoras/bradesco_real_dark.svg', logoLight: '/uploads/seguradoras/bradesco_real_light.svg' },
  { name: 'MAG Seguros', url: 'https://www.mag.com.br', logo: '/uploads/seguradoras/mag_real.svg', logoLight: '/uploads/seguradoras/mag_real_light.svg' },
  { name: 'Icatu Seguros', url: 'https://portal.icatuseguros.com.br', logo: '/uploads/seguradoras/icatu_real_dark.png', logoLight: '/uploads/seguradoras/icatu_real_light.png' },
  { name: 'Tokio Marine', url: 'https://www.tokiomarine.com.br', logo: '/uploads/seguradoras/tokio_real.svg', logoLight: '/uploads/seguradoras/tokio_real.svg' },
  { name: 'MAPFRE', url: 'https://www.mapfre.com.br', logo: '/uploads/seguradoras/mapfre_real_dark.svg', logoLight: '/uploads/seguradoras/mapfre_real_light.svg' },
  { name: 'Embracon', url: 'https://www.embracon.com.br', logo: '/uploads/seguradoras/embracon_real_dark.png', logoLight: '/uploads/seguradoras/embracon_real_light.png' },
  { name: 'AZOS', url: 'https://www.azos.com.br', logo: '/uploads/seguradoras/azos_real_dark.png', logoLight: '/uploads/seguradoras/azos_real_light.png' },
  { name: 'Centauro Seguros', url: 'https://www.centauro-on.com.br', logo: '/uploads/seguradoras/centauro_real_dark.png', logoLight: '/uploads/seguradoras/centauro_real_light.png' },
];

export const PartnersMarquee: React.FC = () => {
  const duplicatedPartners = [...PARTNERS, ...PARTNERS];

  return (
    <section id="parceiros" className="py-16 bg-[#050a14] border-y border-sky-500/15 relative overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center relative z-10">
        <p className="text-[11px] uppercase tracking-[0.3em] font-semibold text-sky-400">
          Instituições & Seguradoras Parceiras
        </p>
        <h3 className="text-xl sm:text-2xl font-light text-slate-100 tracking-tight mt-1.5">
          Conexão direta com as líderes globais e nacionais em proteção patrimonial
        </h3>
      </div>

      {/* Clean Uninterrupted Brand Ribbon without AI cards */}
      <div className="marquee-container py-4">
        <div className="marquee-track flex items-center gap-14 sm:gap-20 px-6">
          {duplicatedPartners.map((partner, idx) => (
            <a
              key={idx}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              title={`Acessar portal oficial da ${partner.name}`}
              className="flex items-center justify-center shrink-0 opacity-80 hover:opacity-100 transition-all duration-300 transform hover:scale-105 cursor-pointer filter drop-shadow-[0_2px_8px_rgba(56,189,248,0.2)]"
            >
              {/* Dark mode logo */}
              <img
                src={partner.logo}
                alt={partner.name}
                className="h-9 sm:h-11 w-auto max-w-[160px] sm:max-w-[200px] object-contain select-none block dark-logo"
                loading="lazy"
              />
              {/* Light mode logo */}
              <img
                src={partner.logoLight}
                alt={partner.name}
                className="h-9 sm:h-11 w-auto max-w-[160px] sm:max-w-[200px] object-contain select-none hidden light-logo"
                loading="lazy"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};


