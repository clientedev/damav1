import React, { useState } from 'react';
import { Shield, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { login } from '../../services/api';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToSite }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ username, password });
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Falha ao autenticar. Verifique usuário e senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090b] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#c5a059]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-md w-full bg-[#0f1115] border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#c5a059] to-[#987834] text-black flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#c5a059]/20">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Painel Administrativo</h1>
          <p className="text-xs text-slate-400 mt-1 font-light">G11 Conceito Financeiro CMS</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1.5">
              Usuário ou E-mail
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white placeholder-slate-500 text-xs focus:border-[#c5a059] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1.5">
              Senha
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white placeholder-slate-500 text-xs focus:border-[#c5a059] focus:outline-none transition-colors"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5">
              Padrão inicial: <code className="text-[#c5a059]">g11admin2026</code>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full gold-gradient-bg text-black font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-lg shadow-[#c5a059]/20 disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Autenticando...' : 'Entrar no Sistema'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <button
            onClick={onBackToSite}
            className="text-xs text-slate-400 hover:text-[#c5a059] transition-colors"
          >
            ← Voltar para o Site Público
          </button>
        </div>
      </div>
    </div>
  );
};
