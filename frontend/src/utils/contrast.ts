/**
 * Smart Contrast Utility (WCAG 2.1 Compliant)
 * Memastikan teks dan elemen UI selalu memiliki rasio kontras tinggi dan terbaca jelas
 * apapun warna latar belakang atau foto banner yang dipilih pengguna.
 */

/**
 * Menghitung Relative Luminance standar WCAG 2.1 untuk warna Hex
 * Nilai 0.0 (Hitam pekat) hingga 1.0 (Putih murni)
 */
export const getRelativeLuminance = (hex?: string): number => {
  if (!hex || typeof hex !== 'string') return 1; // default putih (terang)

  const cleanHex = hex.replace('#', '').trim();
  let r = 255;
  let g = 255;
  let b = 255;

  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  } else {
    return 1;
  }

  if (isNaN(r) || isNaN(g) || isNaN(b)) return 1;

  // Gamma correction sRGB
  const toLinear = (val: number) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };

  const R = toLinear(r);
  const G = toLinear(g);
  const B = toLinear(b);

  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
};

/**
 * Mendeteksi apakah warna hex tergolong gelap (membutuhkan teks putih/terang)
 * Threshold: L < 0.42 (memberi margin aman bagi warna jenuh seperti merah/biru tua/cokelat)
 */
export const isColorDark = (hex?: string): boolean => {
  if (!hex) return false;
  return getRelativeLuminance(hex) < 0.42;
};

export interface ContrastThemeTokens {
  isDark: boolean;
  headingText: string;
  bodyText: string;
  mutedText: string;
  borderClass: string;
  cardBg: string;
  cardInnerHeading: string;
  cardInnerBody: string;
  buttonSecondary: string;
  badgeBg: string;
}

/**
 * Menghasilkan token styling adaptif untuk section berdasarkan warna background,
 * mode kontras teks manual (auto, light, dark), serta keberadaan background image.
 */
export const resolveContrastTokens = (
  bgColor?: string,
  textColorMode?: 'auto' | 'light' | 'dark',
  hasDarkBgImage?: boolean
): ContrastThemeTokens => {
  let isDark = false;

  if (textColorMode === 'light') {
    isDark = true; // Paksa teks terang (untuk latar pekat)
  } else if (textColorMode === 'dark') {
    isDark = false; // Paksa teks gelap (untuk latar terang)
  } else {
    // Mode Auto: deteksi otomatis
    if (hasDarkBgImage) {
      isDark = true;
    } else {
      isDark = isColorDark(bgColor);
    }
  }

  if (isDark) {
    return {
      isDark: true,
      headingText: 'text-white',
      bodyText: 'text-slate-200',
      mutedText: 'text-slate-400',
      borderClass: 'border-white/15',
      // Card di dalam section gelap: semi-transparent glassmorphism gelap
      cardBg: 'bg-white/10 backdrop-blur-md border border-white/15 text-white shadow-lg',
      cardInnerHeading: 'text-white',
      cardInnerBody: 'text-slate-300',
      buttonSecondary: 'bg-white/15 hover:bg-white/25 text-white border border-white/20',
      badgeBg: 'bg-white/15 text-white border border-white/20',
    };
  }

  return {
    isDark: false,
    headingText: 'text-slate-900',
    bodyText: 'text-slate-600',
    mutedText: 'text-slate-400',
    borderClass: 'border-slate-200/80',
    // Card di dalam section terang: clean solid white card
    cardBg: 'bg-white border border-slate-200/80 text-slate-900 shadow-xs',
    cardInnerHeading: 'text-slate-900',
    cardInnerBody: 'text-slate-500',
    buttonSecondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80',
    badgeBg: 'bg-slate-100 text-slate-700 border border-slate-200/60',
  };
};
