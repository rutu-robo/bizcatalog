import React, { useState, useEffect } from 'react';
import { Header } from '../../components/dashboard/Header';
import { MediaPickerModal } from '../../components/MediaPickerModal';
import { Testimonial, GalleryItem } from '../../types';
import { api } from '../../api/client';
import {
  Quote,
  Image as ImageIcon,
  Plus,
  Trash2,
  Star,
  Loader2,
  X
} from 'lucide-react';

export const GalleryTestimonialsPage: React.FC = () => {
  const [tab, setTab] = useState<'testimonials' | 'gallery'>('testimonials');
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isTestiModalOpen, setIsTestiModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<'testimonial' | 'gallery'>('gallery');

  // Form states
  const [testiForm, setTestiForm] = useState({
    client_name: '',
    role_or_company: '',
    feedback: '',
    rating: 5,
    avatar_url: '',
  });

  const [galleryForm, setGalleryForm] = useState({
    title: '',
    image_url: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tData, gData] = await Promise.all([
        api.getTestimonials(),
        api.getGalleries(),
      ]);
      setTestimonials(Array.isArray(tData) ? tData : []);
      setGalleries(Array.isArray(gData) ? gData : []);
    } catch (e) {
      console.error('Failed to load testimonials/galleries:', e);
      setTestimonials([]);
      setGalleries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.createTestimonial(testiForm);
      setTestimonials((prev) => [...prev, created]);
      setIsTestiModalOpen(false);
      setTestiForm({
        client_name: '',
        role_or_company: '',
        feedback: '',
        rating: 5,
        avatar_url: '',
      });
    } catch (e) {
      alert('Gagal menambah testimoni');
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm('Hapus testimoni ini?')) return;
    try {
      await api.deleteTestimonial(id);
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      alert('Gagal menghapus testimoni');
    }
  };

  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.createGallery({
        ...galleryForm,
        order: galleries.length + 1,
      });
      setGalleries((prev) => [...prev, created]);
      setIsGalleryModalOpen(false);
      setGalleryForm({ title: '', image_url: '' });
    } catch (e) {
      alert('Gagal menambah foto galeri');
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!confirm('Hapus foto galeri ini?')) return;
    try {
      await api.deleteGallery(id);
      setGalleries((prev) => prev.filter((g) => g.id !== id));
    } catch (e) {
      alert('Gagal menghapus foto galeri');
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Galeri & Testimoni Pelanggan"
        description="Bangun kredibilitas usaha dengan menampilkan foto workshop produksi dan ulasan pelanggan setia."
      />

      <div className="p-8 space-y-6 max-w-6xl">
        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 gap-8 font-semibold text-sm">
          <button
            onClick={() => setTab('testimonials')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              tab === 'testimonials'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Quote className="w-4 h-4" />
            Testimoni Pelanggan ({testimonials.length})
          </button>
          <button
            onClick={() => setTab('gallery')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              tab === 'gallery'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Foto Galeri Workshop ({galleries.length})
          </button>
        </div>

        {/* Tab 1: Testimonials */}
        {tab === 'testimonials' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setIsTestiModalOpen(true)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Ulasan Testimoni</span>
              </button>
            </div>

            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-sm">Memuat data...</p>
              </div>
            ) : testimonials.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <Quote className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-800">Belum ada testimoni</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Tambahkan ulasan positif dari pembeli pertama Anda.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testimonials.map((testi) => (
                  <div
                    key={testi.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {testi.avatar_url ? (
                              <img
                                src={testi.avatar_url}
                                alt={testi.client_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="font-bold text-blue-700 text-sm">
                                {testi.client_name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{testi.client_name}</h4>
                            <p className="text-xs text-slate-500">{testi.role_or_company}</p>
                          </div>
                        </div>

                        <div className="flex text-amber-400">
                          {Array.from({ length: testi.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed italic">
                        "{testi.feedback}"
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => handleDeleteTestimonial(testi.id)}
                        className="text-slate-400 hover:text-red-600 text-xs flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Gallery */}
        {tab === 'gallery' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setIsGalleryModalOpen(true)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Foto Galeri</span>
              </button>
            </div>

            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-sm">Memuat data...</p>
              </div>
            ) : galleries.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-800">Belum ada foto galeri</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Upload dokumentasi proses pembuatan mebel atau barang kerajinan Anda.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {galleries.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs group relative flex flex-col justify-between"
                  >
                    <div className="aspect-video bg-slate-100 relative overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800 truncate">
                        {item.title}
                      </span>
                      <button
                        onClick={() => handleDeleteGallery(item.id)}
                        className="text-slate-400 hover:text-red-600 p-1"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Testimonial Form Modal */}
      {isTestiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Tambah Testimoni Pelanggan</h3>
              <button onClick={() => setIsTestiModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAddTestimonial} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Nama Klien / Pembeli</label>
                <input
                  type="text"
                  required
                  value={testiForm.client_name}
                  onChange={(e) => setTestiForm({ ...testiForm, client_name: e.target.value })}
                  placeholder="Misal: Bapak Rahmat Santoso"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Pekerjaan / Perusahaan / Asal</label>
                <input
                  type="text"
                  value={testiForm.role_or_company}
                  onChange={(e) => setTestiForm({ ...testiForm, role_or_company: e.target.value })}
                  placeholder="Misal: Cafe Kopi Senja, Bandung"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Rating Kepuasan (1-5 Bintang)</label>
                <select
                  value={testiForm.rating}
                  onChange={(e) => setTestiForm({ ...testiForm, rating: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 Bintang - Sangat Puas)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 Bintang - Puas)</option>
                  <option value={3}>⭐⭐⭐ (3 Bintang - Cukup)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Ulasan / Testimoni</label>
                <textarea
                  rows={3}
                  required
                  value={testiForm.feedback}
                  onChange={(e) => setTestiForm({ ...testiForm, feedback: e.target.value })}
                  placeholder="Tuliskan ulasan pelanggan mengenai produk Anda..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTestiModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold"
                >
                  Simpan Testimoni
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gallery Form Modal */}
      {isGalleryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Tambah Foto Galeri</h3>
              <button onClick={() => setIsGalleryModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAddGallery} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Judul / Keterangan Foto</label>
                <input
                  type="text"
                  required
                  value={galleryForm.title}
                  onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                  placeholder="Misal: Proses Finishing Kayu Jati"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Foto Gambar</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    required
                    value={galleryForm.image_url}
                    onChange={(e) => setGalleryForm({ ...galleryForm, image_url: e.target.value })}
                    placeholder="URL gambar..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setMediaTarget('gallery');
                      setIsMediaModalOpen(true);
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold whitespace-nowrap"
                  >
                    Pilih Media
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGalleryModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold"
                >
                  Simpan Foto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MediaPickerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={(url) => {
          if (mediaTarget === 'gallery') {
            setGalleryForm((prev) => ({ ...prev, image_url: url }));
          }
        }}
        title="Pilih Media Galeri"
        defaultType="gallery"
      />
    </div>
  );
};
