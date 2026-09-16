import React, { useState, useEffect } from 'react';
import { Header } from '../../components/dashboard/Header';
import { api } from '../../api/client';
import { Category, Product } from '../../types';
import {
  Tags,
  Plus,
  Edit2,
  Trash2,
  Search,
  Package,
  Loader2,
  X,
  Layers,
  FolderPlus,
  AlertCircle
} from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cats, prods] = await Promise.all([
        api.getCategories(),
        api.getProducts(),
      ]);
      setCategories(Array.isArray(cats) ? cats : []);
      setProducts(Array.isArray(prods) ? prods : []);
    } catch (e) {
      console.error('Failed to load categories', e);
      setCategories([]);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
    });
    setActionError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCategory(c);
    setFormData({
      name: c.name,
      description: c.description || '',
    });
    setActionError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (cat: Category) => {
    const productCount = products.filter(
      (p) => p.category?.toLowerCase() === cat.name.toLowerCase()
    ).length;

    let confirmMsg = `Apakah Anda yakin ingin menghapus kategori "${cat.name}"?`;
    if (productCount > 0) {
      confirmMsg += `\n\nPerhatian: Ada ${productCount} produk yang saat ini menggunakan kategori ini.`;
    }

    if (!confirm(confirmMsg)) return;

    try {
      await api.deleteCategory(cat.id);
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus kategori');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setActionError(null);

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      setActionError('Nama kategori wajib diisi');
      setIsSaving(false);
      return;
    }

    try {
      if (editingCategory) {
        const updated = await api.updateCategory(editingCategory.id, {
          name: trimmedName,
          description: formData.description.trim(),
        });
        setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        const created = await api.createCategory({
          name: trimmedName,
          description: formData.description.trim(),
        });
        setCategories((prev) => [...prev, created]);
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Gagal menyimpan kategori');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <Header
        title="Kategori Produk"
        description="Kelola kelompok dan jenis produk usaha Anda agar katalog tersusun rapi dan mudah dijelajahi pembeli."
      />

      <div className="p-8 space-y-6 max-w-6xl">
        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Total Kategori
              </span>
              <span className="text-2xl font-black text-slate-900">{categories.length}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Tags className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Produk Terkategori
              </span>
              <span className="text-2xl font-black text-emerald-600">
                {products.filter((p) => Boolean(p.category)).length}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Katalog Aktif
              </span>
              <span className="text-2xl font-black text-indigo-600">{products.length} Produk</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleOpenCreate}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kategori Baru</span>
          </button>
        </div>

        {/* Category List */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm">Memuat daftar kategori...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-lg mx-auto">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FolderPlus className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-800">
              {searchTerm ? 'Kategori Tidak Ditemukan' : 'Belum Ada Kategori'}
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              {searchTerm
                ? 'Tidak ada kategori yang cocok dengan kata kunci pencarian Anda.'
                : 'Buat kategori pertama Anda agar pembeli dapat menyaring dan menemukan produk dengan mudah di website katalog Anda.'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleOpenCreate}
                className="mt-6 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Kategori Pertama</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCategories.map((category) => {
              const productCount = products.filter(
                (p) => p.category?.toLowerCase() === category.name.toLowerCase()
              ).length;

              return (
                <div
                  key={category.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <Tags className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(category)}
                          title="Edit Kategori"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          title="Hapus Kategori"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{category.name}</h3>
                      <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                        slug: /{category.slug}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {category.description || 'Tidak ada deskripsi tambahan.'}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Total Produk</span>
                    <span className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                      <Package className="w-3.5 h-3.5 text-slate-500" />
                      {productCount} produk
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Tags className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingCategory ? 'Edit Kategori Produk' : 'Tambah Kategori Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Nama Kategori <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Pakaian Pria, Ruang Tamu, Mebel Custom"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                />
                {formData.name.trim() && (
                  <p className="text-[11px] font-mono text-slate-400 mt-1">
                    Preview slug: /{formData.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '-')}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Deskripsi Kategori (Opsional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Deskripsi singkat mengenai jenis produk pada kategori ini..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold inline-flex items-center gap-1.5 shadow-md"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{editingCategory ? 'Simpan Perubahan' : 'Buat Kategori'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
