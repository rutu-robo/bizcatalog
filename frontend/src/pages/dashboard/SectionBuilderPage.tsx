import React, { useState, useEffect } from 'react';
import { Header } from '../../components/dashboard/Header';
import { api } from '../../api/client';
import { SectionConfig, SectionType } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { MediaPickerModal } from '../../components/MediaPickerModal';
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
  PanelTop,
  PanelBottom,
  Tag,
  LayoutGrid,
  ShoppingBag,
  Info,
  Image as ImageIcon,
  Star,
  MessageCircle,
  Check,
  ChevronRight,
  Monitor,
  RotateCcw,
  Palette,
  Upload,
  Trash2,
  AlertCircle
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

const VARIANT_DESCRIPTIONS: Record<string, string> = {
  'split': 'Tata letak 2 kolom seimbang antara tulisan dan foto unggulan produk.',
  'bg-full': 'Foto membentang penuh di latar belakang dengan teks kontras tinggi di tengah.',
  'card-rounded': 'Foto berada di dalam bingkai kartu melengkung dengan bayangan mewah.',
  'circle-avatar': 'Avatar lingkaran ala Story Instagram/Shopee dengan cincin border warna tema.',
  'pill-badges': 'Kapsul chip lonjong horizontal yang ramping dan bersih.',
  'box-cards': 'Kartu kotak mini horizontal dengan foto di kiri dan judul di kanan.',
  'standard-card': 'Format grid 5 kolom kartu produk klasik dengan border dan bayangan.',
  'minimal-frameless': 'Kartu produk modern tanpa garis tepi dengan foto latar abu-abu halus.',
  'overlay-badge': 'Tombol keranjang mengambang di sudut foto produk dengan tag harga elegan.',
  'centered-card': 'Teks profil berada di dalam wadah kartu besar berpusat di tengah.',
  'minimal-accent': 'Tata letak elegan dengan garis aksen vertikal warna tema di sebelah kiri teks.',
  'coupon-ticket': 'Voucher tiket diskon berdesain perforasi gerigi dengan tombol salin instan.',
  'full-banner': 'Banner promo mencolok dengan penghitung waktu mundur flash sale live.',
  'split-card': 'Kartu diskon 2 sisi dengan badge persentase diskon besar.',
  'grid-cards': 'Grid kartu testimoni multi-kolom dengan avatar, nama, dan rating bintang 5.',
  'speech-bubble': 'Gaya balon chat percakapan pembeli yang unik dan ramah.',
  'slider-carousel': 'Kutipan ulasan besar terpusat dengan ikon quote dan tombol geser.',
  'multi-column': 'Footer 4 kolom lengkap: info brand, kategori, rekening bayar, dan kontak CS.',
  'centered': 'Footer terpusat di tengah dengan deretan tombol media sosial melingkar.',
  'compact-bar': 'Satu baris memanjang ramping yang sangat hemat ruang.',
};

const SECTION_ICONS: Record<SectionType, React.ElementType> = {
  hero: Sparkles,
  promos: Tag,
  categories: LayoutGrid,
  catalog: ShoppingBag,
  about: Info,
  gallery: ImageIcon,
  projects: Layers,
  testimonials: Star,
  contact: MessageCircle,
  footer: PanelBottom,
};

