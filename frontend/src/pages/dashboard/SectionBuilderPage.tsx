import React, { useState, useEffect } from 'react';
import { Header } from '../../components/dashboard/Header';
import { api } from '../../api/client';
import { SectionConfig, SectionType } from '../../types';
import { useAuthStore } from '../../store/authStore';
import {
  Layers,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Sliders,
  Sparkles,
  PanelTop
} from 'lucide-react';
import { Link } from 'react-router-dom';

const VARIANT_LABELS: Record<string, string> = {
  // Hero
  'split': 'Split 2 Kolom (Teks & Foto)',
  'bg-full': 'Latar Belakang Penuh (Full Cover)',
  'card-rounded': 'Bingkai Kartu Melengkung (Card Rounded)',
  // Categories
  'circle-avatar': 'Circle Avatar / Stories (Bulat)',
  'pill-badges': 'Pill Badges (Kapsul Lonjong)',
  'box-cards': 'Kotak Kartu Mini (Box Cards)',
  // Catalog
  'standard-card': 'Standard Card (Border & Bayangan)',
  'minimal-frameless': 'Minimalist Frameless (Tanpa Border)',
  'overlay-badge': 'Floating Overlay (Tombol Mengambang)',
  // About
  'centered-card': 'Centered Card (Teks di Tengah)',
  'minimal-accent': 'Minimalist Accent (Aksen Garis Kiri)',
  // Promos
  'coupon-ticket': 'Kupon Tiket Diskon (Voucher Siap Salin)',
  'full-banner': 'Flash Sale Banner (Hitung Mundur)',
  'split-card': 'Split Promo Card (Diskon 2 Sisi)',
  // Testimonials
  'grid-cards': 'Grid Ulasan Multi-Kolom',
  'speech-bubble': 'Gaya Balon Chat (Speech Bubble)',
  'slider-carousel': 'Slider Ulasan Terpusat',
  // Footer
  'multi-column': '4 Kolom Lengkap E-Commerce',
  'centered': 'Tampilan Terpusat Elegan',
  'compact-bar': 'Satu Baris Horisontal Ramping',
  // Default fallbacks
  'grid': 'Grid',
  'list': 'List',
  'compact': 'Kompak',
  'story': 'Story',
  'cards': 'Cards',
  'banner': 'Banner',
  'masonry': 'Masonry',
  'default': 'Standar',
};

const SECTION_LABELS: Record<SectionType, { name: string; description: string; variants: string[] }> = {
  hero: {
    name: 'Bagian Banner Utama (Hero)',
    description: 'Header pembuka dengan foto unggulan, judul brand, dan tombol aksi belanja.',
    variants: ['split', 'bg-full', 'card-rounded'],
  },
  promos: {
    name: 'Promo & Diskon (Promotions)',
    description: 'Bagian khusus penawaran promo diskon, voucher belanja, atau flash sale.',
    variants: ['coupon-ticket', 'full-banner', 'split-card'],
  },
  categories: {
    name: 'Daftar Kategori 1 Baris (Categories)',
    description: 'Navigasi cepat kategori produk dalam satu baris horizontal interaktif.',
    variants: ['circle-avatar', 'pill-badges', 'box-cards'],
  },
  catalog: {
    name: 'Katalog Produk (Catalog 5 Kolom)',
    description: 'Koleksi produk e-commerce dalam format Grid 5 kolom dengan harga & tombol keranjang.',
    variants: ['standard-card', 'minimal-frameless', 'overlay-badge'],
  },
  about: {
    name: 'Tentang Usaha (About Us)',
    description: 'Cerita visi, sejarah, dan informasi lokasi toko usaha Anda.',
    variants: ['split', 'centered-card', 'minimal-accent'],
  },
  gallery: {
    name: 'Galeri Foto & Workshop (Gallery)',
    description: 'Dokumentasi visual proses produksi, bahan baku, atau showroom fisik.',
    variants: ['grid', 'masonry'],
  },
  projects: {
    name: 'Proyek & Portofolio (Projects)',
    description: 'Daftar proyek pengerjaan pesanan khusus atau klien bisnis.',
    variants: ['default', 'grid'],
  },
  testimonials: {
    name: 'Testimoni Pembeli (Testimonials)',
    description: 'Ulasan dan rating bintang kepuasan dari pelanggan setia.',
    variants: ['grid-cards', 'speech-bubble', 'slider-carousel'],
  },
  contact: {
    name: 'Kontak & WhatsApp (Contact)',
    description: 'Ajakan berkonsultasi langsung ke chat WhatsApp toko.',
    variants: ['default', 'compact'],
  },
  footer: {
    name: 'Bagian Bawah Halaman (Footer)',
    description: 'Navigasi penutup, hak cipta, metode bayar, dan link media sosial.',
    variants: ['multi-column', 'centered', 'compact-bar'],
  },
};

