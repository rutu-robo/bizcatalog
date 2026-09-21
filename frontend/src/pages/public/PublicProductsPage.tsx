import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../api/client';
import { PublicWebsiteData, Product } from '../../types';
import { THEMES } from '../../themes';
import {
  ArrowLeft,
  ShoppingBag,
  Plus,
  Search,
  X,
  SlidersHorizontal,
  RotateCcw,
  Star,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  ArrowUpDown,
  Tag,
  Package,
  Layers,
  MessageCircle,
  ChevronRight,
  Flame,
  BadgePercent
} from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { CartDrawer } from '../../components/cart/CartDrawer';
import { getProductPromoInfo } from '../../utils/promo';

type StockFilter = 'all' | 'in_stock' | 'out_of_stock';
type PricePreset = 'all' | 'under_1m' | '1m_to_3m' | 'above_3m' | 'custom';
type SortOption = 'default' | 'price_asc' | 'price_desc' | 'name_asc';

export const PublicProductsPage: React.FC = () => {
  const params = useParams<{ subdomain?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Detect subdomain from route or host
  const getSubdomain = () => {
    if (params.subdomain) return params.subdomain;
    const host = window.location.hostname;
    const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(host);
    if (!isIp && host.includes('bizcatalog.com')) {
      const parts = host.split('.');
      if (parts.length > 2 && !['www', 'app', 'admin'].includes(parts[0])) {
        return parts[0];
      }
    }
    return 'mebeljaya'; // Default fallback
  };

  const subdomain = getSubdomain();
  const host = window.location.hostname;
  const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(host);
  const isSubdomainHost =
    !isIp &&
    host.includes('bizcatalog.com') &&
    host.split('.').length > 2 &&
    !['www', 'app', 'admin'].includes(host.split('.')[0]);

  const homeUrl = isSubdomainHost ? '/' : `/site/${subdomain}`;

  // Data states
  const [data, setData] = useState<PublicWebsiteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cart store
  const { addItem, setIsOpen, getTotalCount } = useCartStore();
  const totalCartCount = getTotalCount();

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStock, setSelectedStock] = useState<StockFilter>('all');
  const [pricePreset, setPricePreset] = useState<PricePreset>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [onlyPromo, setOnlyPromo] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  useEffect(() => {
    if (location.search.includes('promo=true')) {
      setOnlyPromo(true);
    }
  }, [location.search]);

  useEffect(() => {
    const loadWebsite = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.getPublicWebsite(subdomain);
        setData(res);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Website tidak ditemukan');
      } finally {
        setIsLoading(false);
      }
    };
    loadWebsite();
  }, [subdomain]);

  const website = data?.website;
  const rawProducts = useMemo(() => (Array.isArray(data?.products) ? data.products : []), [data?.products]);
  const categoriesList = useMemo(() => {
    const cats = Array.isArray(data?.categories) ? data.categories : [];
    const catNames = new Set<string>();
    cats.forEach((c) => {
      if (c && c.name) catNames.add(c.name);
    });
    rawProducts.forEach((p) => {
      if (p && p.category) catNames.add(p.category);
    });
    return Array.from(catNames);
  }, [data?.categories, rawProducts]);

  const theme = website ? THEMES[website.theme_id || 'minimalist'] || THEMES.minimalist : THEMES.minimalist;

  // Format IDR currency
  const formatIDR = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // WhatsApp Link generator
  const createWhatsAppLink = (product?: Product) => {
    if (!website) return '#';
    const rawNumber = (website.whatsapp || '').replace(/[^0-9]/g, '');
    let target = rawNumber;
    if (target.startsWith('0')) target = '62' + target.slice(1);
    if (!target) target = '6281234567890';

    let text = `Halo ${website.business_name}, saya tertarik dengan produk ${product ? `"${product.name}"` : 'katalog Anda'}. Mohon info ketersediaan dan detailnya.`;
    return `https://wa.me/${target}?text=${encodeURIComponent(text)}`;
  };

  // Handle Preset Price Filter changes
  const handlePresetPriceChange = (preset: PricePreset) => {
    setPricePreset(preset);
    if (preset === 'all') {
      setMinPrice('');
      setMaxPrice('');
    } else if (preset === 'under_1m') {
      setMinPrice('0');
      setMaxPrice('1000000');
    } else if (preset === '1m_to_3m') {
      setMinPrice('1000000');
      setMaxPrice('3000000');
    } else if (preset === 'above_3m') {
      setMinPrice('3000000');
      setMaxPrice('');
    }
  };

  const handleCustomMinPrice = (val: string) => {
    setMinPrice(val);
    setPricePreset('custom');
  };

  const handleCustomMaxPrice = (val: string) => {
    setMaxPrice(val);
    setPricePreset('custom');
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStock('all');
    setPricePreset('all');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('default');
    setOnlyPromo(false);
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'all' ||
    selectedStock !== 'all' ||
    pricePreset !== 'all' ||
    minPrice !== '' ||
    maxPrice !== '' ||
    onlyPromo ||
    sortBy !== 'default';

  // Count items with active promotion
  const promoCount = useMemo(() => {
    return rawProducts.filter((p) => getProductPromoInfo(p, data?.promotions) !== null).length;
  }, [rawProducts, data?.promotions]);

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    return rawProducts
      .filter((p) => {
        // Promo only filter
        if (onlyPromo) {
          const promo = getProductPromoInfo(p, data?.promotions);
          if (!promo) return false;
        }

        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = (p.name || '').toLowerCase().includes(q);
          const matchDesc = (p.description || '').toLowerCase().includes(q);
          const matchCat = (p.category || '').toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchCat) return false;
        }

        // Category filter
        if (selectedCategory !== 'all') {
          if (p.category !== selectedCategory) return false;
        }

        // Stock filter (default stock is 10 if not defined)
        const stockCount = typeof p.stock === 'number' ? p.stock : 10;
        if (selectedStock === 'in_stock' && stockCount <= 0) return false;
        if (selectedStock === 'out_of_stock' && stockCount > 0) return false;

        // Price filter
        const minVal = minPrice ? parseFloat(minPrice) : null;
        const maxVal = maxPrice ? parseFloat(maxPrice) : null;
        if (minVal !== null && !isNaN(minVal) && p.price < minVal) return false;
        if (maxVal !== null && !isNaN(maxVal) && p.price > maxVal) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [rawProducts, searchQuery, selectedCategory, selectedStock, minPrice, maxPrice, sortBy, onlyPromo, data?.promotions]);

  // Count items per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    rawProducts.forEach((p) => {
      if (p.category) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });
    return counts;
  }, [rawProducts]);

  // Stock counts
  const stockCounts = useMemo(() => {
    let inStock = 0;
    let outStock = 0;
    rawProducts.forEach((p) => {
      const stock = typeof p.stock === 'number' ? p.stock : 10;
      if (stock > 0) inStock++;
      else outStock++;
    });
    return { inStock, outStock };
  }, [rawProducts]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-3">
        <Loader2 className="w-9 h-9 animate-spin text-blue-500" />
        <p className="text-sm font-medium text-slate-400">Memuat katalog produk...</p>
      </div>
    );
  }

  if (error || !website) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Katalog Tidak Tersedia</h2>
        <p className="text-sm text-slate-500 max-w-md mb-6">
          Website untuk toko <strong>{subdomain}</strong> tidak ditemukan atau terjadi kesalahan server.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition-all"
        >
          <span>Kembali ke Beranda Platform</span>
        </Link>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-50/70 text-slate-900 antialiased font-sans ${theme.fontFamily}`}>
      {/* Top Floating / Fixed Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Back to Storefront Home */}
          <div className="flex items-center gap-3">
            <Link
              to={homeUrl}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 hover:text-blue-600 text-xs font-bold transition-all group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Beranda Toko</span>
            </Link>

            <div className="h-5 w-px bg-slate-200 hidden sm:block" />

            {/* Brand Logo & Name */}
            <div className="flex items-center gap-2.5">
              {website.logo_url ? (
                <img
                  src={website.logo_url}
                  alt={website.business_name}
                  className="w-8 h-8 rounded-lg object-cover border border-slate-200/60"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs">
                  {website.business_name.charAt(0)}
                </div>
              )}
              <span className="font-extrabold text-sm text-slate-900 tracking-tight hidden sm:inline">
                {website.business_name}
              </span>
            </div>
          </div>

          {/* Right actions: WhatsApp & Cart Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {website.whatsapp && (
              <a
                href={createWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Konsultasi WA</span>
              </a>
            )}

            {/* Cart Trigger */}
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-xs transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Keranjang</span>
              {totalCartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black flex items-center justify-center shadow-xs">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero & Breadcrumb Banner */}
      <section className="bg-gradient-to-b from-white via-slate-50 to-slate-100/60 border-b border-slate-200/80 py-7 sm:py-9">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-2.5">
            <Link to={homeUrl} className="hover:text-blue-600 transition-colors">
              Beranda
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-semibold">Katalog Produk</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-100/80 text-blue-800 text-[11px] font-bold mb-1.5">
                <Package className="w-3 h-3 text-blue-600" />
                <span>Katalog Lengkap</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Koleksi Produk Pilihan
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                Temukan seluruh produk berkualitas dari <strong>{website.business_name}</strong>. Gunakan filter untuk mempermudah pencarian Anda.
              </p>
            </div>

            {/* Quick Live Search Bar */}
            <div className="w-full md:w-80 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari nama atau deskripsi produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-300/90 bg-white text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Comprehensive Filter Panel */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 mb-6 space-y-4">
          {/* Header of Filter Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">Filter & Kustomisasi Produk</h3>
                <p className="text-[11px] text-slate-500">
                  Menampilkan <strong className="text-blue-600">{filteredProducts.length}</strong> dari {rawProducts.length} produk
                </p>
              </div>
            </div>

            {/* Sorting & Reset Action */}
            <div className="flex items-center gap-2">
              {/* Sort selector */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none pl-7 pr-8 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                >
                  <option value="default">Urutan: Rekomendasi</option>
                  <option value="price_asc">Harga: Termurah</option>
                  <option value="price_desc">Harga: Termahal</option>
                  <option value="name_asc">Nama: A - Z</option>
                </select>
                <ArrowUpDown className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Reset button if filter active */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all active:scale-95"
                  title="Reset Semua Filter"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="hidden sm:inline">Reset Filter</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter 1: By Category */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Tag className="w-3 h-3 text-slate-400" />
              <span>By Kategori</span>
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                  selectedCategory === 'all' && !onlyPromo
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Semua Kategori ({rawProducts.length})
              </button>
              {promoCount > 0 && (
                <button
                  type="button"
                  onClick={() => setOnlyPromo((prev) => !prev)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border shadow-2xs ${
                    onlyPromo
                      ? 'bg-red-600 border-red-600 text-white shadow-md shadow-red-500/20'
                      : 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700'
                  }`}
                >
                  <Flame className={`w-3.5 h-3.5 ${onlyPromo ? 'fill-white' : 'fill-red-500 text-red-500'}`} />
                  <span>Promo & Flash Sale ({promoCount})</span>
                </button>
              )}
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      selectedCategory === cat ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    {categoryCounts[cat] || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Filter 2 & 3: By Harga & By Stok (Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 border-t border-slate-100">
            {/* Filter by Harga */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <span>💰 By Harga (Rentang Nominal)</span>
              </span>

              {/* Price Preset Chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => handlePresetPriceChange('all')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    pricePreset === 'all'
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Semua Harga
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetPriceChange('under_1m')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    pricePreset === 'under_1m'
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  &lt; Rp 1 Juta
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetPriceChange('1m_to_3m')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    pricePreset === '1m_to_3m'
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Rp 1 - 3 Juta
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetPriceChange('above_3m')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    pricePreset === 'above_3m'
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  &gt; Rp 3 Juta
                </button>
              </div>

              {/* Min & Max inputs */}
              <div className="flex items-center gap-2 text-xs">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-semibold">Rp</span>
                  <input
                    type="number"
                    placeholder="Min Harga"
                    value={minPrice}
                    onChange={(e) => handleCustomMinPrice(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
                <span className="text-slate-400">-</span>
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-semibold">Rp</span>
                  <input
                    type="number"
                    placeholder="Maks Harga"
                    value={maxPrice}
                    onChange={(e) => handleCustomMaxPrice(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Filter by Stok */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <span>📦 By Status Stok</span>
              </span>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedStock('all')}
                  className={`flex-1 sm:flex-initial px-3 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 border ${
                    selectedStock === 'all'
                      ? 'bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-600/20 shadow-xs'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>Semua Stok</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-bold">
                    {rawProducts.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStock('in_stock')}
                  className={`flex-1 sm:flex-initial px-3 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 border ${
                    selectedStock === 'in_stock'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-600/20 shadow-xs'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Ready Stock</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                    {stockCounts.inStock}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStock('out_of_stock')}
                  className={`flex-1 sm:flex-initial px-3 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 border ${
                    selectedStock === 'out_of_stock'
                      ? 'bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-600/20 shadow-xs'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Stok Habis</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 font-bold">
                    {stockCounts.outStock}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid / Empty state */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 px-6 rounded-3xl border border-dashed border-slate-300 bg-white max-w-xl mx-auto my-8 shadow-xs">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1">
              Tidak Ada Produk yang Cocok
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
              Tidak ditemukan produk yang memenuhi kombinasi filter kategori, harga, atau stok yang Anda tentukan. Coba sesuaikan filter Anda.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Semua Filter</span>
            </button>
          </div>
        ) : (
          /* 5-Column Grid on Desktop */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3.5 sm:gap-4">
            {filteredProducts.map((p) => {
              const stock = typeof p.stock === 'number' ? p.stock : 10;
              const isOutOfStock = stock <= 0;
              const promoInfo = getProductPromoInfo(p, data?.promotions);
              const finalItem = promoInfo ? { ...p, price: promoInfo.discountedPrice } : p;

              return (
                <div
                  key={p.id}
                  className="rounded-2xl border border-slate-200/90 hover:border-blue-400 bg-white shadow-2xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden group relative"
                >
                  <div>
                    {/* Image Box */}
                    <div className="relative aspect-square bg-slate-100 overflow-hidden">
                      <img
                        src={p.image_url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&auto=format&fit=crop&q=80'}
                        alt={p.name}
                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                          isOutOfStock ? 'opacity-70 grayscale-[30%]' : ''
                        }`}
                      />

                      {/* Category Badge (Top-Left) */}
                      {p.category && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-xs text-[10px] font-bold text-slate-800 shadow-2xs">
                          {p.category}
                        </span>
                      )}

                      {/* Promo Badge (Bottom-Left) */}
                      {promoInfo && (
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-red-600 text-white font-black text-[10px] uppercase tracking-wider shadow-sm flex items-center gap-1 z-10">
                          <Flame className="w-3 h-3 fill-white" />
                          <span>-{promoInfo.percent}%</span>
                        </span>
                      )}

                      {/* Stock Badge (Top-Right) */}
                      <span
                        className={`absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold backdrop-blur-xs shadow-2xs flex items-center gap-1 ${
                          isOutOfStock
                            ? 'bg-rose-500/90 text-white'
                            : 'bg-emerald-600/90 text-white'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        <span>{isOutOfStock ? 'Habis' : `Stok: ${stock}`}</span>
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-3 sm:p-3.5 space-y-1">
                      <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                        {p.name}
                      </h3>

                      {p.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {p.description}
                        </p>
                      )}

                      <div className="flex items-center gap-1 text-amber-400 pt-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-2.5 h-2.5 fill-amber-400" />
                        ))}
                      </div>

                      <div className="pt-1">
                        {promoInfo ? (
                          <div className="flex items-baseline gap-1.5 flex-wrap">
                            <span className="text-xs sm:text-sm font-black text-red-600 font-mono">
                              {formatIDR(promoInfo.discountedPrice)}
                            </span>
                            <span className="text-[10px] text-slate-400 line-through">
                              {formatIDR(p.price)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs sm:text-sm font-black text-blue-600 block">
                            {formatIDR(p.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-3 pt-0 grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => addItem(finalItem)}
                      disabled={isOutOfStock}
                      className={`w-full py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                        isOutOfStock
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                      title={isOutOfStock ? 'Stok produk habis' : 'Tambah ke Keranjang'}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Keranjang</span>
                    </button>

                    {isOutOfStock ? (
                      <a
                        href={createWhatsAppLink(p)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all flex items-center justify-center gap-1 shadow-xs"
                        title="Tanya ketersediaan via WA"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Pre-Order</span>
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          addItem(finalItem);
                          setIsOpen(true);
                        }}
                        className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-all flex items-center justify-center gap-1 shadow-xs"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Beli</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Cart Drawer Modal */}
      <CartDrawer website={website} />

      {/* Footer */}
      <footer className="mt-16 bg-white border-t border-slate-200/80 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-2">
          <p className="font-semibold text-slate-800">
            {website.business_name} &bull; Katalog Resmi
          </p>
          {website.address && <p className="text-slate-400">{website.address}</p>}
          <p className="text-slate-400 text-[11px] pt-2">
            Powered by <strong>BizCatalog Builder Platform</strong>
          </p>
        </div>
      </footer>
    </div>
  );
};