const SECTION_LABELS: Record<SectionType, { name: string; description: string; variants: string[] }> = {
  hero: {
    name: 'Banner Utama (Hero)',
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

const DEFAULT_SECTION_VALUES: Record<SectionType, { title: string; subtitle: string; variant: string }> = {
  hero: {
    title: 'Koleksi Mebel Kayu Jati Terbaik',
    subtitle: 'Dikerjakan langsung oleh pengrajin ahli dari Jepara dengan kualitas ekspor.',
    variant: 'split',
  },
  promos: {
    title: 'Promo Spesial Diskon & Kupon Belanja',
    subtitle: 'Klaim voucher kupon diskon eksklusif untuk hemat lebih banyak hari ini!',
    variant: 'coupon-ticket',
  },
  categories: {
    title: 'Kategori Pilihan',
    subtitle: 'Pilih kategori untuk memfilter koleksi produk favorit Anda.',
    variant: 'circle-avatar',
  },
  catalog: {
    title: 'Katalog Produk Unggulan',
    subtitle: 'Pilihan produk berkualitas tinggi yang siap mempercantik ruangan Anda.',
    variant: 'standard-card',
  },
  about: {
    title: 'Tentang Usaha Kami',
    subtitle: 'Berpengalaman lebih dari 15 tahun melayani pesanan furnitur rumah tangga, cafe, dan kantor di seluruh Indonesia.',
    variant: 'split',
  },
  gallery: {
    title: 'Galeri Workshop & Pengiriman',
    subtitle: 'Dokumentasi proses produksi dan pengiriman pesanan pelanggan.',
    variant: 'grid',
  },
  projects: {
    title: 'Proyek & Portofolio',
    subtitle: 'Daftar proyek pengerjaan pesanan khusus atau klien bisnis.',
    variant: 'default',
  },
  testimonials: {
    title: 'Apa Kata Pelanggan Kami?',
    subtitle: 'Kepuasan pelanggan adalah prioritas utama setiap karya kami.',
    variant: 'grid-cards',
  },
  contact: {
    title: 'Hubungi Kami Langsung',
    subtitle: 'Konsultasikan kebutuhan perabot Anda langsung via WhatsApp.',
    variant: 'default',
  },
  footer: {
    title: '',
    subtitle: '',
    variant: 'multi-column',
  },
};

const COLOR_PRESETS = [
  { name: 'Bawaan Tema', value: '', preview: 'transparent', border: true },
  { name: 'Putih Bersih', value: '#ffffff', preview: '#ffffff', border: true },
  { name: 'Soft Slate', value: '#f8fafc', preview: '#f8fafc', border: true },
  { name: 'Dark Navy', value: '#0f172a', preview: '#0f172a', border: false },
  { name: 'Deep Indigo', value: '#1e1b4b', preview: '#1e1b4b', border: false },
  { name: 'Warm Amber', value: '#fef3c7', preview: '#fef3c7', border: true },
  { name: 'Deep Forest', value: '#064e3b', preview: '#064e3b', border: false },
];

export const SectionBuilderPage: React.FC = () => {
  const { website, updateWebsite } = useAuthStore();
  const [sections, setSections] = useState<SectionConfig[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [headerStyle, setHeaderStyle] = useState<'solid' | 'floating' | 'dynamic-scroll'>(
    website?.header_style || 'dynamic-scroll'
  );
  const [isSavingHeader, setIsSavingHeader] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  useEffect(() => {
    if (website?.header_style) {
      setHeaderStyle(website.header_style);
    }
  }, [website?.header_style]);

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    setIsLoading(true);
    try {
      const data = await api.getSections();
      setSections(data);
      if (data.length > 0) {
        setSelectedIndex(0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

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

    // Keep active selection following the moved item
    if (selectedIndex === index) {
      setSelectedIndex(targetIndex);
    } else if (selectedIndex === targetIndex) {
      setSelectedIndex(index);
    }
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

  const handleBgColorChange = (index: number, color: string) => {
    const newSections = [...sections];
    newSections[index].bg_color = color;
    setSections(newSections);
  };

  const handleBgImageChange = (index: number, url: string) => {
    const newSections = [...sections];
    newSections[index].bg_image_url = url;
    setSections(newSections);
  };

  const handleResetSection = (index: number) => {
    const target = sections[index];
    if (!target) return;

    const defaults = DEFAULT_SECTION_VALUES[target.type] || {
      title: '',
      subtitle: '',
      variant: 'default',
    };

    const newSections = [...sections];
    newSections[index] = {
      ...newSections[index],
      title: defaults.title,
      subtitle: defaults.subtitle,
      variant: defaults.variant,
      bg_color: '',
      bg_image_url: '',
    };

    setSections(newSections);
    setSuccessMsg(`Bagian "${SECTION_LABELS[target.type]?.name || target.type}" berhasil dikembalikan ke pengaturan bawaan tema!`);
    setTimeout(() => setSuccessMsg(null), 4000);
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

  const activeSection = sections[selectedIndex] || null;
  const activeMeta = activeSection ? SECTION_LABELS[activeSection.type] : null;

  // Check if full cover image variant is active and has an image
  const isFullCoverImageActive =
    activeSection?.type === 'hero' &&
    activeSection?.variant === 'bg-full';

  // Render Visual Mockup Preview in Inspector Panel
  const renderVisualMockup = (type: SectionType, variant: string) => {
    const customBg = activeSection?.bg_color || undefined;
    const heroImg =
      activeSection?.bg_image_url ||
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80';

    switch (type) {
      case 'hero':
        if (variant === 'bg-full') {
          return (
            <div
              className="h-48 rounded-2xl p-5 flex flex-col justify-center items-center text-center text-white relative overflow-hidden border border-slate-700 shadow-inner"
              style={{
                backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.3)), url("${heroImg}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="relative z-10 space-y-1.5 max-w-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/30">
                  Full Cover Hero
                </span>
                <h5 className="text-base font-black tracking-tight">{activeSection?.title || 'Judul Utama Brand'}</h5>
                <p className="text-[10px] text-slate-200 line-clamp-1">{activeSection?.subtitle || 'Deskripsi singkat keunggulan produk'}</p>
                <div className="pt-2 flex justify-center gap-2">
                  <div className="bg-blue-600 text-[9px] font-bold px-3 py-1 rounded-lg">Belanja Sekarang</div>
                  <div className="bg-white/20 text-[9px] font-bold px-3 py-1 rounded-lg">Kontak CS</div>
                </div>
              </div>
            </div>
          );
        }
        if (variant === 'card-rounded') {
          return (
            <div
              className="p-3.5 rounded-2xl border border-slate-200 transition-colors"
              style={{ backgroundColor: customBg || '#f8fafc' }}
            >
              <div
                className="h-40 rounded-xl p-4 flex items-center justify-between text-white relative overflow-hidden shadow-lg"
                style={{
                  backgroundImage: `linear-gradient(to right, rgba(15,23,42,0.85), rgba(30,27,75,0.7)), url("${heroImg}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="space-y-1.5 max-w-[60%]">
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-md">
                    Card Rounded
                  </span>
                  <h5 className="text-sm font-black">{activeSection?.title || 'Koleksi Furnitur Premium'}</h5>
                  <div className="bg-white text-slate-900 text-[9px] font-bold px-2.5 py-1 rounded-md w-max">
                    Jelajahi Produk
                  </div>
                </div>
                <div className="w-24 h-24 rounded-lg bg-white/20 border border-white/30 backdrop-blur-xs flex items-center justify-center text-[9px] font-mono">
                  🖼️ Banner
                </div>
              </div>
            </div>
          );
        }
        // Split 2 column
        return (
          <div
            className="h-44 rounded-2xl p-4 border border-slate-200 grid grid-cols-2 gap-4 items-center shadow-xs transition-colors"
            style={{ backgroundColor: customBg || '#ffffff' }}
          >
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                Split 2 Kolom
              </span>
              <h5 className="text-sm font-bold text-slate-900 line-clamp-2">{activeSection?.title || 'Koleksi Terbaik'}</h5>
              <p className="text-[10px] text-slate-500 line-clamp-1">{activeSection?.subtitle || 'Dibuat dengan bahan kayu jati pilihan'}</p>
              <div className="pt-1 flex gap-1.5">
                <div className="bg-blue-600 text-white text-[9px] font-bold px-2.5 py-1 rounded-md">Katalog</div>
                <div className="bg-slate-100 text-slate-700 text-[9px] font-bold px-2.5 py-1 rounded-md">Chat CS</div>
              </div>
            </div>
            <div
              className="h-32 rounded-xl flex items-center justify-center text-white text-xs font-medium border border-slate-200/50 relative overflow-hidden"
              style={{
                backgroundImage: `url("${heroImg}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 bg-black/20" />
              <span className="relative z-10 bg-black/40 px-2 py-0.5 rounded text-[10px]">Showcase Foto</span>
            </div>
          </div>
        );

      case 'promos':
        if (variant === 'full-banner') {
          return (
            <div className="h-36 rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 p-4 text-white flex flex-col justify-between shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase bg-black/30 px-2 py-0.5 rounded">⚡ FLASH SALE</span>
                <span className="text-[10px] font-bold">Diskon s/d 50%</span>
              </div>
              <div className="text-center">
                <h5 className="text-sm font-black">{activeSection?.title || 'Promo Flash Sale Terbatas'}</h5>
                <div className="inline-flex gap-2 mt-2 bg-black/40 px-3 py-1 rounded-lg text-xs font-mono font-bold">
                  <span>12 Jam</span> : <span>00 Mnt</span> : <span>00 Dtk</span>
                </div>
              </div>
            </div>
          );
        }
        if (variant === 'split-card') {
          return (
            <div className="h-36 rounded-2xl bg-white border border-slate-200 p-3 grid grid-cols-3 gap-3 shadow-xs">
              <div className="col-span-2 flex flex-col justify-center space-y-1">
                <span className="text-[9px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded w-max">Promo Spesial</span>
                <h5 className="text-xs font-bold text-slate-900">{activeSection?.title || 'Diskon Pengguna Baru'}</h5>
                <p className="text-[10px] text-slate-500">Gunakan kode voucher saat checkout belanja.</p>
              </div>
              <div className="rounded-xl bg-red-500 text-white flex flex-col items-center justify-center text-center p-2">
                <span className="text-lg font-black leading-none">30%</span>
                <span className="text-[9px] font-bold uppercase">OFF</span>
              </div>
            </div>
          );
        }
        // Coupon ticket default
        return (
          <div className="h-36 rounded-2xl bg-slate-50 border border-slate-200 p-3 flex items-center justify-center gap-2.5">
            <div className="w-1/2 bg-white rounded-xl border border-dashed border-blue-400 p-2.5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-blue-600">HEMAT10</span>
                <span className="text-[9px] text-slate-400">Potongan 10%</span>
              </div>
              <div className="mt-2 bg-blue-50 text-blue-600 text-center text-[9px] font-bold py-1 rounded">
                Salin Kode ✓
              </div>
            </div>
            <div className="w-1/2 bg-white rounded-xl border border-dashed border-emerald-400 p-2.5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-emerald-600">ONGKIRFREE</span>
                <span className="text-[9px] text-slate-400">Gratis Ongkir</span>
              </div>
              <div className="mt-2 bg-emerald-50 text-emerald-600 text-center text-[9px] font-bold py-1 rounded">
                Salin Kode ✓
              </div>
            </div>
          </div>
        );

      case 'categories':
        if (variant === 'pill-badges') {
          return (
            <div className="h-32 rounded-2xl bg-white border border-slate-200 p-4 flex items-center justify-center gap-2 overflow-x-hidden">
              <span className="px-3 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold shadow-xs">Semua</span>
              <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">Ruang Makan</span>
              <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">Ruang Tamu</span>
              <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">Kamar Tidur</span>
            </div>
          );
        }
        if (variant === 'box-cards') {
          return (
            <div className="h-32 rounded-2xl bg-white border border-slate-200 p-3 flex items-center justify-center gap-2.5">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 w-1/3">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-[10px]">🪑</div>
                <div className="text-[10px] font-bold text-slate-800">Ruang Makan</div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 w-1/3">
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-[10px]">🛋️</div>
                <div className="text-[10px] font-bold text-slate-800">Ruang Tamu</div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 w-1/3">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-[10px]">🛏️</div>
                <div className="text-[10px] font-bold text-slate-800">Kamar Tidur</div>
              </div>
            </div>
          );
        }
        // Circle Avatar Default
        return (
          <div className="h-32 rounded-2xl bg-white border border-slate-200 p-3 flex items-center justify-center gap-4">
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full ring-2 ring-blue-600 bg-blue-50 flex items-center justify-center text-sm shadow-xs">🪑</div>
              <span className="text-[10px] font-bold text-slate-800">Ruang Makan</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full ring-2 ring-slate-200 bg-slate-100 flex items-center justify-center text-sm">🛋️</div>
              <span className="text-[10px] font-medium text-slate-600">Ruang Tamu</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full ring-2 ring-slate-200 bg-slate-100 flex items-center justify-center text-sm">🛏️</div>
              <span className="text-[10px] font-medium text-slate-600">Kamar Tidur</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full ring-2 ring-slate-200 bg-slate-100 flex items-center justify-center text-sm">💻</div>
              <span className="text-[10px] font-medium text-slate-600">Ruang Kerja</span>
            </div>
          </div>
        );

      case 'catalog':
        return (
          <div className="h-36 rounded-2xl bg-white border border-slate-200 p-3 grid grid-cols-5 gap-2 items-center">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="bg-slate-50 rounded-xl p-1.5 border border-slate-200 flex flex-col justify-between h-full">
                <div className="w-full h-12 rounded-lg bg-slate-200 flex items-center justify-center text-[9px] text-slate-400">Foto</div>
                <div className="space-y-0.5 mt-1">
                  <div className="h-2 bg-slate-300 rounded w-4/5" />
                  <div className="h-2 bg-blue-400 rounded w-3/5" />
                </div>
                <div className="w-full h-4 bg-blue-600 rounded text-[7px] text-white font-bold flex items-center justify-center mt-1">
                  + Beli
                </div>
              </div>
            ))}
          </div>
        );

      case 'testimonials':
        return (
          <div className="h-36 rounded-2xl bg-white border border-slate-200 p-3 grid grid-cols-2 gap-3 items-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex text-amber-400 text-xs">★★★★★</div>
              <p className="text-[9px] text-slate-600 italic">"Pengerjaan furnitur kayu jatinya sangat rapi dan kokoh!"</p>
              <div className="text-[9px] font-bold text-slate-900">- Bpk. Hendra W.</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex text-amber-400 text-xs">★★★★★</div>
              <p className="text-[9px] text-slate-600 italic">"Pengiriman aman sampai Bandung tanpa cacat sedikitpun."</p>
              <div className="text-[9px] font-bold text-slate-900">- Ibu Sarah M.</div>
            </div>
          </div>
        );

      default:
        return (
          <div className="h-32 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-1">
            <Sliders className="w-6 h-6 text-slate-400" />
            <span className="text-xs font-medium">Preview Visual: {VARIANT_LABELS[variant] || variant}</span>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Visual Section Builder Studio"
        description="Atur susunan urutan halaman di panel kiri dan kustomisasi konten, warna, foto & varian visual secara interaktif di panel kanan."
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Top Header Bar & Actions */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm text-slate-700">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">Studio Tata Letak Halaman</h3>
              <p className="text-xs text-slate-500">
                Total <strong>{sections.length} Section</strong> ({sections.filter((s) => s.is_visible).length} Aktif Ditampilkan)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {website && (
              <Link
                to={`/site/${website.subdomain}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <span>Live Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2 rounded-xl shadow-xs transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 flex items-center gap-2 text-sm font-medium animate-fade-in shadow-2xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* LOADING STATE */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-9 h-9 animate-spin text-blue-600" />
            <p className="text-sm font-medium">Memuat studio builder...</p>
          </div>
        ) : (
          /* ============================================================ */
          /* 2-COLUMN SPLIT STUDIO LAYOUT                                 */
          /* ============================================================ */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* ---------------------------------------------------------- */}
            {/* KOLOM KIRI (NAVIGATOR / SECTION ORDER LIST)                */}
            {/* ---------------------------------------------------------- */}
            <div className="lg:col-span-5 xl:col-span-5 space-y-4">
              
              {/* PINNED TOP: HEADER NAVIGATION BAR */}
              <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/50 rounded-2xl border border-blue-200/90 p-4 shadow-xs">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-2xs flex-shrink-0">
                      <PanelTop className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white px-1.5 py-0.5 rounded text-[9px]">
                        Tetap di Atas
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs mt-0.5">Bilah Navigasi Header</h4>
                    </div>
                  </div>

                  {/* Header Style Selector */}
                  <select
                    value={headerStyle}
                    onChange={(e) =>
                      handleHeaderStyleChange(
                        e.target.value as 'solid' | 'floating' | 'dynamic-scroll'
                      )
                    }
                    disabled={isSavingHeader}
                    className="text-xs font-bold text-blue-700 bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
                  >
                    <option value="dynamic-scroll">🌊 Dynamic Scroll</option>
                    <option value="floating">✨ Floating Island</option>
                    <option value="solid">🏛️ Solid Bar</option>
                  </select>
                </div>
              </div>

              {/* LIST HEADER & HELP TEXT */}
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Daftar Urutan Section
                </span>
                <span className="text-[11px] text-slate-400">
                  Klik untuk mengedit
                </span>
              </div>

              {/* COMPACT SECTION LIST */}
              <div className="space-y-2">
                {sections.map((section, index) => {
                  const meta = SECTION_LABELS[section.type] || {
                    name: section.type,
                    description: '',
                    variants: ['default'],
                  };
                  const IconComponent = SECTION_ICONS[section.type] || Layers;
                  const isSelected = selectedIndex === index;

                  return (
                    <div
                      key={section.id || index}
                      onClick={() => setSelectedIndex(index)}
                      className={`group cursor-pointer rounded-2xl border transition-all p-3.5 flex items-center justify-between gap-3 select-none ${
                        isSelected
                          ? 'bg-blue-50/90 border-blue-600 shadow-sm ring-2 ring-blue-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs'
                      } ${!section.is_visible ? 'opacity-60 bg-slate-50/40' : ''}`}
                    >
                      {/* Left: Reorder Arrows & Info */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Up/Down buttons */}
                        <div className="flex flex-col gap-0.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleMove(index, 'up')}
                            disabled={index === 0}
                            title="Pindah ke Atas"
                            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-white disabled:opacity-15 transition-colors"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMove(index, 'down')}
                            disabled={index === sections.length - 1}
                            title="Pindah ke Bawah"
                            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-white disabled:opacity-15 transition-colors"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Order Badge */}
                        <div
                          className={`w-6 h-6 rounded-md flex items-center justify-center font-mono font-bold text-[11px] flex-shrink-0 ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          #{index + 1}
                        </div>

                        {/* Icon */}
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>

                        {/* Name & Active Variant */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4
                              className={`text-xs font-bold truncate leading-tight ${
                                isSelected ? 'text-blue-900' : 'text-slate-800'
                              }`}
                            >
                              {meta.name}
                            </h4>
                            {section.bg_color && (
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-slate-300 flex-shrink-0"
                                style={{ backgroundColor: section.bg_color }}
                                title={`Warna kustom: ${section.bg_color}`}
                              />
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 truncate block mt-0.5">
                            {VARIANT_LABELS[section.variant] || section.variant}
                          </span>
                        </div>
                      </div>

                      {/* Right: Visibility Toggle & Selection Arrow */}
                      <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggleVisibility(index)}
                          title={section.is_visible ? 'Sembunyikan' : 'Tampilkan'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            section.is_visible
                              ? 'text-emerald-600 hover:bg-emerald-50'
                              : 'text-slate-400 hover:bg-slate-100'
                          }`}
                        >
                          {section.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>

                        <div className={`p-1 rounded-md ${isSelected ? 'text-blue-600' : 'text-slate-300'}`}>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ---------------------------------------------------------- */}
            {/* KOLOM KANAN (INSPECTOR PANEL & LIVE VISUAL PREVIEW)        */}
            {/* ---------------------------------------------------------- */}
            <div className="lg:col-span-7 xl:col-span-7 sticky top-4 space-y-6">
              {activeSection && activeMeta ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6 animate-fade-in">
                  
                  {/* INSPECTOR HEADER & RESET BUTTON */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
                        {React.createElement(SECTION_ICONS[activeSection.type] || Layers, {
                          className: 'w-5 h-5',
                        })}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                            Urutan #{selectedIndex + 1} • {activeSection.type}
                          </span>
                          {activeSection.is_visible ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Tampil
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                              Disembunyikan
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-black text-slate-900 mt-0.5">{activeMeta.name}</h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {/* RESET TO THEME DEFAULT BUTTON */}
                      <button
                        type="button"
                        onClick={() => handleResetSection(selectedIndex)}
                        title="Kembalikan semua pengaturan teks, varian, warna, dan foto section ini ke bawaan tema awal"
                        className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all flex items-center gap-1.5 shadow-2xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset ke Bawaan</span>
                      </button>

                      {/* TOGGLE VISIBILITY */}
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(selectedIndex)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 shadow-2xs ${
                          activeSection.is_visible
                            ? 'border-slate-200 text-slate-700 hover:bg-slate-50'
                            : 'border-blue-200 bg-blue-50 text-blue-700'
                        }`}
                      >
                        {activeSection.is_visible ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                            <span>Sembunyikan</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5 text-blue-600" />
                            <span>Tampilkan</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* ============================================================ */}
                  {/* HERO SPECIFIC CUSTOMIZATION: BACKGROUND IMAGE & COLOR        */}
                  {/* ============================================================ */}
                  {activeSection.type === 'hero' && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Palette className="w-4 h-4 text-blue-600" />
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                            Kustomisasi Latar Belakang Hero (Warna & Foto)
                          </h4>
                        </div>
                        {(activeSection.bg_color || activeSection.bg_image_url) && (
                          <button
                            type="button"
                            onClick={() => {
                              handleBgColorChange(selectedIndex, '');
                              handleBgImageChange(selectedIndex, '');
                            }}
                            className="text-[11px] font-semibold text-slate-400 hover:text-red-600 transition-colors"
                          >
                            Hapus Kustomisasi Background
                          </button>
                        )}
                      </div>

                      {/* 1. GANTI FOTO BACKGROUND */}
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold text-slate-700">
                          Foto Banner / Background Hero
                        </label>
                        <div className="flex items-center gap-3">
                          {activeSection.bg_image_url ? (
                            <div className="w-16 h-12 rounded-xl border border-slate-300 overflow-hidden relative group flex-shrink-0 shadow-2xs">
                              <img
                                src={activeSection.bg_image_url}
                                alt="Hero background"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-12 rounded-xl border border-dashed border-slate-300 bg-white flex items-center justify-center text-slate-400 text-[10px] flex-shrink-0">
                              Default
                            </div>
                          )}

                          <div className="flex-1 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setIsMediaModalOpen(true)}
                              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-600 text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5"
                            >
                              <Upload className="w-3.5 h-3.5 text-blue-600" />
                              <span>Pilih dari Media Library</span>
                            </button>

                            {activeSection.bg_image_url && (
                              <button
                                type="button"
                                onClick={() => handleBgImageChange(selectedIndex, '')}
                                className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-all flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Gunakan Default</span>
                              </button>
                            )}
                          </div>
                        </div>

                        <input
                          type="url"
                          value={activeSection.bg_image_url || ''}
                          onChange={(e) => handleBgImageChange(selectedIndex, e.target.value)}
                          placeholder="Atau tempel URL gambar langsung (https://...)"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-600"
                        />
                      </div>

                      {/* 2. PILIHAN WARNA DASAR SECTION (DENGAN SMART DISABLING) */}
                      <div className="space-y-2 pt-2 border-t border-slate-200/80">
                        <div className="flex items-center justify-between">
                          <label className="block text-[11px] font-bold text-slate-700">
                            Warna Dasar Section (Background Color)
                          </label>
                          <span className="text-[10px] text-slate-400">
                            Aktif pada varian Split & Card Rounded
                          </span>
                        </div>

                        {/* SMART DISABLING ALERT JIKA FULL COVER IMAGE AKTIF */}
                        {isFullCoverImageActive ? (
                          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2 animate-fade-in">
                            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold">Warna Dasar Ditimpa Foto Layar Penuh</span>
                              <p className="text-[11px] text-amber-700 mt-0.5">
                                Varian <strong>Latar Belakang Penuh (Full Cover)</strong> menampilkan foto membentang menutupi seluruh layar. Pilihan warna dasar dinonaktifkan secara otomatis.
                              </p>
                            </div>
                          </div>
                        ) : null}

                        {/* COLOR PRESETS PALETTE */}
                        <div
                          className={`space-y-2 transition-opacity ${
                            isFullCoverImageActive ? 'opacity-40 pointer-events-none' : 'opacity-100'
                          }`}
                        >
                          <div className="flex flex-wrap gap-2 items-center">
                            {COLOR_PRESETS.map((preset) => {
                              const isSelectedColor = (activeSection.bg_color || '') === preset.value;
                              return (
                                <button
                                  key={preset.name}
                                  type="button"
                                  onClick={() => handleBgColorChange(selectedIndex, preset.value)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border shadow-2xs ${
                                    isSelectedColor
                                      ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50 text-blue-900'
                                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                                  }`}
                                >
                                  <span
                                    className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${
                                      preset.border ? 'border border-slate-300' : ''
                                    }`}
                                    style={{
                                      backgroundColor: preset.value || '#ffffff',
                                      background: preset.value
                                        ? preset.value
                                        : 'linear-gradient(135deg, #f1f5f9 50%, #cbd5e1 50%)',
                                    }}
                                  />
                                  <span>{preset.name}</span>
                                  {isSelectedColor && <Check className="w-3 h-3 text-blue-600 stroke-[3]" />}
                                </button>
                              );
                            })}
                          </div>

                          {/* CUSTOM HEX COLOR PICKER */}
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-[11px] font-semibold text-slate-500">Custom Hex:</span>
                            <input
                              type="color"
                              value={activeSection.bg_color || '#ffffff'}
                              onChange={(e) => handleBgColorChange(selectedIndex, e.target.value)}
                              className="w-7 h-7 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-white"
                              title="Pilih warna custom"
                            />
                            <input
                              type="text"
                              value={activeSection.bg_color || ''}
                              onChange={(e) => handleBgColorChange(selectedIndex, e.target.value)}
                              placeholder="#0f172a atau kosongkan"
                              className="px-2.5 py-1 text-xs font-mono rounded-lg border border-slate-200 bg-white w-32 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                            />
                            {activeSection.bg_color && (
                              <button
                                type="button"
                                onClick={() => handleBgColorChange(selectedIndex, '')}
                                className="text-[11px] text-slate-400 hover:text-slate-600 font-semibold"
                              >
                                Reset Warna
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FORM KONTEN TEKS */}
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        Pengaturan Teks & Konten
                      </label>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Judul Bagian (Opsional)
                      </label>
                      <input
                        type="text"
                        value={activeSection.title}
                        onChange={(e) => handleTitleChange(selectedIndex, e.target.value)}
                        placeholder={`Masukkan judul untuk bagian ${activeMeta.name}...`}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Subjudul / Keterangan Deskripsi
                      </label>
                      <textarea
                        rows={2}
                        value={activeSection.subtitle}
                        onChange={(e) => handleSubtitleChange(selectedIndex, e.target.value)}
                        placeholder="Masukkan deskripsi penjelas bagian ini..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* PILIHAN VARIAN TAMPILAN INTERAKTIF */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        Pilih Varian Tampilan Visual
                      </label>
                      <span className="text-[11px] text-blue-600 font-medium">
                        {activeMeta.variants.length} Varian Tersedia
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeMeta.variants.map((v) => {
                        const isCurrentVariant = activeSection.variant === v;
                        return (
                          <div
                            key={v}
                            onClick={() => handleVariantChange(selectedIndex, v)}
                            className={`cursor-pointer rounded-2xl border-2 p-3.5 transition-all flex flex-col justify-between ${
                              isCurrentVariant
                                ? 'border-blue-600 bg-blue-50/40 ring-4 ring-blue-500/10 shadow-xs'
                                : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <h5 className="text-xs font-bold text-slate-900">
                                {VARIANT_LABELS[v] || v}
                              </h5>
                              {isCurrentVariant && (
                                <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              {VARIANT_DESCRIPTIONS[v] || 'Tata letak varian tampilan.'}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* LIVE VISUAL MOCKUP PREVIEW */}
                  <div className="pt-2 space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-600">
                        <Monitor className="w-3.5 h-3.5 text-blue-600" />
                        <span>Live Visual Mockup Preview</span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Real-time mockup dengan foto & warna kustom
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                      {renderVisualMockup(activeSection.type, activeSection.variant)}
                    </div>
                  </div>

                  {/* BOTTOM SAVE BUTTON */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Perubahan disimpan sementara sampai Anda menekan tombol simpan.
                    </span>
                    <button
                      type="button"
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
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Simpan Perubahan</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
                  <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm">Pilih salah satu section di kolom kiri untuk mulai mengedit.</p>
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* MEDIA PICKER MODAL */}
      <MediaPickerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={(url) => {
          handleBgImageChange(selectedIndex, url);
          setIsMediaModalOpen(false);
        }}
        title="Pilih Gambar Banner Hero"
        defaultType="hero"
      />
    </div>
  );
};
