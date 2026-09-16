import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                BizCatalog Builder
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Platform SaaS multi-tenant untuk UMKM Indonesia membuat website katalog bisnis profesional dan responsif dalam waktu kurang dari 15 menit tanpa pemahaman coding.
            </p>
          </div>

          {/* Nav Col */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Navigasi</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-white transition-colors">Fitur Platform</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Paket Harga</a></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Login Akun</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Daftar Akun Baru</Link></li>
            </ul>
          </div>

          {/* Demo Col */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Demo Website</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/site/mebeljaya" target="_blank" className="hover:text-blue-400 transition-colors">
                  Mebel Jaya Abadi (Solid)
                </Link>
              </li>
              <li>
                <span className="text-xs text-slate-500">Live dynamic generated render</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} BizCatalog Builder. Hak Cipta Dilindungi.</p>
          <p className="flex items-center gap-1">
            Dibangun dengan <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> untuk kemajuan UMKM Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
};
