import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, Column } from '../common/DataTable';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { InvoicePrintModal } from './InvoicePrintModal';
import { formatPaymentTermLabel } from './SalesOrderView';
import { Invoice } from '../../types';
import { exportInvoicesExcel } from '../../utils/excelExport';
import { formatDateIndo } from '../../utils/dateUtils';
import {
  FileText,
  Printer,
  DollarSign,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Building,
  CreditCard,
  Wallet,
  FileSpreadsheet
} from 'lucide-react';

export const InvoiceView: React.FC = () => {
  const {
    invoices,
    deleteInvoice,
    recordInvoicePayment,
    formatCurrency,
    selectedInvoiceForPrint,
    setSelectedInvoiceForPrint
  } = useApp();

  // Payment Modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [targetLedger, setTargetLedger] = useState<'KAS_BESAR' | 'BUKU_BANK'>('BUKU_BANK');
  const [paymentNotes, setPaymentNotes] = useState('');

  const handleOpenPaymentModal = (inv: Invoice) => {
    setSelectedInvoiceForPayment(inv);
    setPaymentAmount(inv.remainingBalance);
    setTargetLedger('BUKU_BANK');
    setPaymentNotes('');
    setPaymentModalOpen(true);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForPayment || paymentAmount <= 0) return;

    recordInvoicePayment(
      selectedInvoiceForPayment.id,
      paymentAmount,
      targetLedger,
      paymentNotes
    );

    setPaymentModalOpen(false);
    alert(`✓ Pembayaran ${formatCurrency(paymentAmount)} berhasil dicatat di ${targetLedger === 'BUKU_BANK' ? 'Buku Bank' : 'Kas Besar'}`);
  };

  const columns: Column<Invoice>[] = [
    {
      key: 'invoiceNumber',
      header: 'No. Invoice',
      render: (inv) => (
        <div>
          <span className="font-extrabold text-slate-900 dark:text-white font-mono">{inv.invoiceNumber}</span>
          <div className="mt-0.5">
            <span className="text-[10px] bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 font-bold px-1.5 py-0.5 rounded">
              {formatPaymentTermLabel(inv.paymentTerm)}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Ref: {inv.salesOrderNumber}</p>
        </div>
      )
    },
    {
      key: 'customerName',
      header: 'Pelanggan / Klien',
      render: (inv) => (
        <span className="font-bold text-slate-800 dark:text-slate-200">{inv.customerName}</span>
      )
    },
    {
      key: 'issueDate',
      header: 'Tgl Terbit & Jatuh Tempo',
      render: (inv) => (
        <div className="text-xs">
          <p className="text-slate-700 dark:text-slate-300 font-medium">Terbit: {formatDateIndo(inv.issueDate)}</p>
          <p className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold">Jatuh Tempo: {formatDateIndo(inv.dueDate)}</p>
        </div>
      )
    },
    {
      key: 'grandTotal',
      header: 'Total Invoice (Inc. PPN 11%)',
      render: (inv) => (
        <span className="font-bold text-slate-900 dark:text-white">
          {formatCurrency(inv.grandTotal)}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status Pembayaran',
      render: (inv) => (
        <Badge variant={inv.status === 'PAID' ? 'emerald' : inv.status === 'PARTIAL' ? 'warning' : 'error'}>
          {inv.status === 'PAID' ? 'LUNAS' : inv.status === 'PARTIAL' ? 'SEBAGIAN' : 'BELUM BAYAR'}
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
            <FileText className="w-6 h-6 text-emerald-600" /> Cetak & Kelola Invoice Penjualan
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Faktur resmi PT Boston Indo Global dengan PPN 11%, cetak PDF, dan pencatatan penerimaan kas/bank.
          </p>
        </div>

        <button
          onClick={() => exportInvoicesExcel(invoices)}
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs shadow-xs flex items-center gap-2 border border-slate-200 dark:border-slate-700 transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export Excel
        </button>
      </div>

      {/* Main Table */}
      <DataTable
        data={invoices}
        columns={columns}
        searchPlaceholder="Cari nomor invoice, pelanggan..."
        searchKeys={['invoiceNumber', 'customerName', 'salesOrderNumber']}
        filterOptions={[
          {
            key: 'status',
            label: 'Status Pembayaran',
            options: [
              { label: 'Lunas', value: 'PAID' },
              { label: 'Bayar Sebagian', value: 'PARTIAL' },
              { label: 'Belum Bayar', value: 'UNPAID' }
            ]
          }
        ]}
        actions={(inv) => (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => setSelectedInvoiceForPrint(inv)}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs"
              title="Cetak Invoice PDF"
            >
              <Printer className="w-3.5 h-3.5" /> Cetak Invoice
            </button>

            {inv.remainingBalance > 0 && (
              <button
                onClick={() => handleOpenPaymentModal(inv)}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs"
                title="Catat Pelunasan"
              >
                <DollarSign className="w-3.5 h-3.5" /> Bayar
              </button>
            )}

            <button
              onClick={() => setDeletingInvoice(inv)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
              title="Hapus Invoice"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />

      {/* Record Payment Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Catat Pelunasan / Penerimaan Invoice"
        subtitle={`Nomor Invoice: ${selectedInvoiceForPayment?.invoiceNumber} (${selectedInvoiceForPayment?.customerName})`}
        maxWidth="md"
      >
        <form onSubmit={handleConfirmPayment} className="space-y-4 text-xs">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300">
            <p className="font-semibold">Sisa Tagihan: {formatCurrency(selectedInvoiceForPayment?.remainingBalance || 0)}</p>
            <p className="text-[11px] text-amber-700 dark:text-amber-400">
              Pencatatan pelunasan akan memperbarui saldo Kas Besar/Buku Bank dan mengurangi Sisa Piutang (AR).
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nominal Yang Diterima (Rp) *
            </label>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(Number(e.target.value))}
              max={selectedInvoiceForPayment?.remainingBalance || 0}
              required
              className="w-full px-3 py-2 text-sm font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Masuk Ke Rekening / Kas *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTargetLedger('BUKU_BANK')}
                className={`p-3 rounded-xl border text-left font-semibold flex items-center gap-2 ${
                  targetLedger === 'BUKU_BANK'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600'
                }`}
              >
                <Building className="w-4 h-4 text-emerald-600" /> Buku Bank (Transfer)
              </button>
              <button
                type="button"
                onClick={() => setTargetLedger('KAS_BESAR')}
                className={`p-3 rounded-xl border text-left font-semibold flex items-center gap-2 ${
                  targetLedger === 'KAS_BESAR'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600'
                }`}
              >
                <Wallet className="w-4 h-4 text-emerald-600" /> Kas Besar (Tunai)
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Catatan / Bukti Transfer
            </label>
            <input
              type="text"
              placeholder="Nomor referensi bank / Keterangan tambahan"
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
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
              Simpan Pembayaran
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable Invoice Modal Component */}
      <InvoicePrintModal
        invoice={selectedInvoiceForPrint}
        onClose={() => setSelectedInvoiceForPrint(null)}
      />

      <ConfirmDeleteModal
        isOpen={!!deletingInvoice}
        onClose={() => setDeletingInvoice(null)}
        onConfirm={() => {
          if (deletingInvoice) deleteInvoice(deletingInvoice.id);
        }}
        title="Hapus Invoice"
        description="Apakah Anda yakin ingin menghapus dokumen invoice ini?"
        itemName={deletingInvoice ? `Invoice #${deletingInvoice.invoiceNumber} (${deletingInvoice.customerName})` : ''}
      />
    </div>
  );
};
