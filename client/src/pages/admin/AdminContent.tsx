import React, { useState } from 'react';
import { FileText, Save, CheckCircle2, ShieldCheck, HeartHandshake, Sparkles, Plus, Trash2, Edit3 } from 'lucide-react';
import { AboutContent, Product, ExclusiveBenefit, Testimonial, ClaimFaq } from '../../types';
import { updateAboutContent, updateProduct, addProduct, deleteProduct, updateBenefit, addBenefit, deleteBenefit, updateTestimonial, addTestimonial, deleteTestimonial, updateClaim, uploadMediaFile } from '../../services/api';

interface AdminContentProps {
  initialAbout: AboutContent;
  initialProducts: Product[];
  initialBenefits: ExclusiveBenefit[];
  initialTestimonials: Testimonial[];
  initialClaims: ClaimFaq[];
  onRefresh: () => void;
}

export const AdminContent: React.FC<AdminContentProps> = ({
  initialAbout,
  initialProducts,
  initialBenefits,
  initialTestimonials,
  initialClaims,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'about' | 'products' | 'benefits' | 'testimonials' | 'claims'>('about');

  // About State
  const [about, setAbout] = useState<AboutContent>(initialAbout);
  const [savingAbout, setSavingAbout] = useState(false);
  const [aboutSaved, setAboutSaved] = useState(false);

  // Product Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    title: '',
    tag: '',
    description: '',
    card_image: '',
    features: ['']
  });

  // Testimonial Modal State
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [testimonialForm, setTestimonialForm] = useState({
    name: '',
    role: '',
    quote: '',
    stars: 5
  });

  // Save About Section
  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAbout(true);
    try {
      await updateAboutContent(about);
      setAboutSaved(true);
      setTimeout(() => setAboutSaved(false), 3000);
      onRefresh();
    } catch (err: any) {
      alert('Erro ao salvar Sobre: ' + err.message);
    } finally {
      setSavingAbout(false);
    }
  };

  // Product Handlers
  const handleOpenProductModal = (prod?: Product) => {
    if (prod) {
      setEditingProduct(prod);
      setProductForm({
        title: prod.title,
        tag: prod.tag || '',
        description: prod.description,
        card_image: prod.card_image,
        features: prod.features && prod.features.length > 0 ? [...prod.features] : ['']
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        title: '',
        tag: 'Exclusivo',
        description: '',
        card_image: '',
        features: ['']
      });
    }
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cleanFeatures = productForm.features.filter((f) => f.trim().length > 0);
      if (editingProduct) {
        await updateProduct(editingProduct.id, { ...productForm, features: cleanFeatures });
      } else {
        await addProduct({ ...productForm, features: cleanFeatures });
      }
      setShowProductModal(false);
      onRefresh();
    } catch (err: any) {
      alert('Erro ao salvar produto: ' + err.message);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Excluir este produto?')) return;
    try {
      await deleteProduct(id);
      onRefresh();
    } catch (err: any) {
      alert('Erro ao excluir produto: ' + err.message);
    }
  };

  // Testimonial Handlers
  const handleOpenTestimonialModal = (test?: Testimonial) => {
    if (test) {
      setEditingTestimonial(test);
      setTestimonialForm({
        name: test.name,
        role: test.role,
        quote: test.quote,
        stars: test.stars || 5
      });
    } else {
      setEditingTestimonial(null);
      setTestimonialForm({
        name: '',
        role: 'Corretor Parceiro',
        quote: '',
        stars: 5
      });
    }
    setShowTestimonialModal(true);
  };

  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTestimonial) {
        await updateTestimonial(editingTestimonial.id, testimonialForm);
      } else {
        await addTestimonial(testimonialForm);
      }
      setShowTestimonialModal(false);
      onRefresh();
    } catch (err: any) {
      alert('Erro ao salvar depoimento: ' + err.message);
    }
  };

  const handleDeleteTestimonial = async (id: number) => {
    if (!confirm('Excluir depoimento?')) return;
    try {
      await deleteTestimonial(id);
      onRefresh();
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="pb-6 border-b border-white/10">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <FileText className="w-6 h-6 text-[#c5a059]" />
          Conteúdo Institucional, Produtos & Sinistro
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Edição de textos, produtos de seguros, depoimentos reais e etapas da central de sinistro.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
        {[
          { id: 'about', label: 'Sobre & Valores' },
          { id: 'products', label: 'Produtos & Seguros' },
          { id: 'benefits', label: 'Benefícios Exclusivos' },
          { id: 'testimonials', label: 'Depoimentos' },
          { id: 'claims', label: 'Central de Sinistro' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all ${
              activeTab === tab.id
                ? 'gold-gradient-bg text-black shadow-md'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: ABOUT & VALUES */}
      {activeTab === 'about' && (
        <form onSubmit={handleSaveAbout} className="space-y-6">
          {aboutSaved && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Conteúdo institucional salvo com sucesso!</span>
            </div>
          )}

          <div className="p-6 sm:p-8 rounded-2xl bg-[#0f1115] border border-white/10 space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#c5a059]">
              História e Narrativa Principal
            </h3>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                Texto de Apresentação (Conheça a G11)
              </label>
              <textarea
                rows={4}
                value={about.text_conheca}
                onChange={(e) => setAbout({ ...about, text_conheca: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:border-[#c5a059] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                  Missão
                </label>
                <textarea
                  rows={3}
                  value={about.missao}
                  onChange={(e) => setAbout({ ...about, missao: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:border-[#c5a059] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                  Visão
                </label>
                <textarea
                  rows={3}
                  value={about.visao}
                  onChange={(e) => setAbout({ ...about, visao: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:border-[#c5a059] focus:outline-none"
                />
              </div>
            </div>

            {/* Values */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-3">
                Valores Institucionais
              </label>
              <div className="space-y-3">
                {(about.valores || []).map((val, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 rounded-xl bg-black/40 border border-white/5">
                    <input
                      type="text"
                      value={val.item}
                      onChange={(e) => {
                        const newVals = [...about.valores];
                        newVals[idx].item = e.target.value;
                        setAbout({ ...about, valores: newVals });
                      }}
                      className="sm:col-span-4 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white text-xs font-semibold"
                      placeholder="Nome do Valor"
                    />
                    <input
                      type="text"
                      value={val.descricao}
                      onChange={(e) => {
                        const newVals = [...about.valores];
                        newVals[idx].descricao = e.target.value;
                        setAbout({ ...about, valores: newVals });
                      }}
                      className="sm:col-span-8 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white text-xs font-light"
                      placeholder="Descrição"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={savingAbout}
            className="gold-gradient-bg text-black font-bold px-8 py-3.5 rounded-full text-xs uppercase tracking-wider flex items-center gap-2 hover:opacity-95 transition-all shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>{savingAbout ? 'Salvando...' : 'Salvar Conteúdo Institucional'}</span>
          </button>
        </form>
      )}

      {/* TAB 2: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-400">
              Produtos cadastrados no portfólio da G11 Conceito Financeiro:
            </p>
            <button
              onClick={() => handleOpenProductModal()}
              className="gold-gradient-bg text-black font-semibold px-4 py-2 rounded-full text-xs uppercase tracking-wider flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Produto</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {initialProducts.map((prod) => (
              <div
                key={prod.id}
                className="rounded-2xl bg-[#0f1115] border border-white/10 overflow-hidden flex flex-col justify-between p-5 space-y-4"
              >
                <div>
                  <img
                    src={prod.card_image}
                    alt={prod.title}
                    className="w-full h-36 object-cover rounded-xl mb-3"
                  />
                  <span className="text-[10px] uppercase font-bold text-[#c5a059] bg-[#c5a059]/10 px-2.5 py-0.5 rounded-full">
                    {prod.tag}
                  </span>
                  <h4 className="text-base font-semibold text-white mt-1">{prod.title}</h4>
                  <p className="text-xs text-slate-400 font-light mt-1 line-clamp-3">{prod.description}</p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenProductModal(prod)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
                    title="Editar produto"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(prod.id)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
                    title="Excluir produto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Product Modal */}
          {showProductModal && (
            <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-[#0f1115] border border-white/15 rounded-2xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl">
                <h3 className="text-lg font-bold text-white">
                  {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                </h3>

                <form onSubmit={handleSaveProduct} className="space-y-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                      Nome do Produto
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Seguro de Vida"
                      value={productForm.title}
                      onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                      Tag / Categoria Curta
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Vida"
                      value={productForm.tag}
                      onChange={(e) => setProductForm({ ...productForm, tag: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                      Descrição Completa
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Benefícios e cobertura..."
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">
                      Imagem do Card (/uploads/...)
                    </label>
                    <input
                      type="text"
                      value={productForm.card_image}
                      onChange={(e) => setProductForm({ ...productForm, card_image: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setShowProductModal(false)}
                      className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="gold-gradient-bg text-black font-semibold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider"
                    >
                      Salvar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BENEFITS */}
      {activeTab === 'benefits' && (
        <div className="space-y-6">
          <p className="text-xs text-slate-400">
            Benefícios pagos e exclusivos para clientes G11:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialBenefits.map((ben) => (
              <div key={ben.id} className="p-6 rounded-2xl bg-[#0f1115] border border-white/10 space-y-2">
                <h4 className="text-sm font-semibold text-white">{ben.title}</h4>
                <p className="text-xs text-slate-400 font-light leading-relaxed">{ben.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: TESTIMONIALS */}
      {activeTab === 'testimonials' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-400">Depoimentos cadastrados de corretores e clientes:</p>
            <button
              onClick={() => handleOpenTestimonialModal()}
              className="gold-gradient-bg text-black font-semibold px-4 py-2 rounded-full text-xs uppercase tracking-wider flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Depoimento</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {initialTestimonials.map((t) => (
              <div key={t.id} className="p-6 rounded-2xl bg-[#0f1115] border border-white/10 flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-white">{t.name} <span className="text-xs font-normal text-[#c5a059]">({t.role})</span></h4>
                  <p className="text-xs text-slate-300 font-light mt-2 italic">"{t.quote}"</p>
                </div>
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                  <button onClick={() => handleOpenTestimonialModal(t)} className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-300">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteTestimonial(t.id)} className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial Modal */}
          {showTestimonialModal && (
            <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-[#0f1115] border border-white/15 rounded-2xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl">
                <h3 className="text-lg font-bold text-white">
                  {editingTestimonial ? 'Editar Depoimento' : 'Novo Depoimento'}
                </h3>
                <form onSubmit={handleSaveTestimonial} className="space-y-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">Nome</label>
                    <input
                      type="text"
                      required
                      value={testimonialForm.name}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">Cargo / Função</label>
                    <input
                      type="text"
                      required
                      value={testimonialForm.role}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, role: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-1">Depoimento</label>
                    <textarea
                      rows={3}
                      required
                      value={testimonialForm.quote}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, quote: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs resize-none"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                    <button type="button" onClick={() => setShowTestimonialModal(false)} className="px-4 py-2 text-xs text-slate-300">
                      Cancelar
                    </button>
                    <button type="submit" className="gold-gradient-bg text-black font-semibold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider">
                      Salvar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: CLAIMS */}
      {activeTab === 'claims' && (
        <div className="space-y-6">
          <p className="text-xs text-slate-400">Instruções e respostas da Central de Sinistros:</p>
          <div className="space-y-4">
            {initialClaims.map((claim) => (
              <div key={claim.id} className="p-6 rounded-2xl bg-[#0f1115] border border-white/10 space-y-3">
                <h4 className="text-sm font-semibold text-white">{claim.question}</h4>
                <p className="text-xs text-slate-300 font-light leading-relaxed">{claim.answer}</p>
                {claim.steps && claim.steps.length > 0 && (
                  <ul className="space-y-1.5 list-disc list-inside text-xs text-slate-400 pl-2">
                    {claim.steps.map((st, i) => (
                      <li key={i}>{st}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
