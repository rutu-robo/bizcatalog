import React, { useState, useEffect } from 'react';
import { Header } from '../../components/dashboard/Header';
import { api } from '../../api/client';
import { Asset, AssetType } from '../../types';
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Filter,
  ExternalLink,
  Loader2,
  Copy,
  Check,
  X
} from 'lucide-react';

export const AssetLibraryPage: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedType, setSelectedType] = useState<AssetType>('product');
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadAssets();
  }, []);

  useEffect(() => {
    const list = Array.isArray(assets) ? assets : [];
    if (activeFilter === 'all') {
      setFilteredAssets(list);
    } else {
      setFilteredAssets(list.filter((a) => a.type === activeFilter));
    }
  }, [assets, activeFilter]);

  const loadAssets = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAssets();
      setAssets(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setAssets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const created = await api.uploadAsset(file, selectedType);
      setAssets((prev) => [created, ...prev]);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal mengunggah aset');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus aset ini secara permanen?')) return;
    try {
      await api.deleteAsset(id);
      setAssets((prev) => prev.filter((a) => a.id !== id));
      if (previewAsset?.id === id) setPreviewAsset(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus aset');
    }
  };

  const copyUrl = (url: string, id: string) => {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Pustaka Aset Media (Asset Library)"
        description="Pusat penyimpanan logo, foto banner hero, foto produk, dan gambar galeri usaha Anda."
      />

      <div className="p-8 space-y-6 max-w-6xl">
        {/* Upload Box */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Unggah Gambar Baru</h3>
              <p className="text-xs text-slate-500">
                Pilih jenis aset dan upload gambar beresolusi tinggi (PNG, JPG, WEBP).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as AssetType)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="product">Foto Produk</option>
              <option value="hero">Banner Hero</option>
              <option value="logo">Logo Bisnis</option>
              <option value="gallery">Galeri / Workshop</option>
              <option value="background">Background Halaman</option>
            </select>

            <label className="cursor-pointer inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all">
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengunggah...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Pilih File dari Komputer</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {[
            { id: 'all', label: 'Semua Aset' },
            { id: 'product', label: 'Produk' },
            { id: 'hero', label: 'Hero Banner' },
            { id: 'logo', label: 'Logo' },
            { id: 'gallery', label: 'Galeri' },
            { id: 'background', label: 'Background' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveFilter(item.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeFilter === item.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Assets Grid */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm">Memuat aset media...</p>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3 stroke-[1.5]" />
            <h4 className="text-base font-bold text-slate-800">Tidak ada media pada kategori ini</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Gunakan formulir di atas untuk mengunggah gambar baru ke server.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div
                  onClick={() => setPreviewAsset(asset)}
                  className="aspect-square bg-slate-100 relative overflow-hidden cursor-pointer"
                >
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur">
                    {asset.type}
                  </span>
                </div>

                <div className="p-3">
                  <div className="text-xs font-semibold text-slate-800 truncate" title={asset.name}>
                    {asset.name}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                    <button
                      onClick={() => copyUrl(asset.url, asset.id)}
                      className="hover:text-blue-600 flex items-center gap-1 transition-colors"
                      title="Salin Tautan URL"
                    >
                      {copiedId === asset.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Salin URL</span>
                    </button>
                    <button
                      onClick={() => handleDelete(asset.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                      title="Hapus Aset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Preview Modal */}
      {previewAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-2xl w-full p-4 border border-slate-800 flex flex-col gap-4 text-white">
            <div className="flex items-center justify-between px-2">
              <div>
                <h4 className="font-bold text-sm truncate">{previewAsset.name}</h4>
                <span className="text-xs text-slate-400 uppercase font-mono">{previewAsset.type}</span>
              </div>
              <button
                onClick={() => setPreviewAsset(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center">
              <img
                src={previewAsset.url}
                alt={previewAsset.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 px-2">
              <a
                href={previewAsset.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-blue-400 hover:underline"
              >
                <span>Buka di tab baru</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => handleDelete(previewAsset.id)}
                className="text-red-400 hover:text-red-300"
              >
                Hapus Aset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
