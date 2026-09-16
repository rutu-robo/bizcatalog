import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Header } from '../../components/dashboard/Header';
import { api } from '../../api/client';
import { THEMES } from '../../themes';
import {
  Package,
  Palette,
  Layers,
  Globe,
  ArrowUpRight,
  Plus,
  ExternalLink,
  Copy,
  Check,
  Building2,
  Sparkles,
  ShoppingBag
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const { user, website } = useAuthStore();
  const [productCount, setProductCount] = useState(0);
  const [assetCount, setAssetCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [products, assets, orders] = await Promise.all([
          api.getProducts(),
          api.getAssets(),
          api.getOrders().catch(() => []),
        ]);
        setProductCount(Array.isArray(products) ? products.length : 0);
        setAssetCount(Array.isArray(assets) ? assets.length : 0);
        setOrderCount(Array.isArray(orders) ? orders.length : 0);
      } catch (e) {
        console.error('Failed to load stats', e);
      }
    };
    loadStats();
  }, []);

  const maxProducts = user?.plan === 'free' ? 5 : user?.plan === 'pro' ? 25 : 100;
  const currentTheme = THEMES[website?.theme_id || 'minimalist'] || THEMES.minimalist;

  const publicUrl = `${window.location.origin}/site/${website?.subdomain}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title={`Halo, ${user?.name || 'Pengusaha'}`}
        description="Pantau status katalog produk dan performa website bisnis Anda di sini."
      />

      <div className="p-8 space-y-8 max-w-6xl">
        {/* Live Website Showcase Banner */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-600/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/30 text-blue-200 text-xs font-semibold uppercase tracking-wider border border-blue-400/30">
              <Globe className="w-3.5 h-3.5" />
              <span>Website Katalog Anda Aktif</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              {website?.business_name}
            </h2>
            <div className="flex items-center gap-2 text-sm text-blue-100 font-mono bg-blue-900/40 px-3 py-1.5 rounded-xl border border-blue-400/20 max-w-fit">
              <span className="truncate">{publicUrl}</span>
              <button
                onClick={copyUrl}
                title="Salin Link"
                className="hover:text-white p-1 rounded transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/site/${website?.subdomain}`}
              target="_blank"
              className="inline-flex items-center gap-2 bg-white hover:bg-blue-50 text-blue-800 text-sm font-bold px-5 py-3 rounded-2xl shadow-lg transition-all"
            >
              <span>Buka Website</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Products */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider">Katalog Produk</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">{productCount}</span>
                <span className="text-xs text-slate-500 font-medium">/ {maxProducts} produk</span>
              </div>
              {/* Quota bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    productCount >= maxProducts ? 'bg-amber-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${Math.min(100, (productCount / maxProducts) * 100)}%` }}
                />
              </div>
            </div>
            <Link
              to="/dashboard/products"
              className="mt-4 text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Kelola Produk</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2: Theme */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider">Desain Tema</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Palette className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className="w-4 h-4 rounded-full border border-white shadow-xs"
                  style={{ backgroundColor: currentTheme.previewColor }}
                />
                <span className="text-lg font-bold text-slate-900 truncate">
                  {currentTheme.name}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                {currentTheme.tagline}
              </p>
            </div>
            <Link
              to="/dashboard/theme"
              className="mt-4 text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Ganti Tema</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3: Builder */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider">Section Builder</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <span className="text-lg font-bold text-slate-900">7 Bagian Halaman</span>
              <p className="text-xs text-slate-500 mt-2">
                Hero, About, Katalog, Galeri, Testimoni, Kontak WA, Footer.
              </p>
            </div>
            <Link
              to="/dashboard/builder"
              className="mt-4 text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Atur Urutan & Varian</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 4: Media Assets */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider">Pustaka Media</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <span className="text-3xl font-black text-slate-900">{assetCount}</span>
              <span className="text-xs text-slate-500 ml-1">file tersimpan</span>
              <p className="text-xs text-slate-500 mt-2">
                Foto logo, produk & dokumentasi workshop.
              </p>
            </div>
            <Link
              to="/dashboard/assets"
              className="mt-4 text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Unggah Media</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Quick Launch Actions */}
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-4">Langkah Cepat Penyiapan & Operasional Toko</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/dashboard/orders"
              className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all group flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    Pesanan Masuk
                  </h4>
                  {orderCount > 0 && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                      {orderCount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Pantau pesanan belanja masuk dari pembeli secara real-time.
                </p>
              </div>
            </Link>

            <Link
              to="/dashboard/products"
              className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all group flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Tambah Produk Baru
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Upload gambar, atur harga Rupiah, dan buat deskripsi barang.
                </p>
              </div>
            </Link>

            <Link
              to="/dashboard/company"
              className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all group flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Lengkapi Nomor WhatsApp
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Agar tombol checkout otomatis terhubung ke WhatsApp bisnis.
                </p>
              </div>
            </Link>

            <Link
              to="/dashboard/builder"
              className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all group flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                  Kustomisasi Section
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Ganti susunan blok halaman sesuai selera promosi Anda.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
