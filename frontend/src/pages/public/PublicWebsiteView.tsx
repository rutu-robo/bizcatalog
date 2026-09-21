import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { PublicWebsiteData, Product, SectionConfig } from '../../types';
import { THEMES } from '../../themes';
import {
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Video,
  Star,
  Layers,
  ArrowRight,
  ExternalLink,
  Loader2,
  AlertCircle,
  ShoppingBag,
  Plus,
  Truck,
  Search,
  X,
  Zap,
  Tag,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Quote,
  ShieldCheck,
  Sparkles,
  Award,
  CheckCircle2,
  BadgePercent,
  Flame
} from 'lucide-react';
import { InstagramIcon, FacebookIcon } from '../../components/Icons';
import { useCartStore } from '../../store/cartStore';
import { CartDrawer } from '../../components/cart/CartDrawer';
import { Promotion } from '../../types';
import { getProductPromoInfo } from '../../utils/promo';
import { resolveContrastTokens, isColorDark } from '../../utils/contrast';

interface CategoryScrollContainerProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

const CategoryScrollContainer: React.FC<CategoryScrollContainerProps> = ({ children, className = '', align = 'left' }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = React.useState(false);
  const [showRightArrow, setShowRightArrow] = React.useState(false);

  const checkScroll = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const canScrollLeft = el.scrollLeft > 10;
    const canScrollRight = el.scrollLeft < el.scrollWidth - el.clientWidth - 10;
    setShowLeftArrow(canScrollLeft);
    setShowRightArrow(canScrollRight);
  }, []);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    window.addEventListener('resize', checkScroll);
    el.addEventListener('scroll', checkScroll, { passive: true });
    return () => {
      window.removeEventListener('resize', checkScroll);
      el.removeEventListener('scroll', checkScroll);
    };
  }, [checkScroll]);

  // Mouse Drag to Swipe support on desktop
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let hasMoved = false;

    const onMouseDown = (e: MouseEvent) => {
      isDown = true;
      hasMoved = false;
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX);
      if (Math.abs(walk) > 4) {
        hasMoved = true;
        el.style.cursor = 'grabbing';
      }
      el.scrollLeft = scrollLeft - walk;
    };

    const onMouseUp = () => {
      if (hasMoved) {
        const captureClick = (clickEvent: MouseEvent) => {
          clickEvent.stopPropagation();
          clickEvent.preventDefault();
          window.removeEventListener('click', captureClick, true);
        };
        window.addEventListener('click', captureClick, true);
      }
      isDown = false;
      hasMoved = false;
      if (el) el.style.cursor = 'grab';
    };

    const onMouseLeave = () => {
      isDown = false;
      hasMoved = false;
      if (el) el.style.cursor = 'grab';
    };

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    el.addEventListener('mouseleave', onMouseLeave);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  const scrollBy = (offset: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group/catscroll">
      {/* Subtle left gradient mask when scrolled */}
      {showLeftArrow && (
        <div className="hidden sm:block absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
      )}

      {/* Left scroll navigation arrow */}
      {showLeftArrow && (
        <button
          type="button"
          onClick={() => scrollBy(-260)}
          aria-label="Scroll ke kiri"
          className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3.5 z-20 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-slate-200/90 items-center justify-center text-slate-700 hover:text-blue-600 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover/catscroll:opacity-100"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Main Horizontal Swipeable Container */}
      <div
        ref={scrollRef}
        className="overflow-x-auto no-scrollbar scroll-smooth overscroll-x-contain touch-pan-x cursor-grab active:cursor-grabbing select-none sm:select-auto"
      >
        <div
          className={`flex items-center flex-nowrap min-w-full w-max ${
            align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'
          } ${className}`}
        >
          {children}
        </div>
      </div>

      {/* Subtle right gradient mask when overflowed */}
      {showRightArrow && (
        <div className="hidden sm:block absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />
      )}

      {/* Right scroll navigation arrow */}
      {showRightArrow && (
        <button
          type="button"
          onClick={() => scrollBy(260)}
          aria-label="Scroll ke kanan"
          className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-3.5 z-20 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-slate-200/90 items-center justify-center text-slate-700 hover:text-blue-600 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover/catscroll:opacity-100"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

const PromoCountdownBanner: React.FC<{
  sec: SectionConfig;
  isOverlayHeader: boolean;
  isFirstSection: boolean;
  productsUrl: string;
  linkedPromo?: Promotion | null;
}> = ({ sec, isOverlayHeader, isFirstSection, productsUrl, linkedPromo }) => {
  const initialDays = linkedPromo?.countdown_days ?? (typeof sec.countdown_days === 'number' ? sec.countdown_days : 2);
  const initialHours = linkedPromo?.countdown_hours ?? (typeof sec.countdown_hours === 'number' ? sec.countdown_hours : 14);
  const initialMinutes = linkedPromo?.countdown_minutes ?? (typeof sec.countdown_minutes === 'number' ? sec.countdown_minutes : 37);

  // Calculate total seconds remaining
  const initialTotalSeconds = React.useMemo(() => {
    return initialDays * 86400 + initialHours * 3600 + initialMinutes * 60 + 59;
  }, [initialDays, initialHours, initialMinutes]);

  const [totalSeconds, setTotalSeconds] = useState(initialTotalSeconds);

  useEffect(() => {
    setTotalSeconds(initialTotalSeconds);
  }, [initialTotalSeconds]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTotalSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const badge = linkedPromo?.badge || sec.promo_badge || 'Limited Time Offer';
  const title = linkedPromo?.title || sec.title || 'Super Sale Up To 50% Off!';
  const subtitle = linkedPromo?.subtitle || sec.subtitle || 'On selected items. Shop now before the deal ends.';
  const buttonText = linkedPromo?.button_text || sec.promo_button_text || 'Shop The Sale';
  const buttonLink = linkedPromo?.button_link || sec.promo_button_link || '#katalog';
  const targetUrl = buttonLink === '#katalog' ? `${productsUrl}?promo=true` : buttonLink;

  const hasBgImage = !!sec.bg_image_url;
  const overlayOp = sec.overlay_opacity ?? 70;
  const tokens = resolveContrastTokens(sec.bg_color, sec.text_color_mode, hasBgImage);

  return (
    <section
      id="promo"
      key={sec.id}
      style={{ backgroundColor: sec.bg_color || undefined }}
      className={`${
        isOverlayHeader && isFirstSection ? 'pt-24 sm:pt-28 pb-8 sm:pb-10' : 'py-8 sm:py-10'
      } border-b ${tokens.borderClass}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div
          className={`border rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 transition-colors ${
            hasBgImage
              ? 'border-white/20 text-white'
              : tokens.isDark
              ? 'bg-[#121212] border-neutral-800/90 text-white'
              : 'bg-white border-slate-200 text-slate-900 shadow-lg'
          }`}
          style={{
            backgroundImage: hasBgImage
              ? `linear-gradient(rgba(0,0,0,${overlayOp / 100}), rgba(0,0,0,${overlayOp / 100})), url("${sec.bg_image_url}")`
              : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Subtle ambient lighting jika tidak ada foto */}
          {!hasBgImage && (
            <>
              <div className="absolute -left-20 -top-20 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            </>
          )}

          {/* Left Text */}
          <div className="space-y-1.5 max-w-xl text-center lg:text-left z-10">
            <span className="text-orange-500 text-xs font-black tracking-widest uppercase block">
              {badge}
            </span>
            <h2 className={`text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight ${hasBgImage || tokens.isDark ? 'text-white' : 'text-slate-900'}`}>
              {title}
            </h2>
            <p className={`text-xs sm:text-sm leading-relaxed mt-1 ${hasBgImage || tokens.isDark ? 'text-neutral-300' : 'text-slate-600'}`}>
              {subtitle}
            </p>
          </div>

          {/* Center & Right: 4 Countdown Cards & Orange CTA Button */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 flex-shrink-0 z-10 w-full sm:w-auto justify-center">
            {/* 4 Countdown Boxes */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
              {/* Days */}
              <div className={`${hasBgImage || tokens.isDark ? 'bg-[#1a1a1a]/90 border-neutral-800' : 'bg-slate-100 border-slate-200'} border rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 min-w-[58px] sm:min-w-[68px] shadow-inner`}>
                <span className={`text-xl sm:text-2xl lg:text-3xl font-black font-mono block ${hasBgImage || tokens.isDark ? 'text-white' : 'text-slate-900'}`}>
                  {String(days).padStart(2, '0')}
                </span>
                <span className={`text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider block mt-0.5 ${hasBgImage || tokens.isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  Days
                </span>
              </div>

              {/* Hours */}
              <div className={`${hasBgImage || tokens.isDark ? 'bg-[#1a1a1a]/90 border-neutral-800' : 'bg-slate-100 border-slate-200'} border rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 min-w-[58px] sm:min-w-[68px] shadow-inner`}>
                <span className={`text-xl sm:text-2xl lg:text-3xl font-black font-mono block ${hasBgImage || tokens.isDark ? 'text-white' : 'text-slate-900'}`}>
                  {String(hours).padStart(2, '0')}
                </span>
                <span className={`text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider block mt-0.5 ${hasBgImage || tokens.isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  Hours
                </span>
              </div>

              {/* Mins */}
              <div className={`${hasBgImage || tokens.isDark ? 'bg-[#1a1a1a]/90 border-neutral-800' : 'bg-slate-100 border-slate-200'} border rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 min-w-[58px] sm:min-w-[68px] shadow-inner`}>
                <span className={`text-xl sm:text-2xl lg:text-3xl font-black font-mono block ${hasBgImage || tokens.isDark ? 'text-white' : 'text-slate-900'}`}>
                  {String(minutes).padStart(2, '0')}
                </span>
                <span className={`text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider block mt-0.5 ${hasBgImage || tokens.isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  Mins
                </span>
              </div>

              {/* Secs */}
              <div className={`${hasBgImage || tokens.isDark ? 'bg-[#1a1a1a]/90 border-neutral-800' : 'bg-slate-100 border-slate-200'} border rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 min-w-[58px] sm:min-w-[68px] shadow-inner`}>
                <span className="text-xl sm:text-2xl lg:text-3xl font-black font-mono block text-orange-500">
                  {String(seconds).padStart(2, '0')}
                </span>
                <span className={`text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider block mt-0.5 ${hasBgImage || tokens.isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  Secs
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <a
              href={targetUrl}
              className="w-full sm:w-auto text-center px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black text-xs sm:text-sm shadow-xl shadow-orange-500/20 transition-all hover:scale-105 whitespace-nowrap"
            >
              {buttonText}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export const PublicWebsiteView: React.FC = () => {
  const params = useParams<{ subdomain?: string }>();
  
  // Detect subdomain either from router parameter or from host
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
    return 'mebeljaya'; // Default fallback demo
  };

  const navigate = useNavigate();
  const subdomain = getSubdomain();
  const host = window.location.hostname;
  const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(host);
  const isSubdomainHost =
    !isIp &&
    host.includes('bizcatalog.com') &&
    host.split('.').length > 2 &&
    !['www', 'app', 'admin'].includes(host.split('.')[0]);
  const productsUrl = isSubdomainHost ? '/products' : `/site/${subdomain}/products`;

  const [data, setData] = useState<PublicWebsiteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [trackOrderInput, setTrackOrderInput] = useState('');
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [activeTestiIndex, setActiveTestiIndex] = useState(0);
  const [countdown, setCountdown] = useState({ hours: 7, minutes: 48, seconds: 25 });

  const { addItem, setIsOpen, getTotalCount, getTotalAmount } = useCartStore();
  const totalCount = getTotalCount();
  const totalAmount = getTotalAmount();

  // Real-time flash sale countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-3">
        <Loader2 className="w-9 h-9 animate-spin text-blue-500" />
        <p className="text-sm font-medium text-slate-400">Merender website dinamis...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Website Tidak Ditemukan</h2>
        <p className="text-sm text-slate-500 max-w-md mb-6">
          Subdomain <strong>{subdomain}</strong> belum terdaftar atau telah dinonaktifkan.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition-all"
        >
          <span>Kembali ke Beranda BizCatalog</span>
        </Link>
      </div>
    );
  }

  const website = data.website;
  const products = Array.isArray(data.products) ? data.products : [];
  const sections = Array.isArray(data.sections) ? data.sections : [];
  const testimonials = Array.isArray(data.testimonials) ? data.testimonials : [];
  const galleries = Array.isArray(data.galleries) ? data.galleries : [];
  const theme = THEMES[website.theme_id || 'minimalist'] || THEMES.minimalist;

  // Format IDR
  const formatIDR = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // WhatsApp Buy Link generator
  const createWhatsAppLink = (product?: Product) => {
    const rawNumber = (website.whatsapp || '').replace(/[^0-9]/g, '');
    let target = rawNumber;
    if (target.startsWith('0')) target = '62' + target.slice(1);
    if (!target) target = '6281234567890';

    let text = `Halo ${website.business_name}, saya melihat website katalog Anda dan ingin berkonsultasi mengenai produk/layanan Anda.`;
    if (product) {
      text = `Halo ${website.business_name}, saya tertarik untuk memesan produk "${product.name}" seharga ${formatIDR(product.price)}. Apakah stok produk ini masih tersedia?`;
    }
    return `https://wa.me/${target}?text=${encodeURIComponent(text)}`;
  };

  const categoryObjects = (data.categories && data.categories.length > 0)
    ? data.categories
    : Array.from(new Set(products.map((p) => p.category).filter(Boolean))).map((name, i) => ({
        id: `cat-${i}`,
        website_id: website.id,
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        created_at: '',
        updated_at: ''
      }));

  const categories = categoryObjects.map((c) => c.name);
  const filteredProducts =
    activeCategory === 'all'
      ? products
      : products.filter((p) => p.category === activeCategory);

  // Active sorted sections
  const activeSections = sections
    .filter((s) => s.is_visible)
    .sort((a, b) => a.order - b.order);

  const renderHeaderContent = (isFloating = false) => (
    <>
      <div className="flex items-center gap-3">
        {website.logo_url && (
          <img
            src={website.logo_url}
            alt={website.business_name}
            className={`object-cover ${
              isFloating
                ? 'w-10 h-10 rounded-full ring-2 ring-white/90 shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
                : 'w-9 h-9 rounded-lg border border-slate-200/50'
            }`}
          />
        )}
        <div>
          <span className={`text-base sm:text-lg ${theme.headingClass} font-black tracking-tight text-slate-900 drop-shadow-2xs`}>
            {website.business_name}
          </span>
        </div>
      </div>

      <nav className={`hidden md:flex items-center gap-1 text-xs font-semibold ${isFloating ? 'text-slate-700' : 'gap-6'}`}>
        <a href="#katalog" className={`${isFloating ? 'px-3.5 py-1.5 rounded-full hover:bg-white/60 hover:text-slate-950 transition-all' : 'hover:opacity-80 transition-opacity'}`}>Katalog</a>
        <a href="#promo" className={`${isFloating ? 'px-3.5 py-1.5 rounded-full hover:bg-white/60 hover:text-slate-950 transition-all' : 'hover:opacity-80 transition-opacity'}`}>Promo</a>
        <a href="#tentang" className={`${isFloating ? 'px-3.5 py-1.5 rounded-full hover:bg-white/60 hover:text-slate-950 transition-all' : 'hover:opacity-80 transition-opacity'}`}>Tentang</a>
        {galleries.length > 0 && <a href="#galeri" className={`${isFloating ? 'px-3.5 py-1.5 rounded-full hover:bg-white/60 hover:text-slate-950 transition-all' : 'hover:opacity-80 transition-opacity'}`}>Galeri</a>}
        {testimonials.length > 0 && <a href="#testimoni" className={`${isFloating ? 'px-3.5 py-1.5 rounded-full hover:bg-white/60 hover:text-slate-950 transition-all' : 'hover:opacity-80 transition-opacity'}`}>Testimoni</a>}
        <a href="#kontak" className={`${isFloating ? 'px-3.5 py-1.5 rounded-full hover:bg-white/60 hover:text-slate-950 transition-all' : 'hover:opacity-80 transition-opacity'}`}>Kontak</a>
      </nav>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsTrackModalOpen(true)}
          className={`transition-all flex items-center gap-1.5 text-xs font-bold ${
            isFloating
              ? 'bg-white/60 hover:bg-white/95 backdrop-blur-md border border-white/80 text-slate-800 rounded-full px-3.5 py-2 shadow-[0_2px_10px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] hover:scale-105 active:scale-95'
              : 'p-2 bg-white/80 backdrop-blur-md hover:bg-white border border-slate-200/70 text-slate-800 rounded-xl shadow-2xs'
          }`}
          title="Lacak Status Pesanan"
        >
          <Truck className="w-4 h-4 text-indigo-600" />
          <span className="hidden sm:inline">Lacak Pesanan</span>
        </button>

        <button
          onClick={() => setIsOpen(true)}
          className={`relative transition-all flex items-center gap-1.5 text-xs font-bold ${
            isFloating
              ? 'bg-white/60 hover:bg-white/95 backdrop-blur-md border border-white/80 text-slate-800 rounded-full px-3.5 py-2 shadow-[0_2px_10px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] hover:scale-105 active:scale-95'
              : 'p-2 bg-white/80 backdrop-blur-md hover:bg-white border border-slate-200/70 text-slate-800 rounded-xl shadow-2xs'
          }`}
          title="Buka Keranjang Belanja"
        >
          <ShoppingBag className="w-4 h-4 text-blue-600" />
          <span className="hidden sm:inline">Keranjang</span>
          {totalCount > 0 && (
            <span className="bg-blue-600 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full shadow-xs">
              {totalCount}
            </span>
          )}
        </button>

        <a
          href={createWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 text-xs font-bold transition-all ${
            isFloating
              ? 'bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full px-4 py-2 shadow-[0_4px_16px_rgba(37,99,235,0.35),inset_0_1px_0_rgba(255,255,255,0.35)] hover:scale-105 active:scale-95'
              : `${theme.buttonPrimary} py-2 px-4 shadow-sm rounded-xl`
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-300" />
          <span>Chat CS</span>
        </a>
      </div>
    </>
  );

  return (
    <div className={`min-h-screen ${theme.bgClass} ${theme.fontFamily} antialiased selection:bg-blue-600 selection:text-white`}>
      {/* Header / Navigation Options: 'floating' | 'solid' | 'dynamic-scroll' */}
      {(() => {
        const headerStyle = website.header_style || 'dynamic-scroll';

        // 1. FLOATING ISLAND (Apple Liquid Glass Melayang)
        if (headerStyle === 'floating') {
          return (
            <div className="fixed top-3 sm:top-4 left-0 right-0 z-40 max-w-6xl mx-auto px-4 sm:px-6 pointer-events-none transition-all duration-300">
              <header className="pointer-events-auto rounded-3xl sm:rounded-full backdrop-blur-2xl backdrop-saturate-[190%] bg-gradient-to-b from-white/75 via-white/55 to-white/45 shadow-[0_20px_50px_rgba(0,0,0,0.14),0_1px_2px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-1px_1px_rgba(255,255,255,0.2)] border border-white/60 px-4 sm:px-6 h-16 sm:h-[68px] flex items-center justify-between transition-all duration-300 hover:shadow-[0_25px_60px_rgba(0,0,0,0.18),inset_0_1px_1px_rgba(255,255,255,0.95)]">
                {renderHeaderContent(true)}
              </header>
            </div>
          );
        }

        // 2. SOLID HEADER (Menempel Padat Kokoh)
        if (headerStyle === 'solid') {
          return (
            <header className={`sticky top-0 z-40 bg-white border-b ${theme.borderClass} shadow-xs`}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                {renderHeaderContent(false)}
              </div>
            </header>
          );
        }

        // 3. DYNAMIC SCROLL (Transparan di Puncak -> Kaca Blur Frosted Glass Saat Scroll)
        return (
          <header
            className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
              isScrolled
                ? 'backdrop-blur-xl backdrop-saturate-150 bg-white/80 shadow-md border-b border-slate-200/60'
                : 'bg-transparent backdrop-blur-none border-b border-transparent shadow-none'
            }`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
              {renderHeaderContent(false)}
            </div>
          </header>
        );
      })()}

      {/* Render Dynamic Sections */}
      {(() => {
        const headerStyle = website.header_style || 'dynamic-scroll';
        const isOverlayHeader = headerStyle === 'floating' || headerStyle === 'dynamic-scroll';

        return activeSections.map((sec, index) => {
          const isFirstSection = index === 0;

          switch (sec.type) {
            case 'hero': {
              const heroImage =
                sec.bg_image_url ||
                website.logo_url ||
                products[0]?.image_url ||
                'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&auto=format&fit=crop&q=80';

              if (sec.variant === 'bg-full') {
                const contentPadding = isOverlayHeader && isFirstSection
                  ? 'pt-28 sm:pt-36 pb-20 sm:pb-28'
                  : 'py-20 sm:py-28';

                const textAlign = sec.text_align || 'center';
                const isLeft = textAlign === 'left';
                const isRight = textAlign === 'right';

                return (
                  <section
                    key={sec.id}
                    style={{ backgroundColor: sec.bg_color || undefined }}
                    className="relative min-h-[500px] sm:min-h-[560px] flex items-center justify-center border-b border-slate-800 overflow-hidden text-white"
                  >
                    <div className="absolute inset-0 z-0">
                      <img
                        src={heroImage}
                        alt="Hero Background"
                        className="w-full h-full object-cover filter brightness-[0.4]"
                      />
                      <div className={`absolute inset-0 ${
                        isLeft
                          ? 'bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-slate-950/40'
                          : isRight
                          ? 'bg-gradient-to-l from-slate-950/95 via-slate-950/75 to-slate-950/40'
                          : 'bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40'
                      }`} />
                    </div>

                    <div className={`relative z-10 max-w-5xl mx-auto px-4 sm:px-6 ${contentPadding} w-full ${
                      isLeft
                        ? 'text-left flex flex-col items-start'
                        : isRight
                        ? 'text-right flex flex-col items-end'
                        : 'text-center flex flex-col items-center'
                    } space-y-6`}>
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold tracking-wide backdrop-blur-md">
                        <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                        <span>{website.tagline || 'Toko Resmi Terpercaya'}</span>
                      </div>

                      <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.15] text-white drop-shadow-md max-w-3xl">
                        {sec.title || website.business_name}
                      </h1>

                      <p className={`text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl ${
                        isLeft ? 'mr-auto' : isRight ? 'ml-auto' : 'mx-auto'
                      }`}>
                        {sec.subtitle || website.description}
                      </p>

                      <div className={`flex flex-wrap items-center gap-3 pt-2 w-full ${
                        isLeft ? 'justify-start' : isRight ? 'justify-end' : 'justify-center'
                      }`}>
                        <a
                          href="#katalog"
                          className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl hover:shadow-blue-500/30 hover:scale-105 transition-all"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>Belanja Sekarang</span>
                        </a>
                        <a
                          href={createWhatsAppLink()}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 text-white font-bold text-sm backdrop-blur-md hover:scale-105 transition-all"
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-400" />
                          <span>Konsultasi WA</span>
                        </a>
                      </div>

                      <div className={`pt-6 flex flex-wrap items-center gap-6 sm:gap-10 text-xs text-slate-300 w-full ${
                        isLeft ? 'justify-start' : isRight ? 'justify-end' : 'justify-center'
                      }`}>
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>100% Kualitas Terjamin</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-blue-400" />
                          <span>Pengiriman Cepat & Aman</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <span>Pelayanan Terbaik</span>
                        </div>
                      </div>
                    </div>
                  </section>
                );
              }

              if (sec.variant === 'card-rounded') {
                const sectionPadding = isOverlayHeader && isFirstSection
                  ? 'pt-24 sm:pt-28 pb-8 sm:pb-12'
                  : 'py-8 sm:py-12';

                const isRight = sec.text_align === 'right';

                return (
                  <section
                    key={sec.id}
                    style={{ backgroundColor: sec.bg_color || undefined }}
                    className={`${sectionPadding} border-b ${theme.borderClass}`}
                  >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                      <div className={`relative rounded-3xl sm:rounded-[2.5rem] overflow-hidden min-h-[460px] shadow-2xl flex items-center ${
                        isRight ? 'justify-end' : 'justify-start'
                      }`}>
                        <div className="absolute inset-0 z-0">
                          <img
                            src={heroImage}
                            alt="Hero Card"
                            className="w-full h-full object-cover"
                          />
                          <div className={`absolute inset-0 ${
                            isRight
                              ? 'bg-gradient-to-l from-slate-950/95 via-slate-950/75 to-slate-900/30'
                              : 'bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-slate-900/30'
                          }`} />
                        </div>

                        <div className={`relative z-10 p-8 sm:p-14 max-w-2xl text-white space-y-5 ${
                          isRight ? 'text-right flex flex-col items-end' : 'text-left'
                        }`}>
                          <span className="inline-block text-xs uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white">
                            {website.tagline || 'Katalog Pilihan'}
                          </span>
                          <h1 className="text-3xl sm:text-5xl font-black leading-tight text-white drop-shadow-sm">
                            {sec.title || website.business_name}
                          </h1>
                          <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                            {sec.subtitle || website.description}
                          </p>
                          <div className={`flex flex-wrap gap-3 pt-2 ${isRight ? 'justify-end' : 'justify-start'}`}>
                            <a
                              href="#katalog"
                              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs sm:text-sm shadow-lg hover:scale-105 transition-all"
                            >
                              <span>Mulai Belanja</span>
                              <ArrowRight className="w-4 h-4 text-blue-600" />
                            </a>
                            <a
                              href={createWhatsAppLink()}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs sm:text-sm border border-white/30 backdrop-blur-md transition-all"
                            >
                              <MessageCircle className="w-4 h-4 text-emerald-400" />
                              <span>Chat WhatsApp</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                );
              }

              // Default: 'split'
              const heroTokens = resolveContrastTokens(sec.bg_color, sec.text_color_mode);
              const isDarkBg = heroTokens.isDark;

              const isRight = sec.text_align === 'right';

              const sectionPadding = isOverlayHeader && isFirstSection
                ? 'pt-24 sm:pt-28 pb-14 sm:pb-20'
                : 'py-14 sm:py-20';

              return (
                <section
                  key={sec.id}
                  style={{ backgroundColor: sec.bg_color || undefined }}
                  className={`${sectionPadding} border-b ${heroTokens.borderClass} ${isDarkBg ? 'text-white' : ''}`}
                >
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-14 items-center">
                    <div className={`space-y-5 ${isRight ? 'md:order-2' : 'md:order-1'}`}>
                      <span className={theme.badgeClass}>
                        {website.tagline || 'Katalog Resmi'}
                      </span>
                      <h1 className={`text-3xl sm:text-5xl ${heroTokens.headingText} font-black leading-[1.15]`}>
                        {sec.title || website.business_name}
                      </h1>
                      <p className={`text-sm sm:text-base ${heroTokens.bodyText} leading-relaxed`}>
                        {sec.subtitle || website.description}
                      </p>
                      <div className="flex flex-wrap gap-3 pt-2">
                        <a
                          href="#katalog"
                          className={`${theme.buttonPrimary} inline-flex items-center gap-2 text-xs sm:text-sm px-6 py-3 shadow-md hover:scale-105 transition-transform`}
                        >
                          <span>Lihat Katalog Produk</span>
                          <ArrowRight className="w-4 h-4" />
                        </a>
                        <a
                          href={createWhatsAppLink()}
                          target="_blank"
                          rel="noreferrer"
                          className={`${isDarkBg ? 'bg-white/15 hover:bg-white/25 text-white border border-white/20' : theme.buttonSecondary} inline-flex items-center gap-2 text-xs sm:text-sm px-5 py-3 rounded-xl transition-all`}
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-400" />
                          <span>Konsultasi WA</span>
                        </a>
                      </div>

                      <div className={`pt-4 border-t ${isDarkBg ? 'border-white/15 text-slate-300' : 'border-slate-200/60 text-slate-500'} flex items-center gap-6 text-xs`}>
                        <div className="flex items-center gap-1.5 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Kualitas Ekspor</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Transaksi Aman</span>
                        </div>
                      </div>
                    </div>

                    <div className={`relative aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border border-slate-200/50 group ${
                      isRight ? 'md:order-1' : 'md:order-2'
                    }`}>
                      <img
                        src={heroImage}
                        alt="Hero Showcase"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-white/40 shadow-lg flex items-center justify-between">
                        <div>
                          <span className="text-[11px] uppercase font-bold text-blue-600 tracking-wider block">Koleksi Pilihan</span>
                          <span className="font-bold text-sm text-slate-900 dark:text-white">Siap Kirim ke Seluruh Indonesia</span>
                        </div>
                        <a
                          href="#katalog"
                          className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
                        >
                          Cek Produk
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );
          }

          case 'promos': {
            const allPromotions = data.promotions || [];
            const linkedPromo = sec.promotion_id
              ? allPromotions.find((p) => p.id === sec.promotion_id)
              : null;

            if (sec.variant === 'full-banner') {
              const countdownPromo =
                linkedPromo ||
                allPromotions.find((p) => p.type === 'countdown' && p.is_active);

              return (
                <PromoCountdownBanner
                  key={sec.id}
                  sec={sec}
                  isOverlayHeader={isOverlayHeader}
                  isFirstSection={isFirstSection}
                  productsUrl={productsUrl}
                  linkedPromo={countdownPromo}
                />
              );
            }

            if (sec.variant === 'split-card') {
              const hasBgImage = !!sec.bg_image_url;
              const overlayOp = sec.overlay_opacity ?? 60;
              const tokens = resolveContrastTokens(sec.bg_color, sec.text_color_mode, hasBgImage);
              const isDark = hasBgImage || tokens.isDark;

              const discountPromo =
                linkedPromo ||
                allPromotions.find((p) => p.type === 'discount' && p.is_active) ||
                allPromotions[0];

              const promoTitle = discountPromo?.title || 'Hemat Belanja dengan Voucher Eksklusif';
              const promoSubtitle = discountPromo?.subtitle || 'Pilih produk favorit Anda, masukkan ke keranjang belanja, dan gunakan voucher diskon saat checkout untuk harga paling hemat!';
              const badgeText = discountPromo?.badge || 'Penawaran Terbatas';
              const discountVal = discountPromo?.discount_percent ? `${discountPromo.discount_percent}%` : '30%';
              const targetDesc = discountPromo?.target_type === 'category'
                ? `Khusus Kategori ${discountPromo.target_category}`
                : discountPromo?.target_type === 'products'
                ? 'Koleksi Produk Pilihan'
                : 'Semua Produk Unggulan';
              const codeText = discountPromo?.code || 'HEMAT10';

              return (
                <section id="promo" key={sec.id} style={{ backgroundColor: sec.bg_color || undefined }} className={`${isOverlayHeader && isFirstSection ? 'pt-24 sm:pt-28 pb-8 sm:pb-10' : 'py-8 sm:py-10'} border-b ${tokens.borderClass}`}>
                  <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div
                      className={`rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-8 transition-colors relative overflow-hidden ${
                        hasBgImage
                          ? 'border border-white/20 shadow-2xl text-white'
                          : isDark
                          ? 'border border-white/15 bg-white/10 backdrop-blur-md shadow-xl text-white'
                          : 'border border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white shadow-sm text-slate-900'
                      }`}
                      style={{
                        backgroundImage: hasBgImage
                          ? `linear-gradient(rgba(0,0,0,${overlayOp / 100}), rgba(0,0,0,${overlayOp / 100})), url("${sec.bg_image_url}")`
                          : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      {/* Subtle ambient lighting jika tidak ada foto */}
                      {!hasBgImage && (
                        <div className="absolute -left-16 -top-16 w-56 h-56 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                      )}

                      <div className="space-y-3 max-w-xl z-10">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                          hasBgImage
                            ? 'text-orange-300 bg-black/40 border border-white/20 backdrop-blur-xs'
                            : isDark
                            ? 'text-orange-400 bg-white/10 border border-white/15'
                            : 'text-blue-700 bg-blue-100'
                        }`}>
                          <BadgePercent className="w-3.5 h-3.5" />
                          <span>{badgeText}</span>
                        </span>
                        <h2 className={`text-xl sm:text-2xl font-black tracking-tight leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {promoTitle}
                        </h2>
                        <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-600'}`}>
                          {promoSubtitle}
                        </p>
                        <div className="pt-2">
                          <a
                            href={`${productsUrl}?promo=true`}
                            className={`${theme.buttonPrimary} inline-flex items-center gap-2 text-xs px-5 py-2.5 shadow-sm`}
                          >
                            <span>Lihat Produk Promo</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>

                      <div className="flex-shrink-0 text-center p-6 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl min-w-[220px] border border-white/15 z-10">
                        <span className="text-xs uppercase font-bold tracking-widest text-blue-200 block">Potongan Hingga</span>
                        <span className="text-4xl font-black block my-1">{discountVal}</span>
                        <span className="text-xs text-blue-100 block">{targetDesc}</span>
                        <div className="mt-3 pt-3 border-t border-white/20 text-[11px] text-blue-200">
                          Gunakan kode: <span className="font-mono font-bold text-white bg-white/20 px-2 py-0.5 rounded">{codeText}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              );
            }

            // Default: 'coupon-ticket'
            const tokens = resolveContrastTokens(sec.bg_color, sec.text_color_mode);
            const activeCouponPromos = allPromotions.filter((p) => p.type === 'coupon' && p.is_active);
            const coupons = activeCouponPromos.length > 0
              ? activeCouponPromos.map((c) => ({
                  code: c.code || 'HEMAT10',
                  discount: c.badge || (c.discount_percent ? `${c.discount_percent}% OFF` : 'PROMO'),
                  desc: c.subtitle || c.title,
                  minSpend: c.min_spend ? `Min. Belanja Rp ${c.min_spend.toLocaleString('id-ID')}` : 'Tanpa minimum belanja',
                }))
              : [
                  { code: 'HEMAT10', discount: '10% OFF', desc: 'Potongan 10% untuk pesanan Anda', minSpend: 'Min. Belanja Rp 1.000.000' },
                  { code: 'ONGKIRFREE', discount: 'GRATIS ONGKIR', desc: 'Subsidi ongkos kirim hingga Rp 100.000', minSpend: 'Khusus pesanan via website' },
                  { code: 'SUPERDEAL', discount: 'CASHBACK 50RB', desc: 'Potongan langsung Rp 50.000 saat checkout', minSpend: 'Tanpa minimum belanja' },
                ];

            return (
              <section id="promo" key={sec.id} style={{ backgroundColor: sec.bg_color || undefined }} className={`${isOverlayHeader && isFirstSection ? 'pt-24 sm:pt-28 pb-8 sm:pb-10' : 'py-8 sm:py-10'} border-b ${tokens.borderClass}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                  <div className="text-center max-w-2xl mx-auto mb-6">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-2 ${
                      tokens.isDark ? 'text-orange-400 bg-white/10 border border-white/15' : 'text-blue-700 bg-blue-100'
                    }`}>
                      <Tag className="w-3.5 h-3.5" />
                      <span>Kupon & Voucher Belanja</span>
                    </span>
                    <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${tokens.headingText}`}>
                      {sec.title || 'Klaim Voucher Diskon Hari Ini'}
                    </h2>
                    <p className={`text-xs sm:text-sm mt-1 ${tokens.bodyText}`}>
                      {sec.subtitle || 'Salin kode voucher di bawah dan nikmati potongan harga langsung saat Anda melakukan pemesanan.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {coupons.map((c) => {
                      const isCopied = copiedCoupon === c.code;
                      return (
                        <div
                          key={c.code}
                          className="relative rounded-2xl border-2 border-dashed border-blue-300 bg-white p-5 shadow-sm flex flex-col justify-between overflow-hidden group hover:border-blue-500 transition-colors"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="px-2.5 py-1 rounded-md bg-blue-600 text-white font-black text-xs">
                                {c.discount}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-400">Voucher Toko</span>
                            </div>
                            <h4 className="font-bold text-sm text-slate-900">{c.desc}</h4>
                            <p className="text-[11px] text-slate-500">{c.minSpend}</p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-dashed border-blue-200 flex items-center justify-between gap-2">
                            <span className="font-mono font-extrabold text-sm text-blue-700 bg-slate-50 px-3 py-1 rounded-lg border border-blue-200">
                              {c.code}
                            </span>
                            <button
                              onClick={() => handleCopyCoupon(c.code)}
                              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                                isCopied
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                              }`}
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Tersalin!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Salin Kode</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            );

          }

          case 'categories': {
            if (categories.length === 0) return null;

            const textAlign = sec.text_align || 'left';
            const tokens = resolveContrastTokens(sec.bg_color, sec.text_color_mode);
            const isDarkBg = tokens.isDark;

            return (
              <section id="kategori" key={sec.id} style={{ backgroundColor: sec.bg_color || undefined }} className={`${isOverlayHeader && isFirstSection ? 'pt-20 sm:pt-24 pb-6 sm:pb-7' : 'py-6 sm:py-7'} border-b ${tokens.borderClass}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                  
                  {/* Title & Subtitle with Alignment Controls */}
                  {textAlign === 'center' ? (
                    <div className="relative mb-4 sm:mb-5 text-center">
                      <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${tokens.headingText}`}>
                        {sec.title || 'Kategori Pilihan'}
                      </h2>
                      {sec.subtitle && (
                        <p className={`text-xs sm:text-sm font-normal mt-1 max-w-xl mx-auto ${tokens.bodyText}`}>
                          {sec.subtitle}
                        </p>
                      )}
                      {activeCategory !== 'all' && (
                        <div className="mt-2 sm:absolute sm:right-0 sm:top-1/2 sm:-translate-y-1/2 sm:mt-0">
                          <button
                            onClick={() => setActiveCategory('all')}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 mx-auto sm:mx-0"
                          >
                            <span>Tampilkan Semua</span>
                            <span className="text-sm leading-none">×</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : textAlign === 'right' ? (
                    <div className="flex items-center justify-between mb-4 sm:mb-5 gap-3">
                      {activeCategory !== 'all' ? (
                        <button
                          onClick={() => setActiveCategory('all')}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 flex-shrink-0"
                        >
                          <span>Tampilkan Semua</span>
                          <span className="text-sm leading-none">×</span>
                        </button>
                      ) : <div />}
                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2.5 text-right">
                        {sec.subtitle && (
                          <span className={`text-xs sm:text-sm font-normal order-2 sm:order-1 ${tokens.bodyText}`}>
                            {sec.subtitle}<span className="hidden sm:inline"> •</span>
                          </span>
                        )}
                        <h2 className={`text-xl sm:text-2xl font-black tracking-tight order-1 sm:order-2 ${tokens.headingText}`}>
                          {sec.title || 'Kategori Pilihan'}
                        </h2>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between mb-4 sm:mb-5 gap-3">
                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2.5 text-left">
                        <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${tokens.headingText}`}>
                          {sec.title || 'Kategori Pilihan'}
                        </h2>
                        {sec.subtitle && (
                          <span className={`text-xs sm:text-sm font-normal ${tokens.bodyText}`}>
                            <span className="hidden sm:inline">• </span>{sec.subtitle}
                          </span>
                        )}
                      </div>
                      {activeCategory !== 'all' && (
                        <button
                          onClick={() => setActiveCategory('all')}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 flex-shrink-0"
                        >
                          <span>Tampilkan Semua</span>
                          <span className="text-sm leading-none">×</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Horizontal Scrolling & Swipeable List with Variants */}
                  {sec.variant === 'pill-badges' ? (
                    <CategoryScrollContainer align={textAlign} className="gap-2.5 pb-1.5">
                      <button
                        onClick={() => {
                          setActiveCategory('all');
                          document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`px-4 py-2 rounded-full text-xs sm:text-[13px] font-semibold flex items-center gap-2 flex-shrink-0 transition-all ${
                          activeCategory === 'all'
                            ? `${theme.buttonPrimary} shadow-xs`
                            : isDarkBg
                            ? 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
                            : 'bg-slate-100/90 hover:bg-slate-200/90 text-slate-600 hover:text-slate-900 border border-slate-200/60'
                        }`}
                      >
                        <span>Semua</span>
                        <span className="px-2 py-0.5 rounded-full bg-white/30 text-[11px] font-bold">
                          {products.length}
                        </span>
                      </button>
                      {categoryObjects.map((cat) => {
                        const count = products.filter(p => p.category === cat.name).length;
                        const isActive = activeCategory === cat.name;
                        return (
                          <button
                            key={cat.id || cat.name}
                            onClick={() => {
                              setActiveCategory(cat.name);
                              document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className={`px-4 py-2 rounded-full text-xs sm:text-[13px] font-semibold flex items-center gap-2 flex-shrink-0 transition-all ${
                              isActive
                                ? `${theme.buttonPrimary} shadow-xs`
                                : isDarkBg
                                ? 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
                                : 'bg-slate-100/90 hover:bg-slate-200/90 text-slate-600 hover:text-slate-900 border border-slate-200/60'
                            }`}
                          >
                            <span>{cat.name}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${isDarkBg ? 'bg-white/20 text-white' : 'bg-black/5 text-slate-500'}`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </CategoryScrollContainer>
                  ) : sec.variant === 'box-cards' ? (
                    <CategoryScrollContainer align={textAlign} className="gap-3 pb-1.5">
                      <div
                        onClick={() => {
                          setActiveCategory('all');
                          document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`px-3.5 py-2.5 rounded-xl border cursor-pointer flex items-center gap-3 flex-shrink-0 transition-all ${
                          activeCategory === 'all'
                            ? 'border-blue-600 bg-blue-50/80 shadow-2xs'
                            : isDarkBg
                            ? 'border-white/15 hover:border-white/30 bg-white/10 hover:bg-white/15 text-white'
                            : 'border-slate-200/80 hover:border-slate-300 bg-white hover:bg-slate-50/50 text-slate-800'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs flex-shrink-0">
                          ALL
                        </div>
                        <div className="text-left">
                          <div className={`text-xs sm:text-sm font-bold leading-tight ${isDarkBg ? 'text-white' : 'text-slate-800'}`}>Semua</div>
                          <div className={`text-[11px] leading-none mt-0.5 ${isDarkBg ? 'text-slate-300' : 'text-slate-400'}`}>{products.length} produk</div>
                        </div>
                      </div>

                      {categoryObjects.map((cat) => {
                        const count = products.filter(p => p.category === cat.name).length;
                        const sampleImg = products.find(p => p.category === cat.name)?.image_url;
                        const isActive = activeCategory === cat.name;
                        return (
                          <div
                            key={cat.id || cat.name}
                            onClick={() => {
                              setActiveCategory(cat.name);
                              document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className={`px-3.5 py-2.5 rounded-xl border cursor-pointer flex items-center gap-3 flex-shrink-0 transition-all ${
                              isActive
                                ? 'border-blue-600 bg-blue-50/80 shadow-2xs'
                                : isDarkBg
                                ? 'border-white/15 hover:border-white/30 bg-white/10 hover:bg-white/15 text-white'
                                : 'border-slate-200/80 hover:border-slate-300 bg-white hover:bg-slate-50/50 text-slate-800'
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 border border-slate-200/50 flex-shrink-0 flex items-center justify-center">
                              {sampleImg ? (
                                <img src={sampleImg} alt={cat.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-blue-600 font-bold text-xs">{cat.name.charAt(0)}</span>
                              )}
                            </div>
                            <div className="text-left">
                              <div className={`text-xs sm:text-sm font-bold leading-tight truncate max-w-[125px] ${isDarkBg ? 'text-white' : 'text-slate-800'}`}>{cat.name}</div>
                              <div className={`text-[11px] leading-none mt-0.5 ${isDarkBg ? 'text-slate-300' : 'text-slate-400'}`}>{count} produk</div>
                            </div>
                          </div>
                        );
                      })}
                    </CategoryScrollContainer>
                  ) : (
                    // Default: 'circle-avatar' (Compact Stories Avatar +10%)
                    <CategoryScrollContainer align={textAlign} className="gap-4 sm:gap-6 pb-2 pt-0.5">
                      <div
                        onClick={() => {
                          setActiveCategory('all');
                          document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="group flex flex-col items-center gap-2 cursor-pointer flex-shrink-0"
                      >
                        <div
                          className={`w-[52px] h-[52px] sm:w-[58px] sm:h-[58px] rounded-full p-0.5 transition-all flex items-center justify-center ${
                            activeCategory === 'all'
                              ? 'ring-2 ring-blue-600 ring-offset-2 scale-105 shadow-xs'
                              : isDarkBg
                              ? 'border border-white/20 group-hover:border-blue-400'
                              : 'border border-slate-200 group-hover:border-blue-400'
                          }`}
                        >
                          <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-2xs">
                            ALL
                          </div>
                        </div>
                        <span className={`text-[11.5px] sm:text-xs text-center max-w-[76px] truncate leading-tight ${activeCategory === 'all' ? 'font-bold text-blue-600' : isDarkBg ? 'font-medium text-slate-200 group-hover:text-white' : 'font-medium text-slate-600 group-hover:text-slate-900'}`}>
                          Semua
                        </span>
                      </div>

                      {categoryObjects.map((cat) => {
                        const sampleImg = products.find(p => p.category === cat.name)?.image_url;
                        const isActive = activeCategory === cat.name;
                        return (
                          <div
                            key={cat.id || cat.name}
                            onClick={() => {
                              setActiveCategory(cat.name);
                              document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="group flex flex-col items-center gap-2 cursor-pointer flex-shrink-0"
                          >
                            <div
                              className={`w-[52px] h-[52px] sm:w-[58px] sm:h-[58px] rounded-full p-0.5 transition-all overflow-hidden ${
                                isActive
                                  ? 'ring-2 ring-blue-600 ring-offset-2 scale-105 shadow-xs'
                                  : isDarkBg
                                  ? 'border border-white/20 group-hover:border-blue-400'
                                  : 'border border-slate-200 group-hover:border-blue-400'
                              }`}
                            >
                              <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                                {sampleImg ? (
                                  <img src={sampleImg} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                ) : (
                                  <span className="font-bold text-blue-600 text-xs sm:text-sm">{cat.name.charAt(0)}</span>
                                )}
                              </div>
                            </div>
                            <span className={`text-[11.5px] sm:text-xs text-center max-w-[76px] truncate leading-tight ${isActive ? 'font-bold text-blue-600' : isDarkBg ? 'font-medium text-slate-200 group-hover:text-white' : 'font-medium text-slate-600 group-hover:text-slate-900'}`}>
                              {cat.name}
                            </span>
                          </div>
                        );
                      })}
                    </CategoryScrollContainer>
                  )}
                </div>
              </section>
            );
          }

          case 'catalog': {
            const isRight = sec.text_align === 'right';
            const tokens = resolveContrastTokens(sec.bg_color, sec.text_color_mode);
            const isDarkBg = tokens.isDark;

            return (
              <section id="katalog" key={sec.id} style={{ backgroundColor: sec.bg_color || undefined }} className={`${isOverlayHeader && isFirstSection ? 'pt-24 sm:pt-28 pb-8 sm:pb-10' : 'py-8 sm:py-10'} border-b ${tokens.borderClass}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                  <div className={`flex flex-col sm:flex-row sm:items-end justify-between mb-5 sm:mb-6 gap-3 ${isRight ? 'sm:flex-row-reverse' : ''}`}>
                    <div className={isRight ? 'text-left sm:text-right flex flex-col sm:items-end' : 'text-left'}>
                      <span className={theme.badgeClass}>Showcase Produk</span>
                      <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${tokens.headingText} mt-1`}>
                        {sec.title || 'Katalog Produk Pilihan'}
                      </h2>
                      <p className={`text-xs sm:text-sm ${tokens.bodyText} mt-1`}>
                        {sec.subtitle || 'Temukan produk idaman Anda dan belanja langsung melalui website.'}
                      </p>
                    </div>

                    {/* Tombol Lihat Semuanya */}
                    <button
                      type="button"
                      onClick={() => navigate(productsUrl)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all self-start sm:self-auto group"
                    >
                      <span>Lihat Semuanya</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>

                  {products.length === 0 ? (
                    <div className="text-center py-12 px-6 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 max-w-xl mx-auto my-4">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                      <h3 className={`text-sm sm:text-base font-bold mb-1 ${theme.headingClass}`}>
                        Katalog Produk Sedang Disiapkan
                      </h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5 leading-relaxed">
                        Pemilik toko sedang mempersiapkan daftar produk pilihan terbaik.
                      </p>
                      {website.whatsapp && (
                        <a
                          href={createWhatsAppLink()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all hover:scale-105"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Tanya Toko via WhatsApp</span>
                        </a>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* 5-Column Grid on Desktop (5 x 2 rows = max 10 products) */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3 sm:gap-3.5">
                        {products.slice(0, 10).map((p) => {
                          const promoInfo = getProductPromoInfo(p, data.promotions);
                          const finalItem = promoInfo ? { ...p, price: promoInfo.discountedPrice } : p;

                          if (sec.variant === 'minimal-frameless') {
                            return (
                              <div
                                key={p.id}
                                className="group flex flex-col justify-between transition-all"
                              >
                                <div>
                                  <div className="relative aspect-square rounded-2xl bg-slate-100 overflow-hidden mb-2.5">
                                    <img
                                      src={p.image_url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&auto=format&fit=crop&q=80'}
                                      alt={p.name}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    {p.category && (
                                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-[10px] font-bold text-slate-800 shadow-xs">
                                        {p.category}
                                      </span>
                                    )}
                                    {promoInfo && (
                                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-red-600 text-white font-black text-[10px] uppercase tracking-wider shadow-sm flex items-center gap-1">
                                        <Flame className="w-3 h-3 fill-white" />
                                        <span>-{promoInfo.percent}%</span>
                                      </span>
                                    )}
                                  </div>
                                  <h3 className={`font-bold text-xs sm:text-[13px] line-clamp-2 leading-snug group-hover:text-blue-500 transition-colors ${
                                    isDarkBg ? 'text-white' : 'text-slate-900'
                                  }`}>
                                    {p.name}
                                  </h3>
                                  <div className="mt-0.5">
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
                                      <span className={`text-xs sm:text-sm font-black ${isDarkBg ? 'text-blue-400' : 'text-blue-600'}`}>
                                        {formatIDR(p.price)}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="mt-2.5 flex gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => addItem(finalItem)}
                                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                                      isDarkBg
                                        ? 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                                    }`}
                                    title="Tambah ke Keranjang"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Keranjang</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      addItem(finalItem);
                                      setIsOpen(true);
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
                                    title="Beli Langsung"
                                  >
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          }


                          if (sec.variant === 'overlay-badge') {
                            return (
                              <div
                                key={p.id}
                                className="group relative rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
                              >
                                <div className="relative aspect-square overflow-hidden bg-slate-100">
                                  <img
                                    src={p.image_url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&auto=format&fit=crop&q=80'}
                                    alt={p.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                  {p.category && (
                                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-bold backdrop-blur-xs">
                                      {p.category}
                                    </span>
                                  )}
                                  {promoInfo && (
                                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-red-600 text-white font-black text-[10px] uppercase tracking-wider shadow-sm flex items-center gap-1">
                                      <Flame className="w-3 h-3 fill-white" />
                                      <span>-{promoInfo.percent}%</span>
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      addItem(finalItem);
                                      setIsOpen(true);
                                    }}
                                    className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform absolute top-2 right-2"
                                    title="Beli Langsung"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <div className="p-2.5 sm:p-3">
                                  <h3 className="font-bold text-xs sm:text-[13px] text-slate-900 line-clamp-2 leading-snug">
                                    {p.name}
                                  </h3>
                                  <div className="mt-1.5 flex items-center justify-between">
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
                                      <span className="text-xs sm:text-sm font-black text-blue-600">
                                        {formatIDR(p.price)}
                                      </span>
                                    )}
                                    <button
                                      onClick={() => addItem(finalItem)}
                                      className="text-[11px] font-bold text-slate-500 hover:text-blue-600 underline"
                                    >
                                      +Keranjang
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          // Default: 'standard-card' (Grid 5x Klasik Compact)
                          return (
                            <div
                              key={p.id}
                              className="rounded-2xl border border-slate-200/90 hover:border-blue-400/80 bg-white shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                            >
                              <div>
                                <div className="relative aspect-square bg-slate-100 overflow-hidden">
                                  <img
                                    src={p.image_url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&auto=format&fit=crop&q=80'}
                                    alt={p.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                  {p.category && (
                                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-[10px] font-bold text-slate-800 shadow-xs">
                                      {p.category}
                                    </span>
                                  )}
                                  {promoInfo && (
                                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-red-600 text-white font-black text-[10px] uppercase tracking-wider shadow-sm flex items-center gap-1">
                                      <Flame className="w-3 h-3 fill-white" />
                                      <span>-{promoInfo.percent}%</span>
                                    </span>
                                  )}
                                </div>

                                <div className="p-2.5 sm:p-3 space-y-1">
                                  <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                                    {p.name}
                                  </h3>
                                  <div className="flex items-center gap-1 text-amber-400">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star key={i} className="w-2.5 h-2.5 fill-amber-400" />
                                    ))}
                                  </div>
                                  <div className="pt-0.5">
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

                              <div className="p-2.5 sm:p-3 pt-0 grid grid-cols-2 gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => addItem(finalItem)}
                                  className="w-full py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10.5px] sm:text-[11px] font-bold transition-all flex items-center justify-center gap-1"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Keranjang</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    addItem(finalItem);
                                    setIsOpen(true);
                                  }}
                                  className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10.5px] sm:text-[11px] font-bold transition-all flex items-center justify-center gap-1 shadow-xs"
                                >
                                  <ShoppingBag className="w-3 h-3" />
                                  <span>Beli</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Tombol Lihat Semua Produk jika produk > 10 */}
                      {products.length > 10 && (
                        <div className="mt-8 text-center">
                          <button
                            type="button"
                            onClick={() => navigate(productsUrl)}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-blue-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:text-blue-600 font-bold text-xs shadow-xs hover:shadow-md transition-all group"
                          >
                            <span>Lihat Semua {products.length} Produk Lengkap</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </section>
            );
          }

          case 'about': {
            const tokens = resolveContrastTokens(sec.bg_color, sec.text_color_mode);
            const isDarkBg = tokens.isDark;
            if (sec.variant === 'centered-card') {
              return (
                <section id="tentang" key={sec.id} style={{ backgroundColor: sec.bg_color || undefined }} className={`py-8 sm:py-10 border-b ${tokens.borderClass}`}>
                  <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="rounded-3xl sm:rounded-[2.5rem] border border-slate-200/80 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 p-6 sm:p-10 text-center max-w-4xl mx-auto shadow-sm space-y-4">
                      <span className={theme.badgeClass}>Tentang Usaha</span>
                      <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${tokens.headingText} leading-tight`}>
                        {sec.title || `Mengenal Lebih Dekat ${website.business_name}`}
                      </h2>
                      <p className={`text-xs sm:text-sm leading-relaxed ${tokens.bodyText} max-w-2xl mx-auto whitespace-pre-line mt-1`}>
                        {sec.subtitle || website.description}
                      </p>

                      <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-left max-w-xl mx-auto">
                        {website.address && (
                          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/60 shadow-2xs flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <strong className="block text-slate-900 dark:text-white">Alamat Workshop / Toko</strong>
                              <span className={theme.textClass}>{website.address}</span>
                            </div>
                          </div>
                        )}
                        {website.operating_hours && (
                          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/60 shadow-2xs flex items-start gap-3">
                            <Clock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <strong className="block text-slate-900 dark:text-white">Jam Operasional</strong>
                              <span className={theme.textClass}>{website.operating_hours}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              );
            }

            if (sec.variant === 'minimal-accent') {
              return (
                <section id="tentang" key={sec.id} style={{ backgroundColor: sec.bg_color || undefined }} className={`py-8 sm:py-10 border-b ${tokens.borderClass}`}>
                  <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    <div className="border-l-4 border-blue-600 pl-6 sm:pl-8 space-y-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Profil Toko</span>
                      <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${tokens.headingText}`}>
                        {sec.title || `Tentang ${website.business_name}`}
                      </h2>
                      <p className={`text-xs sm:text-sm leading-relaxed ${tokens.bodyText} whitespace-pre-line mt-1`}>
                        {sec.subtitle || website.description}
                      </p>
                      {website.address && (
                        <p className={`text-xs ${tokens.bodyText} pt-2 flex items-center gap-2`}>
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span>{website.address}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </section>
              );
            }

            // Default: 'split'
            return (
              <section id="tentang" key={sec.id} style={{ backgroundColor: sec.bg_color || undefined }} className={`py-8 sm:py-10 border-b ${tokens.borderClass}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-2">
                      <span className={theme.badgeClass}>Tentang Usaha</span>
                      <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${tokens.headingText}`}>
                        {sec.title || `Mengenal Lebih Dekat ${website.business_name}`}
                      </h2>
                      <p className={`text-xs sm:text-sm leading-relaxed ${tokens.bodyText} whitespace-pre-line mt-1`}>
                        {sec.subtitle || website.description}
                      </p>
                    </div>

                    <div className="space-y-3">
                      {website.address && (
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 flex items-start gap-3.5 shadow-xs">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <strong className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Alamat Workshop / Toko Fisik</strong>
                            <span className={`text-[11px] sm:text-xs ${theme.textClass} mt-0.5 block leading-relaxed`}>{website.address}</span>
                          </div>
                        </div>
                      )}

                      {website.operating_hours && (
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 flex items-start gap-3.5 shadow-xs">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <strong className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Jam Operasional Pelayanan</strong>
                            <span className={`text-[11px] sm:text-xs ${theme.textClass} mt-0.5 block leading-relaxed`}>{website.operating_hours}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            );
          }

          case 'gallery': {
            if (galleries.length === 0) return null;
            const tokens = resolveContrastTokens(sec.bg_color, sec.text_color_mode);
            const isDarkBg = tokens.isDark;
            return (
              <section id="galeri" key={sec.id} style={{ backgroundColor: sec.bg_color || undefined }} className={`py-8 sm:py-10 border-b ${tokens.borderClass}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                  <div className="text-center max-w-2xl mx-auto mb-6">
                    <span className={theme.badgeClass}>Dokumentasi</span>
                    <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${tokens.headingText} mt-1`}>
                      {sec.title || 'Galeri Workshop & Produksi'}
                    </h2>
                    <p className={`text-xs sm:text-sm ${tokens.bodyText} mt-1`}>
                      {sec.subtitle || 'Lihat proses pengerjaan bahan berkualitas tinggi langsung di tempat kami.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {galleries.map((item) => (
                      <div
                        key={item.id}
                        className="group relative aspect-4/3 rounded-2xl overflow-hidden shadow-xs bg-slate-100 border border-slate-200/60"
                      >
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                          <span className="text-white text-xs font-semibold">{item.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          }

          case 'testimonials': {
            const tokens = resolveContrastTokens(sec.bg_color, sec.text_color_mode);
            const isDarkBg = tokens.isDark;
            if (testimonials.length === 0) {
              return (
                <section id="testimoni" key={sec.id} style={{ backgroundColor: sec.bg_color || undefined }} className={`py-8 sm:py-10 border-b ${tokens.borderClass}`}>
                  <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
                    <span className={theme.badgeClass}>Kepuasan Pembeli</span>
                    <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${tokens.headingText} mt-1`}>
                      {sec.title || 'Apa Kata Pelanggan Kami?'}
                    </h2>
                    <p className={`text-xs sm:text-sm ${tokens.bodyText} max-w-md mx-auto mt-1 mb-6`}>
                      {sec.subtitle || 'Ulasan jujur dari pelanggan setia akan ditampilkan di bagian ini.'}
                    </p>
                    <div className="p-6 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/30 inline-flex flex-col items-center gap-2 max-w-sm mx-auto">
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400" />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">Belum Ada Ulasan Pembeli</span>
                      <span className="text-[11px] text-slate-400 text-center leading-relaxed">
                        Pemilik toko dapat menambahkan testimoni pembeli melalui menu Testimoni di dashboard admin.
                      </span>
                    </div>
                  </div>
                </section>
              );
            }

            if (sec.variant === 'slider-carousel') {
              const current = testimonials[activeTestiIndex] || testimonials[0];
              return (
                <section id="testimoni" key={sec.id} style={{ backgroundColor: sec.bg_color || undefined }} className={`py-8 sm:py-10 border-b ${tokens.borderClass}`}>
                  <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
                    <span className={theme.badgeClass}>Kepuasan Pembeli</span>
                    <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${tokens.headingText} mt-1`}>
                      {sec.title || 'Apa Kata Pelanggan Kami?'}
                    </h2>
                    <p className={`text-xs sm:text-sm ${tokens.bodyText} mt-1`}>
                      {sec.subtitle || 'Ulasan jujur dari pembeli yang telah menggunakan produk kami.'}
                    </p>
                    <div className="relative py-4 px-4">
                      <Quote className="w-10 h-10 text-blue-200 dark:text-blue-900 mx-auto mb-3" />
                      <p className={`text-base sm:text-xl font-medium italic leading-relaxed max-w-2xl mx-auto ${isDarkBg ? 'text-slate-100' : 'text-slate-800'}`}>
                        "{current.feedback}"
                      </p>
                      <div className="mt-5 flex flex-col items-center gap-1.5">
                        <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-200 shadow-md">
                          {current.avatar_url ? (
                            <img src={current.avatar_url} alt={current.client_name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-black text-sm text-slate-600 flex items-center justify-center w-full h-full">{current.client_name.charAt(0)}</span>
                          )}
                        </div>
                        <h4 className={`font-bold text-xs sm:text-sm ${tokens.headingText}`}>{current.client_name}</h4>
                        <span className={`text-[11px] ${tokens.bodyText}`}>{current.role_or_company}</span>
                        <div className="flex text-amber-400 pt-0.5">
                          {Array.from({ length: current.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Next / Prev buttons */}
                    {testimonials.length > 1 && (
                      <div className="flex items-center justify-center gap-3 pt-1">
                        <button
                          onClick={() => setActiveTestiIndex((prev) => (prev > 0 ? prev - 1 : testimonials.length - 1))}
                          className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="Sebelumnya"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="flex gap-1.5">
                          {testimonials.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setActiveTestiIndex(i)}
                              className={`w-2.5 h-2.5 rounded-full transition-all ${activeTestiIndex === i ? 'bg-blue-600 w-6' : 'bg-slate-300'}`}
                            />
                          ))}
                        </div>
                        <button
                          onClick={() => setActiveTestiIndex((prev) => (prev < testimonials.length - 1 ? prev + 1 : 0))}
                          className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="Selanjutnya"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </section>
              );
            }

            if (sec.variant === 'speech-bubble') {
              return (
                <section id="testimoni" key={sec.id} style={{ backgroundColor: sec.bg_color || undefined }} className={`py-8 sm:py-10 border-b ${tokens.borderClass}`}>
                  <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center max-w-2xl mx-auto mb-6">
                      <span className={theme.badgeClass}>Kepuasan Pembeli</span>
                      <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${tokens.headingText} mt-1`}>
                        {sec.title || 'Apa Kata Pelanggan Kami?'}
                      </h2>
                      <p className={`text-xs sm:text-sm ${tokens.bodyText} mt-1`}>
                        {sec.subtitle || 'Ulasan jujur dari pembeli yang telah menggunakan produk kami.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {testimonials.map((testi) => (
                        <div key={testi.id} className="space-y-3">
                          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 shadow-xs relative">
                            <p className="text-xs sm:text-sm italic text-slate-700 dark:text-slate-300 leading-relaxed">
                              "{testi.feedback}"
                            </p>
                            <div className="absolute -bottom-2.5 left-8 w-5 h-5 bg-white dark:bg-slate-800 border-b border-r border-slate-200/80 rotate-45" />
                          </div>
                          <div className="flex items-center gap-3 pl-4 pt-1">
                            <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-200">
                              {testi.avatar_url ? (
                                <img src={testi.avatar_url} alt={testi.client_name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="font-bold text-xs flex items-center justify-center w-full h-full">{testi.client_name.charAt(0)}</span>
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-slate-900 dark:text-white">{testi.client_name}</h4>
                              <p className="text-[11px] text-slate-400">{testi.role_or_company}</p>
                            </div>
                            <div className="ml-auto flex text-amber-400">
                              {Array.from({ length: testi.rating }).map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );
            }

            // Default: 'grid-cards'
            return (
              <section id="testimoni" key={sec.id} style={{ backgroundColor: sec.bg_color || undefined }} className={`py-8 sm:py-10 border-b ${tokens.borderClass}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                  <div className="text-center max-w-2xl mx-auto mb-6">
                    <span className={theme.badgeClass}>Kepuasan Pembeli</span>
                    <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${tokens.headingText} mt-1`}>
                      {sec.title || 'Apa Kata Pelanggan Kami?'}
                    </h2>
                    <p className={`text-xs sm:text-sm ${tokens.bodyText} mt-1`}>
                      {sec.subtitle || 'Ulasan jujur dari pembeli yang telah menggunakan produk kami.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {testimonials.map((testi) => (
                      <div key={testi.id} className={`${theme.cardClass} p-5 space-y-3`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                              {testi.avatar_url ? (
                                <img
                                  src={testi.avatar_url}
                                  alt={testi.client_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="font-bold text-xs">{testi.client_name.charAt(0)}</span>
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-xs sm:text-sm">{testi.client_name}</h4>
                              <p className={`text-[11px] sm:text-xs ${theme.textClass}`}>{testi.role_or_company}</p>
                            </div>
                          </div>
                          <div className="flex text-amber-400">
                            {Array.from({ length: testi.rating }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                            ))}
                          </div>
                        </div>
                        <p className={`text-xs sm:text-sm italic leading-relaxed ${theme.textClass}`}>
                          "{testi.feedback}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          }

          case 'contact': {
            return (
              <section id="kontak" key={sec.id} style={{ backgroundColor: sec.bg_color || undefined }} className={`py-8 sm:py-10 border-b ${theme.borderClass}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                  <div className="bg-gradient-to-tr from-blue-700 to-indigo-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-3 max-w-xl">
                      <span className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded bg-blue-500/30 text-blue-200 border border-blue-400/20">
                        {sec.title || 'Hubungi Kami Langsung'}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                        Punya Pertanyaan atau Pesanan Khusus?
                      </h2>
                      <p className="text-blue-100 text-xs sm:text-sm leading-relaxed mt-1">
                        {sec.subtitle || 'Konsultasikan produk idaman Anda langsung dengan tim kami via WhatsApp. Kami siap membantu dengan senang hati.'}
                      </p>

                      <div className="pt-2 flex flex-wrap gap-4 text-xs">
                        {website.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-4 h-4" />
                            <span>{website.phone}</span>
                          </div>
                        )}
                        {website.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-4 h-4" />
                            <span>{website.email}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <a
                        href={createWhatsAppLink()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2.5 bg-white hover:bg-slate-100 text-blue-800 font-bold px-7 py-3.5 rounded-2xl shadow-lg transition-all text-sm hover:scale-105"
                      >
                        <MessageCircle className="w-5 h-5 text-emerald-600" />
                        <span>Mulai Chat WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              </section>
            );
          }

          case 'footer': {
            const tokens = resolveContrastTokens(sec.bg_color, sec.text_color_mode);
            const isDarkBg = tokens.isDark;

            if (sec.variant === 'centered') {
              return (
                <footer key={sec.id} style={{ backgroundColor: sec.bg_color || undefined }} className={`py-14 border-t ${tokens.borderClass} text-xs`}>
                  <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
                    <div className="flex flex-col items-center">
                      {website.logo_url && (
                        <img src={website.logo_url} alt={website.business_name} className="w-12 h-12 rounded-xl object-cover mb-2 border border-slate-200/50" />
                      )}
                      <div className={`font-bold text-base ${tokens.headingText}`}>{website.business_name}</div>
                      <p className={`${tokens.bodyText} text-xs mt-1 max-w-md`}>{website.tagline || 'Toko E-Commerce Resmi'}</p>
                    </div>

                    <div className={`flex flex-wrap justify-center gap-6 font-semibold ${isDarkBg ? 'text-slate-300' : 'text-slate-600'}`}>
                      <a href="#katalog" className="hover:text-blue-500 transition-colors">Katalog</a>
                      <a href="#promo" className="hover:text-blue-500 transition-colors">Promo</a>
                      <a href="#tentang" className="hover:text-blue-500 transition-colors">Tentang Kami</a>
                      <a href="#kontak" className="hover:text-blue-500 transition-colors">Kontak</a>
                    </div>

                    <div className="flex justify-center gap-3 pt-2">
                      {website.instagram && (
                        <a href={`https://instagram.com/${website.instagram}`} target="_blank" rel="noreferrer" className={`p-2 rounded-xl ${isDarkBg ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                          <InstagramIcon className="w-4 h-4" />
                        </a>
                      )}
                      {website.facebook && (
                        <a href={`https://facebook.com/${website.facebook}`} target="_blank" rel="noreferrer" className={`p-2 rounded-xl ${isDarkBg ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                          <FacebookIcon className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    <div className={`pt-4 border-t ${tokens.borderClass} ${isDarkBg ? 'text-slate-400' : 'text-slate-400'}`}>
                      © {new Date().getFullYear()} {website.business_name}. Seluruh hak cipta dilindungi undang-undang.
                    </div>
                  </div>
                </footer>
              );
            }

            if (sec.variant === 'compact-bar') {
              return (
                <footer key={sec.id} style={{ backgroundColor: sec.bg_color || undefined }} className={`py-6 border-t ${tokens.borderClass} text-xs`}>
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className={tokens.bodyText}>
                      © {new Date().getFullYear()} <strong className={tokens.headingText}>{website.business_name}</strong>. All rights reserved.
                    </span>
                    <div className="flex items-center gap-3">
                      {website.instagram && (
                        <a href={`https://instagram.com/${website.instagram}`} target="_blank" rel="noreferrer" className={`${isDarkBg ? 'text-slate-300 hover:text-white' : 'text-slate-500 hover:text-blue-600'}`}>
                          <InstagramIcon className="w-4 h-4" />
                        </a>
                      )}
                      {website.facebook && (
                        <a href={`https://facebook.com/${website.facebook}`} target="_blank" rel="noreferrer" className={`${isDarkBg ? 'text-slate-300 hover:text-white' : 'text-slate-500 hover:text-blue-600'}`}>
                          <FacebookIcon className="w-4 h-4" />
                        </a>
                      )}
                      <a
                        href={createWhatsAppLink()}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[11px]"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp CS</span>
                      </a>
                    </div>
                  </div>
                </footer>
              );
            }

            // Default: 'multi-column' (4 Kolom Komprehensif E-Commerce)
            return (
              <footer key={sec.id} style={{ backgroundColor: sec.bg_color || undefined }} className={`py-14 border-t ${tokens.borderClass} text-xs ${sec.bg_color ? '' : 'bg-slate-50/50 dark:bg-slate-900/30'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {/* Col 1: Store info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                      {website.logo_url && (
                        <img src={website.logo_url} alt={website.business_name} className="w-8 h-8 rounded-lg object-cover" />
                      )}
                      <span className={`font-extrabold text-sm ${tokens.headingText}`}>{website.business_name}</span>
                    </div>
                    <p className={`${tokens.bodyText} leading-relaxed`}>{website.tagline || website.description}</p>
                    <p className={`text-[11px] ${tokens.bodyText} opacity-75 pt-2`}>
                      © {new Date().getFullYear()} {website.business_name}. All rights reserved.
                    </p>
                  </div>

                  {/* Col 2: Quick Links & Categories */}
                  <div className="space-y-3">
                    <h4 className={`font-bold text-sm uppercase tracking-wider text-[11px] ${tokens.headingText}`}>Kategori Belanja</h4>
                    <ul className={`space-y-2 ${isDarkBg ? 'text-slate-300' : 'text-slate-600'}`}>
                      <li>
                        <a href="#katalog" onClick={() => setActiveCategory('all')} className="hover:text-blue-500 transition-colors">Semua Produk</a>
                      </li>
                      {categories.slice(0, 4).map(c => (
                        <li key={c}>
                          <a href="#katalog" onClick={() => setActiveCategory(c)} className="hover:text-blue-500 transition-colors">{c}</a>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Col 3: Operational & Payment */}
                  <div className="space-y-3">
                    <h4 className={`font-bold text-sm uppercase tracking-wider text-[11px] ${tokens.headingText}`}>Metode Pembayaran</h4>
                    <div className={`space-y-2 ${isDarkBg ? 'text-slate-300' : 'text-slate-600'}`}>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-bold text-[10px]">TRANSFER BANK</span>
                        <span className="text-[11px]">{website.bank_name || 'BCA / Mandiri'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold text-[10px]">QRIS</span>
                        <span className="text-[11px]">Semua e-Wallet</span>
                      </div>
                      {website.enable_cod && (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-bold text-[10px]">COD</span>
                          <span className="text-[11px]">Bayar di Tempat</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Col 4: Customer Help & Socials */}
                  <div className="space-y-3">
                    <h4 className={`font-bold text-sm uppercase tracking-wider text-[11px] ${tokens.headingText}`}>Layanan Pelanggan</h4>
                    <div className={`space-y-2 ${isDarkBg ? 'text-slate-300' : 'text-slate-600'}`}>
                      {website.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-blue-500" />
                          <span>{website.phone}</span>
                        </div>
                      )}
                      {website.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-blue-500" />
                          <span>{website.email}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      {website.instagram && (
                        <a
                          href={`https://instagram.com/${website.instagram}`}
                          target="_blank"
                          rel="noreferrer"
                          className={`p-2 rounded-lg ${isDarkBg ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} transition-colors`}
                        >
                          <InstagramIcon className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {website.facebook && (
                        <a
                          href={`https://facebook.com/${website.facebook}`}
                          target="_blank"
                          rel="noreferrer"
                          className={`p-2 rounded-lg ${isDarkBg ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} transition-colors`}
                        >
                          <FacebookIcon className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {website.tiktok && (
                        <a
                          href={`https://tiktok.com/@${website.tiktok}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          <Video className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </footer>
            );
          }

          default:
            return null;
        }
      });
      })()}

      {totalCount > 0 && (
        <div className="fixed bottom-6 right-6 z-40 animate-fade-in">
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-3 bg-slate-900 hover:bg-black text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 hover:scale-105 transition-all group"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-blue-400 group-hover:rotate-12 transition-transform" />
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-slate-900">
                {totalCount}
              </span>
            </div>
            <div className="text-left leading-tight">
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Keranjang</div>
              <div className="text-xs font-bold font-mono text-emerald-400">{formatIDR(totalAmount)}</div>
            </div>
          </button>
        </div>
      )}

      {/* Track Order Search Modal */}
      {isTrackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 relative text-slate-900">
            <button
              onClick={() => setIsTrackModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Lacak Status Pesanan</h3>
                <p className="text-xs text-slate-500">Cek status pembayaran & nomor resi pengiriman</p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!trackOrderInput.trim()) return;
                setIsTrackModalOpen(false);
                navigate(`/site/${subdomain}/order/${encodeURIComponent(trackOrderInput.trim())}`);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nomor Invoice Pesanan
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={trackOrderInput}
                    onChange={(e) => setTrackOrderInput(e.target.value)}
                    placeholder="Contoh: INV-260916-ea30a"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono uppercase"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Masukkan nomor invoice yang Anda dapatkan setelah melakukan pesanan.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTrackModalOpen(false)}
                  className="flex-1 py-2.5 px-4 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-indigo-600/20"
                >
                  Lacak Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CartDrawer website={website} />
    </div>
  );
};
