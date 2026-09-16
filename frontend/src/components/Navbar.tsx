import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Layers, ArrowRight, LayoutDashboard, ExternalLink } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, website } = useAuthStore();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                BizCatalog
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                SaaS
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Platform Katalog UMKM</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
            Fitur Unggulan
          </a>
          <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
            Harga & Paket
          </a>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Demo UMKM:</span>
            <Link 
              to="/site/mebeljaya" 
              target="_blank"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition-colors"
            >
              Mebel Jaya <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm hover:shadow transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard ({website?.business_name || user.name})</span>
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-700 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-md shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Mulai Gratis</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
