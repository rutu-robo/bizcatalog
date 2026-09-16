import React, { useState, useEffect } from 'react';
import { Header } from '../../components/dashboard/Header';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../api/client';
import { MediaPickerModal } from '../../components/MediaPickerModal';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Video,
  Clock,
  CheckCircle2,
  Loader2,
  Image as ImageIcon,
  CreditCard,
  QrCode
} from 'lucide-react';
import { InstagramIcon, FacebookIcon } from '../../components/Icons';

export const CompanyProfilePage: React.FC = () => {
  const { website, updateWebsite } = useAuthStore();
  const [formData, setFormData] = useState({
    business_name: '',
    tagline: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    whatsapp: '',
    instagram: '',
    facebook: '',
    tiktok: '',
    logo_url: '',
    operating_hours: '',
    bank_name: '',
    bank_account_no: '',
    bank_account_name: '',
    qris_image_url: '',
    enable_cod: true,
    enable_bank_transfer: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  useEffect(() => {
    if (website) {
      setFormData({
        business_name: website.business_name || '',
        tagline: website.tagline || '',
        description: website.description || '',
        address: website.address || '',
        phone: website.phone || '',
        email: website.email || '',
        whatsapp: website.whatsapp || '',
        instagram: website.instagram || '',
        facebook: website.facebook || '',
        tiktok: website.tiktok || '',
        logo_url: website.logo_url || '',
        operating_hours: website.operating_hours || '',
        bank_name: website.bank_name || '',
        bank_account_no: website.bank_account_no || '',
        bank_account_name: website.bank_account_name || '',
        qris_image_url: website.qris_image_url || '',
        enable_cod: website.enable_cod ?? true,
        enable_bank_transfer: website.enable_bank_transfer ?? true,
      });
    }
  }, [website]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const updated = await api.updateMyWebsite(formData);
      updateWebsite(updated);
      setSuccessMsg('Profil usaha berhasil diperbarui dan disinkronkan ke website publik!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menyimpan profil usaha');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Profil Usaha (Company Profile)"
        description="Kelola informasi identitas, kontak WhatsApp, alamat, dan media sosial bisnis Anda."
      />

      <div className="p-8 max-w-4xl space-y-6">
        {successMsg && (
          <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 flex items-center gap-2 text-sm font-medium animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-red-50 text-red-800 rounded-2xl border border-red-200 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo & Basic Info Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-base">Identitas Bisnis</h3>
            </div>

            {/* Logo Picker */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Logo Usaha
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
                  {formData.logo_url ? (
                    <img
                      src={formData.logo_url}
                      alt="Logo Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-300" />
                  )}
                </div>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setIsMediaModalOpen(true)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Pilih / Unggah Logo
                  </button>
                  <p className="text-[11px] text-slate-400">
                    Format PNG, JPG, atau SVG persegi disarankan.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Nama Bisnis / Brand
                </label>
                <input
                  type="text"
                  required
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Slogan / Tagline
                </label>
                <input
                  type="text"
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                  placeholder="Misal: Spesialis Mebel Jati Kualitas Ekspor"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Deskripsi Singkat Profil Bisnis
              </label>
              <textarea
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Ceritakan sejarah singkat, keunggulan bahan baku, atau visi usaha Anda..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Contact & WhatsApp Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <MessageCircle className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-base">Kontak WhatsApp & Pemesanan</h3>
                <p className="text-xs text-slate-400">
                  Nomor ini akan menjadi tujuan tombol "Beli via WhatsApp" pada setiap produk.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Nomor WhatsApp Bisnis (Wajib dengan kode 62)
                </label>
                <input
                  type="text"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder="Misal: 6281234567890"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  Nomor Telepon Kantor / Hotline
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+62 812-3456-7890"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  Email Bisnis
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="kontak@usahaanda.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Jam Operasional
                </label>
                <input
                  type="text"
                  name="operating_hours"
                  value={formData.operating_hours}
                  onChange={handleChange}
                  placeholder="Senin - Sabtu: 08:00 - 17:00 WIB"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                Alamat Fisik Workshop / Toko
              </label>
              <textarea
                rows={2}
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Jl. Pemuda No. 45, Jepara, Jawa Tengah..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Social Media Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <InstagramIcon className="w-5 h-5 text-pink-600" />
              <h3 className="font-bold text-slate-900 text-base">Media Sosial</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                  <InstagramIcon className="w-3.5 h-3.5 text-pink-600" />
                  Instagram
                </label>
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="username_ig"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                  <FacebookIcon className="w-3.5 h-3.5 text-blue-600" />
                  Facebook Page
                </label>
                <input
                  type="text"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleChange}
                  placeholder="nama_halaman"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                  <Video className="w-3.5 h-3.5 text-slate-700" />
                  TikTok
                </label>
                <input
                  type="text"
                  name="tiktok"
                  value={formData.tiktok}
                  onChange={handleChange}
                  placeholder="@username_tiktok"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Payment & Bank Account Settings Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Pengaturan Pembayaran & Rekening Toko (E-Commerce)
                </h3>
                <p className="text-xs text-slate-500">
                  Data rekening dan QRIS ini akan otomatis tampil saat pembeli melakukan checkout langsung di website toko Anda.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Nama Bank
                </label>
                <input
                  type="text"
                  name="bank_name"
                  value={formData.bank_name}
                  onChange={handleChange}
                  placeholder="Misal: Bank Central Asia (BCA)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Nomor Rekening
                </label>
                <input
                  type="text"
                  name="bank_account_no"
                  value={formData.bank_account_no}
                  onChange={handleChange}
                  placeholder="Misal: 8830-1928-41"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Atas Nama Pemilik Rekening
                </label>
                <input
                  type="text"
                  name="bank_account_name"
                  value={formData.bank_account_name}
                  onChange={handleChange}
                  placeholder="Misal: Mebel Jaya Abadi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                URL Kode QRIS Toko (Opsional)
              </label>
              <input
                type="text"
                name="qris_image_url"
                value={formData.qris_image_url}
                onChange={handleChange}
                placeholder="https://... URL gambar QRIS toko Anda"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Bisa menggunakan URL gambar QRIS dari Pustaka Aset Anda atau QR dinamis.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-6">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="enable_bank_transfer"
                  checked={formData.enable_bank_transfer}
                  onChange={(e) =>
                    setFormData({ ...formData, enable_bank_transfer: e.target.checked })
                  }
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold text-slate-700">
                  Aktifkan Pembayaran Transfer Bank Manual
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="enable_cod"
                  checked={formData.enable_cod}
                  onChange={(e) => setFormData({ ...formData, enable_cod: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold text-slate-700">
                  Aktifkan Pembayaran di Tempat (COD)
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3 rounded-2xl shadow-lg shadow-blue-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all text-sm disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Perubahan...</span>
                </>
              ) : (
                <span>Simpan Profil Usaha</span>
              )}
            </button>
          </div>
        </form>
      </div>

      <MediaPickerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={(url) => setFormData((prev) => ({ ...prev, logo_url: url }))}
        title="Pilih atau Unggah Logo Usaha"
        defaultType="logo"
      />
    </div>
  );
};
