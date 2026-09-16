import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { api } from '../../api/client';
import { Website } from '../../types';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Loader2,
  MapPin,
  User,
  Phone,
  FileText,
  CreditCard,
  QrCode,
  Truck,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';

interface CartDrawerProps {
  website: Website;
}

const SHIPPING_OPTIONS = [
  {
    id: 'cargo',
    name: 'Kargo Truk Ekspedisi Jepara',
    desc: 'Spesialis kirim mebel & barang berat aman berasuransi',
    price: 150000,
  },
  {
    id: 'regular',
    name: 'Kurir Reguler / Pengiriman Cepat',
    desc: 'J&T / JNE / SiCepat dengan nomor resi pelacakan',
    price: 50000,
  },
  {
    id: 'pickup',
    name: 'Ambil di Toko / Workshop Langsung',
    desc: 'Ambil mandiri di lokasi workshop tanpa biaya kirim',
    price: 0,
  },
];

export const CartDrawer: React.FC<CartDrawerProps> = ({ website }) => {
  const navigate = useNavigate();
  const {
    items,
    isOpen,
    setIsOpen,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalAmount,
    getTotalCount,
  } = useCartStore();

  const [step, setStep] = useState<'cart' | 'shipping' | 'payment'>('cart');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);

  // Form details
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    address: '',
    notes: '',
    shipping_method: 'cargo',
    payment_method: 'bank_transfer',
  });

  const selectedShipping =
    SHIPPING_OPTIONS.find((s) => s.id === formData.shipping_method) || SHIPPING_OPTIONS[0];

  const subtotal = getTotalAmount();
  const finalTotal = subtotal + selectedShipping.price;

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const copyBankNumber = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);
    try {
      const orderPayload = {
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        address: formData.address,
        notes: formData.notes,
        payment_method: formData.payment_method,
        shipping_method: formData.shipping_method,
        shipping_cost: selectedShipping.price,
        items: items.map((i) => ({
          product_id: i.product.id,
          product_name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          image_url: i.product.image_url,
        })),
      };

      // 1. Create order on the website backend
      const order = await api.createPublicOrder(website.subdomain, orderPayload);

      // 2. Clear shopping cart
      clearCart();
      setIsOpen(false);
      setStep('cart');

      // 3. Redirect buyer directly to the on-site invoice tracking page!
      const host = window.location.hostname;
      const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(host);
      const isLocalhost = host === 'localhost' || host === '127.0.0.1' || isIp;
      const isSubdomainHost =
        !isLocalhost &&
        host.includes('bizcatalog.com') &&
        host.split('.').length > 2 &&
        !['www', 'app', 'admin'].includes(host.split('.')[0]);

      if (isSubdomainHost) {
        navigate(`/order/${order.order_number}`);
      } else {
        navigate(`/site/${website.subdomain}/order/${order.order_number}`);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal memproses pesanan di website');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-md bg-white text-slate-800 shadow-2xl z-10 flex flex-col h-full border-l border-slate-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {step === 'cart'
                  ? 'Keranjang Belanja'
                  : step === 'shipping'
                  ? 'Pengiriman Pesanan'
                  : 'Metode Pembayaran'}
              </h3>
              <p className="text-xs text-slate-600">
                {items.length === 0
                  ? 'Keranjang kosong'
                  : `Langkah ${
                      step === 'cart' ? '1/3' : step === 'shipping' ? '2/3' : '3/3'
                    }: ${getTotalCount()} produk terpilih`}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-slate-600 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h4 className="font-bold text-slate-800 text-base">Keranjang Anda Masih Kosong</h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Temukan produk pilihan Anda dari katalog dan klik tombol "+ Keranjang" untuk mulai
                berbelanja online.
              </p>
              <button
                onClick={() => setIsOpen(false)}
                className="mt-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Jelajahi Produk Sekarang
              </button>
            </div>
          ) : step === 'cart' ? (
            /* Step 1: Cart Items */
            <div className="space-y-4">
              <div className="space-y-3">
                {items.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3 group"
                  >
                    <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 overflow-hidden flex-shrink-0">
                      <img
                        src={
                          product.image_url ||
                          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&auto=format&fit=crop&q=80'
                        }
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 text-xs truncate">
                        {product.name}
                      </h4>
                      <div className="text-xs font-extrabold text-indigo-600 mt-0.5">
                        {formatIDR(product.price)}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border border-slate-300 rounded-lg bg-white">
                          <button
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="p-1 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-l-md"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold font-mono text-slate-800">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="p-1 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-r-md"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-[11px] text-slate-600 font-mono">
                          = {formatIDR(product.price * quantity)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(product.id)}
                      className="text-slate-600 hover:text-red-600 p-1.5 rounded-lg transition-colors"
                      title="Hapus barang"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : step === 'shipping' ? (
            /* Step 2: Shipping & Buyer Info */
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-indigo-900 leading-relaxed text-xs">
                Masukkan detail alamat lengkap Anda untuk pengiriman langsung dari workshop{' '}
                <strong>{website.business_name}</strong>.
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  Nama Lengkap Penerima
                </label>
                <input
                  type="text"
                  required
                  value={formData.customer_name}
                  onChange={(e) =>
                    setFormData({ ...formData, customer_name: e.target.value })
                  }
                  placeholder="Misal: Budi Santoso"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  Nomor WhatsApp / HP Aktif
                </label>
                <input
                  type="text"
                  required
                  value={formData.customer_phone}
                  onChange={(e) =>
                    setFormData({ ...formData, customer_phone: e.target.value })
                  }
                  placeholder="Misal: 08123456789"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  Alamat Lengkap Pengiriman
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota/kabupaten..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              {/* Shipping Method Options */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-indigo-600" />
                  Pilih Layanan Pengiriman
                </label>
                <div className="space-y-2">
                  {SHIPPING_OPTIONS.map((opt) => (
                    <label
                      key={opt.id}
                      className={`block p-3 rounded-xl border cursor-pointer transition ${
                        formData.shipping_method === opt.id
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-600'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="shipping_method"
                            value={opt.id}
                            checked={formData.shipping_method === opt.id}
                            onChange={() =>
                              setFormData({ ...formData, shipping_method: opt.id })
                            }
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block text-xs">
                              {opt.name}
                            </span>
                            <span className="text-[11px] text-slate-600 block">
                              {opt.desc}
                            </span>
                          </div>
                        </div>
                        <span className="font-bold text-xs text-indigo-600">
                          {opt.price === 0 ? 'Gratis' : formatIDR(opt.price)}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  Catatan untuk Penjual (Opsional)
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Instruksi khusus pengiriman, lantai, dll."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>
          ) : (
            /* Step 3: Payment Options */
            <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-emerald-900 leading-relaxed text-xs">
                Pilih metode pembayaran yang Anda inginkan. Seluruh transaksi dicatat secara resmi
                pada website toko ini.
              </div>

              <div className="space-y-2">
                {/* Bank Transfer */}
                <label
                  className={`block p-3.5 rounded-2xl border cursor-pointer transition ${
                    formData.payment_method === 'bank_transfer'
                      ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      value="bank_transfer"
                      checked={formData.payment_method === 'bank_transfer'}
                      onChange={() => setFormData({ ...formData, payment_method: 'bank_transfer' })}
                      className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-indigo-600" />
                        <span className="font-bold text-slate-900 text-xs">
                          Transfer Bank Manual (BCA / Mandiri / BRI)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">
                        Transfer ke rekening resmi toko & unggah bukti transfer langsung di website.
                      </p>

                      {formData.payment_method === 'bank_transfer' && (
                        <div className="mt-3 p-3 bg-slate-900 text-white rounded-xl space-y-2">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-300">Bank:</span>
                            <span className="font-bold">
                              {website.bank_name || 'Bank Central Asia (BCA)'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-300">No. Rek:</span>
                            <div className="flex items-center gap-1.5 font-mono font-bold text-indigo-200">
                              <span>{website.bank_account_no || '8830-1928-41'}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  copyBankNumber(
                                    (website.bank_account_no || '8830192841').replace(/[^0-9]/g, '')
                                  )
                                }
                                className="p-1 hover:bg-white/20 rounded transition"
                                title="Salin nomor rekening"
                              >
                                {copiedBank ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3 text-white" />
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-300">Atas Nama:</span>
                            <span className="font-medium text-slate-200">
                              {website.bank_account_name || website.business_name}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </label>

                {/* QRIS */}
                <label
                  className={`block p-3.5 rounded-2xl border cursor-pointer transition ${
                    formData.payment_method === 'qris'
                      ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      value="qris"
                      checked={formData.payment_method === 'qris'}
                      onChange={() => setFormData({ ...formData, payment_method: 'qris' })}
                      className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-slate-900 text-xs">
                          QRIS (Semua E-Wallet & Mobile Banking)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">
                        Scan QRIS langsung setelah pesanan dibuat via GoPay, OVO, DANA, BCA Mobile, dll.
                      </p>
                    </div>
                  </div>
                </label>

                {/* COD */}
                <label
                  className={`block p-3.5 rounded-2xl border cursor-pointer transition ${
                    formData.payment_method === 'cod'
                      ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      value="cod"
                      checked={formData.payment_method === 'cod'}
                      onChange={() => setFormData({ ...formData, payment_method: 'cod' })}
                      className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-amber-600" />
                        <span className="font-bold text-slate-900 text-xs">
                          Bayar di Tempat (Cash on Delivery / COD)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">
                        Bayar tunai kepada kurir saat pesanan tiba di alamat tujuan.
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              {/* Order Cost Breakdown */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex justify-between text-slate-600 text-xs">
                  <span>Subtotal Produk</span>
                  <span className="font-medium text-slate-800">{formatIDR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600 text-xs">
                  <span>Biaya Pengiriman ({selectedShipping.name})</span>
                  <span className="font-medium text-slate-800">
                    {selectedShipping.price === 0 ? 'Gratis' : formatIDR(selectedShipping.price)}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-slate-900">
                  <span>Total Tagihan</span>
                  <span className="text-indigo-600 text-base">{formatIDR(finalTotal)}</span>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Total Tagihan:</span>
              <span className="text-base font-extrabold text-slate-900">
                {formatIDR(finalTotal)}
              </span>
            </div>

            {step === 'cart' ? (
              <button
                onClick={() => setStep('shipping')}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all active:scale-[0.99]"
              >
                <span>Lanjut ke Pengiriman</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : step === 'shipping' ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="px-4 py-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!formData.customer_name || !formData.customer_phone || !formData.address) {
                      alert('Mohon lengkapi nama, nomor telepon, dan alamat pengiriman Anda.');
                      return;
                    }
                    setStep('payment');
                  }}
                  className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all"
                >
                  <span>Lanjut ke Pembayaran</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('shipping')}
                  className="px-4 py-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-600/25 transition-all disabled:opacity-50 active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memproses Pesanan...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Bayar & Pesan di Website</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
