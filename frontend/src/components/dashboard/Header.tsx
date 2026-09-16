import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { ExternalLink, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  title: string;
  description?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, description }) => {
  const { website, user } = useAuthStore();

  return (
    <div className="bg-white border-b border-slate-200 px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Plan Indicator */}
        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-slate-600">Paket:</span>
          <span className="font-bold text-slate-900 uppercase">{user?.plan || 'FREE'}</span>
          {user?.plan === 'free' && (
            <Link
              to="/dashboard/settings"
              className="ml-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 underline"
            >
              Upgrade
            </Link>
          )}
        </div>

        {/* Public Website Preview */}
        {website && (
          <Link
            to={`/site/${website.subdomain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-xl border border-blue-200 transition-colors"
          >
            <span>Lihat Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
};
