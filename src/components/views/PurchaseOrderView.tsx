import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, Column } from '../common/DataTable';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { POPrintModal } from './POPrintModal';
import { PurchaseOrder } from '../../types';
import { exportPurchaseOrdersExcel } from '../../utils/excelExport';
import {
  PackageCheck,
  Plus,
  Trash2,
  DollarSign,
  Truck,
  Building,
  Wallet,
  FileSpreadsheet,
  Printer
} from 'lucide-react';

export const formatPOPaymentTermLabel = (term?: string) => {
  if (!term) return 'Tempo 30 Hari (NET 30)';
  switch (term) {
    case 'CASH':
      return 'Cash / COD (Tunai Diterima)';
    case 'CBD':
      return 'CBD (Cash Before Delivery)';
    case 'NET_7':
      return 'Tempo 7 Hari (NET 7)';
    case 'NET_14':
      return 'Tempo 14 Hari (NET 14)';
    case 'NET_30':
      return 'Tempo 30 Hari (NET 30)';
    case 'NET_60':
      return 'Tempo 60 Hari (NET 60)';
    case 'NET_90':
      return 'Tempo 90 Hari (NET 90)';
    default:
      return term;
  }
};

export const PurchaseOrderView: React.FC = () => {
  const {
    purchaseOrders,
    addPurchaseOrder,
    deletePurchaseOrder,
    recordPOPayment,
    suppliers,
    formatCurrency
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPOForPayment, setSelectedPOForPayment] = useState<PurchaseOrder | null>(null);
  const [selectedPOForPrint, setSelectedPOForPrint] = useState<PurchaseOrder | null>(null);
  const [deletingPO, setDeletingPO] = useState<PurchaseOrder | null>(null);

  // Payment Form
  const [payAmount, setPayAmount] = useState<number>(0);
  const [sourceLedger, setSourceLedger] = useState<'KAS_BESAR' | 'BUKU_BANK'>('BUKU_BANK');
  const [payNotes, setPayNotes] = useState('');

  // PO Form State
  const [formData, setFormData] = useState({
    poNumber: '',
    supplierId: '',
    manualSupplierName: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    paymentTerm: 'NET_30',
    includePPN: true,
    notes: ''
  });

  const [poItems, setPoItems] = useState<Array<{
    id: string;
    itemName: string;
    category: string;
    quantity: number;
    unit: string;
    unitPrice: number;
  }>>([]);

  const PRESET_ITEMS = [
    { name: 'Bayer Agenda 25 EC (Termitisida 5 Liter)', category: 'CHEMICALS', unit: 'Jerigen (5L)', price: 1250000 },
    { name: 'Cislin 25 EC (Insektisida Nyamuk & Lalat 1L)', category: 'CHEMICALS', unit: 'Botol (1L)', price: 480000 },
    { name: 'Syngenta Icon 25 EC (Insektisida Fogging 1L)', category: 'CHEMICALS', unit: 'Botol (1L)', price: 520000 },
    { name: 'Tasco SP-15 Stainless Steel Sprayer', category: 'EQUIPMENT', unit: 'Unit', price: 1850000 },
    { name: 'Sprayer Elektrik Solo 16 Liter', category: 'EQUIPMENT', unit: 'Unit', price: 950000 },
    { name: 'Bait Station Rayap Subterranean (Box 10 Pcs)', category: 'BAIT_STATION', unit: 'Box', price: 750000 },
    { name: 'Masker Respirator 3M Double Filter', category: 'SAFETY_PPE', unit: 'Pcs', price: 320000 },
    { name: 'Baju Hazmat APD Technisi Pest Control', category: 'SAFETY_PPE', unit: 'Pcs', price: 150000 }
  ];

  const handleOpenAdd = () => {
    const defaultSup = suppliers[0]?.id || '';
    setFormData({
      poNumber: `PO/BIG/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${Math.floor(100 + Math.random() * 900)}`,
      supplierId: defaultSup,
      manualSupplierName: '',
      orderDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      paymentTerm: 'NET_30',
      includePPN: true,
      notes: 'Dikirim ke gudang operasional PT Boston Indo Global (Ruko Grand Wisata Bekasi).'
    });
    setPoItems([
      {
        id: `POI-${Date.now()}-1`,
        itemName: 'Bayer Agenda 25 EC (Termitisida 5 Liter)',
        category: 'CHEMICALS',
        quantity: 5,
        unit: 'Jerigen (5L)',
        unitPrice: 1250000
      }
    ]);
    setIsModalOpen(true);
  };

  const handleAddItemRow = () => {
    setPoItems(prev => [
      ...prev,
      {
        id: `POI-${Date.now()}-${prev.length + 1}`,
        itemName: '',
        category: 'CHEMICALS',
        quantity: 1,
        unit: 'Pcs',
        unitPrice: 0
      }
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (poItems.length <= 1) return;
    setPoItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateItemRow = (index: number, field: string, value: any) => {
    setPoItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSelectPreset = (index: number, presetName: string) => {
    if (presetName === 'MANUAL') {
      setPoItems(prev => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          itemName: '',
          unitPrice: 0
        };
        return updated;
      });
      return;
    }
    const found = PRESET_ITEMS.find(p => p.name === presetName);
    if (found) {
      setPoItems(prev => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          itemName: found.name,
          category: found.category,
          unit: found.unit,
          unitPrice: found.price
        };
        return updated;
      });
    }
  };

  const calculatedSubtotal = poItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const calculatedTaxPPN = formData.includePPN ? Math.round(calculatedSubtotal * 0.11) : 0;
  const calculatedGrandTotal = calculatedSubtotal + calculatedTaxPPN;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let supplierName = '';
    let supplierId = '';
    
    if (formData.supplierId === 'MANUAL') {
        if (!formData.manualSupplierName.trim()) {
            alert('Silakan masukkan nama supplier.');
            return;
        }
        supplierName = formData.manualSupplierName;
        supplierId = `MANUAL-${Date.now()}`;
    } else {
        const sup = suppliers.find(s => s.id === formData.supplierId);
        if (!sup) {
          alert('Silakan pilih supplier terlebih dahulu.');
          return;
        }
        supplierName = sup.name;
        supplierId = sup.id;
    }

    if (poItems.length === 0 || poItems.some(i => !i.itemName.trim() || i.quantity <= 0)) {
      alert('Mohon lengkapi seluruh item produk PO.');
      return;
    }

    const itemsFormatted = poItems.map(item => ({
      id: item.id,
      itemName: item.itemName,
      category: item.category,
      quantity: Number(item.quantity),
      unit: item.unit,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.quantity) * Number(item.unitPrice)
    }));

    addPurchaseOrder({
      poNumber: formData.poNumber,
      supplierId: supplierId,
      supplierName: supplierName,
      orderDate: formData.orderDate,
      expectedDeliveryDate: formData.expectedDeliveryDate,
      paymentTerm: formData.paymentTerm,
      items: itemsFormatted,
      subtotal: calculatedSubtotal,
      taxPPN: calculatedTaxPPN,
      grandTotal: calculatedGrandTotal,
      notes: formData.notes
    });

    setIsModalOpen(false);
  };

  const handleOpenPaymentModal = (po: PurchaseOrder) => {
    setSelectedPOForPayment(po);
    setPayAmount(po.grandTotal - po.amountPaid);
    setSourceLedger('BUKU_BANK');
    setPayNotes('');
    setPaymentModalOpen(true);
  };

  const handleConfirmPOPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPOForPayment || payAmount <= 0) return;

    recordPOPayment(
      selectedPOForPayment.id,
      payAmount,
      sourceLedger,
      payNotes
    );

    setPaymentModalOpen(false);
    alert(`✓ Pembayaran ${formatCurrency(payAmount)} ke ${selectedPOForPayment.supplierName} berhasil dicatatkan!`);
  };

  const columns: Column<PurchaseOrder>[] = [
    {
      key: 'poNumber',
      header: 'No. PO Supplier',
      render: (po) => (
        <span className="font-bold text-slate-900 dark:text-white">{po.poNumber}</span>
      )
    },
    {
      key: 'supplierName',
      header: 'Supplier / Vendor',
      render: (po) => (
        <span className="font-bold text-slate-800 dark:text-slate-200">{po.supplierName}</span>
      )
    },
    {
      key: 'items',
      header: 'Item Barang Dipesan',
      render: (po) => (
        <div className="space-y-1 max-w-xs">
          {po.items && po.items.length > 0 ? (
            po.items.map((it, i) => (
              <div key={i} className="text-xs text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="truncate">{it.itemName} <span className="text-slate-500 font-normal">({it.quantity} {it.unit})</span></span>
              </div>
            ))
          ) : (
            <span className="text-slate-400 italic text-xs">-</span>
          )}
        </div>
      )
    },
    {
      key: 'orderDate',
      header: 'Tgl Pemesanan & Pengiriman',
      render: (po) => (
        <div className="text-xs text-slate-500">
          <p>Order: {po.orderDate}</p>
          <p className="text-[10px] text-emerald-600 font-semibold">Kirim: {po.expectedDeliveryDate}</p>
        </div>
      )
    },
    {
      key: 'paymentTerm',
      header: 'Tempo Pembayaran',
      render: (po) => (
        <span className="inline-block px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700">
          {formatPOPaymentTermLabel(po.paymentTerm)}
        </span>
      )
    },
    {
      key: 'grandTotal',
      header: 'Total Nilai PO (Inc. PPN)',
      render: (po) => (
        <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(po.grandTotal)}</span>
      )
    },
    {
      key: 'amountPaid',
      header: 'Telah Dibayar',
      render: (po) => (
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
          {formatCurrency(po.amountPaid)}
        </span>
      )
    },
    {
      key: 'paymentStatus',
      header: 'Status Hutang (AP)',
      render: (po) => (
        <Badge variant={po.paymentStatus === 'PAID' ? 'emerald' : po.paymentStatus === 'PARTIAL' ? 'warning' : 'error'}>
          {po.paymentStatus === 'PAID' ? 'LUNAS' : po.paymentStatus === 'PARTIAL' ? 'DIBAYAR SEBAGIAN' : 'BELUM DIBAYAR'}
        </Badge>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <PackageCheck className="w-6 h-6 text-emerald-600" /> Input Purchase Order (PO) Supplier
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pemesanan bahan kimia termitisida, rodentisida, mesin fogging, dan perlengkapan teknisi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportPurchaseOrdersExcel(purchaseOrders)}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs shadow-xs flex items-center gap-2 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export Excel
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-950/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Buat PO Supplier Baru
          </button>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        data={purchaseOrders}
        columns={columns}
        searchPlaceholder="Cari nomor PO, supplier..."
        searchKeys={['poNumber', 'supplierName']}
        actions={(po) => (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => setSelectedPOForPrint(po)}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors flex items-center gap-1"
              title="Cetak Form PO Supplier"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Cetak PO</span>
            </button>
            {po.paymentStatus !== 'PAID' && (
              <button
                onClick={() => handleOpenPaymentModal(po)}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs"
              >
                <DollarSign className="w-3.5 h-3.5" /> Bayar Hutang
              </button>
            )}
            <button
              onClick={() => setDeletingPO(po)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
              title="Hapus PO"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />

      {/* Add PO Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Input Purchase Order (PO) Supplier Baru"
        subtitle="Form pemesanan inventaris bahan kimia, peralatan & APD pest control ke supplier"
        maxWidth="3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Section 1: Header Info */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <Building className="w-4 h-4 text-emerald-600" /> Informasi Utama PO & Supplier
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Supplier / Vendor *
                </label>
                <select
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
                >
                  <option value="">-- Pilih Supplier --</option>
                  <option value="MANUAL">✏️ Input Supplier Manual</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code} - {s.category})</option>
                  ))}
                </select>
                {formData.supplierId === 'MANUAL' && (
                  <input
                    type="text"
                    value={formData.manualSupplierName}
                    onChange={(e) => setFormData({ ...formData, manualSupplierName: e.target.value })}
                    placeholder="Masukkan Nama Supplier Manual"
                    required
                    className="w-full mt-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
                  />
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor PO Supplier *
                </label>
                <input
                  type="text"
                  value={formData.poNumber}
                  onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tanggal Order *
                </label>
                <input
                  type="date"
                  value={formData.orderDate}
                  onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Estimasi Tgl Pengiriman *
                </label>
                <input
                  type="date"
                  value={formData.expectedDeliveryDate}
                  onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tempo Pembayaran (Payment Terms) *
                </label>
                <select
                  value={formData.paymentTerm}
                  onChange={(e) => setFormData({ ...formData, paymentTerm: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
                >
                  <option value="NET_30">Tempo 30 Hari (NET 30)</option>
                  <option value="NET_14">Tempo 14 Hari (NET 14)</option>
                  <option value="NET_7">Tempo 7 Hari (NET 7)</option>
                  <option value="NET_60">Tempo 60 Hari (NET 60)</option>
                  <option value="NET_90">Tempo 90 Hari (NET 90)</option>
                  <option value="CASH">Cash / COD (Bayar Saat Barang Diterima)</option>
                  <option value="CBD">CBD (Cash Before Delivery / Bayar Dimuka)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: PO Items Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <PackageCheck className="w-4 h-4 text-emerald-600" /> Daftar Item Pesanan (Bahan & Peralatan)
              </h4>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1 hover:bg-emerald-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Baris Item
              </button>
            </div>

            <div className="space-y-3">
              {poItems.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-500 dark:text-slate-400 text-[11px] uppercase">
                      Item #{idx + 1}
                    </span>
                    {poItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50"
                        title="Hapus baris item ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                    {/* Preset Selector */}
                    <div className="md:col-span-5">
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        Pilih Katalog / Input Nama Item (Di-isi Manual) *
                      </label>
                      <select
                        onChange={(e) => {
                          if (e.target.value) handleSelectPreset(idx, e.target.value);
                        }}
                        defaultValue=""
                        className="w-full mb-1.5 px-2.5 py-1 text-[11px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 font-medium"
                      >
                        <option value="">-- Pilih Dari Katalog Produk --</option>
                        <option value="MANUAL">✏️ -- Input / Ketik Manual Nama Item Baru --</option>
                        {PRESET_ITEMS.map((preset, pIdx) => (
                          <option key={pIdx} value={preset.name}>{preset.name}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={item.itemName}
                        onChange={(e) => handleUpdateItemRow(idx, 'itemName', e.target.value)}
                        placeholder="Ketik Nama Item Secara Manual (cth: Bayer Agenda 25 EC)..."
                        required
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
                      />
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 block italic">
                        * Pilih dari katalog untuk auto-fill, atau ketik manual di kolom atas.
                      </span>
                    </div>

                    {/* Category */}
                    <div className="md:col-span-3">
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        Kategori *
                      </label>
                      <select
                        value={item.category}
                        onChange={(e) => handleUpdateItemRow(idx, 'category', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                      >
                        <option value="CHEMICALS">CHEMICALS (Bahan Kimia)</option>
                        <option value="EQUIPMENT">EQUIPMENT (Sprayer/Fogging)</option>
                        <option value="SAFETY_PPE">SAFETY PPE (APD & Masker)</option>
                        <option value="BAIT_STATION">BAIT STATION (Umpan Rayap)</option>
                        <option value="GENERAL_CONSUMABLES">GENERAL CONSUMABLES</option>
                      </select>
                    </div>

                    {/* Quantity & Unit */}
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        Qty & Satuan *
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItemRow(idx, 'quantity', Number(e.target.value))}
                          required
                          className="w-16 px-2 py-1.5 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                        />
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => handleUpdateItemRow(idx, 'unit', e.target.value)}
                          placeholder="Unit"
                          required
                          className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Unit Price & Total */}
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        Harga Satuan (Rp) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handleUpdateItemRow(idx, 'unitPrice', Number(e.target.value))}
                        required
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold text-right"
                      />
                      <p className="text-[10px] text-right text-emerald-600 font-bold mt-1">
                        Subtotal: {formatCurrency(item.quantity * item.unitPrice)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Summary & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Catatan Pengiriman / Instruksi Khusus
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="cth: Mohon lampirkan MSDS (Material Safety Data Sheet) dan CoA (Certificate of Analysis)."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div className="bg-slate-900 dark:bg-slate-800 text-white p-3.5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-slate-300">
                <span>Total Nilai Barang (Subtotal):</span>
                <span className="font-bold">{formatCurrency(calculatedSubtotal)}</span>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.includePPN}
                    onChange={(e) => setFormData({ ...formData, includePPN: e.target.checked })}
                    className="rounded accent-emerald-500 w-4 h-4"
                  />
                  <span>Termasuk PPN 11%:</span>
                </label>
                <span className="font-bold text-amber-400">
                  {formData.includePPN ? formatCurrency(calculatedTaxPPN) : 'Rp 0'}
                </span>
              </div>

              <div className="border-t border-slate-700 pt-2 flex items-center justify-between text-sm font-extrabold text-emerald-400">
                <span>Grand Total PO Supplier:</span>
                <span className="text-base">{formatCurrency(calculatedGrandTotal)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-950/20 flex items-center gap-1.5 transition-colors"
            >
              <PackageCheck className="w-4 h-4" /> Simpan & Buat Purchase Order
            </button>
          </div>
        </form>
      </Modal>

      {/* Pay PO Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Pembayaran Hutang PO Supplier"
        subtitle={`Nomor PO: ${selectedPOForPayment?.poNumber} (${selectedPOForPayment?.supplierName})`}
        maxWidth="md"
      >
        <form onSubmit={handleConfirmPOPayment} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nominal Bayar (Rp) *
            </label>
            <input
              type="number"
              value={payAmount}
              onChange={(e) => setPayAmount(Number(e.target.value))}
              required
              className="w-full px-3 py-2 font-bold text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Sumber Dana Pengeluaran *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSourceLedger('BUKU_BANK')}
                className={`p-3 rounded-xl border font-semibold flex items-center gap-2 ${
                  sourceLedger === 'BUKU_BANK' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200'
                }`}
              >
                <Building className="w-4 h-4 text-emerald-600" /> Transfer Bank
              </button>
              <button
                type="button"
                onClick={() => setSourceLedger('KAS_BESAR')}
                className={`p-3 rounded-xl border font-semibold flex items-center gap-2 ${
                  sourceLedger === 'KAS_BESAR' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200'
                }`}
              >
                <Wallet className="w-4 h-4 text-emerald-600" /> Kas Besar (Tunai)
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setPaymentModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
            >
              Konfirmasi Pelunasan
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDeleteModal
        isOpen={!!deletingPO}
        onClose={() => setDeletingPO(null)}
        onConfirm={() => {
          if (deletingPO) deletePurchaseOrder(deletingPO.id);
        }}
        title="Hapus Purchase Order (PO)"
        description="Apakah Anda yakin ingin menghapus dokumen Purchase Order ini?"
        itemName={deletingPO ? `PO #${deletingPO.poNumber} (${deletingPO.supplierName})` : ''}
      />

      <POPrintModal
        po={selectedPOForPrint}
        onClose={() => setSelectedPOForPrint(null)}
      />
    </div>
  );
};
