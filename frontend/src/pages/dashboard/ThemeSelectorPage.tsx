import React, { useState } from 'react';
import { Header } from '../../components/dashboard/Header';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../api/client';
import { THEMES, ThemeConfig } from '../../themes';
import {
  Palette,
  CheckCircle2,
  Lock,
  Sparkles,
  Loader2,
  ExternalLink,
  PanelTop,
  Sliders
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ThemeSelectorPage: React.FC = () => {
  const { website, user, updateWebsite } = useAuthStore();
  const [activeThemeId, setActiveThemeId] = useState(website?.theme_id || 'minimalist');
  const [activeHeaderStyle, setActiveHeaderStyle] = useState<'solid' | 'floating' | 'dynamic-scroll'>(
    website?.header_style || 'dynamic-scroll'
  );
  const [isApplying, setIsApplying] = useState(false);
  const [isApplyingHeader, setIsApplyingHeader] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [lockedModalTheme, setLockedModalTheme] = useState<ThemeConfig | null>(null);

  React.useEffect(() => {
    if (website?.header_style) {
      setActiveHeaderStyle(website.header_style);
    }
  }, [website?.header_style]);

  const handleApplyHeaderStyle = async (style: 'solid' | 'floating' | 'dynamic-scroll') => {
    setIsApplyingHeader(true);
    setSuccessMsg(null);
    try {
      const updated = await api.updateMyWebsite({ header_style: style });
      updateWebsite(updated);
      setActiveHeaderStyle(style);
      const label =
        style === 'floating'
          ? 'Floating Island (Melayang)'
          : style === 'solid'
          ? 'Solid Bar (Menempel Kokoh)'
          : 'Dynamic Scroll (Transparan ke Blur)';
      setSuccessMsg(`Gaya navigasi header berhasil diubah menjadi "${label}"!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal mengubah gaya header');
    } finally {
      setIsApplyingHeader(false);
    }
  };

  const handleApplyTheme = async (theme: ThemeConfig) => {
    if (theme.isProOnly && user?.plan === 'free') {
      setLockedModalTheme(theme);
      return;
    }

    setIsApplying(true);
    setSuccessMsg(null);
    try {
      const updated = await api.updateTheme(theme.id);
      updateWebsite(updated);
      setActiveThemeId(theme.id);
      setSuccessMsg(`Tema ${theme.name} berhasil diterapkan ke website Anda!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      if ((err as { code?: string }).code === 'THEME_LOCKED') {
        setLockedModalTheme(theme);
      } else {
        alert(err instanceof Error ? err.message : 'Gagal menerapkan tema');
      }
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Desain & Gaya Tampilan (Theme & Header)"
        description="Atur tema warna estetika, tipografi, dan gaya header navigasi (solid, floating melayang, atau dinamis scroll)."
      />

      <div className="p-8 space-y-10 max-w-6xl">
        {successMsg && (
          <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 flex items-center gap-2 text-sm font-medium animate-fade-in shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ============================================================ */}
        {/* HEADER NAVIGATION STYLE SELECTOR */}
        {/* ============================================================ */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">
                <PanelTop className="w-4 h-4" />
                <span>Pengaturan Header Navigasi</span>
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Pilih Gaya Header Navigasi
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Tentukan perilaku visual bilah navigasi website publik Anda saat pengunjung membuka dan menggulir (scroll) halaman.
              </p>
            </div>
            {website?.subdomain && (
              <a
                href={`/site/${website.subdomain}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-xs transition-colors self-start sm:self-auto"
              >
                <span>Lihat Live Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* OPSI 1: DYNAMIC SCROLL */}
            <div
              onClick={() => !isApplyingHeader && handleApplyHeaderStyle('dynamic-scroll')}
              className={`cursor-pointer rounded-2xl border-2 transition-all overflow-hidden bg-white flex flex-col justify-between p-5 relative shadow-sm hover:shadow-md ${
                activeHeaderStyle === 'dynamic-scroll'
                  ? 'border-blue-600 ring-4 ring-blue-500/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    Dinamis
                  </span>
                  {activeHeaderStyle === 'dynamic-scroll' && (
                    <span className="text-blue-600 font-bold text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Aktif
                    </span>
                  )}
                </div>

                {/* Preview Ilustrasi Dynamic */}
                <div className="h-28 rounded-xl bg-gradient-to-b from-slate-800 to-slate-900 p-2.5 relative overflow-hidden flex flex-col justify-between mb-3 border border-slate-700/60">
                  {/* Top Transparent Bar */}
                  <div className="h-6 rounded-lg bg-white/20 backdrop-blur-xs border border-white/20 flex items-center justify-between px-2 text-[9px] text-white font-medium">
                    <span className="font-bold">LOGO</span>
                    <span className="text-[8px] opacity-75">Katalog • Promo • Kontak</span>
                    <span className="bg-white/30 px-1.5 py-0.5 rounded text-[8px]">🛒</span>
                  </div>

                  <div className="text-center text-[10px] text-slate-400 font-mono">
                    ↓ gulir halaman ↓
                  </div>

                  {/* Scrolled Blur Bar */}
                  <div className="h-6 rounded-lg bg-white/95 shadow-md flex items-center justify-between px-2 text-[9px] text-slate-800 font-medium">
                    <span className="font-bold text-blue-600">LOGO</span>
                    <span className="text-[8px] text-slate-500">Katalog • Promo • Kontak</span>
                    <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[8px]">🛒</span>
                  </div>
                </div>

                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  Dynamic Scroll
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Menyatu transparan dengan foto hero di posisi puncak, lalu otomatis berubah menjadi kaca blur solid ketika halaman di-scroll ke bawah.
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  disabled={isApplyingHeader}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeHeaderStyle === 'dynamic-scroll'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {isApplyingHeader && activeHeaderStyle === 'dynamic-scroll' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : activeHeaderStyle === 'dynamic-scroll' ? (
                    'Gaya Saat Ini'
                  ) : (
                    'Pilih Gaya Ini'
                  )}
                </button>
              </div>
            </div>

            {/* OPSI 2: FLOATING ISLAND */}
            <div
              onClick={() => !isApplyingHeader && handleApplyHeaderStyle('floating')}
              className={`cursor-pointer rounded-2xl border-2 transition-all overflow-hidden bg-white flex flex-col justify-between p-5 relative shadow-sm hover:shadow-md ${
                activeHeaderStyle === 'floating'
                  ? 'border-blue-600 ring-4 ring-blue-500/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                    Liquid Glass ala Apple
                  </span>
                  {activeHeaderStyle === 'floating' && (
                    <span className="text-blue-600 font-bold text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Aktif
                    </span>
                  )}
                </div>

                {/* Preview Ilustrasi Floating Liquid Glass */}
                <div className="h-28 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 p-3 relative overflow-hidden flex flex-col justify-center items-center mb-3 shadow-inner">
                  {/* Liquid Glass Capsule Bar */}
                  <div className="w-11/12 h-9 rounded-full backdrop-blur-xl backdrop-saturate-[180%] bg-white/60 shadow-[0_8px_20px_rgba(0,0,0,0.15),inset_0_1px_1px_rgba(255,255,255,0.9)] border border-white/70 flex items-center justify-between px-3 text-[9px] text-slate-900 font-bold transition-transform hover:scale-105">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-xs"></div>
                      <span className="font-black text-[9px] tracking-tight">BRAND</span>
                    </div>
                    <span className="text-[8px] text-slate-700 font-semibold hidden sm:inline">Katalog • Promo</span>
                    <div className="flex items-center gap-1">
                      <span className="bg-white/80 border border-white/80 rounded-full px-1.5 py-0.5 text-[7px] text-slate-800 shadow-2xs">🛒 1</span>
                      <span className="bg-blue-600 text-white rounded-full px-2 py-0.5 text-[7px] font-bold shadow-2xs">Chat</span>
                    </div>
                  </div>
                  <span className="text-[9px] text-white/95 font-bold mt-2.5 bg-black/25 backdrop-blur-xs px-2.5 py-0.5 rounded-full shadow-2xs border border-white/20">
                    ✨ Apple Liquid Glassmorphism
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  Floating Island (Apple Liquid Glass)
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Header melayang dengan estetika Apple Liquid Glass (kaca buram berbias cahaya specular rim, pembiasan warna mewah, dan kontrol mikro-glass). Sangat modern, elegan & premium.
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  disabled={isApplyingHeader}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeHeaderStyle === 'floating'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {isApplyingHeader && activeHeaderStyle === 'floating' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : activeHeaderStyle === 'floating' ? (
                    'Gaya Saat Ini'
                  ) : (
                    'Pilih Gaya Ini'
                  )}
                </button>
              </div>
            </div>

            {/* OPSI 3: SOLID HEADER */}
            <div
              onClick={() => !isApplyingHeader && handleApplyHeaderStyle('solid')}
              className={`cursor-pointer rounded-2xl border-2 transition-all overflow-hidden bg-white flex flex-col justify-between p-5 relative shadow-sm hover:shadow-md ${
                activeHeaderStyle === 'solid'
                  ? 'border-blue-600 ring-4 ring-blue-500/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    Klasik
                  </span>
                  {activeHeaderStyle === 'solid' && (
                    <span className="text-blue-600 font-bold text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Aktif
                    </span>
                  )}
                </div>

                {/* Preview Ilustrasi Solid */}
                <div className="h-28 rounded-xl bg-slate-100 p-0 relative overflow-hidden flex flex-col justify-between mb-3 border border-slate-200">
                  {/* Solid Bar on Top */}
                  <div className="w-full h-8 bg-white border-b-2 border-slate-300 shadow-xs flex items-center justify-between px-3 text-[9px] text-slate-800 font-medium">
                    <span className="font-bold text-slate-900">NAMA USAHA</span>
                    <span className="text-[8px] text-slate-500">Menu Lengkap</span>
                    <span className="bg-slate-800 text-white rounded px-1.5 py-0.5 text-[8px]">🛒</span>
                  </div>
                  <div className="p-3 text-center text-[10px] text-slate-500">
                    Menempel kokoh dengan latar belakang solid dan border jelas.
                  </div>
                </div>

                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  Solid Bar (Padat Menempel)
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Header tradisional yang menempel kuat di bagian atas layar dengan warna solid penuh dan garis pembatas. Formal, rapi, dan stabil.
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  disabled={isApplyingHeader}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeHeaderStyle === 'solid'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {isApplyingHeader && activeHeaderStyle === 'solid' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : activeHeaderStyle === 'solid' ? (
                    'Gaya Saat Ini'
                  ) : (
                    'Pilih Gaya Ini'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* THEME SELECTION SECTION */}
        {/* ============================================================ */}
        <div className="space-y-4">
          <div>
            <div className="inline-flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">
              <Palette className="w-4 h-4" />
              <span>Tema Visual Toko</span>
            </div>
            <h3 className="text-xl font-black text-slate-900">
              Pilih Tema Desain E-Commerce
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Setiap tema mengubah tipografi font, skema warna primer/sekunder, radius tombol, dan gaya badge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(THEMES).map((theme) => {
            const isCurrent = activeThemeId === theme.id;
            const isLocked = theme.isProOnly && user?.plan === 'free';

            return (
              <div
                key={theme.id}
                className={`bg-white rounded-3xl border-2 transition-all overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md ${
                  isCurrent
                    ? 'border-blue-600 ring-4 ring-blue-500/10'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Theme Header & Tag */}
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full border border-slate-300 shadow-xs"
                        style={{ backgroundColor: theme.previewColor }}
                      />
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{theme.name}</h3>
                        <span className="text-[11px] font-mono text-slate-400 uppercase">
                          {theme.fontFamily}
                        </span>
                      </div>
                    </div>

                    {isLocked ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Pro
                      </span>
                    ) : isCurrent ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Aktif
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                        Tersedia
                      </span>
                    )}
                  </div>

                  {/* Visual Preview Box representing the theme styles */}
                  <div className={`p-6 ${theme.bgClass} border-b border-slate-100 min-h-[160px] flex flex-col justify-between`}>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={theme.badgeClass}>Preview Desain</span>
                      </div>
                      <h4 className={`text-lg mb-1 ${theme.headingClass}`}>
                        Furnitur Kayu Asli
                      </h4>
                      <p className={`text-xs ${theme.textClass} line-clamp-2`}>
                        {theme.tagline}
                      </p>
                    </div>

                    <div className="pt-3 flex gap-2">
                      <div className={`text-xs ${theme.buttonPrimary} text-center py-1.5 px-3`}>
                        Beli Produk
                      </div>
                      <div className={`text-xs ${theme.buttonSecondary} text-center py-1.5 px-3`}>
                        Detail
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="p-6">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {theme.tagline}
                    </p>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="p-6 pt-0">
                  <button
                    onClick={() => handleApplyTheme(theme)}
                    disabled={isApplying || isCurrent}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      isCurrent
                        ? 'bg-slate-100 text-slate-400 cursor-default'
                        : isLocked
                        ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                    }`}
                  >
                    {isCurrent ? (
                      <span>Tema Sedang Digunakan</span>
                    ) : isLocked ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Buka dengan Paket Pro</span>
                      </>
                    ) : (
                      <>
                        <Palette className="w-3.5 h-3.5" />
                        <span>Terapkan Tema Ini</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </div>

      {/* Locked Theme Upgrade Prompt Modal */}
      {lockedModalTheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-white flex items-center justify-center mx-auto shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Tema Eksklusif {lockedModalTheme.name}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Paket Free hanya mencakup tema <strong>Minimalist Clean</strong>. Tingkatkan akun Anda ke <strong>Paket Pro</strong> untuk membuka semua 5 tema modern, batas 25 produk, dan fitur prioritas lainnya!
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/dashboard/settings"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all"
              >
                Tingkatkan ke Paket Pro
              </Link>
              <button
                onClick={() => setLockedModalTheme(null)}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
