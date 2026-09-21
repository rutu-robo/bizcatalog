import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard,
  Building2,
  Package,
  ShoppingBag,
  Image as ImageIcon,
  Palette,
  Layers,
  Settings,
  ExternalLink,
  LogOut,
  Sparkles,
  Quote,
  Tags,
  BadgePercent
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { website, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Ringkasan', path: '/dashboard', icon: LayoutDashboard, end: true },
    { name: 'Pesanan Masuk', path: '/dashboard/orders', icon: ShoppingBag },
    { name: 'Profil Usaha', path: '/dashboard/company', icon: Building2 },
    { name: 'Katalog Produk', path: '/dashboard/products', icon: Package },
    { name: 'Kategori Produk', path: '/dashboard/categories', icon: Tags },
    { name: 'Promo & Kupon', path: '/dashboard/promos', icon: BadgePercent },
    { name: 'Aset Media', path: '/dashboard/assets', icon: ImageIcon },
    { name: 'Galeri & Testimoni', path: '/dashboard/gallery', icon: Quote },
    { name: 'Pilih Tema', path: '/dashboard/theme', icon: Palette },
    { name: 'Section Builder', path: '/dashboard/builder', icon: Layers },
    { name: 'Pengaturan & Akun', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              BizCatalog
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400">
                CMS
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-[140px]">
              {website?.business_name || 'Panel Admin'}
            </p>
          </div>
        </Link>
      </div>

      {/* Live Site Preview Link */}
      {website && (
        <div className="p-3 mx-3 mt-3 bg-slate-800/80 rounded-xl border border-slate-700/60 flex items-center justify-between">
          <div className="overflow-hidden">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Subdomain</div>
            <div className="text-xs font-mono text-blue-400 font-medium truncate">
              {website.subdomain}.bizcatalog.com
            </div>
          </div>
          <Link
            to={`/site/${website.subdomain}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Buka Website Publik"
            className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Subscription Card in Sidebar */}
      <div className="p-3 mx-3 mb-3 rounded-xl bg-gradient-to-br from-indigo-950/60 to-slate-800/80 border border-indigo-500/30">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] uppercase tracking-wider font-bold text-indigo-300 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" /> Paket {user?.plan?.toUpperCase()}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-tight mb-2">
          {user?.plan === 'free' 
            ? 'Batas 5 produk & 1 tema.' 
            : user?.plan === 'pro' 
            ? 'Batas 25 produk & 5 tema aktif.' 
            : 'Akses tanpa batas 100 produk.'}
        </p>
        <Link
          to="/dashboard/settings"
          className="block text-center text-xs font-semibold py-1 px-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
        >
          Kelola Langganan
        </Link>
      </div>

      {/* User Footer & Logout */}
      <div className="p-4 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-white">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-medium text-white truncate max-w-[110px]">{user?.name}</div>
            <div className="text-[10px] text-slate-400 truncate max-w-[110px]">{user?.email}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Keluar"
          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
