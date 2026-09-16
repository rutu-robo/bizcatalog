export interface ThemeConfig {
  id: 'minimalist' | 'solid' | 'industrial' | 'formal' | 'lifestyle';
  name: string;
  tagline: string;
  previewColor: string;
  isProOnly: boolean;
  fontFamily: string;
  bgClass: string;
  textClass: string;
  cardClass: string;
  buttonPrimary: string;
  buttonSecondary: string;
  badgeClass: string;
  borderClass: string;
  headingClass: string;
  accentClass: string;
}

export const THEMES: Record<string, ThemeConfig> = {
  minimalist: {
    id: 'minimalist',
    name: 'Minimalist Clean',
    tagline: 'Desain bersih, monokromatik modern, tipografi lapang dengan fokus utama ke produk.',
    previewColor: '#0f172a',
    isProOnly: false,
    fontFamily: 'font-sans',
    bgClass: 'bg-white text-slate-800',
    textClass: 'text-slate-600',
    cardClass: 'bg-white border border-slate-200 hover:border-slate-400 transition-all shadow-sm rounded-xl',
    buttonPrimary: 'bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm hover:shadow',
    buttonSecondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 px-5 py-2.5 rounded-lg font-medium transition-all border border-slate-300',
    badgeClass: 'bg-slate-100 text-slate-800 border border-slate-200 rounded-full px-3 py-0.5 text-xs font-medium',
    borderClass: 'border-slate-200',
    headingClass: 'font-bold text-slate-900 tracking-tight',
    accentClass: 'text-slate-900',
  },
  solid: {
    id: 'solid',
    name: 'Solid Vibrant',
    tagline: 'Warna tegas penuh energi, kartu bergradasi solid, kontras tinggi dan eye-catching.',
    previewColor: '#2563eb',
    isProOnly: true,
    fontFamily: 'font-sans',
    bgClass: 'bg-slate-50 text-slate-900',
    textClass: 'text-slate-600',
    cardClass: 'bg-white border-2 border-blue-500/20 hover:border-blue-600 shadow-md hover:shadow-xl transition-all rounded-2xl overflow-hidden',
    buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all',
    buttonSecondary: 'bg-white hover:bg-blue-50 text-blue-700 px-6 py-3 rounded-xl font-semibold border-2 border-blue-200 hover:border-blue-400 transition-all',
    badgeClass: 'bg-blue-50 text-blue-700 border border-blue-200 rounded-lg px-3 py-1 text-xs font-semibold uppercase tracking-wider',
    borderClass: 'border-blue-100',
    headingClass: 'font-extrabold text-slate-900 tracking-tight',
    accentClass: 'text-blue-600',
  },
  industrial: {
    id: 'industrial',
    name: 'Industrial Dark',
    tagline: 'Nuansa graphite dark mode, aksen kuning amber teknis, presisi tinggi untuk bengkel, teknik & pabrikan.',
    previewColor: '#f59e0b',
    isProOnly: true,
    fontFamily: 'font-mono',
    bgClass: 'bg-neutral-950 text-neutral-200',
    textClass: 'text-neutral-400',
    cardClass: 'bg-neutral-900 border border-neutral-800 hover:border-amber-500/60 shadow-lg rounded-none transition-all',
    buttonPrimary: 'bg-amber-500 hover:bg-amber-400 text-neutral-950 px-5 py-2.5 rounded-none font-bold uppercase tracking-wider transition-all',
    buttonSecondary: 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-5 py-2.5 rounded-none border border-neutral-700 uppercase tracking-wider transition-all',
    badgeClass: 'bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-none px-2.5 py-0.5 text-xs font-mono font-bold tracking-wider',
    borderClass: 'border-neutral-800',
    headingClass: 'font-mono font-bold text-white tracking-wider uppercase',
    accentClass: 'text-amber-400',
  },
  formal: {
    id: 'formal',
    name: 'Formal Luxury',
    tagline: 'Tipografi serif klasik elegan, aksen navy emerald & emas untuk butik eksklusif dan layanan premium.',
    previewColor: '#064e3b',
    isProOnly: true,
    fontFamily: 'font-serif',
    bgClass: 'bg-[#faf8f5] text-[#1c1917]',
    textClass: 'text-stone-600',
    cardClass: 'bg-white border border-amber-200/60 shadow-sm hover:shadow-md transition-all rounded-lg',
    buttonPrimary: 'bg-[#064e3b] hover:bg-[#022c22] text-[#fef3c7] px-6 py-2.5 rounded-md font-serif font-medium tracking-wide shadow transition-all',
    buttonSecondary: 'bg-transparent hover:bg-stone-100 text-[#064e3b] px-6 py-2.5 rounded-md border border-[#064e3b]/30 font-serif transition-all',
    badgeClass: 'bg-amber-50 text-amber-900 border border-amber-200 rounded-md px-3 py-0.5 text-xs font-serif italic',
    borderClass: 'border-amber-100',
    headingClass: 'font-serif font-semibold text-[#1c1917]',
    accentClass: 'text-[#064e3b]',
  },
  lifestyle: {
    id: 'lifestyle',
    name: 'Lifestyle Aesthetic',
    tagline: 'Warna hangat terracotta & cream, sudut melengkung lembut (pill), estetik untuk cafe, fashion, dan bakery.',
    previewColor: '#ea580c',
    isProOnly: true,
    fontFamily: 'font-sans',
    bgClass: 'bg-[#fcfaf7] text-stone-800',
    textClass: 'text-stone-600',
    cardClass: 'bg-white border border-orange-100 hover:border-orange-300 shadow-sm hover:shadow-md rounded-3xl p-2 transition-all',
    buttonPrimary: 'bg-[#ea580c] hover:bg-[#c2410c] text-white px-7 py-3 rounded-full font-medium shadow-md shadow-orange-500/20 hover:scale-105 transition-all',
    buttonSecondary: 'bg-orange-50 hover:bg-orange-100 text-orange-900 px-6 py-2.5 rounded-full font-medium border border-orange-200 transition-all',
    badgeClass: 'bg-orange-50 text-orange-700 border border-orange-200 rounded-full px-4 py-1 text-xs font-medium',
    borderClass: 'border-orange-100',
    headingClass: 'font-bold text-stone-900 tracking-tight',
    accentClass: 'text-[#ea580c]',
  },
};
