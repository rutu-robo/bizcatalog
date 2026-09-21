import React, { useState, useEffect } from 'react';
import { Header } from '../../components/dashboard/Header';
import { api } from '../../api/client';
import { Promotion, PromoType, PromoTargetType, Category, Product } from '../../types';
import {
  BadgePercent,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Ticket,
  Percent,
  Search,
  CheckCircle2,
  X,
  Package,
  Layers,
  Sparkles,
  Flame,
  Check,
  Calendar,
  AlertCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const PromotionsPage: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | PromoType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);

  // Form State
  const [formType, setFormType] = useState<PromoType>('countdown');
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formBadge, setFormBadge] = useState('Limited Time Offer');
  const [formButtonText, setFormButtonText] = useState('Shop The Sale');
  const [formButtonLink, setFormButtonLink] = useState('#katalog');
  const [formCode, setFormCode] = useState('HEMAT10');
  const [formDiscountPercent, setFormDiscountPercent] = useState<number>(30);
  const [formDiscountAmount, setFormDiscountAmount] = useState<number>(50000);
  const [formMinSpend, setFormMinSpend] = useState<number>(1000000);
  const [formCountdownDays, setFormCountdownDays] = useState<number>(2);
  const [formCountdownHours, setFormCountdownHours] = useState<number>(14);
  const [formCountdownMinutes, setFormCountdownMinutes] = useState<number>(37);
  const [formTargetType, setFormTargetType] = useState<PromoTargetType>('all');
  const [formTargetCategory, setFormTargetCategory] = useState<string>('');
  const [formSelectedProductIds, setFormSelectedProductIds] = useState<string[]>([]);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);

  // Product selector search in modal
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [promosData, catsData, prodsData] = await Promise.all([
        api.getPromotions(),
        api.getCategories(),
        api.getProducts(),
      ]);
      setPromotions(Array.isArray(promosData) ? promosData : []);
      setCategories(Array.isArray(catsData) ? catsData : []);
      setProducts(Array.isArray(prodsData) ? prodsData : []);
    } catch (e) {
      console.error('Failed to load promotions', e);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openCreateModal = () => {
    setEditingPromo(null);
    setFormType('countdown');
    setFormTitle('Super Sale Up To 50% Off!');
    setFormSubtitle('On selected items. Shop now before the deal ends.');
    setFormBadge('Limited Time Offer');
    setFormButtonText('Shop The Sale');
    setFormButtonLink('#katalog');
    setFormCode('HEMAT10');
    setFormDiscountPercent(50);
    setFormDiscountAmount(50000);
    setFormMinSpend(1000000);
    setFormCountdownDays(2);
    setFormCountdownHours(14);
    setFormCountdownMinutes(37);
    setFormTargetType('all');
    setFormTargetCategory(categories[0]?.name || '');
    setFormSelectedProductIds([]);
    setFormIsActive(true);
    setProductSearch('');
    setIsModalOpen(true);
  };

  const openEditModal = (promo: Promotion) => {
    setEditingPromo(promo);
    setFormType(promo.type);
    setFormTitle(promo.title);
    setFormSubtitle(promo.subtitle || '');
    setFormBadge(promo.badge || '');
    setFormButtonText(promo.button_text || 'Shop The Sale');
    setFormButtonLink(promo.button_link || '#katalog');
    setFormCode(promo.code || '');
    setFormDiscountPercent(promo.discount_percent || 0);
    setFormDiscountAmount(promo.discount_amount || 0);
    setFormMinSpend(promo.min_spend || 0);
    setFormCountdownDays(promo.countdown_days ?? 2);
    setFormCountdownHours(promo.countdown_hours ?? 14);
    setFormCountdownMinutes(promo.countdown_minutes ?? 37);
    setFormTargetType(promo.target_type || 'all');
    setFormTargetCategory(promo.target_category || categories[0]?.name || '');
    setFormSelectedProductIds(promo.product_ids || []);
    setFormIsActive(promo.is_active);
    setProductSearch('');
    setIsModalOpen(true);
  };

  const handleToggleProduct = (prodId: string) => {
    setFormSelectedProductIds((prev) =>
      prev.includes(prodId) ? prev.filter((id) => id !== prodId) : [...prev, prodId]
    );
  };

  const handleToggleAllProducts = () => {
    if (formSelectedProductIds.length === products.length) {
      setFormSelectedProductIds([]);
    } else {
      setFormSelectedProductIds(products.map((p) => p.id));
    }
  };

  const handleToggleStatus = async (promo: Promotion) => {
    try {
      const updated = await api.updatePromotion(promo.id, {
        is_active: !promo.is_active,
      });
      setPromotions((prev) => prev.map((p) => (p.id === promo.id ? updated : p)));
      showToast(`Promo ${updated.is_active ? 'diaktifkan' : 'dinonaktifkan'}`);
    } catch (e: any) {
      showToast(e.message || 'Gagal mengubah status');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Yakin ingin menghapus promo "${title}"?`)) return;
    try {
      await api.deletePromotion(id);
      setPromotions((prev) => prev.filter((p) => p.id !== id));
      showToast('Promo berhasil dihapus');
    } catch (e: any) {
      showToast(e.message || 'Gagal menghapus promo');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Judul promo wajib diisi');
      return;
    }

    setIsSaving(true);
    try {
      const payload: Partial<Promotion> = {
        title: formTitle.trim(),
        subtitle: formSubtitle.trim(),
        type: formType,
        code: formCode.trim().toUpperCase(),
        discount_percent: formDiscountPercent,
        discount_amount: formDiscountAmount,
        min_spend: formMinSpend,
        countdown_days: formCountdownDays,
        countdown_hours: formCountdownHours,
        countdown_minutes: formCountdownMinutes,
        badge: formBadge.trim(),
        button_text: formButtonText.trim(),
        button_link: formButtonLink.trim(),
        target_type: formTargetType,
        target_category: formTargetType === 'category' ? formTargetCategory : '',
        product_ids: formTargetType === 'products' ? formSelectedProductIds : [],
        is_active: formIsActive,
      };

      if (editingPromo) {
        const updated = await api.updatePromotion(editingPromo.id, payload);
        setPromotions((prev) => prev.map((p) => (p.id === editingPromo.id ? updated : p)));
        showToast('Promo berhasil diperbarui');
      } else {
        const created = await api.createPromotion(payload);
        setPromotions((prev) => [created, ...prev]);
        showToast('Promo baru berhasil dibuat');
      }
      setIsModalOpen(false);
    } catch (e: any) {
      alert(e.message || 'Gagal menyimpan promo');
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered promotions for display
  const filteredPromotions = promotions.filter((p) => {
    const matchesTab = activeTab === 'all' || p.type === activeTab;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.subtitle && p.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.code && p.code.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  // Calculate target products affected for a promo
  const getAffectedProductsCount = (promo: Promotion) => {
    if (promo.target_type === 'all') return products.length;
    if (promo.target_type === 'category') {
      return products.filter((p) => p.category === promo.target_category).length;
    }
    return promo.product_ids?.length || 0;
  };

  // KPIs
  const activePromosCount = promotions.filter((p) => p.is_active).length;
  const countdownPromosCount = promotions.filter((p) => p.type === 'countdown' && p.is_active).length;
  const couponPromosCount = promotions.filter((p) => p.type === 'coupon' && p.is_active).length;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 min-h-screen">
      <Header title="Manajemen Promo & Kupon" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Banner Intro & Quick Link to Section Builder */}
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-2 z-10 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider text-white">
              <BadgePercent className="w-3.5 h-3.5" />
              Pusat Kampanye Pemasaran
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Kelola Promo, Diskon, & Kupon Belanja
            </h1>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
              Atur besaran diskon, durasi hitung mundur flash sale, serta pilih spesifik produk mana saja yang mendapatkan potongan harga di website katalog Anda.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 z-10 w-full md:w-auto">
            <button
              type="button"
              onClick={openCreateModal}
              className="px-5 py-2.5 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 active:scale-95 font-bold text-xs shadow-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-orange-600" />
              <span>Buat Promo Baru</span>
            </button>
            <Link
              to="/dashboard/builder"
              className="px-4 py-2.5 rounded-2xl bg-black/20 hover:bg-black/30 backdrop-blur-sm text-white text-xs font-semibold border border-white/20 transition-all flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Atur di Section Builder</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Promo</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{promotions.length}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <BadgePercent className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Promo Aktif</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">{activePromosCount}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Flash Sale Aktif</span>
              <span className="text-2xl font-black text-orange-600 mt-1 block">{countdownPromosCount}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Kupon Voucher</span>
              <span className="text-2xl font-black text-blue-600 mt-1 block">{couponPromosCount}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Ticket className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Semua Promo ({promotions.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('countdown')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'countdown'
                  ? 'bg-white text-orange-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Flash Sale</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('coupon')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'coupon'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Kupon Voucher</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('discount')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'discount'
                  ? 'bg-white text-purple-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Percent className="w-3.5 h-3.5" />
              <span>Diskon Langsung</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama promo atau kode..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>
        </div>

        {/* Promotions List Cards */}
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Memuat data promo...</div>
        ) : filteredPromotions.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto">
              <BadgePercent className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Belum Ada Promo</h3>
              <p className="text-xs text-slate-500 mt-1">
                {searchQuery
                  ? 'Tidak ada promo yang cocok dengan kata kunci pencarian.'
                  : 'Buat promo pertama Anda untuk menarik lebih banyak pembeli ke katalog toko.'}
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateModal}
              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-all shadow-md shadow-orange-500/20"
            >
              + Buat Promo Baru
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPromotions.map((promo) => {
              const affectedCount = getAffectedProductsCount(promo);

              return (
                <div
                  key={promo.id}
                  className={`bg-white rounded-3xl border transition-all hover:shadow-md flex flex-col justify-between overflow-hidden relative ${
                    promo.is_active ? 'border-slate-200/90' : 'border-slate-200 opacity-60 bg-slate-50/50'
                  }`}
                >
                  {/* Top Bar Status */}
                  <div className="p-5 pb-3">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      {/* Type Badge */}
                      {promo.type === 'countdown' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-200">
                          <Flame className="w-3 h-3 text-orange-600" />
                          Flash Sale Countdown
                        </span>
                      )}
                      {promo.type === 'coupon' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                          <Ticket className="w-3 h-3 text-blue-600" />
                          Kupon Voucher
                        </span>
                      )}
                      {promo.type === 'discount' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                          <Percent className="w-3 h-3 text-purple-600" />
                          Diskon Langsung
                        </span>
                      )}

                      {/* Active Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(promo)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all flex items-center gap-1 ${
                          promo.is_active
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${promo.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        <span>{promo.is_active ? 'Aktif' : 'Nonaktif'}</span>
                      </button>
                    </div>

                    {/* Title & Subtitle */}
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{promo.title}</h3>
                    {promo.subtitle && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {promo.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Promo Details Box */}
                  <div className="px-5 py-3 bg-slate-50/80 border-y border-slate-100 space-y-2">
                    {/* Discount Value */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Besaran Promo:</span>
                      <span className="font-bold text-slate-900">
                        {promo.discount_percent ? `${promo.discount_percent}% OFF` : ''}
                        {promo.discount_amount ? ` (Rp ${promo.discount_amount.toLocaleString('id-ID')})` : ''}
                        {promo.code && (
                          <span className="ml-1.5 font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[11px]">
                            {promo.code}
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Countdown Details (if countdown) */}
                    {promo.type === 'countdown' && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Durasi Mundur:</span>
                        <span className="font-mono font-bold text-orange-600 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-orange-500" />
                          {promo.countdown_days ?? 2}h {promo.countdown_hours ?? 14}j {promo.countdown_minutes ?? 37}m
                        </span>
                      </div>
                    )}

                    {/* Target Products */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Produk Terdampak:</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <Package className="w-3.5 h-3.5 text-slate-400" />
                        {promo.target_type === 'all' && <span>Semua ({products.length} Produk)</span>}
                        {promo.target_type === 'category' && (
                          <span>Kategori: {promo.target_category || 'Semua'} ({affectedCount})</span>
                        )}
                        {promo.target_type === 'products' && (
                          <span>{affectedCount} Produk Pilihan</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 flex items-center justify-between gap-2">
                    <div className="text-[11px] text-slate-400 font-medium">
                      Badge: <span className="font-semibold text-slate-600">{promo.badge || '-'}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(promo)}
                        className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-all"
                        title="Edit Promo"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(promo.id, promo.title)}
                        className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-all"
                        title="Hapus Promo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal Create / Edit Promotion */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <BadgePercent className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    {editingPromo ? 'Edit Promo / Diskon' : 'Buat Promo Baru'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Atur strategi diskon, durasi waktu, serta pilih produk yang berpartisipasi.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* 1. Pilih Jenis Promo */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  1. Pilih Format / Jenis Promo
                </label>
                <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                  {/* Countdown */}
                  <button
                    type="button"
                    onClick={() => {
                      setFormType('countdown');
                      setFormBadge('Limited Time Offer');
                      setFormButtonText('Shop The Sale');
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      formType === 'countdown'
                        ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-2">
                      <Clock className="w-4 h-4" />
                    </div>
                    <span className="block text-xs font-bold text-slate-900">Countdown Flash Sale</span>
                    <span className="block text-[10px] text-slate-500 mt-0.5 leading-tight">
                      Banner hitung mundur hari, jam, & menit live
                    </span>
                  </button>

                  {/* Coupon */}
                  <button
                    type="button"
                    onClick={() => {
                      setFormType('coupon');
                      setFormBadge('Kupon Voucher');
                      setFormButtonText('Salin Kode');
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      formType === 'coupon'
                        ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
                      <Ticket className="w-4 h-4" />
                    </div>
                    <span className="block text-xs font-bold text-slate-900">Kupon / Voucher</span>
                    <span className="block text-[10px] text-slate-500 mt-0.5 leading-tight">
                      Kode voucher siap salin untuk checkout
                    </span>
                  </button>

                  {/* Discount */}
                  <button
                    type="button"
                    onClick={() => {
                      setFormType('discount');
                      setFormBadge('30% OFF');
                      setFormButtonText('Lihat Produk');
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      formType === 'discount'
                        ? 'border-purple-500 bg-purple-50/50 ring-2 ring-purple-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-2">
                      <Percent className="w-4 h-4" />
                    </div>
                    <span className="block text-xs font-bold text-slate-900">Diskon Langsung</span>
                    <span className="block text-[10px] text-slate-500 mt-0.5 leading-tight">
                      Potongan harga katalog & badge persentase
                    </span>
                  </button>
                </div>
              </div>

              {/* 2. Informasi Utama Promo */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  2. Informasi Teks & Promo
                </label>
                <div>
                  <span className="block text-[11px] font-semibold text-slate-600 mb-1">Judul Promo</span>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Contoh: Super Sale Up To 50% Off!"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <span className="block text-[11px] font-semibold text-slate-600 mb-1">Subjudul / Deskripsi Singkat</span>
                  <input
                    type="text"
                    value={formSubtitle}
                    onChange={(e) => setFormSubtitle(e.target.value)}
                    placeholder="Contoh: On selected items. Shop now before the deal ends."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="block text-[11px] font-semibold text-slate-600 mb-1">Label Tag / Badge</span>
                    <input
                      type="text"
                      value={formBadge}
                      onChange={(e) => setFormBadge(e.target.value)}
                      placeholder="Contoh: Limited Time Offer"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <span className="block text-[11px] font-semibold text-slate-600 mb-1">Teks Tombol Aksi (CTA)</span>
                    <input
                      type="text"
                      value={formButtonText}
                      onChange={(e) => setFormButtonText(e.target.value)}
                      placeholder="Contoh: Shop The Sale"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Pengaturan Diskon & Countdown */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-4">
                <label className="block text-xs font-bold text-slate-800">
                  3. Nilai Diskon & Parameter Waktu
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="block text-[11px] font-semibold text-slate-600 mb-1">Diskon Persen (%)</span>
                    <div className="flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={formDiscountPercent}
                        onChange={(e) => setFormDiscountPercent(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full text-xs font-bold text-slate-900 bg-transparent focus:outline-none"
                      />
                      <span className="text-xs font-bold text-slate-400">%</span>
                    </div>
                  </div>

                  {formType === 'coupon' && (
                    <>
                      <div>
                        <span className="block text-[11px] font-semibold text-slate-600 mb-1">Kode Voucher</span>
                        <input
                          type="text"
                          value={formCode}
                          onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                          placeholder="HEMAT10"
                          className="w-full px-2.5 py-1.5 text-xs font-mono font-bold uppercase rounded-xl border border-slate-200 bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <span className="block text-[11px] font-semibold text-slate-600 mb-1">Min. Belanja (Rp)</span>
                        <input
                          type="number"
                          min={0}
                          value={formMinSpend}
                          onChange={(e) => setFormMinSpend(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full px-2.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white focus:outline-none"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Countdown Inputs (if countdown) */}
                {formType === 'countdown' && (
                  <div className="pt-2 border-t border-slate-200/80 space-y-2">
                    <span className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Waktu Hitung Mundur (Hari, Jam, Menit)
                    </span>
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="bg-white rounded-xl border border-slate-200 p-2 text-center">
                        <span className="block text-[9px] font-bold text-slate-400 uppercase">Hari (Days)</span>
                        <input
                          type="number"
                          min={0}
                          max={365}
                          value={formCountdownDays}
                          onChange={(e) => setFormCountdownDays(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full text-center font-mono font-black text-sm text-slate-900 bg-transparent focus:outline-none"
                        />
                      </div>
                      <div className="bg-white rounded-xl border border-slate-200 p-2 text-center">
                        <span className="block text-[9px] font-bold text-slate-400 uppercase">Jam (Hours)</span>
                        <input
                          type="number"
                          min={0}
                          max={23}
                          value={formCountdownHours}
                          onChange={(e) => setFormCountdownHours(Math.min(23, Math.max(0, parseInt(e.target.value) || 0)))}
                          className="w-full text-center font-mono font-black text-sm text-slate-900 bg-transparent focus:outline-none"
                        />
                      </div>
                      <div className="bg-white rounded-xl border border-slate-200 p-2 text-center">
                        <span className="block text-[9px] font-bold text-slate-400 uppercase">Menit (Mins)</span>
                        <input
                          type="number"
                          min={0}
                          max={59}
                          value={formCountdownMinutes}
                          onChange={(e) => setFormCountdownMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                          className="w-full text-center font-mono font-black text-sm text-slate-900 bg-transparent focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Presets */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-medium">Preset:</span>
                      {[
                        { label: '2 Hari 14 Jam', d: 2, h: 14, m: 37 },
                        { label: '3 Hari', d: 3, h: 0, m: 0 },
                        { label: '24 Jam', d: 1, h: 0, m: 0 },
                        { label: '12 Jam', d: 0, h: 12, m: 0 },
                      ].map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setFormCountdownDays(p.d);
                            setFormCountdownHours(p.h);
                            setFormCountdownMinutes(p.m);
                          }}
                          className="px-2 py-0.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-[10px] font-bold text-slate-600"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 4. TARGET PRODUK (Concern #3 dari User) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-800">
                      4. Target Produk yang Masuk Promo
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Tentukan produk mana saja yang otomatis berstatus promo dan mendapatkan harga coret.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800">
                    Targeting Produk
                  </span>
                </div>

                {/* 3 Target Options */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Option 1: All */}
                  <label
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                      formTargetType === 'all'
                        ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="targetType"
                      checked={formTargetType === 'all'}
                      onChange={() => setFormTargetType('all')}
                      className="mt-0.5 text-orange-600 focus:ring-orange-500"
                    />
                    <div>
                      <span className="block text-xs font-bold text-slate-900">Semua Produk</span>
                      <span className="block text-[10px] text-slate-500 mt-0.5">
                        Berlaku untuk seluruh {products.length} produk di toko
                      </span>
                    </div>
                  </label>

                  {/* Option 2: Category */}
                  <label
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                      formTargetType === 'category'
                        ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="targetType"
                      checked={formTargetType === 'category'}
                      onChange={() => setFormTargetType('category')}
                      className="mt-0.5 text-orange-600 focus:ring-orange-500"
                    />
                    <div>
                      <span className="block text-xs font-bold text-slate-900">Kategori Tertentu</span>
                      <span className="block text-[10px] text-slate-500 mt-0.5">
                        Hanya berlaku untuk satu kategori terpilih
                      </span>
                    </div>
                  </label>

                  {/* Option 3: Specific Products */}
                  <label
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                      formTargetType === 'products'
                        ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="targetType"
                      checked={formTargetType === 'products'}
                      onChange={() => setFormTargetType('products')}
                      className="mt-0.5 text-orange-600 focus:ring-orange-500"
                    />
                    <div>
                      <span className="block text-xs font-bold text-slate-900">Pilih Produk</span>
                      <span className="block text-[10px] text-slate-500 mt-0.5">
                        Pilih produk spesifik dengan checklist
                      </span>
                    </div>
                  </label>
                </div>

                {/* If Category is selected */}
                {formTargetType === 'category' && (
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="block text-xs font-bold text-slate-700 mb-1.5">
                      Pilih Kategori Produk:
                    </span>
                    <select
                      value={formTargetCategory}
                      onChange={(e) => setFormTargetCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name} ({products.filter((p) => p.category === c.name).length} Produk)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* If Specific Products is selected */}
                {formTargetType === 'products' && (
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        Pilih Produk ({formSelectedProductIds.length} dari {products.length} Terpilih):
                      </span>
                      <button
                        type="button"
                        onClick={handleToggleAllProducts}
                        className="text-[11px] font-bold text-orange-600 hover:text-orange-700"
                      >
                        {formSelectedProductIds.length === products.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                      </button>
                    </div>

                    {/* Search inside product selector */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Cari nama produk..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none"
                      />
                    </div>

                    {/* Product List Checklist */}
                    <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                      {products
                        .filter((p) =>
                          p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                          p.category.toLowerCase().includes(productSearch.toLowerCase())
                        )
                        .map((prod) => {
                          const isSelected = formSelectedProductIds.includes(prod.id);
                          const discountedPrice = Math.round(prod.price * (1 - formDiscountPercent / 100));

                          return (
                            <div
                              key={prod.id}
                              onClick={() => handleToggleProduct(prod.id)}
                              className={`p-2 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                                isSelected
                                  ? 'border-orange-500 bg-orange-50/70 shadow-2xs'
                                  : 'border-slate-200 bg-white hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                  className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                                    isSelected
                                      ? 'bg-orange-500 border-orange-500 text-white'
                                      : 'border-slate-300 bg-white'
                                  }`}
                                >
                                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </div>
                                {prod.image_url ? (
                                  <img
                                    src={prod.image_url}
                                    alt={prod.name}
                                    className="w-9 h-9 rounded-lg object-cover border border-slate-200"
                                  />
                                ) : (
                                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                    <Package className="w-4 h-4" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <span className="block text-xs font-bold text-slate-900 truncate">
                                    {prod.name}
                                  </span>
                                  <span className="block text-[10px] text-slate-400">
                                    {prod.category}
                                  </span>
                                </div>
                              </div>

                              <div className="text-right flex-shrink-0">
                                <span className="block text-xs font-bold text-orange-600">
                                  Rp {discountedPrice.toLocaleString('id-ID')}
                                </span>
                                <span className="block text-[10px] text-slate-400 line-through">
                                  Rp {prod.price.toLocaleString('id-ID')}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>

              {/* Status Switch */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-800">Status Promo Aktif</span>
                  <span className="block text-[11px] text-slate-500">
                    Jika dinonaktifkan, harga coret & promo tidak akan ditampilkan di toko.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-md shadow-orange-500/20 disabled:opacity-50"
                >
                  {isSaving ? 'Menyimpan...' : editingPromo ? 'Simpan Perubahan' : 'Buat Promo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