export const SectionBuilderPage: React.FC = () => {
  const { website, updateWebsite } = useAuthStore();
  const [sections, setSections] = useState<SectionConfig[]>([]);
  const [headerStyle, setHeaderStyle] = useState<'solid' | 'floating' | 'dynamic-scroll'>(
    website?.header_style || 'dynamic-scroll'
  );
  const [isSavingHeader, setIsSavingHeader] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (website?.header_style) {
      setHeaderStyle(website.header_style);
    }
  }, [website?.header_style]);

  const handleHeaderStyleChange = async (newStyle: 'solid' | 'floating' | 'dynamic-scroll') => {
    setIsSavingHeader(true);
    setSuccessMsg(null);
    try {
      const updated = await api.updateMyWebsite({ header_style: newStyle });
      updateWebsite(updated);
      setHeaderStyle(newStyle);
      const label =
        newStyle === 'floating'
          ? 'Floating Island'
          : newStyle === 'solid'
          ? 'Solid Bar'
          : 'Dynamic Scroll';
      setSuccessMsg(`Gaya header berhasil diubah menjadi "${label}"!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal mengubah gaya header');
    } finally {
      setIsSavingHeader(false);
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    setIsLoading(true);
    try {
      const data = await api.getSections();
      setSections(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    // Recalculate order numbers
    newSections.forEach((s, i) => {
      s.order = i + 1;
    });

    setSections(newSections);
  };

  const handleToggleVisibility = (index: number) => {
    const newSections = [...sections];
    newSections[index].is_visible = !newSections[index].is_visible;
    setSections(newSections);
  };

  const handleVariantChange = (index: number, variant: string) => {
    const newSections = [...sections];
    newSections[index].variant = variant;
    setSections(newSections);
  };

  const handleTitleChange = (index: number, title: string) => {
    const newSections = [...sections];
    newSections[index].title = title;
    setSections(newSections);
  };

  const handleSubtitleChange = (index: number, subtitle: string) => {
    const newSections = [...sections];
    newSections[index].subtitle = subtitle;
    setSections(newSections);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    setSuccessMsg(null);
    try {
      const saved = await api.saveSections(sections);
      setSections(saved);
      setSuccessMsg('Susunan dan konfigurasi section berhasil disimpan!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menyimpan section');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Visual Section Builder"
        description="Atur urutan bagian halaman, sembunyikan section yang belum dibutuhkan, dan sesuaikan varian tampilan."
      />

      <div className="p-8 space-y-6 max-w-5xl">
        {/* Top Control Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <Sliders className="w-4 h-4 text-blue-600" />
            <span>
              Total <strong>{sections.length} Bagian</strong> ({sections.filter((s) => s.is_visible).length} Aktif Ditampilkan)
            </span>
          </div>

          <div className="flex items-center gap-3">
            {website && (
              <Link
                to={`/site/${website.subdomain}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span>Preview Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Perubahan Susunan</span>
              )}
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 flex items-center gap-2 text-sm font-medium animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Section Blocks List */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm">Memuat modul builder...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* PINNED TOP: HEADER NAVIGATION BAR */}
            <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white rounded-2xl border-2 border-blue-200/80 transition-all p-5 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
                    <PanelTop className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white px-2 py-0.5 rounded-md">
                        Header Utama
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">
                        Bilah Navigasi Header (Komponen Tetap Atas)
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Menampilkan logo brand, menu tautan, tombol lacak pesanan, keranjang belanja, & tombol chat WhatsApp.
                    </p>
                  </div>
                </div>

                {/* Header Style Selector */}
                <div className="flex items-center gap-2 self-end md:self-auto bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 pl-2 hidden sm:inline">
                    Gaya Header:
                  </span>
                  <select
                    value={headerStyle}
                    onChange={(e) =>
                      handleHeaderStyleChange(
                        e.target.value as 'solid' | 'floating' | 'dynamic-scroll'
                      )
                    }
                    disabled={isSavingHeader}
                    className="text-xs font-bold text-blue-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="dynamic-scroll">🌊 Dynamic Scroll (Transparan ke Blur)</option>
                    <option value="floating">✨ Floating Island (Melayang Bebas)</option>
                    <option value="solid">🏛️ Solid Bar (Padat Menempel)</option>
                  </select>
                  {isSavingHeader && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />}
                </div>
              </div>
            </div>

            {sections.map((section, index) => {
              const meta = SECTION_LABELS[section.type] || {
                name: section.type,
                description: '',
                variants: ['default'],
              };

              return (
                <div
                  key={section.id || index}
                  className={`bg-white rounded-2xl border transition-all p-5 shadow-xs ${
                    section.is_visible
                      ? 'border-slate-200'
                      : 'border-slate-200 bg-slate-50/70 opacity-65'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Reorder & Name */}
                    <div className="flex items-center gap-3">
                      {/* Order Controls */}
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleMove(index, 'up')}
                          disabled={index === 0}
                          title="Geser ke atas"
                          className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-20"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMove(index, 'down')}
                          disabled={index === sections.length - 1}
                          title="Geser ke bawah"
                          className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-20"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-mono font-bold text-xs">
                        #{index + 1}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{meta.name}</h4>
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {section.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{meta.description}</p>
                      </div>
                    </div>

                    {/* Right: Controls (Variant & Toggle Visibility) */}
                    <div className="flex items-center gap-3 self-end md:self-auto">
                      {/* Variant Selector */}
                      {meta.variants.length > 1 && (
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-slate-500 font-medium">Varian:</span>
                          <select
                            value={section.variant || meta.variants[0]}
                            onChange={(e) => handleVariantChange(index, e.target.value)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none capitalize"
                          >
                            {meta.variants.map((v) => (
                              <option key={v} value={v}>
                                {VARIANT_LABELS[v] || v}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Visibility Toggle */}
                      <button
                        onClick={() => handleToggleVisibility(index)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          section.is_visible
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                        }`}
                      >
                        {section.is_visible ? (
                          <>
                            <Eye className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Tampil</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-red-500" />
                            <span>Sembunyi</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Inline Content Customization (Title & Subtitle for this section) */}
                  {section.is_visible && section.type !== 'footer' && (
                    <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Judul Bagian (Opsional)
                        </label>
                        <input
                          type="text"
                          value={section.title || ''}
                          onChange={(e) => handleTitleChange(index, e.target.value)}
                          placeholder="Judul section..."
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Subjudul / Deskripsi Bagian
                        </label>
                        <input
                          type="text"
                          value={section.subtitle || ''}
                          onChange={(e) => handleSubtitleChange(index, e.target.value)}
                          placeholder="Subjudul ringkas..."
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
