import React, { useState } from 'react';
import { Header } from '../../components/dashboard/Header';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../api/client';
import { UserPlan } from '../../types';
import {
  Settings,
  Sparkles,
  CheckCircle2,
  Shield,
  Loader2,
  CreditCard
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isSwitchingPlan, setIsSwitchingPlan] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMsg(null);
    try {
      const res = await api.updateProfile({ name });
      updateUser(res.user);
      setMsg('Nama profil berhasil diperbarui!');
      setTimeout(() => setMsg(null), 3000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal memperbarui profil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSwitchPlan = async (targetPlan: UserPlan) => {
    if (targetPlan === user?.plan) return;
    setIsSwitchingPlan(true);
    setMsg(null);
    try {
      const res = await api.updateProfile({ plan: targetPlan });
      updateUser(res.user);
      setMsg(`Paket berhasil diubah menjadi ${targetPlan.toUpperCase()}! Kuota dan akses tema telah disesuaikan.`);
      setTimeout(() => setMsg(null), 4000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal mengubah paket');
    } finally {
      setIsSwitchingPlan(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Pengaturan Akun & Langganan"
        description="Kelola profil akun dan uji coba pergantian paket langganan (Free, Pro, Ultimate)."
      />

      <div className="p-8 space-y-8 max-w-4xl">
        {msg && (
          <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 flex items-center gap-2 text-sm font-medium animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{msg}</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Settings className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">Profil Pengguna</h3>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Alamat Email (Login)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-sm text-slate-500 cursor-not-allowed"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Email terikat dengan database multi-tenant Anda.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm transition-all"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Perubahan Profil</span>
              )}
            </button>
          </form>
        </div>

        {/* Subscription Plan Switcher Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Paket Langganan Aktif: <span className="text-indigo-600 uppercase">{user?.plan}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Uji coba instan batasan kuota produk dan akses tema langsung dari switcher di bawah.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Free */}
            <div
              className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                user?.plan === 'free'
                  ? 'border-blue-600 bg-blue-50/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">Paket Free</span>
                  {user?.plan === 'free' && (
                    <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                      Aktif
                    </span>
                  )}
                </div>
                <div className="my-3">
                  <span className="text-2xl font-black text-slate-900">Rp 0</span>
                </div>
                <ul className="text-xs text-slate-600 space-y-2 mb-4">
                  <li>• Maksimal 5 Produk</li>
                  <li>• Tema Minimalist Saja</li>
                  <li>• 1 Website Bisnis</li>
                </ul>
              </div>
              <button
                onClick={() => handleSwitchPlan('free')}
                disabled={user?.plan === 'free' || isSwitchingPlan}
                className={`w-full py-2 rounded-xl text-xs font-semibold transition-all ${
                  user?.plan === 'free'
                    ? 'bg-slate-100 text-slate-400 cursor-default'
                    : 'bg-slate-900 hover:bg-black text-white'
                }`}
              >
                Gunakan Free
              </button>
            </div>

            {/* Pro */}
            <div
              className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between relative ${
                user?.plan === 'pro'
                  ? 'border-blue-600 bg-blue-50/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="absolute -top-3 right-4 bg-blue-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                Rekomendasi
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">Paket Pro</span>
                  {user?.plan === 'pro' && (
                    <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                      Aktif
                    </span>
                  )}
                </div>
                <div className="my-3">
                  <span className="text-2xl font-black text-slate-900">Rp 49.000</span>
                  <span className="text-xs text-slate-400">/bln</span>
                </div>
                <ul className="text-xs text-slate-600 space-y-2 mb-4">
                  <li>• Hingga 25 Produk</li>
                  <li>• Buka Semua 5 Tema</li>
                  <li>• Galeri & Testimoni</li>
                </ul>
              </div>
              <button
                onClick={() => handleSwitchPlan('pro')}
                disabled={user?.plan === 'pro' || isSwitchingPlan}
                className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                  user?.plan === 'pro'
                    ? 'bg-blue-100 text-blue-700 cursor-default'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                }`}
              >
                Gunakan Pro
              </button>
            </div>

            {/* Ultimate */}
            <div
              className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                user?.plan === 'ultimate'
                  ? 'border-blue-600 bg-blue-50/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">Paket Ultimate</span>
                  {user?.plan === 'ultimate' && (
                    <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                      Aktif
                    </span>
                  )}
                </div>
                <div className="my-3">
                  <span className="text-2xl font-black text-slate-900">Rp 99.000</span>
                  <span className="text-xs text-slate-400">/bln</span>
                </div>
                <ul className="text-xs text-slate-600 space-y-2 mb-4">
                  <li>• Hingga 100 Produk</li>
                  <li>• Semua Tema & Fitur</li>
                  <li>• Multi-User Admin</li>
                </ul>
              </div>
              <button
                onClick={() => handleSwitchPlan('ultimate')}
                disabled={user?.plan === 'ultimate' || isSwitchingPlan}
                className={`w-full py-2 rounded-xl text-xs font-semibold transition-all ${
                  user?.plan === 'ultimate'
                    ? 'bg-slate-100 text-slate-400 cursor-default'
                    : 'bg-slate-900 hover:bg-black text-white'
                }`}
              >
                Gunakan Ultimate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
