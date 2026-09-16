import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Asset } from '../types';
import { X, Upload, Image as ImageIcon, Link as LinkIcon, Check, Loader2 } from 'lucide-react';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  title?: string;
  defaultType?: string;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  title = 'Pilih Media Gambar',
  defaultType = 'product',
}) => {
  const [tab, setTab] = useState<'library' | 'upload' | 'url'>('library');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [directUrl, setDirectUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAssets();
    }
  }, [isOpen]);

  const loadAssets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getAssets();
      setAssets(Array.isArray(data) ? data : []);
    } catch {
      setError('Gagal memuat pustaka media');
      setAssets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      const newAsset = await api.uploadAsset(file, defaultType);
      setAssets((prev) => [newAsset, ...prev]);
      onSelect(newAsset.url);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal mengunggah gambar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDirectUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directUrl.trim()) return;
    onSelect(directUrl.trim());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-lg">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 gap-6 bg-slate-50 text-sm font-semibold">
          <button
            onClick={() => setTab('library')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
              tab === 'library'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Pustaka Media ({assets.length})
          </button>
          <button
            onClick={() => setTab('upload')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
              tab === 'upload'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            Unggah File Baru
          </button>
          <button
            onClick={() => setTab('url')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
              tab === 'url'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            Tautan URL Gambar
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
            {error}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {tab === 'library' && (
            <div>
              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
                  <p className="text-sm">Memuat aset media...</p>
                </div>
              ) : assets.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 stroke-[1.5] text-slate-300" />
                  <p className="text-sm font-medium text-slate-600">Belum ada media di pustaka</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Silakan beralih ke tab 'Unggah File' atau 'Tautan URL'.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {assets.map((asset) => (
                    <div
                      key={asset.id}
                      onClick={() => {
                        onSelect(asset.url);
                        onClose();
                      }}
                      className="group relative aspect-square rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:border-blue-600 hover:shadow-md transition-all bg-slate-100"
                    >
                      <img
                        src={asset.url}
                        alt={asset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/20 transition-colors flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow">
                          <Check className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-slate-900/70 p-1 text-[10px] text-white truncate px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {asset.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'upload' && (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl p-10 bg-slate-50 hover:bg-slate-100/60 transition-colors cursor-pointer relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {isUploading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <p className="text-sm font-semibold text-slate-700">Sedang mengunggah media...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">
                    Klik atau tarik file gambar ke sini
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Mendukung format PNG, JPG, JPEG, WEBP (Maksimal 10MB)
                  </p>
                </div>
              )}
            </div>
          )}

          {tab === 'url' && (
            <form onSubmit={handleDirectUrlSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Tautan Langsung Gambar (URL)
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={directUrl}
                  onChange={(e) => setDirectUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Masukkan link gambar dari internet (misal: Unsplash, Pexels, atau hosting Anda).
                </p>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-all shadow"
              >
                Gunakan URL Ini
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
