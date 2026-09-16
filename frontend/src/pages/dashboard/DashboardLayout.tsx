import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Sidebar } from '../../components/dashboard/Sidebar';
import { Loader2 } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, isLoading, initAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [user, isLoading, navigate, location]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm text-slate-400">Memuat sesi dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-800">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-y-auto max-h-screen">
        <Outlet />
      </main>
    </div>
  );
};
