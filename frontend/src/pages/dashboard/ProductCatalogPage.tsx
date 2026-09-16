import React, { useState, useEffect } from 'react';
import { Header } from '../../components/dashboard/Header';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../api/client';
import { Product, Category } from '../../types';
import { MediaPickerModal } from '../../components/MediaPickerModal';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  Loader2,
  X,
  Tags,
  FolderPlus,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProductCatalogPage: React.FC = () => {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);

  // Categories list & quick category modal
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [isQuickCatModalOpen, setIsQuickCatModalOpen] = useState(false);
  const [quickCatName, setQuickCatName] = useState('');
  const [isSavingQuickCat, setIsSavingQuickCat] = useState(false);
  const [quickCatError, setQuickCatError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: 0,
    category: '',
    image_url: '',
    status: 'published' as 'published' | 'draft',
  });

  const maxProducts = user?.plan === 'free' ? 5 : user?.plan === 'pro' ? 25 : 100;
  const isAtLimit = (products || []).length >= maxProducts;

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    let result = Array.isArray(products) ? products : [];
    if (searchTerm) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (categoryFilter !== 'all') {
      result = result.filter((p) => p.category === categoryFilter);
    }
    setFilteredProducts(result);
  }, [products, searchTerm, categoryFilter]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const [data, cats] = await Promise.all([
        api.getProducts(),
        api.getCategories().catch(() => []),
      ]);
      setProducts(Array.isArray(data) ? data : []);
      setCategoriesList(Array.isArray(cats) ? cats : []);
    } catch (e) {
      console.error(e);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateQuickCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = quickCatName.trim();
    if (!trimmed) return;

    setIsSavingQuickCat(true);
    setQuickCatError(null);
    try {
      const created = await api.createCategory({ name: trimmed });
      setCategoriesList((prev) => [...prev, created]);
      setFormData((prev) => ({ ...prev, category: created.name }));
      setQuickCatName('');
      setIsQuickCatModalOpen(false);
    } catch (err: unknown) {
      setQuickCatError(err instanceof Error ? err.message : 'Gagal membuat kategori');
    } finally {
      setIsSavingQuickCat(false);
    }
  };

  const categories = Array.from(
    new Set([
      ...categoriesList.map((c) => c.name),
      ...(products || []).map((p) => p.category),
    ].filter(Boolean))
  );

  const handleOpenCreate = () => {
    if (isAtLimit) {
      setIsLimitModalOpen(true);
      return;
    }
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      price: 0,
      category: '',
      image_url: '',
      status: 'published',
    });
    setActionError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      category: p.category,
      image_url: p.image_url,
      status: p.status,
    });
    setActionError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini dari katalog?')) return;
    try {
      await api.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus produk');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setActionError(null);

    try {
      if (editingProduct) {
        const updated = await api.updateProduct(editingProduct.id, formData);
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        const created = await api.createProduct(formData);
        setProducts((prev) => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Gagal menyimpan produk');
    } finally {
      setIsSaving(false);
    }
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Katalog Produk"
        description="Kelola daftar produk, gambar, harga Rupiah, dan status tayang di website publik Anda."
      />

      <div className="p-8 space-y-6 max-w-6xl">
        {/* Quota limit progress banner */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Kuota Penggunaan Produk</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 font-mono text-slate-700">
                  {products.length} / {maxProducts} Digunakan
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Paket {user?.plan?.toUpperCase()}: Batas maksimal {maxProducts} produk.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAtLimit && (
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                Batas Kuota Tercapai
              </span>
            )}
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Produk</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama atau kategori produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Products List / Grid */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm">Memuat katalog produk...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3 stroke-[1.5]" />
            <h4 className="text-base font-bold text-slate-800">Tidak ada produk ditemukan</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Mulai tambahkan foto dan harga produk untuk memikat pembeli di website katalog Anda.
            </p>
            <button
              onClick={handleOpenCreate}
              className="mt-5 inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Produk Pertama</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-video bg-slate-100 overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                    <span
                      className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider backdrop-blur-md shadow-xs ${
                        product.status === 'published'
                          ? 'bg-emerald-500/90 text-white'
                          : 'bg-slate-700/90 text-slate-200'
                      }`}
                    >
                      {product.status === 'published' ? 'Tayang' : 'Draft'}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    {product.category && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        {product.category}
                      </span>
                    )}
                    <h3 className="font-bold text-slate-900 text-base line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {product.description || 'Tidak ada deskripsi'}
                    </p>
                    <div className="pt-2">
                      <span className="text-lg font-extrabold text-blue-700">
                        {formatIDR(product.price)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 flex items-center justify-end gap-2 border-t border-slate-100 mt-2">
                  <button
                    onClick={() => handleOpenEdit(product)}
                    className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Edit Produk"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus Produk"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Form Modal (Add / Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingProduct ? 'Edit Informasi Produk' : 'Tambah Produk Baru ke Katalog'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="mx-6 mt-4 p-3.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {actionError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-4">
              {/* Product Image */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Foto Produk
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {formData.image_url ? (
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => setIsMediaModalOpen(true)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors"
                    >
                      Pilih / Upload Foto
                    </button>
                    <p className="text-[11px] text-slate-400">
                      Format PNG, JPG, WEBP rasio 4:3 atau 1:1 disarankan.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Nama Produk
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      name: val,
                      slug: prev.slug || val.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                    }));
                  }}
                  placeholder="Misal: Meja Makan Jati Minimalis 6 Kursi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Harga Produk (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.price}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))
                    }
                    placeholder="Misal: 4850000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Kategori Produk
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setQuickCatError(null);
                        setQuickCatName('');
                        setIsQuickCatModalOpen(true);
                      }}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Tambah Kategori Baru</span>
                    </button>
                  </div>

                  {categoriesList.length > 0 ? (
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white text-slate-800"
                    >
                      <option value="">-- Pilih Kategori Produk --</option>
                      {categoriesList.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                      placeholder="Misal: Pakaian Pria, Mebel Custom"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Deskripsi Lengkap Produk
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Tuliskan spesifikasi bahan, ukuran dimensi, opsi warna, garansi, dsb..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Status Publikasi
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="published"
                      checked={formData.status === 'published'}
                      onChange={() => setFormData((prev) => ({ ...prev, status: 'published' }))}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Tayang di Website (Published)</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={formData.status === 'draft'}
                      onChange={() => setFormData((prev) => ({ ...prev, status: 'draft' }))}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Simpan Sebagai Draft</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-sm disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{editingProduct ? 'Simpan Perubahan' : 'Terbitkan Produk'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Plan Quota Limit Upgrade Modal */}
      {isLimitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Batas Kuota Produk Tercapai</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Anda sedang menggunakan paket <strong>{user?.plan?.toUpperCase()}</strong> yang memiliki batas maksimal {maxProducts} produk. Tingkatkan ke paket Pro untuk menambahkan hingga 25 produk dan membuka semua tema!
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/dashboard/settings"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all"
              >
                Upgrade ke Paket Pro Sekarang
              </Link>
              <button
                onClick={() => setIsLimitModalOpen(false)}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Nanti Saja
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Create Category Modal */}
      {isQuickCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Tags className="w-4 h-4 text-blue-600" />
                <h4 className="font-bold text-slate-900 text-sm">Tambah Kategori Baru</h4>
              </div>
              <button
                onClick={() => setIsQuickCatModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {quickCatError && (
              <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{quickCatError}</span>
              </div>
            )}

            <form onSubmit={handleCreateQuickCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Misal: Kaos Polo, Celana Chino, Sofa"
                  value={quickCatName}
                  onChange={(e) => setQuickCatName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuickCatModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-slate-500 hover:bg-slate-100 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingQuickCat}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {isSavingQuickCat ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan & Pilih</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MediaPickerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={(url) => setFormData((prev) => ({ ...prev, image_url: url }))}
        title="Pilih Gambar Produk"
        defaultType="product"
      />
    </div>
  );
};
