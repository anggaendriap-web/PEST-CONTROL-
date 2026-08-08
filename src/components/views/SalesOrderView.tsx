import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, Column } from '../common/DataTable';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { SalesOrder, ServiceType } from '../../types';
import { exportSalesOrdersExcel } from '../../utils/excelExport';
import {
  ShoppingCart,
  Plus,
  Edit2,
  Trash2,
  FileSpreadsheet,
  Calendar,
  User,
  Building,
  CheckCircle,
  FileText,
  Calculator,
  Percent,
  Receipt
} from 'lucide-react';

export const formatPaymentTermLabel = (term?: string) => {
  if (!term) return 'Termin Bulanan';
  switch (term) {
    case 'TERMIN_BULANAN':
      return 'Termin Bulanan (Rutin)';
    case 'NET_14':
      return 'Termin 14 Hari (NET 14)';
    case 'NET_30':
      return 'Termin 30 Hari (NET 30)';
    case 'NET_60':
      return 'Termin 60 Hari (NET 60)';
    case 'CASH_IN_ADVANCE':
      return 'CBD (Cash Before Delivery)';
    case 'COD':
      return 'COD (Cash On Delivery)';
    default:
      return term;
  }
};

export const SalesOrderView: React.FC = () => {
  const {
    salesOrders,
    addSalesOrder,
    updateSalesOrder,
    deleteSalesOrder,
    customers,
    addInvoice,
    formatCurrency,
    currentUser,
    setActiveTab,
    marketingTeam
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSO, setEditingSO] = useState<SalesOrder | null>(null);
  const [deletingSO, setDeletingSO] = useState<SalesOrder | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    orderNumber: '',
    customerId: '',
    salesPerson: marketingTeam[0]?.name || 'SUTARDJAT',
    serviceType: 'Termite Control (Rayap)' as ServiceType,
    contractStartDate: new Date().toISOString().split('T')[0],
    contractEndDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    visitFrequency: 'BULANAN' as 'MINGGUAN' | 'DWI_MINGGUAN' | 'BULANAN' | 'INSIDENTIL',
    itemDescription: '',
    areaSize: '1000 m2',
    unitPrice: 2000000,
    taxType: 'PPN_11' as 'PPN_11' | 'NON_PPN',
    isPPh23: true,
    paymentTerm: 'TERMIN_BULANAN' as any,
    notes: ''
  });

  const handleOpenAdd = () => {
    setEditingSO(null);
    const defaultCust = customers[0]?.id || '';
    const defaultSales = marketingTeam[0]?.name || 'SUTARDJAT';
    const nextSeq = String(salesOrders.length + 1).padStart(3, '0');
    setFormData({
      orderNumber: `WO/BIG/2026/08/${nextSeq}`,
      customerId: defaultCust,
      salesPerson: defaultSales,
      serviceType: 'Termite Control (Rayap)',
      contractStartDate: new Date().toISOString().split('T')[0],
      contractEndDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      visitFrequency: 'BULANAN',
      itemDescription: 'Layanan Treatment Pest Control Rayap & Serangga Rutin Area Gedung',
      areaSize: '1500 m2',
      unitPrice: 3500000,
      taxType: 'PPN_11',
      isPPh23: true,
      paymentTerm: 'TERMIN_BULANAN',
      notes: 'Treatment meliputi spraying, fogging, serta pemeriksaan umpan rayap.'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (so: SalesOrder) => {
    setEditingSO(so);
    setFormData({
      orderNumber: so.orderNumber,
      customerId: so.customerId,
      salesPerson: so.salesPerson || (marketingTeam[0]?.name || 'SUTARDJAT'),
      serviceType: so.serviceType,
      contractStartDate: so.contractStartDate,
      contractEndDate: so.contractEndDate,
      visitFrequency: so.visitFrequency || 'BULANAN',
      itemDescription: so.items[0]?.description || 'Layanan Pest Control',
      areaSize: so.items[0]?.areaSize || '1000 m2',
      unitPrice: so.subtotal || 2000000,
      taxType: so.taxType || (so.taxPPN > 0 ? 'PPN_11' : 'NON_PPN'),
      isPPh23: so.isPPh23 !== undefined ? so.isPPh23 : true,
      paymentTerm: so.paymentTerm || 'TERMIN_BULANAN',
      notes: so.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === formData.customerId);
    if (!cust) return;

    const subtotal = formData.unitPrice;
    const taxPPN = formData.taxType === 'PPN_11' ? Math.round(subtotal * 0.11) : 0;
    const taxPPh23 = formData.isPPh23 ? Math.round(subtotal * 0.02) : 0;
    const grandTotal = subtotal + taxPPN;
    const netPayable = grandTotal - taxPPh23;
    const finalSalesPerson = formData.salesPerson.toUpperCase().trim();

    const items = [
      {
        id: `ITM-${Date.now()}`,
        description: formData.itemDescription,
        serviceType: formData.serviceType,
        areaSize: formData.areaSize,
        quantity: 1,
        unitPrice: formData.unitPrice,
        total: formData.unitPrice
      }
    ];

    if (editingSO) {
      updateSalesOrder({
        ...editingSO,
        orderNumber: formData.orderNumber,
        customerId: cust.id,
        customerName: cust.name,
        serviceType: formData.serviceType,
        contractStartDate: formData.contractStartDate,
        contractEndDate: formData.contractEndDate,
        visitFrequency: formData.visitFrequency,
        items,
        subtotal,
        taxType: formData.taxType,
        taxPPN,
        isPPh23: formData.isPPh23,
        taxPPh23,
        grandTotal,
        netPayable,
        paymentTerm: formData.paymentTerm,
        salesPerson: finalSalesPerson,
        notes: formData.notes
      });
    } else {
      addSalesOrder({
        orderNumber: formData.orderNumber,
        customerId: cust.id,
        customerName: cust.name,
        serviceType: formData.serviceType,
        contractStartDate: formData.contractStartDate,
        contractEndDate: formData.contractEndDate,
        visitFrequency: formData.visitFrequency,
        items,
        subtotal,
        taxType: formData.taxType,
        taxPPN,
        isPPh23: formData.isPPh23,
        taxPPh23,
        grandTotal,
        netPayable,
        status: 'ACTIVE',
        paymentTerm: formData.paymentTerm,
        salesPerson: finalSalesPerson,
        notes: formData.notes
      });
    }

    setIsModalOpen(false);
  };

  const handleGenerateInvoice = (so: SalesOrder) => {
    // Nomor invoice disamakan dengan Nomor Work Order / Sales Order
    const invNumber = so.orderNumber;
    const cust = customers.find(c => c.id === so.customerId);

    addInvoice({
      invoiceNumber: invNumber,
      salesOrderId: so.id,
      salesOrderNumber: so.orderNumber,
      customerId: so.customerId,
      customerName: so.customerName,
      customerAddress: cust?.address || 'Bekasi',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      items: so.items,
      subtotal: so.subtotal,
      taxType: so.taxType || (so.taxPPN > 0 ? 'PPN_11' : 'NON_PPN'),
      taxAmount: so.taxPPN,
      isPPh23: so.isPPh23,
      taxPPh23: so.taxPPh23 || 0,
      grandTotal: so.grandTotal,
      netPayable: so.netPayable || (so.grandTotal - (so.taxPPh23 || 0)),
      paymentTerm: so.paymentTerm || 'TERMIN_BULANAN',
      notes: `Invoice tagihan untuk ${so.orderNumber}. ${so.notes || ''}`,
      createdById: currentUser.id,
      createdByName: currentUser.name,
      signedBySales: currentUser.name
    });

    alert(`✓ Invoice #${invNumber} berhasil dibuat untuk ${so.customerName}! Navigasi ke menu Cetak Invoice.`);
    setActiveTab('invoices');
  };

  const columns: Column<SalesOrder>[] = [
    {
      key: 'orderNumber',
      header: 'No. Work Order / SO',
      render: (so) => (
        <div>
          <span className="font-extrabold text-slate-900 dark:text-white font-mono">{so.orderNumber}</span>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[10px] bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 font-bold px-1.5 py-0.5 rounded">
              {formatPaymentTermLabel(so.paymentTerm)}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Sales: {so.salesPerson}</p>
        </div>
      )
    },
    {
      key: 'customerName',
      header: 'Pelanggan',
      render: (so) => (
        <span className="font-bold text-slate-800 dark:text-slate-200">{so.customerName}</span>
      )
    },
    {
      key: 'serviceType',
      header: 'Jenis Layanan Pest Control',
      render: (so) => (
        <div>
          <p className="font-medium text-emerald-700 dark:text-emerald-400">{so.serviceType}</p>
          <span className="text-[10px] text-slate-400 font-semibold">Jadwal: {so.visitFrequency}</span>
        </div>
      )
    },
    {
      key: 'contractStartDate',
      header: 'Periode Pekerjaan',
      render: (so) => (
        <div className="text-xs text-slate-500">
          <span>{so.contractStartDate}</span> s/d <span>{so.contractEndDate}</span>
        </div>
      )
    },
    {
      key: 'grandTotal',
      header: 'Nilai Kontrak & Pajak',
      render: (so) => {
        const isPpn = (so.taxType ?? (so.taxPPN > 0 ? 'PPN_11' : 'NON_PPN')) === 'PPN_11';
        const isPph = so.isPPh23 ?? true;
        const pphVal = so.taxPPh23 ?? (isPph ? Math.round(so.subtotal * 0.02) : 0);
        const netVal = so.netPayable ?? (so.grandTotal - pphVal);
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 dark:text-white">{formatCurrency(so.grandTotal)}</span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${isPpn ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                {isPpn ? 'PPN 11%' : 'NON PPN'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-slate-500">
              <span>DPP: {formatCurrency(so.subtotal)}</span>
              {isPph && (
                <span className="text-amber-700 dark:text-amber-400 font-semibold">
                  (PPh23 2%: -{formatCurrency(pphVal)})
                </span>
              )}
            </div>
            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              Net Kas: {formatCurrency(netVal)}
            </div>
          </div>
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      render: (so) => (
        <Badge variant={so.status === 'ACTIVE' ? 'emerald' : 'neutral'}>
          {so.status}
        </Badge>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-emerald-600" /> Input Penjualan & Kontrak
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Input Work Order (WO), spesifikasi treatment hama, periode kontrak, dan termin pembayaran.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportSalesOrdersExcel(salesOrders)}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs shadow-xs flex items-center gap-2 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export Excel
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-950/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Input Sales Order Baru
          </button>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        data={salesOrders}
        columns={columns}
        searchPlaceholder="Cari nomor WO, nama customer, jenis layanan..."
        searchKeys={['orderNumber', 'customerName', 'serviceType', 'salesPerson']}
        actions={(so) => (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => handleGenerateInvoice(so)}
              className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-bold text-[11px] flex items-center gap-1"
              title="Terbitkan Invoice"
            >
              <FileText className="w-3.5 h-3.5" /> Buat Invoice
            </button>
            <button
              onClick={() => handleOpenEdit(so)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
              title="Edit Sales Order"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeletingSO(so)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
              title="Hapus Sales Order"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />

      {/* Modal Add / Edit SO */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSO ? 'Edit Work Order Penjualan' : 'Input Sales Order / Work Order Baru'}
        subtitle="Form registrasi penjualan jasa pest control PT Boston Indo Global"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Highlighted Marketing Selection Field */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800">
            <label className="block font-extrabold text-slate-900 dark:text-white mb-1 flex items-center justify-between">
              <span>NAMA MARKETING / SALES EXECUTIVE *</span>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">
                * Wajib diisi untuk kontrol pencapaian target sales
              </span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <select
                  value={formData.salesPerson}
                  onChange={(e) => setFormData({ ...formData, salesPerson: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-xl text-slate-900 dark:text-white font-extrabold uppercase focus:ring-2 focus:ring-amber-500"
                >
                  <option value="" disabled>-- Pilih Marketing Executive --</option>
                  {marketingTeam.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Atau Ketik Nama Sales Manual..."
                  value={formData.salesPerson}
                  onChange={(e) => setFormData({ ...formData, salesPerson: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-extrabold uppercase placeholder:font-normal placeholder:normal-case text-xs"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              Setiap transaksi yang diinput dengan nama marketing ini akan otomatis terhitung dalam realisasi omset & target dashboard marketing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>Nomor Work Order (WO) *</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Bisa Diedit Manual</span>
              </label>
              <input
                type="text"
                value={formData.orderNumber}
                onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                required
                placeholder="WO/BIG/2026/08/001"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold"
              />
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <span className="text-[10px] text-slate-500">Preset Cepat:</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, orderNumber: `WO/BIG/2026/08/001` })}
                  className="text-[10px] bg-emerald-100 hover:bg-emerald-200 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200 px-2 py-0.5 rounded font-mono font-bold transition-colors"
                >
                  Mulai #001
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const nextSeq = String(salesOrders.length + 1).padStart(3, '0');
                    setFormData({ ...formData, orderNumber: `WO/BIG/2026/08/${nextSeq}` });
                  }}
                  className="text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-700 dark:text-slate-200 px-2 py-0.5 rounded font-mono font-bold transition-colors"
                >
                  Gunakan Auto (#{String(salesOrders.length + 1).padStart(3, '0')})
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Syarat Pembayaran (Term of Payment) *
              </label>
              <select
                value={formData.paymentTerm}
                onChange={(e) => setFormData({ ...formData, paymentTerm: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
              >
                <option value="TERMIN_BULANAN">Termin Bulanan (Invoicing Rutin Bulanan)</option>
                <option value="NET_14">Termin 14 Hari (NET 14 Days)</option>
                <option value="NET_30">Termin 30 Hari (NET 30 Days)</option>
                <option value="NET_60">Termin 60 Hari (NET 60 Days)</option>
                <option value="CASH_IN_ADVANCE">CBD - Cash Before Delivery (Tunai Awal)</option>
                <option value="COD">COD - Cash On Delivery (Bayar Saat Treatment)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pilih Customer *
              </label>
              <select
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jenis Layanan Pest Control *
              </label>
              <select
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value as ServiceType })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="Termite Control (Rayap)">Termite Control (Rayap)</option>
                <option value="General Pest Control (Serangga/Nyamuk/Lalat/Kecoa)">General Pest Control (Serangga/Nyamuk/Lalat/Kecoa)</option>
                <option value="Rodent Control (Tikus)">Rodent Control (Tikus)</option>
                <option value="Fumigation (Fumigasi)">Fumigation (Fumigasi)</option>
                <option value="Bed Bug Treatment (Kutu Busuk)">Bed Bug Treatment (Kutu Busuk)</option>
                <option value="Disinfection & Sterilization">Disinfection & Sterilization</option>
                <option value="Snake Control (Ular)">Snake Control (Ular)</option>
                <option value="Bird Control (Burung)">Bird Control (Burung)</option>
                <option value="Cat Control (Kucing)">Cat Control (Kucing)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Frekuensi Kunjungan Routine
              </label>
              <select
                value={formData.visitFrequency}
                onChange={(e) => setFormData({ ...formData, visitFrequency: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="BULANAN">Bulanan (1x per Bulan)</option>
                <option value="DWI_MINGGUAN">Dwi Mingguan (2x per Bulan)</option>
                <option value="MINGGUAN">Mingguan (4x per Bulan)</option>
                <option value="INSIDENTIL">Insidentil (One-Time Treatment)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Mulai Periode Pekerjaan
              </label>
              <input
                type="date"
                value={formData.contractStartDate}
                onChange={(e) => setFormData({ ...formData, contractStartDate: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Selesai Periode Pekerjaan
              </label>
              <input
                type="date"
                value={formData.contractEndDate}
                onChange={(e) => setFormData({ ...formData, contractEndDate: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Deskripsi Pekerjaan / Layanan
            </label>
            <input
              type="text"
              value={formData.itemDescription}
              onChange={(e) => setFormData({ ...formData, itemDescription: e.target.value })}
              required
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Estimasi Luas Area (m2 / titik)
              </label>
              <input
                type="text"
                value={formData.areaSize}
                onChange={(e) => setFormData({ ...formData, areaSize: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Harga Jasa (DPP Sebelum PPN) Rp *
              </label>
              <input
                type="number"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                required
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
              />
            </div>
          </div>

          {/* Interactive Tax Options & Calculator Panel */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-extrabold text-sm flex items-center gap-2 text-emerald-400">
                <Calculator className="w-4 h-4 text-emerald-400" /> KALKULATOR PAJAK & POTONGAN (PPN 11% & PPH 23)
              </span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full font-mono border border-emerald-800">
                Otomatis Dihitung
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* PPN Choice */}
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                <label className="block font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-blue-400" /> Tipe PPN (Pajak Pertambahan Nilai)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, taxType: 'PPN_11' })}
                    className={`py-2 px-2 rounded-lg font-bold text-xs transition-all border ${
                      formData.taxType === 'PPN_11'
                        ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    ✓ PPN 11% (PKP)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, taxType: 'NON_PPN' })}
                    className={`py-2 px-2 rounded-lg font-bold text-xs transition-all border ${
                      formData.taxType === 'NON_PPN'
                        ? 'bg-slate-700 border-slate-500 text-white shadow-md'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    NON PPN (0%)
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">
                  {formData.taxType === 'PPN_11'
                    ? 'Faktur Pajak PPN 11% ditambahkan di atas nilai DPP Jasa.'
                    : 'Transaksi Non-PKP tanpa PPN.'}
                </p>
              </div>

              {/* PPh 23 Choice */}
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                <label className="block font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-amber-400" /> Pemotongan PPh Pasal 23 (Jasa)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isPPh23: true })}
                    className={`py-2 px-2 rounded-lg font-bold text-xs transition-all border ${
                      formData.isPPh23
                        ? 'bg-amber-600 border-amber-400 text-white shadow-md'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    ✓ Dipotong PPh23 (2%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isPPh23: false })}
                    className={`py-2 px-2 rounded-lg font-bold text-xs transition-all border ${
                      !formData.isPPh23
                        ? 'bg-slate-700 border-slate-500 text-white shadow-md'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    Tanpa PPh 23 (0%)
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">
                  {formData.isPPh23
                    ? 'PPh 23 sebesar 2% dari DPP Jasa dipotong oleh pelanggan.'
                    : 'Tidak ada potongan PPh 23.'}
                </p>
              </div>
            </div>

            {/* Live Calculation Display Box */}
            {(() => {
              const subtotal = formData.unitPrice || 0;
              const taxPPN = formData.taxType === 'PPN_11' ? Math.round(subtotal * 0.11) : 0;
              const taxPPh23 = formData.isPPh23 ? Math.round(subtotal * 0.02) : 0;
              const grandTotal = subtotal + taxPPN;
              const netPayable = grandTotal - taxPPh23;

              return (
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>1. DPP (Harga Jasa Pest Control)</span>
                    <span className="font-bold text-white font-sans">{formatCurrency(subtotal)}</span>
                  </div>

                  <div className="flex justify-between items-center text-blue-300">
                    <span>2. PPN ({formData.taxType === 'PPN_11' ? '11%' : 'NON PPN (0%)'})</span>
                    <span className="font-bold font-sans">+{formatCurrency(taxPPN)}</span>
                  </div>

                  <div className="flex justify-between items-center text-white border-t border-b border-slate-800 py-1.5 my-1">
                    <span className="font-extrabold font-sans text-xs">TOTAL INVOICE (NILAI KONTRAK)</span>
                    <span className="font-extrabold text-sm text-blue-400 font-sans">{formatCurrency(grandTotal)}</span>
                  </div>

                  <div className="flex justify-between items-center text-amber-400">
                    <span>3. Potongan PPh 23 ({formData.isPPh23 ? '2% dari DPP Jasa' : '0%'})</span>
                    <span className="font-bold font-sans">-{formatCurrency(taxPPh23)}</span>
                  </div>

                  <div className="flex justify-between items-center text-emerald-400 pt-1.5 border-t border-slate-800/80">
                    <span className="font-extrabold font-sans text-xs">ESTIMASI KAS BERSIH DITERIMA</span>
                    <span className="font-extrabold text-base text-emerald-400 font-sans">{formatCurrency(netPayable)}</span>
                  </div>
                </div>
              );
            })()}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Catatan Khusus Operasional
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-950/20"
            >
              Simpan Sales Order
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDeleteModal
        isOpen={!!deletingSO}
        onClose={() => setDeletingSO(null)}
        onConfirm={() => {
          if (deletingSO) deleteSalesOrder(deletingSO.id);
        }}
        title="Hapus Sales Order / WO"
        description="Apakah Anda yakin ingin menghapus dokumen Sales Order ini?"
        itemName={deletingSO ? `SO/WO #${deletingSO.orderNumber} (${deletingSO.customerName})` : ''}
      />
    </div>
  );
};
