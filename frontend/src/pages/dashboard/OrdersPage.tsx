import React, { useState, useEffect } from 'react';
import { Header } from '../../components/dashboard/Header';
import { api } from '../../api/client';
import { Order, OrderStatus, PaymentStatus } from '../../types';
import {
  Search,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Package,
  MapPin,
  FileText,
  User,
  Phone,
  Eye,
  Loader2,
  X,
  CreditCard,
  QrCode,
  Truck,
  Image as ImageIcon,
  ExternalLink,
  Check,
  Save,
} from 'lucide-react';

const STATUS_MAP: Record<OrderStatus, { label: string; bg: string; text: string; border: string }> = {
  pending: {
    label: 'Menunggu Konfirmasi',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
  },
  processing: {
    label: 'Sedang Diproses',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
  },
  completed: {
    label: 'Selesai',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
  },
  cancelled: {
    label: 'Dibatalkan',
    bg: 'bg-red-50',
    text: 'text-red-800',
    border: 'border-red-200',
  },
};

const PAYMENT_STATUS_MAP: Record<PaymentStatus, { label: string; bg: string; text: string }> = {
  unpaid: {
    label: 'Belum Bayar',
    bg: 'bg-rose-100',
    text: 'text-rose-800',
  },
  waiting_verification: {
    label: 'Verifikasi Bukti',
    bg: 'bg-amber-100',
    text: 'text-amber-800',
  },
  paid: {
    label: 'Lunas',
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
  },
  refunded: {
    label: 'Dikembalikan',
    bg: 'bg-slate-100',
    text: 'text-slate-800',
  },
};

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Edit shipping in modal
  const [shippingCourier, setShippingCourier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isUpdatingShipping, setIsUpdatingShipping] = useState(false);
  const [shippingSavedMsg, setShippingSavedMsg] = useState(false);

  // Proof lightbox
  const [viewProofURL, setViewProofURL] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await api.getOrders();
      setOrders(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let res = orders;
    if (statusFilter !== 'all') {
      res = res.filter((o) => o.status === statusFilter);
    }
    if (searchTerm) {
      res = res.filter(
        (o) =>
          o.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.customer_phone?.includes(searchTerm)
      );
    }
    setFilteredOrders(res);
  }, [orders, statusFilter, searchTerm]);

  useEffect(() => {
    if (selectedOrder) {
      setShippingCourier(selectedOrder.shipping_courier || '');
      setTrackingNumber(selectedOrder.tracking_number || '');
      setShippingSavedMsg(false);
    }
  }, [selectedOrder]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updated = await api.updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal memperbarui status');
    }
  };

  const handleVerifyPayment = async (orderId: string) => {
    try {
      const updated = await api.updateOrderAdmin(orderId, {
        payment_status: 'paid',
        status: 'processing',
      });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal memverifikasi pembayaran');
    }
  };

  const handleSaveShipping = async () => {
    if (!selectedOrder) return;
    setIsUpdatingShipping(true);
    try {
      const updated = await api.updateOrderAdmin(selectedOrder.id, {
        shipping_courier: shippingCourier,
        tracking_number: trackingNumber,
        status: trackingNumber ? 'processing' : selectedOrder.status,
      });
      setOrders((prev) => prev.map((o) => (o.id === selectedOrder.id ? updated : o)));
      setSelectedOrder(updated);
      setShippingSavedMsg(true);
      setTimeout(() => setShippingSavedMsg(false), 3000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menyimpan info pengiriman');
    } finally {
      setIsUpdatingShipping(false);
    }
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const createCustomerWhatsAppChat = (order: Order) => {
    let phone = order.customer_phone.replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) phone = '62' + phone.slice(1);
    const msg = `Halo ${order.customer_name}, terima kasih telah memesan produk di toko kami dengan nomor invoice *${order.order_number}*. Kami ingin mengonfirmasi detail pesanan Anda.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  // Metrics
  const totalOrders = orders.length;
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const waitingProofCount = orders.filter((o) => o.payment_status === 'waiting_verification').length;
  const completedCount = orders.filter((o) => o.status === 'completed').length;
  const totalRevenue = orders
    .filter((o) => o.payment_status === 'paid' || o.status === 'completed')
    .reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div className="flex-1 flex flex-col font-sans">
      <Header
        title="Manajemen Pesanan Masuk (Orders)"
        description="Kelola seluruh transaksi belanja pelanggan yang dilakukan langsung di dalam website toko online Anda."
      />

      <div className="p-8 max-w-7xl space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
                Total Pesanan
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{totalOrders}</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
                Perlu Diproses
              </span>
              <span className="text-2xl font-black text-amber-600 mt-1 block">{pendingCount}</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
                Verifikasi Bukti
              </span>
              <span className="text-2xl font-black text-indigo-600 mt-1 block">
                {waitingProofCount}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
                Omset Terverifikasi
              </span>
              <span className="text-lg font-black text-emerald-600 mt-1 block truncate">
                {formatIDR(totalRevenue)}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filter & Search Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex flex-wrap gap-1 w-full sm:w-auto">
            {['all', 'pending', 'processing', 'completed', 'cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                  statusFilter === tab
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab === 'all'
                  ? 'Semua'
                  : tab === 'pending'
                  ? 'Menunggu'
                  : tab === 'processing'
                  ? 'Diproses'
                  : tab === 'completed'
                  ? 'Selesai'
                  : 'Dibatalkan'}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari invoice, nama, no HP..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
            />
          </div>
        </div>

        {/* Orders Table */}
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Memuat data pesanan...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 border border-slate-200 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Package className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-slate-800 text-base">Belum Ada Pesanan Masuk</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Pesanan pelanggan dari katalog website toko online Anda akan otomatis tercatat dan
              tampil di sini.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[10px]">
                  <tr>
                    <th className="px-6 py-4">No. Invoice & Waktu</th>
                    <th className="px-6 py-4">Pelanggan</th>
                    <th className="px-6 py-4">Rincian Barang</th>
                    <th className="px-6 py-4">Pembayaran</th>
                    <th className="px-6 py-4">Pengiriman</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Status Pesanan</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((order) => {
                    const statusConfig = STATUS_MAP[order.status] || STATUS_MAP.pending;
                    const paymentConfig =
                      PAYMENT_STATUS_MAP[order.payment_status] || PAYMENT_STATUS_MAP.unpaid;
                    const itemCount = order.items.reduce((acc, i) => acc + i.quantity, 0);

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono font-bold text-slate-900 block text-xs">
                            {order.order_number}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(order.created_at).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{order.customer_name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {order.customer_phone}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                            {order.address}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-800">
                            {itemCount} Produk ({order.items.length} item)
                          </div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                            {order.items.map((i) => `${i.product_name} (${i.quantity}x)`).join(', ')}
                          </div>
                        </td>

                        {/* Payment Method & Proof */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <span className="capitalize font-semibold text-slate-800 block text-[11px]">
                              {order.payment_method === 'bank_transfer'
                                ? 'Transfer Bank'
                                : order.payment_method === 'qris'
                                ? 'QRIS Instant'
                                : 'Bayar di Tempat (COD)'}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${paymentConfig.bg} ${paymentConfig.text}`}
                              >
                                {paymentConfig.label}
                              </span>
                              {order.payment_proof_url && (
                                <button
                                  onClick={() => setViewProofURL(order.payment_proof_url || null)}
                                  className="text-[10px] font-semibold text-indigo-600 hover:underline flex items-center gap-0.5"
                                  title="Lihat bukti transfer"
                                >
                                  <ImageIcon className="w-3 h-3" /> Bukti
                                </button>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Shipping */}
                        <td className="px-6 py-4">
                          {order.tracking_number ? (
                            <div>
                              <span className="text-[11px] font-bold text-slate-900 block">
                                {order.shipping_courier || 'Kurir'}:
                              </span>
                              <span className="font-mono text-[11px] text-indigo-700 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded">
                                {order.tracking_number}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              {order.shipping_method || 'Belum dikirim'}
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 font-extrabold text-slate-900">
                          {formatIDR(order.total_amount)}
                        </td>

                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(order.id, e.target.value as OrderStatus)
                            }
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer focus:outline-none ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                          >
                            <option value="pending">Menunggu</option>
                            <option value="processing">Diproses</option>
                            <option value="completed">Selesai</option>
                            <option value="cancelled">Dibatalkan</option>
                          </select>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Lihat Detail Pesanan"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <a
                              href={createCustomerWhatsAppChat(order)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-colors shadow-2xs"
                              title="Chat WhatsApp Pembeli"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span className="hidden xl:inline">Chat</span>
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Lightbox Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  Detail Pesanan Masuk
                </span>
                <h3 className="font-extrabold text-slate-900 text-lg mt-1">
                  {selectedOrder.order_number}
                </h3>
                <span className="text-xs text-slate-400">
                  {new Date(selectedOrder.created_at).toLocaleString('id-ID')}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Shipping Destination */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                  <User className="w-4 h-4 text-indigo-600" />
                  {selectedOrder.customer_name}
                </span>
                <a
                  href={createCustomerWhatsAppChat(selectedOrder)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 font-bold hover:underline flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {selectedOrder.customer_phone}
                </a>
              </div>
              <div className="flex items-start gap-1.5 text-slate-700 pt-1">
                <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{selectedOrder.address}</span>
              </div>
              {selectedOrder.notes && (
                <div className="flex items-start gap-1.5 text-slate-600 pt-2 border-t border-slate-200">
                  <FileText className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="italic">"{selectedOrder.notes}"</span>
                </div>
              )}
            </div>

            {/* Payment Verification Card */}
            <div className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-900">
                    Status Pembayaran:
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      PAYMENT_STATUS_MAP[selectedOrder.payment_status]?.bg || 'bg-slate-100'
                    } ${PAYMENT_STATUS_MAP[selectedOrder.payment_status]?.text || 'text-slate-800'}`}
                  >
                    {PAYMENT_STATUS_MAP[selectedOrder.payment_status]?.label || selectedOrder.payment_status}
                  </span>
                </div>

                {selectedOrder.payment_status !== 'paid' && (
                  <button
                    onClick={() => handleVerifyPayment(selectedOrder.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verifikasi Lunas</span>
                  </button>
                )}
              </div>

              {/* Uploaded Payment Proof */}
              {selectedOrder.payment_proof_url ? (
                <div className="p-3 bg-white rounded-xl border border-indigo-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedOrder.payment_proof_url}
                      alt="Bukti Transfer"
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Foto Bukti Transfer Pelanggan
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold">
                        Telah diunggah langsung di website
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewProofURL(selectedOrder.payment_proof_url || null)}
                    className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg border border-indigo-200 transition"
                  >
                    Perbesar
                  </button>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500">
                  Pembeli belum mengunggah foto bukti transfer.
                </p>
              )}
            </div>

            {/* Shipping Tracking Section */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-900">
                  Pengiriman & Nomor Resi
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Nama Ekspedisi / Kurir
                  </label>
                  <input
                    type="text"
                    value={shippingCourier}
                    onChange={(e) => setShippingCourier(e.target.value)}
                    placeholder="Contoh: Kargo Truk Jepara / JNE"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Nomor Resi Pengiriman
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Contoh: RESI-99882312"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                {shippingSavedMsg ? (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Info pengiriman tersimpan!
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">
                    Pelanggan dapat melacak resi ini di halaman pesanan mereka.
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleSaveShipping}
                  disabled={isUpdatingShipping}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {isUpdatingShipping ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>Simpan Resi</span>
                </button>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Rincian Barang Pesanan
              </div>
              <div className="divide-y divide-slate-100 max-h-40 overflow-y-auto">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{item.product_name}</div>
                      <div className="text-[11px] text-slate-500">
                        {item.quantity} × {formatIDR(item.price)}
                      </div>
                    </div>
                    <div className="font-extrabold text-slate-900">
                      {formatIDR(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="font-bold text-indigo-950 text-xs block">Total Pembayaran</span>
                <span className="text-[11px] text-indigo-700">
                  {selectedOrder.shipping_cost
                    ? `Termasuk Ongkir: ${formatIDR(selectedOrder.shipping_cost)}`
                    : 'Sudah termasuk ongkir'}
                </span>
              </div>
              <span className="font-black text-indigo-700 text-xl">
                {formatIDR(selectedOrder.total_amount)}
              </span>
            </div>

            {/* Status Selector in Modal */}
            <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
              <span className="font-semibold text-slate-600">Ubah Status Keseluruhan:</span>
              <select
                value={selectedOrder.status}
                onChange={(e) =>
                  handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)
                }
                className="px-3.5 py-2 rounded-xl border border-slate-300 font-bold focus:outline-none text-xs"
              >
                <option value="pending">Menunggu Konfirmasi</option>
                <option value="processing">Sedang Diproses</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Proof Lightbox Modal */}
      {viewProofURL && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="max-w-2xl w-full bg-white rounded-3xl p-4 shadow-2xl relative space-y-3">
            <div className="flex items-center justify-between px-2 pt-1">
              <h4 className="text-sm font-bold text-slate-900">Bukti Transfer Pembeli</h4>
              <button
                onClick={() => setViewProofURL(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto rounded-2xl border border-slate-200">
              <img
                src={viewProofURL}
                alt="Bukti Transfer Pembeli"
                className="w-full h-auto object-contain mx-auto"
              />
            </div>
            <div className="text-right px-2">
              <a
                href={viewProofURL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka Gambar Asli</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
