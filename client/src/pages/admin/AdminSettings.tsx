import React, { useState } from 'react';
import { Settings, Save, CheckCircle2 } from 'lucide-react';
import { GeneralSettings } from '../../types';
import { updateGeneralSettings } from '../../services/api';

interface AdminSettingsProps {
  initialSettings: GeneralSettings;
  onRefresh: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ initialSettings, onRefresh }) => {
  const [settings, setSettings] = useState<GeneralSettings>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateGeneralSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      onRefresh();
    } catch (err: any) {
      alert('Erro ao salvar configurações: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="pb-6 border-b border-white/10">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-[#c5a059]" />
          Configurações Gerais, Contato & SEO
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Dados de contato, endereço físico, horário de atendimento e metadados de indexação.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2.5 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Configurações atualizadas e salvas com sucesso!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Contact & Address */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0f1115] border border-white/10 space-y-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#c5a059]">
            Contato & Endereço Físico
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                Nome da Empresa
              </label>
              <input
                type="text"
                value={settings.company_name}
                onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                Data de Fundação
              </label>
              <input
                type="text"
                value={settings.founded_date}
                onChange={(e) => setSettings({ ...settings, founded_date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                value={settings.whatsapp}
                onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                Link do WhatsApp Oficial
              </label>
              <input
                type="text"
                value={settings.whatsapp_url}
                onChange={(e) => setSettings({ ...settings, whatsapp_url: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                Endereço Completo
              </label>
              <input
                type="text"
                value={settings.address_full}
                onChange={(e) => setSettings({ ...settings, address_full: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                Link do Google Maps
              </label>
              <input
                type="text"
                value={settings.google_maps_url}
                onChange={(e) => setSettings({ ...settings, google_maps_url: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                Horário de Funcionamento
              </label>
              <input
                type="text"
                value={settings.business_hours}
                onChange={(e) => setSettings({ ...settings, business_hours: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
              />
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0f1115] border border-white/10 space-y-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#c5a059]">
            Metadados de SEO & Indexação
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                Meta Title
              </label>
              <input
                type="text"
                value={settings.meta_title}
                onChange={(e) => setSettings({ ...settings, meta_title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                Meta Description
              </label>
              <textarea
                rows={3}
                value={settings.meta_description}
                onChange={(e) => setSettings({ ...settings, meta_description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs resize-none"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                Palavras-chave (Keywords)
              </label>
              <input
                type="text"
                value={settings.meta_keywords}
                onChange={(e) => setSettings({ ...settings, meta_keywords: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="gold-gradient-bg text-black font-bold px-8 py-3.5 rounded-full text-xs uppercase tracking-wider flex items-center gap-2 hover:opacity-95 transition-all shadow-md"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Salvando...' : 'Salvar Configurações Gerais'}</span>
        </button>
      </form>
    </div>
  );
};
