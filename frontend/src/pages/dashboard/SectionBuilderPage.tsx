import React, { useState, useEffect } from 'react';
import { Header } from '../../components/dashboard/Header';
import { api } from '../../api/client';
import { SectionConfig, SectionType, Promotion } from '../../types';
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
  AlertCircle,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Clock,
  BadgePercent
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { resolveContrastTokens, isColorDark } from '../../utils/contrast';

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
  'full-banner': 'Countdown Flash Sale (Hitung Mundur Hari, Jam & Menit)',
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
  'full-banner': 'Banner promo eksklusif dengan hitung mundur hari, jam, menit, dan detik secara real-time.',
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

const DEFAULT_SECTION_VALUES: Record<SectionType, { title: string; subtitle: string; variant: string; text_align?: 'left' | 'center' | 'right' }> = {
  hero: {
    title: 'Koleksi Mebel Kayu Jati Terbaik',
    subtitle: 'Dikerjakan langsung oleh pengrajin ahli dari Jepara dengan kualitas ekspor.',
    variant: 'split',
    text_align: 'left',
  },
  promos: {
    title: 'Promo Spesial Diskon & Kupon Belanja',
    subtitle: 'Klaim voucher kupon diskon eksklusif untuk hemat lebih banyak hari ini!',
    variant: 'coupon-ticket',
    text_align: 'left',
  },
  categories: {
    title: 'Kategori Pilihan',
    subtitle: 'Pilih kategori untuk memfilter koleksi produk favorit Anda.',
    variant: 'circle-avatar',
    text_align: 'left',
  },
  catalog: {
    title: 'Katalog Produk Unggulan',
    subtitle: 'Pilihan produk berkualitas tinggi yang siap mempercantik ruangan Anda.',
    variant: 'standard-card',
    text_align: 'left',
  },
  about: {
    title: 'Tentang Usaha Kami',
    subtitle: 'Berpengalaman lebih dari 15 tahun melayani pesanan furnitur rumah tangga, cafe, dan kantor di seluruh Indonesia.',
    variant: 'split',
    text_align: 'left',
  },
  gallery: {
    title: 'Galeri Workshop & Pengiriman',
    subtitle: 'Dokumentasi proses produksi dan pengiriman pesanan pelanggan.',
    variant: 'grid',
    text_align: 'left',
  },
  projects: {
    title: 'Proyek & Portofolio',
    subtitle: 'Daftar proyek pengerjaan pesanan khusus atau klien bisnis.',
    variant: 'default',
    text_align: 'left',
  },
  testimonials: {
    title: 'Apa Kata Pelanggan Kami?',
    subtitle: 'Kepuasan pelanggan adalah prioritas utama setiap karya kami.',
    variant: 'grid-cards',
    text_align: 'left',
  },
  contact: {
    title: 'Hubungi Kami Langsung',
    subtitle: 'Konsultasikan kebutuhan perabot Anda langsung via WhatsApp.',
    variant: 'default',
    text_align: 'left',
  },
  footer: {
    title: '',
    subtitle: '',
    variant: 'multi-column',
    text_align: 'left',
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
  const [promotions, setPromotions] = useState<Promotion[]>([]);
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
      const [data, promosData] = await Promise.all([
        api.getSections(),
        api.getPromotions().catch(() => []),
      ]);
      setPromotions(Array.isArray(promosData) ? promosData : []);
      const sanitized = data.map((sec) => {
        if (
          (sec.type === 'hero' && (sec.variant === 'split' || sec.variant === 'card-rounded')) ||
          sec.type === 'catalog'
        ) {
          if (sec.text_align === 'center') {
            return { ...sec, text_align: 'left' as const };
          }
        }
        return sec;
      });
      setSections(sanitized);
      if (sanitized.length > 0) {
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
    // Jika ganti ke varian 2 kolom hero (split / card-rounded) atau catalog dan posisi sebelumnya center, ubah ke left
    if (
      (newSections[index].type === 'hero' && (variant === 'split' || variant === 'card-rounded')) ||
      newSections[index].type === 'catalog'
    ) {
      if (newSections[index].text_align === 'center') {
        newSections[index].text_align = 'left';
      }
    }
    if (newSections[index].type === 'promos' && variant === 'full-banner') {
      if (newSections[index].countdown_days === undefined) newSections[index].countdown_days = 2;
      if (newSections[index].countdown_hours === undefined) newSections[index].countdown_hours = 14;
      if (newSections[index].countdown_minutes === undefined) newSections[index].countdown_minutes = 37;
      if (!newSections[index].promo_badge) newSections[index].promo_badge = 'Limited Time Offer';
      if (!newSections[index].promo_button_text) newSections[index].promo_button_text = 'Shop The Sale';
      if (!newSections[index].promo_button_link) newSections[index].promo_button_link = '#katalog';
    }
    setSections(newSections);
  };

  const handlePromoFieldChange = (
    index: number,
    field: 'countdown_days' | 'countdown_hours' | 'countdown_minutes' | 'promo_badge' | 'promo_button_text' | 'promo_button_link',
    value: string | number
  ) => {
    const newSections = [...sections];
    newSections[index] = {
      ...newSections[index],
      [field]: value,
    };
    setSections(newSections);
  };

  const handleLinkPromotion = (index: number, promoId: string) => {
    const newSections = [...sections];
    if (promoId === 'manual' || !promoId) {
      newSections[index] = {
        ...newSections[index],
        promotion_id: undefined,
      };
      setSections(newSections);
      return;
    }

    const selectedPromo = promotions.find((p) => p.id === promoId);
    if (!selectedPromo) return;

    let targetVariant = newSections[index].variant;
    if (selectedPromo.type === 'countdown') {
      targetVariant = 'full-banner';
    } else if (selectedPromo.type === 'coupon') {
      targetVariant = 'coupon-ticket';
    } else if (selectedPromo.type === 'discount') {
      targetVariant = 'split-card';
    }

    newSections[index] = {
      ...newSections[index],
      promotion_id: selectedPromo.id,
      title: selectedPromo.title || newSections[index].title,
      subtitle: selectedPromo.subtitle || newSections[index].subtitle,
      variant: targetVariant,
      countdown_days: selectedPromo.countdown_days ?? newSections[index].countdown_days,
      countdown_hours: selectedPromo.countdown_hours ?? newSections[index].countdown_hours,
      countdown_minutes: selectedPromo.countdown_minutes ?? newSections[index].countdown_minutes,
      promo_badge: selectedPromo.badge || newSections[index].promo_badge,
      promo_button_text: selectedPromo.button_text || newSections[index].promo_button_text,
      promo_button_link: selectedPromo.button_link || newSections[index].promo_button_link,
    };
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

  const handleTextAlignChange = (index: number, align: 'left' | 'center' | 'right') => {
    const newSections = [...sections];
    newSections[index] = {
      ...newSections[index],
      text_align: align,
    };
    setSections(newSections);
  };

  const handleTextColorModeChange = (index: number, mode: 'auto' | 'light' | 'dark') => {
    const newSections = [...sections];
    newSections[index] = {
      ...newSections[index],
      text_color_mode: mode,
    };
    setSections(newSections);
  };

  const handleOverlayOpacityChange = (index: number, opacity: number) => {
    const newSections = [...sections];
    newSections[index] = {
      ...newSections[index],
      overlay_opacity: opacity,
    };
    setSections(newSections);
  };

  const handleResetSection = (index: number) => {
    const target = sections[index];
    if (!target) return;

    const defaults = DEFAULT_SECTION_VALUES[target.type] || {
      title: '',
      subtitle: '',
      variant: 'default',
      text_align: 'left',
    };

    const newSections = [...sections];
    newSections[index] = {
      ...newSections[index],
      title: defaults.title,
      subtitle: defaults.subtitle,
      variant: defaults.variant,
      bg_color: '',
      bg_image_url: '',
      text_align: defaults.text_align || 'left',
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

  // Check if hero 2-column layout is active (split or card-rounded)
  const isHeroTwoColumn =
    activeSection?.type === 'hero' &&
    (activeSection?.variant === 'split' || activeSection?.variant === 'card-rounded');

  // Check if catalog section is active (2-way layout: left / right only)
  const isCatalog = activeSection?.type === 'catalog';

  // Render Visual Mockup Preview in Inspector Panel
  const renderVisualMockup = (type: SectionType, variant: string) => {
    const customBg = activeSection?.bg_color || undefined;
    const hasBgImage = !!activeSection?.bg_image_url;
    const tokens = resolveContrastTokens(
      customBg,
      activeSection?.text_color_mode,
      hasBgImage
    );
    const isDark = tokens.isDark;
    const heroImg =
      activeSection?.bg_image_url ||
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80';

    switch (type) {
      case 'hero':
        if (variant === 'bg-full') {
          const align = activeSection?.text_align || 'center';
          const isLeft = align === 'left';
          const isRight = align === 'right';

          return (
            <div
              className={`h-48 rounded-2xl p-5 flex flex-col justify-center text-white relative overflow-hidden border border-slate-700 shadow-inner ${
                isLeft
                  ? 'items-start text-left'
                  : isRight
                  ? 'items-end text-right'
                  : 'items-center text-center'
              }`}
              style={{
                backgroundImage: isLeft
                  ? `linear-gradient(to right, rgba(0,0,0,0.85), rgba(0,0,0,0.3)), url("${heroImg}")`
                  : isRight
                  ? `linear-gradient(to left, rgba(0,0,0,0.85), rgba(0,0,0,0.3)), url("${heroImg}")`
                  : `linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.3)), url("${heroImg}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className={`relative z-10 space-y-1.5 max-w-sm flex flex-col ${
                isLeft ? 'items-start' : isRight ? 'items-end' : 'items-center'
              }`}>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/30">
                  Full Cover • {isLeft ? 'Rata Kiri' : isRight ? 'Rata Kanan' : 'Rata Tengah'}
                </span>
                <h5 className="text-base font-black tracking-tight">{activeSection?.title || 'Judul Utama Brand'}</h5>
                <p className="text-[10px] text-slate-200 line-clamp-1">{activeSection?.subtitle || 'Deskripsi singkat keunggulan produk'}</p>
                <div className={`pt-2 flex gap-2 ${isLeft ? 'justify-start' : isRight ? 'justify-end' : 'justify-center'}`}>
                  <div className="bg-blue-600 text-[9px] font-bold px-3 py-1 rounded-lg">Belanja Sekarang</div>
                  <div className="bg-white/20 text-[9px] font-bold px-3 py-1 rounded-lg">Kontak CS</div>
                </div>
              </div>
            </div>
          );
        }
        if (variant === 'card-rounded') {
          const isRight = activeSection?.text_align === 'right';
          return (
            <div
              className={`p-3.5 rounded-2xl border transition-colors ${
                isDark ? 'border-slate-700' : 'border-slate-200 bg-slate-50'
              }`}
              style={{ backgroundColor: customBg || (isDark ? undefined : '#f8fafc') }}
            >
              <div
                className={`h-40 rounded-xl p-4 flex items-center justify-between text-white relative overflow-hidden shadow-lg ${
                  isRight ? 'flex-row-reverse' : ''
                }`}
                style={{
                  backgroundImage: isRight
                    ? `linear-gradient(to left, rgba(15,23,42,0.85), rgba(30,27,75,0.7)), url("${heroImg}")`
                    : `linear-gradient(to right, rgba(15,23,42,0.85), rgba(30,27,75,0.7)), url("${heroImg}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className={`space-y-1.5 max-w-[60%] ${isRight ? 'text-right flex flex-col items-end' : ''}`}>
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-md">
                    Card Rounded {isRight ? '• Teks Kanan' : '• Teks Kiri'}
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
        const isRight = activeSection?.text_align === 'right';
        return (
          <div
            className={`h-44 rounded-2xl p-4 border grid grid-cols-2 gap-4 items-center shadow-xs transition-colors ${
              isDark ? 'border-slate-700' : 'border-slate-200 bg-white'
            }`}
            style={{ backgroundColor: customBg || (isDark ? undefined : '#ffffff') }}
          >
            <div className={`space-y-1.5 ${isRight ? 'order-2' : 'order-1'}`}>
              <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                Split 2 Kolom {isRight ? '• Teks Kanan' : '• Teks Kiri'}
              </span>
              <h5 className={`text-sm font-bold line-clamp-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {activeSection?.title || 'Koleksi Terbaik'}
              </h5>
              <p className={`text-[10px] line-clamp-1 ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                {activeSection?.subtitle || 'Dibuat dengan bahan kayu jati pilihan'}
              </p>
              <div className="pt-1 flex gap-1.5">
                <div className="bg-blue-600 text-white text-[9px] font-bold px-2.5 py-1 rounded-md">Katalog</div>
                <div className={`text-[9px] font-bold px-2.5 py-1 rounded-md ${isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'}`}>Chat CS</div>
              </div>
            </div>
            <div
              className={`h-32 rounded-xl flex items-center justify-center text-white text-xs font-medium border border-slate-200/50 relative overflow-hidden ${
                isRight ? 'order-1' : 'order-2'
              }`}
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

      case 'promos': {
        const linked = activeSection?.promotion_id
          ? promotions.find((p) => p.id === activeSection.promotion_id)
          : (promotions.find((p) => p.type === (variant === 'full-banner' ? 'countdown' : variant === 'coupon-ticket' ? 'coupon' : 'discount') && p.is_active) || promotions[0]);

        if (variant === 'full-banner') {
          const days = String(linked?.countdown_days ?? activeSection?.countdown_days ?? 2).padStart(2, '0');
          const hours = String(linked?.countdown_hours ?? activeSection?.countdown_hours ?? 14).padStart(2, '0');
          const mins = String(linked?.countdown_minutes ?? activeSection?.countdown_minutes ?? 37).padStart(2, '0');
          const badge = linked?.badge || activeSection?.promo_badge || 'Limited Time Offer';
          const btnText = linked?.button_text || activeSection?.promo_button_text || 'Shop The Sale';
          const pTitle = linked?.title || 'Super Sale Up To 50% Off!';
          const pSub = linked?.subtitle || 'On selected items. Shop now before the deal ends.';
          const promoBgImg = activeSection?.bg_image_url;
          const overlayOp = activeSection?.overlay_opacity ?? 70;

          return (
            <div
              className={`rounded-2xl border p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl transition-colors relative overflow-hidden ${
                promoBgImg ? 'text-white border-white/20' : (isDark ? 'text-white bg-[#141414] border-neutral-800' : 'text-slate-900 bg-white border-slate-200 shadow-sm')
              }`}
              style={{
                backgroundColor: promoBgImg ? undefined : (customBg || (isDark ? '#141414' : '#ffffff')),
                backgroundImage: promoBgImg ? `linear-gradient(rgba(0,0,0,${overlayOp / 100}), rgba(0,0,0,${overlayOp / 100})), url("${promoBgImg}")` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Subtle ambient glow */}
              {!promoBgImg && (
                <div className="absolute -left-10 -top-10 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
              )}

              {/* Left Content */}
              <div className="space-y-1 text-center md:text-left z-10">
                <span className="text-[10px] font-black tracking-widest uppercase text-orange-500 block">
                  {badge}
                </span>
                <h5 className={`text-sm sm:text-base font-black tracking-tight leading-tight ${promoBgImg || isDark ? 'text-white' : 'text-slate-900'}`}>
                  {pTitle}
                </h5>
                <p className={`text-[11px] line-clamp-1 max-w-sm ${promoBgImg || isDark ? 'text-neutral-300' : 'text-slate-500'}`}>
                  {pSub}
                </p>
              </div>

              {/* Countdown Timer Boxes */}
              <div className="flex items-center gap-1.5 sm:gap-2 text-center z-10">
                <div className={`${promoBgImg || isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-slate-100 border-slate-200'} border rounded-xl px-2.5 py-1.5 min-w-[46px] shadow-inner`}>
                  <span className={`text-sm sm:text-base font-black font-mono block ${promoBgImg || isDark ? 'text-white' : 'text-slate-900'}`}>{days}</span>
                  <span className={`text-[9px] font-semibold block uppercase ${promoBgImg || isDark ? 'text-neutral-400' : 'text-slate-500'}`}>Days</span>
                </div>
                <div className={`${promoBgImg || isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-slate-100 border-slate-200'} border rounded-xl px-2.5 py-1.5 min-w-[46px] shadow-inner`}>
                  <span className={`text-sm sm:text-base font-black font-mono block ${promoBgImg || isDark ? 'text-white' : 'text-slate-900'}`}>{hours}</span>
                  <span className={`text-[9px] font-semibold block uppercase ${promoBgImg || isDark ? 'text-neutral-400' : 'text-slate-500'}`}>Hours</span>
                </div>
                <div className={`${promoBgImg || isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-slate-100 border-slate-200'} border rounded-xl px-2.5 py-1.5 min-w-[46px] shadow-inner`}>
                  <span className={`text-sm sm:text-base font-black font-mono block ${promoBgImg || isDark ? 'text-white' : 'text-slate-900'}`}>{mins}</span>
                  <span className={`text-[9px] font-semibold block uppercase ${promoBgImg || isDark ? 'text-neutral-400' : 'text-slate-500'}`}>Mins</span>
                </div>
                <div className={`${promoBgImg || isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-slate-100 border-slate-200'} border rounded-xl px-2.5 py-1.5 min-w-[46px] shadow-inner`}>
                  <span className="text-sm sm:text-base font-black font-mono block text-orange-500">59</span>
                  <span className={`text-[9px] font-semibold block uppercase ${promoBgImg || isDark ? 'text-neutral-400' : 'text-slate-500'}`}>Secs</span>
                </div>
              </div>

              {/* Button */}
              <div className="z-10">
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs shadow-md transition-all whitespace-nowrap"
                >
                  {btnText}
                </button>
              </div>
            </div>
          );
        }
        if (variant === 'split-card') {
          const promoBgImg = activeSection?.bg_image_url;
          const overlayOp = activeSection?.overlay_opacity ?? 70;
          const pTitle = linked?.title || 'Diskon Pengguna Baru';
          const pSub = linked?.subtitle || 'Gunakan kode voucher saat checkout belanja.';
          const pDiscount = linked?.discount_percent ? `${linked.discount_percent}% OFF` : '30% OFF';
          const pCode = linked?.code || 'HEMAT10';

          return (
            <div
              className={`rounded-2xl border p-4 shadow-xs transition-colors flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden ${
                promoBgImg ? 'text-white border-white/20' : (isDark ? 'border-white/15 bg-white/10 text-white' : 'border-slate-200 bg-white text-slate-900')
              }`}
              style={{
                backgroundColor: promoBgImg ? undefined : (customBg && !isDark ? customBg : undefined),
                backgroundImage: promoBgImg ? `linear-gradient(rgba(0,0,0,${overlayOp / 100}), rgba(0,0,0,${overlayOp / 100})), url("${promoBgImg}")` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="space-y-1.5 max-w-sm z-10">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block ${
                  promoBgImg || isDark ? 'text-orange-300 bg-white/15 border border-white/20' : 'text-blue-600 bg-blue-50'
                }`}>
                  Promo Spesial
                </span>
                <h5 className={`text-xs font-bold ${promoBgImg || isDark ? 'text-white' : 'text-slate-900'}`}>{pTitle}</h5>
                <p className={`text-[10px] ${promoBgImg || isDark ? 'text-slate-200' : 'text-slate-500'}`}>{pSub}</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex flex-col items-center justify-center text-center px-4 py-2.5 min-w-[120px] shadow-md z-10 border border-white/15">
                <span className="text-base font-black leading-none">{pDiscount}</span>
                <span className="text-[9px] text-blue-200 font-mono mt-1">{pCode}</span>
              </div>
            </div>
          );
        }
      }
        // Coupon ticket default
        return (
          <div
            className={`rounded-2xl border p-3.5 flex items-center justify-center gap-3 transition-colors ${
              isDark ? 'border-white/15 bg-white/5' : 'border-slate-200 bg-slate-50'
            }`}
            style={{ backgroundColor: customBg }}
          >
            <div className="w-1/2 bg-white rounded-xl border border-dashed border-blue-400 p-2.5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-blue-600 font-mono">HEMAT10</span>
                <span className="text-[9px] text-slate-500 font-bold">10% OFF</span>
              </div>
              <div className="mt-2 bg-blue-50 text-blue-600 text-center text-[9px] font-bold py-1 rounded">
                Salin Kode ✓
              </div>
            </div>
            <div className="w-1/2 bg-white rounded-xl border border-dashed border-emerald-400 p-2.5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-emerald-600 font-mono">ONGKIRFREE</span>
                <span className="text-[9px] text-slate-500 font-bold">GRATIS ONGKIR</span>
              </div>
              <div className="mt-2 bg-emerald-50 text-emerald-600 text-center text-[9px] font-bold py-1 rounded">
                Salin Kode ✓
              </div>
            </div>
          </div>
        );

      case 'categories': {
        const align = activeSection?.text_align || 'left';
        const justifyClass = align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start';

        if (variant === 'pill-badges') {
          return (
            <div
              className={`h-28 rounded-2xl border p-3.5 flex flex-col justify-center gap-2 shadow-2xs transition-colors ${
                isDark ? 'border-slate-700' : 'border-slate-200 bg-white'
              }`}
              style={{ backgroundColor: customBg }}
            >
              <div className={`text-xs font-black flex ${justifyClass} items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <span>{activeSection?.title || 'Kategori'}</span>
                <span className={`${isDark ? 'text-slate-400' : 'text-slate-400'} font-normal hidden sm:inline`}>• Minimalist Pills</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-600 border border-blue-100 uppercase ml-1">{align}</span>
              </div>
              <div className="overflow-x-auto no-scrollbar pb-1 cursor-grab">
                <div className={`flex items-center gap-2 min-w-full w-max ${justifyClass}`}>
                  <span className="px-3 py-1.5 rounded-full bg-blue-600 text-white text-[11px] font-bold shadow-xs flex-shrink-0">Semua</span>
                  <span className={`px-3 py-1.5 rounded-full text-[11px] font-medium border flex-shrink-0 ${
                    isDark ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200/50'
                  }`}>Ruang Makan</span>
                  <span className={`px-3 py-1.5 rounded-full text-[11px] font-medium border flex-shrink-0 ${
                    isDark ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200/50'
                  }`}>Ruang Tamu</span>
                  <span className={`px-3 py-1.5 rounded-full text-[11px] font-medium border flex-shrink-0 ${
                    isDark ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200/50'
                  }`}>Kamar</span>
                  <span className={`px-3 py-1.5 rounded-full text-[11px] font-medium border flex-shrink-0 ${
                    isDark ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200/50'
                  }`}>Dapur</span>
                  <span className={`px-3 py-1.5 rounded-full text-[11px] font-medium border flex-shrink-0 ${
                    isDark ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200/50'
                  }`}>Kerja</span>
                </div>
              </div>
            </div>
          );
        }
        if (variant === 'box-cards') {
          return (
            <div
              className={`h-28 rounded-2xl border p-3.5 flex flex-col justify-center gap-2 shadow-2xs transition-colors ${
                isDark ? 'border-slate-700' : 'border-slate-200 bg-white'
              }`}
              style={{ backgroundColor: customBg }}
            >
              <div className={`text-xs font-black flex ${justifyClass} items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <span>{activeSection?.title || 'Kategori'}</span>
                <span className={`${isDark ? 'text-slate-400' : 'text-slate-400'} font-normal hidden sm:inline`}>• Compact Chips</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-600 border border-blue-100 uppercase ml-1">{align}</span>
              </div>
              <div className="overflow-x-auto no-scrollbar pb-1 cursor-grab">
                <div className={`flex items-center gap-2.5 min-w-full w-max ${justifyClass}`}>
                  <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border flex-shrink-0 ${
                    isDark ? 'bg-slate-800/80 border-slate-700 text-slate-100' : 'bg-blue-50 border-blue-200 text-slate-800'
                  }`}>
                    <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] flex-shrink-0">🪑</div>
                    <div className="text-[10px] font-bold truncate">Makan</div>
                  </div>
                  <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border flex-shrink-0 ${
                    isDark ? 'bg-slate-800/80 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}>
                    <div className="w-6 h-6 rounded-md bg-purple-100 text-purple-600 flex items-center justify-center text-[10px] flex-shrink-0">🛋️</div>
                    <div className="text-[10px] font-bold truncate">Tamu</div>
                  </div>
                  <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border flex-shrink-0 ${
                    isDark ? 'bg-slate-800/80 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}>
                    <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-600 flex items-center justify-center text-[10px] flex-shrink-0">🛏️</div>
                    <div className="text-[10px] font-bold truncate">Kamar</div>
                  </div>
                  <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border flex-shrink-0 ${
                    isDark ? 'bg-slate-800/80 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}>
                    <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] flex-shrink-0">💻</div>
                    <div className="text-[10px] font-bold truncate">Kerja</div>
                  </div>
                </div>
              </div>
            </div>
          );
        }
        // Circle Avatar Default
        return (
          <div
            className={`h-28 rounded-2xl border p-3.5 flex flex-col justify-center gap-2 shadow-2xs transition-colors ${
              isDark ? 'border-slate-700' : 'border-slate-200 bg-white'
            }`}
            style={{ backgroundColor: customBg }}
          >
            <div className={`text-xs font-black flex ${justifyClass} items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <span>{activeSection?.title || 'Kategori'}</span>
              <span className={`${isDark ? 'text-slate-400' : 'text-slate-400'} font-normal hidden sm:inline`}>• Minimal Stories</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-600 border border-blue-100 uppercase ml-1">{align}</span>
            </div>
            <div className="overflow-x-auto no-scrollbar pb-1 cursor-grab">
              <div className={`flex items-center gap-3.5 min-w-full w-max ${justifyClass}`}>
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="w-8 h-8 rounded-full ring-2 ring-blue-600 bg-blue-50 flex items-center justify-center text-xs shadow-xs">🪑</div>
                  <span className={`text-[9px] font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Makan</span>
                </div>
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
                  }`}>🛋️</div>
                  <span className={`text-[9px] font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Tamu</span>
                </div>
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
                  }`}>🛏️</div>
                  <span className={`text-[9px] font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Kamar</span>
                </div>
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
                  }`}>💻</div>
                  <span className={`text-[9px] font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Kerja</span>
                </div>
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
                  }`}>✨</div>
                  <span className={`text-[9px] font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Outdoor</span>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'catalog': {
        const dummyCatalog = [
          {
            id: 1,
            name: 'Sofa 2 Seater',
            category: 'Living',
            price: 'Rp 2.450.000',
            icon: '🛋️',
            gradient: 'from-emerald-50 to-teal-100/60',
          },
          {
            id: 2,
            name: 'Meja Makan Jati',
            category: 'Dining',
            price: 'Rp 3.800.000',
            icon: '🪵',
            gradient: 'from-amber-50 to-orange-100/60',
          },
          {
            id: 3,
            name: 'Kursi Kerja',
            category: 'Office',
            price: 'Rp 1.150.000',
            icon: '🪑',
            gradient: 'from-blue-50 to-indigo-100/60',
          },
          {
            id: 4,
            name: 'Lemari 3 Pintu',
            category: 'Bedroom',
            price: 'Rp 4.200.000',
            icon: '🚪',
            gradient: 'from-purple-50 to-pink-100/60',
          },
          {
            id: 5,
            name: 'Lampu Japandi',
            category: 'Decor',
            price: 'Rp 320.000',
            icon: '💡',
            gradient: 'from-yellow-50 to-amber-100/60',
          },
        ];

        const isRight = activeSection?.text_align === 'right';

        const renderCatalogMockupHeader = (variantTitle: string, badgeBg: string) => (
          <div className={`flex flex-col sm:flex-row sm:items-end justify-between mb-3.5 gap-2 border-b pb-2.5 ${
            isDark ? 'border-slate-700/60' : 'border-slate-100'
          } ${isRight ? 'sm:flex-row-reverse' : ''}`}>
            <div className={`space-y-0.5 ${isRight ? 'text-left sm:text-right flex flex-col sm:items-end' : 'text-left'}`}>
              <div className={`flex items-center gap-1.5 ${isRight ? 'justify-start sm:justify-end' : 'justify-start'}`}>
                <span className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeSection?.title || 'Katalog Produk'}</span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${badgeBg}`}>
                  {variantTitle}
                </span>
                <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-600 border border-blue-200 uppercase">
                  {isRight ? 'Rata Kanan' : 'Rata Kiri'}
                </span>
              </div>
              <p className={`text-[10px] font-medium line-clamp-1 ${isDark ? 'text-slate-300' : 'text-slate-400'}`}>{activeSection?.subtitle || 'Pilihan Produk'}</p>
            </div>

            {/* Tombol Lihat Semuanya Mockup */}
            <div className={`flex items-center ${isRight ? 'justify-start sm:justify-start' : 'justify-start sm:justify-end'}`}>
              <span className="px-2 py-0.5 rounded-md font-bold bg-blue-600 text-white text-[9px] shadow-2xs flex items-center gap-1">
                <span>Lihat Semuanya</span>
                <span>&rarr;</span>
              </span>
            </div>
          </div>
        );

        if (variant === 'minimal-frameless') {
          return (
            <div
              className={`rounded-2xl border p-3.5 shadow-2xs transition-colors ${
                isDark ? 'border-slate-700' : 'border-slate-200 bg-white'
              }`}
              style={{ backgroundColor: customBg }}
            >
              {renderCatalogMockupHeader('Minimalist Frameless (Tanpa Border Luar)', 'bg-purple-100 text-purple-800 border border-purple-300')}

              {/* Grid 5 Kolom: Frameless murni, Tanpa Border Luar, Tanpa Rating Bintang, Split Modern Button */}
              <div className="grid grid-cols-5 gap-2.5 items-start">
                {dummyCatalog.map((item) => (
                  <div key={item.id} className="p-0 bg-transparent border-0 shadow-none flex flex-col justify-between h-34 group">
                    <div>
                      {/* Smooth rounded image without outer border */}
                      <div className={`w-full h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center relative mb-1.5 shadow-2xs`}>
                        <span className="text-2xl select-none">{item.icon}</span>
                        <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded-full bg-slate-900/10 text-[7px] font-semibold text-slate-800">
                          {item.category}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <div className={`text-[10px] font-bold truncate group-hover:text-blue-600 transition-colors ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          {item.name}
                        </div>
                        <div className="text-[10px] font-black text-blue-600">
                          {item.price}
                        </div>
                      </div>
                    </div>
                    {/* Modern Split Action Buttons */}
                    <div className="flex gap-1 mt-2">
                      <div className={`flex-1 py-1 rounded-lg text-[8px] font-bold text-center ${
                        isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'
                      }`}>
                        + Keranjang
                      </div>
                      <div className="w-5 py-1 rounded-lg bg-blue-600 text-white text-[8px] font-bold flex items-center justify-center shadow-2xs">
                        🛍️
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        if (variant === 'overlay-badge') {
          return (
            <div
              className={`rounded-2xl border p-3.5 shadow-2xs transition-colors ${
                isDark ? 'border-slate-700' : 'border-slate-200 bg-white'
              }`}
              style={{ backgroundColor: customBg }}
            >
              {renderCatalogMockupHeader('Floating Overlay (Tombol Keranjang Melayang)', 'bg-blue-100 text-blue-800 border border-blue-300')}

              {/* Grid 5 Kolom: Full Bleed Photo + Tombol Keranjang Bulat Melayang di Sudut Foto + Link Teks Samping Harga */}
              <div className="grid grid-cols-5 gap-2.5 items-start">
                {dummyCatalog.map((item) => (
                  <div key={item.id} className={`rounded-xl border overflow-hidden shadow-2xs flex flex-col justify-between h-34 ${
                    isDark ? 'border-slate-700 bg-slate-800/90' : 'border-slate-200 bg-white'
                  }`}>
                    {/* Full-bleed photo to top/side edges */}
                    <div className={`w-full h-18 bg-gradient-to-br ${item.gradient} relative overflow-hidden flex items-center justify-center`}>
                      <span className="text-2xl select-none">{item.icon}</span>
                      <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded bg-slate-900/80 text-white text-[7px] font-bold">
                        {item.category}
                      </span>
                      {/* Floating Round Action Button in top-right corner */}
                      <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-md absolute top-1 right-1 ring-1 ring-white">
                        +
                      </div>
                    </div>
                    {/* Compact bottom content without bottom buttons */}
                    <div className="p-1.5 space-y-0.5">
                      <div className={`text-[10px] font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {item.name}
                      </div>
                      <div className="flex items-center justify-between pt-0.5">
                        <span className="text-[10px] font-black text-blue-600">
                          {item.price}
                        </span>
                        <span className="text-[7.5px] font-bold text-blue-500 underline cursor-pointer">
                          +Keranjang
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        // Default: 'standard-card'
        return (
          <div
            className={`rounded-2xl border p-3.5 shadow-2xs transition-colors ${
              isDark ? 'border-slate-700' : 'border-slate-200 bg-white'
            }`}
            style={{ backgroundColor: customBg }}
          >
            {renderCatalogMockupHeader('Standard Card (Border Lengkap & Bintang)', 'bg-amber-100 text-amber-800 border border-amber-300')}

            {/* Grid 5 Kolom: Kartu Kotak Berbingkai + Bintang Emas + 2 Tombol Bawah */}
            <div className="grid grid-cols-5 gap-2.5 items-start">
              {dummyCatalog.map((item) => (
                <div key={item.id} className={`rounded-xl border shadow-2xs p-1.5 flex flex-col justify-between h-34 ${
                  isDark ? 'border-slate-700 bg-slate-800/90' : 'border-slate-200/90 bg-white'
                }`}>
                  <div>
                    <div className={`w-full h-13 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center relative border border-slate-100 mb-1`}>
                      <span className="text-xl select-none">{item.icon}</span>
                      <span className="absolute top-0.5 left-0.5 px-1 py-0.2 rounded bg-white/90 text-[6.5px] font-bold text-slate-700 shadow-2xs">
                        {item.category}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <div className={`text-[10px] font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {item.name}
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-400 text-[8px] leading-none">
                        ★★★★★
                      </div>
                      <div className="text-[10px] font-black text-blue-600">
                        {item.price}
                      </div>
                    </div>
                  </div>
                  {/* Bottom Dual Action Buttons */}
                  <div className="grid grid-cols-2 gap-1 mt-1.5">
                    <div className={`py-0.5 rounded text-[7.5px] font-bold text-center truncate ${
                      isDark ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-700'
                    }`}>
                      + Keranjang
                    </div>
                    <div className="py-0.5 bg-blue-600 text-white rounded text-[7.5px] font-bold text-center truncate shadow-2xs">
                      Beli
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'testimonials':
        if (variant === 'slider-carousel') {
          return (
            <div
              className={`rounded-2xl border p-4 text-center shadow-2xs space-y-2 transition-colors ${
                isDark ? 'border-slate-700' : 'border-slate-200 bg-white'
              }`}
              style={{ backgroundColor: customBg }}
            >
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">
                Slider Carousel
              </span>
              <p className={`text-xs font-medium italic max-w-sm mx-auto ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                "Pengerjaan furnitur kayu jatinya sangat rapi, kokoh, dan hasil finishingnya mewah banget!"
              </p>
              <div className="flex items-center justify-center gap-2 pt-1">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold flex items-center justify-center">H</div>
                <div className="text-left">
                  <div className={`text-[10px] font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Bpk. Hendra W.</div>
                  <div className={`text-[8px] ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Jakarta Selatan</div>
                </div>
                <div className="text-amber-400 text-[10px] ml-2">★★★★★</div>
              </div>
              <div className="flex items-center justify-center gap-1.5 pt-1">
                <span className="w-4 h-1 rounded-full bg-blue-600" />
                <span className="w-1.5 h-1 rounded-full bg-slate-300" />
                <span className="w-1.5 h-1 rounded-full bg-slate-300" />
              </div>
            </div>
          );
        }
        if (variant === 'speech-bubble') {
          return (
            <div
              className={`rounded-2xl border p-3.5 shadow-2xs space-y-2 transition-colors ${
                isDark ? 'border-slate-700' : 'border-slate-200 bg-white'
              }`}
              style={{ backgroundColor: customBg }}
            >
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-600 border border-purple-100 inline-block">
                Speech Bubble
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[9px] italic text-slate-700 relative">
                    "Furnitur sampai dengan selamat tanpa lecet sedikitpun!"
                    <div className="absolute -bottom-1 left-4 w-2 h-2 bg-slate-50 border-b border-r border-slate-200 rotate-45" />
                  </div>
                  <div className="flex items-center gap-2 pl-2 pt-0.5">
                    <div className="w-5 h-5 rounded-full bg-slate-200 text-[9px] font-bold flex items-center justify-center">S</div>
                    <div className={`text-[9px] font-bold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>Ibu Sarah</div>
                    <div className="text-amber-400 text-[8px] ml-auto">★★★★★</div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[9px] italic text-slate-700 relative">
                    "Kualitas kayu jatinya istimewa, sangat recomended!"
                    <div className="absolute -bottom-1 left-4 w-2 h-2 bg-slate-50 border-b border-r border-slate-200 rotate-45" />
                  </div>
                  <div className="flex items-center gap-2 pl-2 pt-0.5">
                    <div className="w-5 h-5 rounded-full bg-slate-200 text-[9px] font-bold flex items-center justify-center">D</div>
                    <div className={`text-[9px] font-bold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>Bpk. Doni</div>
                    <div className="text-amber-400 text-[8px] ml-auto">★★★★★</div>
                  </div>
                </div>
              </div>
            </div>
          );
        }
        // Default: 'grid-cards'
        return (
          <div
            className={`rounded-2xl border p-3.5 shadow-2xs space-y-2 transition-colors ${
              isDark ? 'border-slate-700' : 'border-slate-200 bg-white'
            }`}
            style={{ backgroundColor: customBg }}
          >
            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 inline-block">
              Grid Cards
            </span>
            <div className="grid grid-cols-2 gap-3 items-center">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-900">Bpk. Hendra W.</span>
                  <span className="flex text-amber-400 text-[9px]">★★★★★</span>
                </div>
                <p className="text-[9px] text-slate-600 italic">"Pengerjaan kayu jatinya sangat rapi dan kokoh!"</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-900">Ibu Sarah M.</span>
                  <span className="flex text-amber-400 text-[9px]">★★★★★</span>
                </div>
                <p className="text-[9px] text-slate-600 italic">"Pengiriman aman sampai Bandung tanpa cacat."</p>
              </div>
            </div>
          </div>
        );

      case 'about':
        if (variant === 'centered-card') {
          return (
            <div
              className={`rounded-2xl border p-4 text-center shadow-2xs space-y-2 transition-colors ${
                isDark ? 'border-slate-700' : 'border-slate-200 bg-white'
              }`}
              style={{ backgroundColor: customBg }}
            >
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">
                Centered Card
              </span>
              <h5 className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeSection?.title || 'Tentang Usaha Kami'}</h5>
              <p className={`text-[9px] max-w-sm mx-auto line-clamp-2 ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                {activeSection?.subtitle || 'Melayani pemesanan furnitur berkualitas tinggi langsung dari pengrajin Jepara.'}
              </p>
              <div className="grid grid-cols-2 gap-2 text-[9px] max-w-xs mx-auto pt-1">
                <div className={`p-1.5 rounded-lg border text-left font-medium ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>📍 Workshop Jepara</div>
                <div className={`p-1.5 rounded-lg border text-left font-medium ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>🕒 08:00 - 17:00 WIB</div>
              </div>
            </div>
          );
        }
        if (variant === 'minimal-accent') {
          return (
            <div
              className={`rounded-2xl border p-4 shadow-2xs transition-colors ${
                isDark ? 'border-slate-700' : 'border-slate-200 bg-white'
              }`}
              style={{ backgroundColor: customBg }}
            >
              <div className="border-l-3 border-blue-600 pl-3 space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600">Minimal Accent</span>
                <h5 className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeSection?.title || 'Tentang Kami'}</h5>
                <p className={`text-[9px] line-clamp-2 ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                  {activeSection?.subtitle || 'Dedikasi tinggi menghasilkan furnitur terbaik dengan kayu pilihan.'}
                </p>
              </div>
            </div>
          );
        }
        // Default: 'split'
        return (
          <div
            className={`rounded-2xl border p-3.5 shadow-2xs grid grid-cols-2 gap-3 items-center transition-colors ${
              isDark ? 'border-slate-700' : 'border-slate-200 bg-white'
            }`}
            style={{ backgroundColor: customBg }}
          >
            <div className="space-y-1">
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">Split 2 Kolom</span>
              <h5 className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeSection?.title || 'Mengenal Lebih Dekat'}</h5>
              <p className={`text-[9px] line-clamp-2 ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                {activeSection?.subtitle || 'Pengrajin berpengalaman belasan tahun menghasilkan furnitur berkelas.'}
              </p>
            </div>
            <div className="space-y-1.5">
              <div className={`p-2 rounded-xl border text-[9px] ${
                isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>📍 Alamat Workshop</div>
              <div className={`p-2 rounded-xl border text-[9px] ${
                isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>🕒 Jam Operasional</div>
            </div>
          </div>
        );

      case 'gallery':
        return (
          <div
            className={`rounded-2xl border p-3.5 shadow-2xs space-y-2 transition-colors ${
              isDark ? 'border-slate-700' : 'border-slate-200 bg-white'
            }`}
            style={{ backgroundColor: customBg }}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeSection?.title || 'Galeri Foto Produk'}</span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-pink-50 text-pink-600 border border-pink-100">
                Showcase Grid
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="h-16 rounded-xl bg-slate-100 flex items-center justify-center text-lg border border-slate-200/50">🖼️</div>
              <div className="h-16 rounded-xl bg-slate-100 flex items-center justify-center text-lg border border-slate-200/50">📸</div>
              <div className="h-16 rounded-xl bg-slate-100 flex items-center justify-center text-lg border border-slate-200/50">🛋️</div>
              <div className="h-16 rounded-xl bg-slate-100 flex items-center justify-center text-lg border border-slate-200/50">🪵</div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div
            className={`rounded-2xl border p-3.5 shadow-2xs space-y-2 transition-colors ${
              isDark ? 'border-slate-700' : 'border-slate-200 bg-white'
            }`}
            style={{ backgroundColor: customBg }}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeSection?.title || 'Hubungi Kami'}</span>
                <p className={`text-[10px] ${isDark ? 'text-slate-300' : 'text-slate-400'}`}>{activeSection?.subtitle || 'Layanan konsultasi & pemesanan cepat'}</p>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100">
                Direct Contact
              </span>
            </div>
            <div className="flex gap-2 pt-1">
              <div className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[9px] font-bold shadow-2xs">WhatsApp</div>
              <div className={`px-3 py-1 rounded-lg text-[9px] font-bold border ${
                isDark ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>Email CS</div>
            </div>
          </div>
        );

      case 'footer':
        return (
          <div
            className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-white shadow-2xs space-y-2 transition-colors"
            style={{ backgroundColor: customBg }}
          >
            <div className="flex items-center justify-between text-xs font-bold">
              <span>{activeSection?.title || 'Nama Bisnis'}</span>
              <span className="text-[9px] text-slate-400">© 2026 Hak Cipta Dilindungi</span>
            </div>
            <p className="text-[9px] text-slate-400">{activeSection?.subtitle || 'Katalog Usaha Resmi & Terpercaya'}</p>
          </div>
        );

      default:
        return (
          <div
            className={`h-32 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-colors ${
              isDark ? 'border-slate-700 text-slate-200' : 'border-slate-200 bg-slate-100 text-slate-400'
            }`}
            style={{ backgroundColor: customBg }}
          >
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
                    <option value="floating">✨ Floating Island (Liquid Glass)</option>
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
                  {/* SECTION BACKGROUND CUSTOMIZATION: COLOR, PHOTO & CONTRAST */}
                  {/* ============================================================ */}
                  {activeSection && (() => {
                    const isPromo = activeSection.type === 'promos';
                    const isCouponVariant = isPromo && activeSection.variant === 'coupon-ticket';
                    const supportsBgImage = activeSection.type === 'hero' || (isPromo && !isCouponVariant);
                    const hasBgImage = !!activeSection.bg_image_url;
                    const textColorMode = activeSection.text_color_mode || 'auto';

                    return (
                      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Palette className="w-4 h-4 text-blue-600" />
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                              {supportsBgImage
                                ? `Kustomisasi Latar Belakang (${activeMeta?.name || activeSection.type}) - Warna & Foto`
                                : `Warna Dasar Section (${activeMeta?.name || activeSection.type})`}
                            </h4>
                          </div>
                          {(activeSection.bg_color || activeSection.bg_image_url || activeSection.text_color_mode) && (
                            <button
                              type="button"
                              onClick={() => {
                                handleBgColorChange(selectedIndex, '');
                                handleBgImageChange(selectedIndex, '');
                                handleTextColorModeChange(selectedIndex, 'auto');
                                handleOverlayOpacityChange(selectedIndex, 70);
                              }}
                              className="text-[11px] font-semibold text-slate-400 hover:text-red-600 transition-colors"
                            >
                              Reset Latar & Kontras
                            </button>
                          )}
                        </div>

                        {/* CATATAN KHUSUS KUPON TIKET: TIDAK MENGGUNAKAN GAMBAR LATAR */}
                        {isCouponVariant && (
                          <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                            <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <span className="leading-relaxed">
                              <strong>Varian Kupon Tiket</strong> menggunakan desain lembaran voucher fisik berlubang perforasi/gerigi. Gunakan pilihan <strong>Warna Dasar</strong> di bawah ini (tanpa foto) agar voucher tetap rapi, estetik, dan kode kupon mudah dibaca pembeli.
                            </span>
                          </div>
                        )}

                        {/* 1. GANTI FOTO BACKGROUND (UNTUK HERO & PROMOS KECUALI KUPON TIKET) */}
                        {supportsBgImage && (
                          <div className="space-y-2 pb-3 border-b border-slate-200/80">
                            <div className="flex items-center justify-between">
                              <label className="block text-[11px] font-bold text-slate-700">
                                Foto Banner / Background Latar
                              </label>
                              <span className="text-[10px] text-slate-400">
                                {activeSection.type === 'promos'
                                  ? 'Menampilkan banner promo mewah bernuansa sinematik'
                                  : 'Aktif pada Full Cover & Split Hero'}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              {activeSection.bg_image_url ? (
                                <div className="w-16 h-12 rounded-xl border border-slate-300 overflow-hidden relative group flex-shrink-0 shadow-2xs">
                                  <img
                                    src={activeSection.bg_image_url}
                                    alt="Section background"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-16 h-12 rounded-xl border border-dashed border-slate-300 bg-white flex items-center justify-center text-slate-400 text-[10px] flex-shrink-0">
                                  Tanpa Foto
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
                                    <span>Hapus Foto</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            <input
                              type="url"
                              value={activeSection.bg_image_url || ''}
                              onChange={(e) => handleBgImageChange(selectedIndex, e.target.value)}
                              placeholder="Atau tempel URL gambar banner (https://...)"
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-600"
                            />

                            {/* SMART OVERLAY OPACITY SLIDER/PRESET JIKA FOTO BANNER AKTIF */}
                            {hasBgImage && (
                              <div className="pt-2 flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                                <div>
                                  <span className="font-bold text-slate-700 block">Tingkat Gelap Overlay Foto</span>
                                  <span className="text-[10px] text-slate-400">Menjaga teks tetap tajam di atas gambar</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {[40, 60, 75, 90].map((op) => {
                                    const currentOp = activeSection.overlay_opacity ?? 70;
                                    const isSelected = currentOp === op;
                                    return (
                                      <button
                                        key={op}
                                        type="button"
                                        onClick={() => handleOverlayOpacityChange(selectedIndex, op)}
                                        className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                          isSelected
                                            ? 'bg-blue-600 text-white shadow-2xs'
                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                        }`}
                                      >
                                        {op}%
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 2. PILIHAN WARNA DASAR SECTION (UNTUK SEMUA SECTION) */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="block text-[11px] font-bold text-slate-700">
                              Warna Dasar Section (Background Color)
                            </label>
                            <span className="text-[10px] text-slate-400">
                              Pilih tema warna atau custom hex
                            </span>
                          </div>

                          {/* SMART DISABLING ALERT JIKA FULL COVER IMAGE AKTIF (HANYA HERO BG-FULL) */}
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

                        {/* 3. MODE KONTRAS TEKS CERDAS (SMART ADAPTIVE CONTRAST) */}
                        <div className="pt-3 border-t border-slate-200/80 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="block text-[11px] font-bold text-slate-700">
                              Mode Kontras Teks (WCAG 2.1)
                            </label>
                            <span className="text-[10px] text-slate-400">
                              Menjamin keterbacaan teks 100%
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={() => handleTextColorModeChange(selectedIndex, 'auto')}
                              className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border shadow-2xs ${
                                textColorMode === 'auto'
                                  ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20'
                                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                              }`}
                            >
                              <span>✦ Otomatis</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTextColorModeChange(selectedIndex, 'dark')}
                              className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border shadow-2xs ${
                                textColorMode === 'dark'
                                  ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20'
                                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                              }`}
                              title="Teks hitam/gelap untuk latar belakang putih atau terang"
                            >
                              <span>☀️ Teks Gelap</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTextColorModeChange(selectedIndex, 'light')}
                              className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border shadow-2xs ${
                                textColorMode === 'light'
                                  ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20'
                                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                              }`}
                              title="Teks putih terang untuk latar belakang gelap atau pekat"
                            >
                              <span>🌙 Teks Terang</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* FORM KONTEN TEKS (DISEMBUNYIKAN UNTUK PROMO KARENA KONTEN TERPUSAT DARI MENU PROMOSI) */}
                  {activeSection.type !== 'promos' && (
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                          Pengaturan Teks & Konten
                        </label>
                      </div>

                      {/* PERATAAN TEKS (ALIGNMENT: KIRI, TENGAH, KANAN) */}
                      <div>
                        {isHeroTwoColumn ? (
                          <>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="block text-[11px] font-semibold text-slate-500">
                                Tata Letak Kolom (Posisi Tulisan & Foto)
                              </label>
                              <span className="text-[10px] font-bold text-blue-600">
                                {activeSection.text_align === 'right'
                                  ? 'Rata Kanan (Tulisan Kanan, Foto Kiri)'
                                  : 'Rata Kiri (Tulisan Kiri, Foto Kanan)'}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
                              <button
                                type="button"
                                onClick={() => handleTextAlignChange(selectedIndex, 'left')}
                                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                                  (activeSection.text_align || 'left') !== 'right'
                                    ? 'bg-white text-blue-600 shadow-2xs border border-slate-200/80'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                }`}
                              >
                                <AlignLeft className="w-3.5 h-3.5" />
                                <span>Rata Kiri (Teks di Kiri)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleTextAlignChange(selectedIndex, 'right')}
                                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                                  activeSection.text_align === 'right'
                                    ? 'bg-white text-blue-600 shadow-2xs border border-slate-200/80'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                }`}
                              >
                                <AlignRight className="w-3.5 h-3.5" />
                                <span>Rata Kanan (Teks di Kanan)</span>
                              </button>
                            </div>
                            <p className="text-[11px] text-blue-800 mt-1.5 flex items-center gap-1.5 bg-blue-50/70 border border-blue-100 px-2.5 py-1.5 rounded-lg">
                              <Info className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                              <span>
                                Khusus tata letak 2 kolom: <strong>Rata Kanan</strong> menempatkan tulisan di kolom kanan dan foto/banner di kolom kiri.
                              </span>
                            </p>
                          </>
                        ) : isCatalog ? (
                          <>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="block text-[11px] font-semibold text-slate-500">
                                Tata Letak Judul & Filter Kategori
                              </label>
                              <span className="text-[10px] font-bold text-blue-600">
                                {activeSection.text_align === 'right'
                                  ? 'Rata Kanan (Judul Kanan, Filter Kiri)'
                                  : 'Rata Kiri (Judul Kiri, Filter Kanan)'}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
                              <button
                                type="button"
                                onClick={() => handleTextAlignChange(selectedIndex, 'left')}
                                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                                  (activeSection.text_align || 'left') !== 'right'
                                    ? 'bg-white text-blue-600 shadow-2xs border border-slate-200/80'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                }`}
                              >
                                <AlignLeft className="w-3.5 h-3.5" />
                                <span>Rata Kiri (Judul Kiri, Filter Kanan)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleTextAlignChange(selectedIndex, 'right')}
                                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                                  activeSection.text_align === 'right'
                                    ? 'bg-white text-blue-600 shadow-2xs border border-slate-200/80'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                }`}
                              >
                                <AlignRight className="w-3.5 h-3.5" />
                                <span>Rata Kanan (Judul Kanan, Filter Kiri)</span>
                              </button>
                            </div>
                            <p className="text-[11px] text-blue-800 mt-1.5 flex items-center gap-1.5 bg-blue-50/70 border border-blue-100 px-2.5 py-1.5 rounded-lg">
                              <Info className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                              <span>
                                Khusus section produk: <strong>Rata Kanan</strong> menempatkan judul & subjudul di kanan, dan tombol filter kategori di kiri.
                              </span>
                            </p>
                          </>
                        ) : (
                          <>
                            {(() => {
                              const currentAlign =
                                activeSection.text_align ||
                                (activeSection.type === 'hero' && activeSection.variant === 'bg-full' ? 'center' : 'left');
                              return (
                                <>
                                  <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-[11px] font-semibold text-slate-500">
                                      Posisi / Perataan Judul & Subjudul
                                    </label>
                                    <span className="text-[10px] font-bold text-blue-600">
                                      {currentAlign === 'center'
                                        ? 'Rata Tengah (Center)'
                                        : currentAlign === 'right'
                                        ? 'Rata Kanan (Right)'
                                        : 'Rata Kiri (Left)'}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
                                    <button
                                      type="button"
                                      onClick={() => handleTextAlignChange(selectedIndex, 'left')}
                                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                                        currentAlign === 'left'
                                          ? 'bg-white text-blue-600 shadow-2xs border border-slate-200/80'
                                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                      }`}
                                    >
                                      <AlignLeft className="w-3.5 h-3.5" />
                                      <span>Rata Kiri</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleTextAlignChange(selectedIndex, 'center')}
                                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                                        currentAlign === 'center'
                                          ? 'bg-white text-blue-600 shadow-2xs border border-slate-200/80'
                                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                      }`}
                                    >
                                      <AlignCenter className="w-3.5 h-3.5" />
                                      <span>Rata Tengah</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleTextAlignChange(selectedIndex, 'right')}
                                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                                        currentAlign === 'right'
                                          ? 'bg-white text-blue-600 shadow-2xs border border-slate-200/80'
                                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                      }`}
                                    >
                                      <AlignRight className="w-3.5 h-3.5" />
                                      <span>Rata Kanan</span>
                                    </button>
                                  </div>
                                </>
                              );
                            })()}
                          </>
                        )}
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
                  )}

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

                  {/* PENGATURAN HUBUNGKAN DENGAN KAMPANYE PROMO */}
                  {activeSection.type === 'promos' && (
                    <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-white p-4 sm:p-5 shadow-xs space-y-3.5">
                      <div className="flex items-center justify-between pb-2.5 border-b border-blue-200/80">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                            <BadgePercent className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                              Sumber Data & Konten Promo (Terpusat)
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              Judul promo, deskripsi, diskon, dan kode kupon otomatis disinkronkan dari Menu Promosi.
                            </p>
                          </div>
                        </div>
                        <Link
                          to="/dashboard/promos"
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-lg border border-blue-200 shadow-2xs hover:bg-blue-50 transition-colors"
                        >
                          <span>Buka Menu Promo</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Pilih Campaign Promo yang Ditampilkan:
                        </label>
                        <select
                          value={activeSection.promotion_id || 'manual'}
                          onChange={(e) => handleLinkPromotion(selectedIndex, e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                        >
                          <option value="manual">Pilih Otomatis (Promo Aktif Pertama)</option>
                          {promotions.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.title} ({p.type === 'countdown' ? 'Flash Sale' : p.type === 'coupon' ? 'Kupon' : 'Diskon'}) - {p.is_active ? '🟢 Aktif' : '⚪ Nonaktif'}
                            </option>
                          ))}
                        </select>
                      </div>

                      {(() => {
                        const linked = activeSection.promotion_id && activeSection.promotion_id !== 'manual'
                          ? promotions.find(p => p.id === activeSection.promotion_id)
                          : promotions.find(p => p.is_active) || promotions[0];
                        if (!linked) return null;
                        return (
                          <div className="p-3 bg-white rounded-xl border border-blue-100/90 shadow-2xs space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                                {linked.type === 'countdown' ? 'Flash Sale Countdown' : linked.type === 'coupon' ? 'Kupon Voucher' : 'Diskon Spesial'}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                ID: {linked.id}
                              </span>
                            </div>
                            <div>
                              <strong className="block text-slate-900 font-bold text-xs">{linked.title}</strong>
                              <p className="text-slate-500 text-[11px] leading-relaxed mt-0.5">{linked.subtitle}</p>
                            </div>
                            <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                              <span className="text-emerald-700 font-medium flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Tersinkronisasi otomatis dengan website publik
                              </span>
                              <Link
                                to="/dashboard/promos"
                                className="font-bold text-orange-600 hover:text-orange-700 underline"
                              >
                                Edit di Menu Promo →
                              </Link>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* PENGATURAN KHUSUS HITUNG MUNDUR PROMO (COUNTDOWN TIMER) */}
                  {activeSection.type === 'promos' && activeSection.variant === 'full-banner' && (
                    <div className="rounded-2xl border border-amber-300/80 bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-white p-4 sm:p-5 shadow-xs space-y-4">
                      <div className="flex items-center justify-between pb-2.5 border-b border-amber-200">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                              Pengaturan Waktu Hitung Mundur (Hari, Jam & Menit)
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              {activeSection.promotion_id && activeSection.promotion_id !== 'manual'
                                ? 'Durasi hitung mundur disinkronkan langsung dari kampanye promo terpilih.'
                                : 'Tentukan durasi promo diskon yang berjalan mundur secara real-time di storefront.'}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 border border-orange-200">
                          Countdown Live
                        </span>
                      </div>

                      {activeSection.promotion_id && activeSection.promotion_id !== 'manual' ? (
                        <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>
                              Menggunakan waktu hitung mundur dari campaign: <strong>{promotions.find(p => p.id === activeSection.promotion_id)?.title || 'Promo Aktif'}</strong>
                            </span>
                          </div>
                          <Link to="/dashboard/promos" className="font-bold text-orange-600 hover:text-orange-700 underline flex-shrink-0">
                            Kelola Durasi Promo
                          </Link>
                        </div>
                      ) : (
                        <>
                          {/* 3 Inputs: Hari, Jam, Menit */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                              Sisa Durasi Waktu Flash Sale (Manual)
                            </label>
                            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                              {/* Hari */}
                              <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-2xs focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
                                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                  Hari (Days)
                                </span>
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min={0}
                                    max={365}
                                    value={activeSection.countdown_days ?? 2}
                                    onChange={(e) =>
                                      handlePromoFieldChange(
                                        selectedIndex,
                                        'countdown_days',
                                        Math.max(0, parseInt(e.target.value) || 0)
                                      )
                                    }
                                    className="w-full text-base sm:text-lg font-black font-mono text-slate-900 bg-transparent focus:outline-none"
                                  />
                                  <span className="text-xs font-semibold text-slate-400">Hari</span>
                                </div>
                              </div>

                              {/* Jam */}
                              <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-2xs focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
                                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                  Jam (Hours)
                                </span>
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min={0}
                                    max={23}
                                    value={activeSection.countdown_hours ?? 14}
                                    onChange={(e) =>
                                      handlePromoFieldChange(
                                        selectedIndex,
                                        'countdown_hours',
                                        Math.min(23, Math.max(0, parseInt(e.target.value) || 0))
                                      )
                                    }
                                    className="w-full text-base sm:text-lg font-black font-mono text-slate-900 bg-transparent focus:outline-none"
                                  />
                                  <span className="text-xs font-semibold text-slate-400">Jam</span>
                                </div>
                              </div>

                              {/* Menit */}
                              <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-2xs focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
                                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                  Menit (Mins)
                                </span>
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min={0}
                                    max={59}
                                    value={activeSection.countdown_minutes ?? 37}
                                    onChange={(e) =>
                                      handlePromoFieldChange(
                                        selectedIndex,
                                        'countdown_minutes',
                                        Math.min(59, Math.max(0, parseInt(e.target.value) || 0))
                                      )
                                    }
                                    className="w-full text-base sm:text-lg font-black font-mono text-slate-900 bg-transparent focus:outline-none"
                                  />
                                  <span className="text-xs font-semibold text-slate-400">Mnt</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Preset Cepat */}
                          <div>
                            <span className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                              Preset Durasi Cepat:
                            </span>
                            <div className="flex flex-wrap items-center gap-1.5 text-xs">
                              <button
                                type="button"
                                onClick={() => {
                                  handlePromoFieldChange(selectedIndex, 'countdown_days', 2);
                                  handlePromoFieldChange(selectedIndex, 'countdown_hours', 14);
                                  handlePromoFieldChange(selectedIndex, 'countdown_minutes', 37);
                                }}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-[11px] font-bold text-slate-700 transition-all shadow-2xs"
                              >
                                2 Hari 14 Jam
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  handlePromoFieldChange(selectedIndex, 'countdown_days', 3);
                                  handlePromoFieldChange(selectedIndex, 'countdown_hours', 0);
                                  handlePromoFieldChange(selectedIndex, 'countdown_minutes', 0);
                                }}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-[11px] font-bold text-slate-700 transition-all shadow-2xs"
                              >
                                3 Hari
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  handlePromoFieldChange(selectedIndex, 'countdown_days', 1);
                                  handlePromoFieldChange(selectedIndex, 'countdown_hours', 0);
                                  handlePromoFieldChange(selectedIndex, 'countdown_minutes', 0);
                                }}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-[11px] font-bold text-slate-700 transition-all shadow-2xs"
                              >
                                24 Jam (1 Hari)
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  handlePromoFieldChange(selectedIndex, 'countdown_days', 0);
                                  handlePromoFieldChange(selectedIndex, 'countdown_hours', 12);
                                  handlePromoFieldChange(selectedIndex, 'countdown_minutes', 0);
                                }}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-[11px] font-bold text-slate-700 transition-all shadow-2xs"
                              >
                                12 Jam
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  handlePromoFieldChange(selectedIndex, 'countdown_days', 0);
                                  handlePromoFieldChange(selectedIndex, 'countdown_hours', 6);
                                  handlePromoFieldChange(selectedIndex, 'countdown_minutes', 0);
                                }}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-[11px] font-bold text-slate-700 transition-all shadow-2xs"
                              >
                                6 Jam
                              </button>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Badge & Button Customization */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-amber-200/80">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Label Tag Promo (Badge Atas)
                          </label>
                          <input
                            type="text"
                            value={activeSection.promo_badge ?? 'Limited Time Offer'}
                            onChange={(e) =>
                              handlePromoFieldChange(selectedIndex, 'promo_badge', e.target.value)
                            }
                            placeholder="Contoh: Limited Time Offer"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Teks Tombol Aksi (CTA Button)
                          </label>
                          <input
                            type="text"
                            value={activeSection.promo_button_text ?? 'Shop The Sale'}
                            onChange={(e) =>
                              handlePromoFieldChange(selectedIndex, 'promo_button_text', e.target.value)
                            }
                            placeholder="Contoh: Shop The Sale"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

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
