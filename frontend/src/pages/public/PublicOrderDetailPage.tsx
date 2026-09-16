import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Order, Website } from '../../types';
import {
  CheckCircle2,
  Clock,
  Truck,
  Copy,
  Check,
  Upload,
  ArrowLeft,
  Printer,
  MessageCircle,
  Package,
  CreditCard,
  QrCode,
  AlertCircle,
  MapPin,
  Calendar,
  FileCheck2,
} from 'lucide-react';

const formatIDR = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val);
};

export const PublicOrderDetailPage: React.FC = () => {
  const { subdomain, orderNumber } = useParams<{ subdomain: string; orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [website, setWebsite] = useState<Website | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Payment proof upload state
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [copiedBank, setCopiedBank] = useState(false);
  const [copiedResi, setCopiedResi] = useState(false);

  const fetchOrder = async () => {
    if (!subdomain || !orderNumber) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.getPublicOrderByNumber(subdomain, orderNumber);
      setOrder(res.order);
      setWebsite(res.website);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Pesanan tidak ditemukan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [subdomain, orderNumber]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProofFile(file);
      setProofPreview(URL.createObjectURL(file));
      setUploadSuccess(null);
    }
  };

  const handleUploadProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofFile || !subdomain || !orderNumber) return;

    setIsUploading(true);
    setUploadSuccess(null);
    try {
      const res = await api.uploadPaymentProof(subdomain, orderNumber, proofFile);
      setOrder(res.order);
      setUploadSuccess('Bukti pembayaran berhasil diunggah! Penjual akan segera memverifikasi pesanan Anda.');
      setProofFile(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal mengunggah bukti pembayaran');
    } finally {
      setIsUploading(false);
    }
  };

  const handleQuickConfirm = async () => {
    if (!subdomain || !orderNumber) return;
    setIsUploading(true);
    try {
      const res = await api.confirmPublicPayment(subdomain, orderNumber);
      setOrder(res.order);
      setUploadSuccess('Konfirmasi pembayaran terkirim! Penjual akan segera memproses pesanan Anda.');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal konfirmasi pembayaran');
    } finally {
      setIsUploading(false);
    }
  };

  const copyBankNumber = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const copyResi = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedResi(true);
    setTimeout(() => setCopiedResi(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 font-medium">Memuat detail pesanan...</p>
        </div>
      </div>
    );
  }

  if (error || !order || !website) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 text-center shadow-xl space-y-4">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Pesanan Tidak Ditemukan</h2>
          <p className="text-sm text-slate-600">
            {error || 'Nomor invoice pesanan yang Anda cari tidak terdaftar pada toko ini.'}
          </p>
          <Link
            to={`/site/${subdomain}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Toko
          </Link>
        </div>
      </div>
    );
  }

  // Stepper Calculation
  const isPaid = order.payment_status === 'paid';
  const isWaitingVerification = order.payment_status === 'waiting_verification';
  const isProcessing = order.status === 'processing';
  const isShipped = !!order.tracking_number;
  const isCompleted = order.status === 'completed';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      {/* Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs print:hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            to={`/site/${subdomain}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Katalog</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Nota</span>
            </button>
            <a
              href={`https://wa.me/${(website.whatsapp || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                `Halo ${website.business_name}, saya ingin menanyakan status pesanan saya dengan nomor invoice *${order.order_number}*.`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition border border-emerald-200"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Tanya Toko</span>
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {/* Invoice Summary Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                  Pesanan Resmi
                </span>
                <span className="text-xs text-slate-600 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(order.created_at).toLocaleString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {order.order_number}
              </h1>
              <p className="text-sm text-slate-600 mt-0.5">
                Toko: <span className="font-semibold text-slate-900">{website.business_name}</span>
              </p>
            </div>

            <div className="sm:text-right">
              <span className="text-xs font-medium text-slate-600 block">Total Tagihan</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600">
                {formatIDR(order.total_amount)}
              </span>
              <div className="mt-1 flex items-center sm:justify-end gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    isPaid
                      ? 'bg-emerald-100 text-emerald-800'
                      : isWaitingVerification
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {isPaid ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" /> Lunas
                    </>
                  ) : isWaitingVerification ? (
                    <>
                      <Clock className="w-3 h-3" /> Menunggu Verifikasi
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3" /> Belum Dibayar
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Stepper Visual */}
          <div className="pt-6">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-4">
              Status Perjalanan Pesanan
            </h3>
            <div className="grid grid-cols-4 gap-2 text-center relative">
              {/* Progress Line */}
              <div className="absolute top-4 left-[12%] right-[12%] h-1 bg-slate-100 -z-0">
                <div
                  className="h-full bg-indigo-600 transition-all duration-500"
                  style={{
                    width: isCompleted
                      ? '100%'
                      : isShipped
                      ? '75%'
                      : isProcessing || isPaid || isWaitingVerification
                      ? '50%'
                      : '15%',
                  }}
                />
              </div>

              {/* Step 1 */}
              <div className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    order.created_at
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  1
                </div>
                <span className="text-xs font-semibold mt-2 text-slate-800">Dibuat</span>
                <span className="text-[10px] text-slate-600 hidden sm:block">Pesanan Diterima</span>
              </div>

              {/* Step 2 */}
              <div className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    isPaid || isWaitingVerification
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  2
                </div>
                <span className="text-xs font-semibold mt-2 text-slate-800">Pembayaran</span>
                <span className="text-[10px] text-slate-600 hidden sm:block">
                  {isPaid ? 'Lunas' : isWaitingVerification ? 'Diverifikasi' : 'Menunggu'}
                </span>
              </div>

              {/* Step 3 */}
              <div className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    isProcessing || isShipped || isCompleted
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  3
                </div>
                <span className="text-xs font-semibold mt-2 text-slate-800">Diproses</span>
                <span className="text-[10px] text-slate-600 hidden sm:block">Sedang Disiapkan</span>
              </div>

              {/* Step 4 */}
              <div className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isShipped
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : 4}
                </div>
                <span className="text-xs font-semibold mt-2 text-slate-800">Pengiriman</span>
                <span className="text-[10px] text-slate-600 hidden sm:block">
                  {isCompleted ? 'Pesanan Selesai' : isShipped ? 'Dalam Perjalanan' : 'Menunggu Resi'}
                </span>
              </div>
            </div>

            {/* Tracking banner if shipped */}
            {order.tracking_number && (
              <div className="mt-6 p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-indigo-700 font-semibold uppercase tracking-wider">
                      Nomor Resi / Kurir Pengiriman
                    </div>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>{order.shipping_courier || 'Ekspedisi'}:</span>
                      <span className="font-mono text-indigo-900 bg-white px-2 py-0.5 rounded border border-indigo-200">
                        {order.tracking_number}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => copyResi(order.tracking_number || '')}
                  className="px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-100/50 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  {copiedResi ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Resi</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Payment Guide & Proof Upload Card (Only show upload if not yet completed) */}
        {!isCompleted && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                {order.payment_method === 'qris' ? (
                  <QrCode className="w-5 h-5" />
                ) : (
                  <CreditCard className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Instruksi & Konfirmasi Pembayaran
                </h3>
                <p className="text-xs text-slate-600">
                  Metode:{' '}
                  <span className="font-semibold text-slate-800 capitalize">
                    {order.payment_method === 'bank_transfer'
                      ? 'Transfer Bank Manual'
                      : order.payment_method === 'qris'
                      ? 'QRIS Interaktif'
                      : 'Bayar di Tempat (COD)'}
                  </span>
                </p>
              </div>
            </div>

            {/* Bank Transfer Details */}
            {order.payment_method === 'bank_transfer' && (
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-indigo-300 font-semibold tracking-wider uppercase">
                      Tujuan Transfer Bank
                    </span>
                    <h4 className="text-lg font-bold mt-0.5">
                      {website.bank_name || 'Bank Central Asia (BCA)'}
                    </h4>
                  </div>
                  <span className="text-xs bg-indigo-500/30 text-indigo-200 px-2.5 py-1 rounded-full border border-indigo-400/20 font-medium">
                    Rekening Resmi Toko
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between bg-white/10 p-3 rounded-xl backdrop-blur-xs">
                  <div>
                    <span className="text-[10px] text-indigo-200 uppercase tracking-wider block">
                      Nomor Rekening
                    </span>
                    <span className="font-mono text-xl sm:text-2xl font-bold tracking-wider">
                      {website.bank_account_no || '8830-1928-41'}
                    </span>
                    <span className="text-xs text-indigo-200 block mt-0.5">
                      a/n {website.bank_account_name || website.business_name}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      copyBankNumber(
                        (website.bank_account_no || '8830192841').replace(/[^0-9]/g, '')
                      )
                    }
                    className="px-3.5 py-2 bg-white text-indigo-950 hover:bg-indigo-50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm active:scale-95"
                  >
                    {copiedBank ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin No. Rek</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-indigo-200/80 mt-3">
                  💡 Silakan transfer sejumlah{' '}
                  <strong className="text-white font-bold">{formatIDR(order.total_amount)}</strong>{' '}
                  dan unggah foto bukti transfer di bawah ini.
                </p>
              </div>
            )}

            {/* QRIS Display */}
            {order.payment_method === 'qris' && (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Pindai QRIS untuk Pembayaran Instan
                </span>
                <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 inline-block mx-auto">
                  <img
                    src={
                      website.qris_image_url ||
                      'https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=00020101021126580014ID.LINKAJA.WWW01189360091438830192845204581253033605802ID5916MEBEL+JAYA+ABADI6006JEPARA62070703A01630489AB'
                    }
                    alt="QRIS Toko"
                    className="w-48 h-48 sm:w-56 sm:h-56 object-contain mx-auto"
                  />
                </div>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Mendukung GoPay, OVO, DANA, ShopeePay, LinkAja, BCA Mobile, Livin' Mandiri, dan
                  semua aplikasi m-Banking.
                </p>
              </div>
            )}

            {/* COD Display */}
            {order.payment_method === 'cod' && (
              <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 leading-relaxed">
                  <strong className="text-emerald-900 block font-semibold mb-0.5">
                    Metode Bayar di Tempat (COD) Aktif
                  </strong>
                  Pesanan Anda akan segera diproses oleh toko. Mohon siapkan uang pas sebesar{' '}
                  <strong>{formatIDR(order.total_amount)}</strong> saat kurir mengantarkan barang ke
                  alamat Anda.
                </div>
              </div>
            )}

            {/* Upload Form or Uploaded Status */}
            {uploadSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            {order.payment_proof_url ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-white rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center">
                    <img
                      src={order.payment_proof_url}
                      alt="Bukti Transfer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                      <FileCheck2 className="w-3.5 h-3.5" /> Bukti Pembayaran Terunggah
                    </span>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Status: {order.payment_status === 'paid' ? 'Telah Diverifikasi Lunas' : 'Sedang Diverifikasi oleh Penjual'}
                    </p>
                  </div>
                </div>
                <a
                  href={order.payment_proof_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-white border border-indigo-200 hover:bg-indigo-50 rounded-xl transition"
                >
                  Lihat Foto Bukti
                </a>
              </div>
            ) : (
              <form onSubmit={handleUploadProof} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Unggah Foto Bukti Transfer / Struk
                  </label>
                  <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-6 text-center transition bg-slate-50/50 relative">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {proofPreview ? (
                      <div className="flex items-center justify-center gap-3">
                        <img
                          src={proofPreview}
                          alt="Preview"
                          className="w-16 h-16 object-cover rounded-xl border border-slate-300 shadow-xs"
                        />
                        <div className="text-left text-xs">
                          <p className="font-semibold text-slate-900">{proofFile?.name}</p>
                          <p className="text-slate-600">Klik untuk mengganti foto</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <Upload className="w-7 h-7 text-indigo-600 mx-auto" />
                        <p className="text-xs font-semibold text-slate-800">
                          Pilih foto struk / tangkapan layar m-banking
                        </p>
                        <p className="text-[11px] text-slate-600">JPG, PNG, atau WebP (Maks. 5MB)</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="submit"
                    disabled={!proofFile || isUploading}
                    className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    {isUploading ? (
                      <span className="inline-flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Mengunggah...
                      </span>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Kirim Bukti Pembayaran</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleQuickConfirm}
                    disabled={isUploading}
                    className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
                  >
                    Konfirmasi Sudah Bayar (Tanpa Foto)
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Order Items & Shipping Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Items List */}
          <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Package className="w-4 h-4 text-indigo-600" />
              <span>Rincian Produk Dipesan ({order.items.length})</span>
            </h3>

            <div className="divide-y divide-slate-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        className="w-14 h-14 object-cover rounded-xl border border-slate-200 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">
                        {item.product_name}
                      </h4>
                      <p className="text-xs text-slate-600">
                        {item.quantity} × {formatIDR(item.price)}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    {formatIDR(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Produk</span>
                <span className="font-semibold text-slate-800">
                  {formatIDR(order.subtotal_amount || order.total_amount)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Biaya Pengiriman</span>
                <span className="font-semibold text-slate-800">
                  {order.shipping_cost ? formatIDR(order.shipping_cost) : 'Gratis / Termasuk'}
                </span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                <span>Total Pembayaran</span>
                <span className="text-indigo-600 text-base">{formatIDR(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span>Tujuan Pengiriman</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-600 block text-[11px]">Nama Penerima:</span>
                <span className="font-bold text-slate-900 text-sm">{order.customer_name}</span>
              </div>
              <div>
                <span className="text-slate-600 block text-[11px]">Nomor WhatsApp:</span>
                <span className="font-mono font-medium text-slate-900">{order.customer_phone}</span>
              </div>
              <div>
                <span className="text-slate-600 block text-[11px]">Alamat Lengkap:</span>
                <p className="text-slate-800 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {order.address}
                </p>
              </div>
              {order.notes && (
                <div>
                  <span className="text-slate-600 block text-[11px]">Catatan Khusus:</span>
                  <p className="text-slate-600 italic bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/60">
                    "{order.notes}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
