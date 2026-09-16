import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Layers,
  Smartphone,
  Zap,
  Globe,
  Palette,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-blue-400/20 to-indigo-500/20 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            {/* SaaS Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Platform No-Code Katalog Bisnis UMKM No. 1</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15] mb-6">
              Buat Website Katalog Bisnis Profesional dalam{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                15 Menit
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed mb-10 font-normal">
              Solusi instan untuk pengrajin, produsen, butik, dan pelaku UMKM Indonesia. Tanpa perlu paham coding, hosting rumit, atau desain web dari nol.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base px-8 py-3.5 rounded-2xl shadow-xl shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Mulai Buat Website Gratis</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/site/mebeljaya"
                target="_blank"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-800 font-semibold text-base px-6 py-3.5 rounded-2xl border border-slate-300 shadow-sm transition-all"
              >
                <Globe className="w-4 h-4 text-blue-600" />
                <span>Lihat Live Demo UMKM</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>

            {/* Trust points */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Subdomain bisnis instan
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Integrasi tombol pesanan WhatsApp
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                5 pilihan tema desain modern
              </span>
            </div>
          </div>

          {/* Interactive Mockup / Preview Banner */}
          <div className="mt-16 relative mx-auto max-w-5xl rounded-2xl p-2 bg-slate-200/80 backdrop-blur border border-slate-300 shadow-2xl">
            <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-inner">
              <div className="h-10 bg-slate-800/80 px-4 flex items-center gap-2 border-b border-slate-700">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="mx-auto bg-slate-900 text-slate-400 text-xs px-6 py-1 rounded-md font-mono flex items-center gap-2 border border-slate-700/60">
                  <Globe className="w-3 h-3 text-blue-400" />
                  https://mebeljaya.bizcatalog.com
                </div>
              </div>
              <div className="p-8 bg-gradient-to-b from-slate-950 to-slate-900 text-white">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-6">
                  <div className="space-y-4 max-w-xl">
                    <span className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      TEMA: SOLID VIBRANT
                    </span>
                    <h3 className="text-3xl font-extrabold tracking-tight">
                      Mebel Jaya Abadi — Kayu Jati Solid Jepara
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Katalog perabot premium dengan sistem direct chat WhatsApp otomatis ke penjual, galeri proses perakitan, dan testimoni pelanggan terverifikasi.
                    </p>
                    <div className="flex gap-3 pt-2">
                      <Link
                        to="/site/mebeljaya"
                        target="_blank"
                        className="text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        Buka Website Demo <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                  <div className="w-full md:w-80 aspect-video rounded-xl overflow-hidden border border-slate-700 shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=600&auto=format&fit=crop&q=80" 
                      alt="Demo Produk" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase Section */}
      <section id="features" className="py-24 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
              Fitur Lengkap yang Dirancang Khusus untuk UMKM
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Semua yang Anda butuhkan untuk membangun kehadiran digital yang profesional dan mendorong konversi penjualan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Katalog Produk Terstruktur</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Kelola nama barang, foto produk berkualitas, harga format Rupiah, kategori, dan tombol direct-checkout WhatsApp.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Palette className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">5 Desain Tema Terkurasi</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Ganti gaya tampilan website Anda dalam satu klik: Minimalist, Solid, Industrial, Formal, atau Lifestyle.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Section Builder Interaktif</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Atur urutan bagian website (Hero, About, Galeri, Testimoni, Kontak) dan ganti varian tampilan dengan mudah.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">100% Responsif & Mobile-First</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Mayoritas pembeli online berbelanja lewat ponsel. Website katalog Anda otomatis optimal di semua ukuran layar smartphone.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Dynamic Live Rendering</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Setiap perubahan harga, produk, atau foto di panel CMS langsung terupdate seketika di website publik tanpa perlu build manual.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Arsitektur Multi-Tenant Aman</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Data bisnis, aset foto, dan akun Anda terisolasi secara aman dengan enkripsi JWT dan backend engine berbasis GoLang.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Matrix Section */}
      <section id="pricing" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-wider text-blue-600 uppercase">Paket Langganan</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2 mb-4">
              Pilihan Paket yang Sesuai dengan Skala Bisnis Anda
            </h2>
            <p className="text-base text-slate-600">
              Mulai gratis hari ini dan tingkatkan paket seiring perkembangan usaha Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-lg font-bold text-slate-900">Free</div>
                <div className="text-xs text-slate-500 mt-1">Cocok untuk UMKM baru merintis</div>
                <div className="my-6">
                  <span className="text-4xl font-extrabold text-slate-900">Rp 0</span>
                  <span className="text-slate-500 text-xs font-medium ml-1">/ selamanya</span>
                </div>
                <ul className="space-y-3 text-sm text-slate-600 border-t border-slate-100 pt-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>1 Website Bisnis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Hingga <strong>5 Produk</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Tema <strong>Minimalist Clean</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Subdomain bizcatalog.com</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/register"
                className="mt-8 block text-center w-full py-3 px-4 rounded-xl font-semibold text-sm bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
              >
                Daftar Gratis
              </Link>
            </div>

            {/* Pro Plan (Recommended) */}
            <div className="bg-white rounded-3xl p-8 border-2 border-blue-600 shadow-xl relative flex flex-col justify-between scale-105 z-10">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
                Paling Populer
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900">Pro</div>
                <div className="text-xs text-slate-500 mt-1">Pilihan tepat untuk UMKM aktif</div>
                <div className="my-6">
                  <span className="text-4xl font-extrabold text-slate-900">Rp 49.000</span>
                  <span className="text-slate-500 text-xs font-medium ml-1">/ bulan</span>
                </div>
                <ul className="space-y-3 text-sm text-slate-600 border-t border-slate-100 pt-6">
                  <li className="flex items-center gap-2 font-medium text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>Hingga <strong>25 Produk</strong></span>
                  </li>
                  <li className="flex items-center gap-2 font-medium text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>Buka <strong>Semua 5 Tema</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>Pustaka Aset & Media 100MB</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>Galeri & Testimoni Pelanggan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>Prioritas Bantuan CS WhatsApp</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/register"
                className="mt-8 block text-center w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all"
              >
                Pilih Paket Pro
              </Link>
            </div>

            {/* Ultimate Plan */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-lg font-bold text-slate-900">Ultimate</div>
                <div className="text-xs text-slate-500 mt-1">Untuk produsen & distributor besar</div>
                <div className="my-6">
                  <span className="text-4xl font-extrabold text-slate-900">Rp 99.000</span>
                  <span className="text-slate-500 text-xs font-medium ml-1">/ bulan</span>
                </div>
                <ul className="space-y-3 text-sm text-slate-600 border-t border-slate-100 pt-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Hingga <strong>100 Produk</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Semua Tema Eksklusif</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Kapasitas Media 1GB</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Fitur Multi-User Kolaborator</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/register"
                className="mt-8 block text-center w-full py-3 px-4 rounded-xl font-semibold text-sm bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
              >
                Pilih Ultimate
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 bg-gradient-to-tr from-blue-700 to-indigo-800 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Siap Membawa Bisnis Anda ke Tingkat Selanjutnya?
          </h2>
          <p className="text-blue-100 text-base sm:text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            Bergabunglah dengan ratusan pengusaha UMKM yang telah mempermudah transaksi pelanggannya melalui website katalog interaktif.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-blue-700 font-bold px-8 py-3.5 rounded-2xl shadow-xl hover:scale-105 transition-all text-base"
          >
            <span>Daftar Sekarang — Gratis</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};
