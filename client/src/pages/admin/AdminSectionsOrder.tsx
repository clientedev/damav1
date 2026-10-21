import React, { useState, useEffect } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers
} from 'lucide-react';
import { SectionItem } from '../../types';
import { fetchSectionsOrder, updateSectionsOrder } from '../../services/api';

const DEFAULT_SECTIONS: SectionItem[] = [
  { id: 'hero', name: '1. Hero Section (Apresentação, Logotipo & Vídeo)', description: 'Primeira dobra com logotipo centralizado, vídeo/slideshow em tela cheia e botões de ação.', is_active: true },
  { id: 'parceiros', name: '2. Seguradoras Parceiras (Letreiro Contínuo)', description: 'Logos oficiais das principais seguradoras parceiras em letreiro infinito com pausa ao passar o mouse.', is_active: true },
  { id: 'sobre', name: '3. Sobre a G11 Conceito Financeiro', description: 'História institucional, pilares estratégicos, missão, visão e valores fundamentais.', is_active: true },
  { id: 'produtos', name: '4. Soluções & Produtos Estratégicos', description: 'Grade de produtos (Vida, Saúde, Previdência, Consórcios) e benefícios exclusivos.', is_active: true },
  { id: 'galeria', name: '5. Galerias de Viagens & Eventos', description: 'Pastas e álbuns fotográficos das convenções e experiências internacionais.', is_active: true },
  { id: 'instagram', name: '6. Feed & Incorporações do Instagram', description: 'Publicações oficiais e vídeos incorporados diretamente do Instagram.', is_active: true },
  { id: 'depoimentos', name: '7. Depoimentos de Parceiros & Corretores', description: 'Avaliações e histórias reais de corretores e clientes estratégicos.', is_active: true },
  { id: 'sinistros', name: '8. Central de Atendimento a Sinistros & FAQ', description: 'Orientações práticas passo a passo e perguntas frequentes para suporte.', is_active: true },
  { id: 'contato', name: '9. Localização, Mapa Google & Contato', description: 'Endereço corporativo, horários de atendimento, mapa interativo e WhatsApp.', is_active: true }
];

interface AdminSectionsOrderProps {
  onRefreshSiteData: () => void;
}

export const AdminSectionsOrder: React.FC<AdminSectionsOrderProps> = ({ onRefreshSiteData }) => {
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSections = async () => {
    try {
      setLoading(true);
      const data = await fetchSectionsOrder();
      // Ensure all default sections are present
      const currentIds = new Set(data.map((s) => s.id));
      const missing = DEFAULT_SECTIONS.filter((s) => !currentIds.has(s.id));
      setSections([...data, ...missing]);
    } catch (err: any) {
      console.error('Erro ao carregar ordem das seções:', err);
      setSections(DEFAULT_SECTIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const [moved] = newSections.splice(index, 1);
    newSections.splice(targetIndex, 0, moved);
    setSections(newSections);
  };

  const toggleSectionActive = (index: number) => {
    const newSections = [...sections];
    newSections[index].is_active = !newSections[index].is_active;
    setSections(newSections);
  };

  const handleResetDefault = () => {
    setSections(DEFAULT_SECTIONS);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSaveSuccess(false);
      await updateSectionsOrder(sections);
      setSaveSuccess(true);
      onRefreshSiteData();
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar ordem das seções.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <ArrowUpDown className="w-6 h-6 text-sky-400" />
            <span>Ordem das Seções da Página Inicial</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Personalize a sequência em que cada bloco aparece na página inicial do site ou oculte seções temporariamente.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetDefault}
            className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrão</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="blue-gradient-btn px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 hover:opacity-95 shadow-md cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Salvando...' : 'Salvar Nova Ordem'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2.5 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Ordem das seções salva e sincronizada com sucesso com o site público!</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2.5 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Info Tip */}
      <div className="p-4 rounded-2xl bg-sky-500/5 border border-sky-500/20 text-xs text-sky-300 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-sky-200">Como funciona o organizador?</p>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed font-light">
            Use as setas para mover qualquer seção para cima ou para baixo na ordem desejada. O botão com ícone de olho permite desativar ou ativar qualquer bloco sem apagá-lo do sistema. Ao terminar, clique em <strong>Salvar Nova Ordem</strong>.
          </p>
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-3">
        {sections.map((section, index) => {
          const isFirst = index === 0;
          const isLast = index === sections.length - 1;

          return (
            <div
              key={section.id}
              className={`p-4 sm:p-5 rounded-2xl bg-[#0f1115] border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg ${
                section.is_active
                  ? 'border-white/10 hover:border-sky-500/30'
                  : 'border-white/5 opacity-55 bg-black/40'
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                {/* Position Index Badge */}
                <div className="w-8 h-8 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-sky-400 shrink-0">
                  {index + 1}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <h4 className="text-sm font-semibold text-white truncate">{section.name}</h4>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                        section.is_active
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-700/30 text-slate-400'
                      }`}
                    >
                      {section.is_active ? 'Visível' : 'Oculto'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 font-light">
                    {section.description}
                  </p>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                {/* Move Up */}
                <button
                  type="button"
                  disabled={isFirst}
                  onClick={() => moveSection(index, 'up')}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="Mover para cima"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>

                {/* Move Down */}
                <button
                  type="button"
                  disabled={isLast}
                  onClick={() => moveSection(index, 'down')}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="Mover para baixo"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>

                {/* Toggle Visibility */}
                <button
                  type="button"
                  onClick={() => toggleSectionActive(index)}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                    section.is_active
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                  title={section.is_active ? 'Ocultar esta seção' : 'Tornar seção visível'}
                >
                  {section.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
