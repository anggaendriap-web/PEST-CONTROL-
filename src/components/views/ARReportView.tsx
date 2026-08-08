import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { ARPrintModal } from './ARPrintModal';
import { Invoice } from '../../types';
import { exportInvoicesExcel } from '../../utils/excelExport';
import { formatDateIndo } from '../../utils/dateUtils';
import { CreditCard, DollarSign, Clock, AlertTriangle, Printer, FileSpreadsheet, Trash2, Search, Layers, PieChart } from 'lucide-react';

export const ARReportView: React.FC = () => {
  const { invoices, deleteInvoice, formatCurrency, setSelectedInvoiceForPrint } = useApp();
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNPAID' | 'PARTIAL' | 'PAID'>('ALL');

  // Overall Metrics
  const totalGrandTotal = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const totalAmountPaid = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const totalAR = invoices.reduce((sum, inv) => sum + inv.remainingBalance, 0);
  const collectionPct = totalGrandTotal > 0 ? (totalAmountPaid / totalGrandTotal) * 100 : 0;

  // Today Date for Aging calculation
  const todayStr = new Date().toISOString().split('T')[0];

  // Aging brackets
  const currentLancar = invoices
    .filter(i => i.remainingBalance > 0 && i.dueDate >= todayStr)
    .reduce((sum, i) => sum + i.remainingBalance, 0);

  const totalOverdue = invoices
    .filter(i => i.remainingBalance > 0 && i.dueDate < todayStr)
    .reduce((sum, i) => sum + i.remainingBalance, 0);

  interface CustomerSummary {
    customerName: string;
    invoiceCount: number;
    totalGrandTotal: number;
    totalAmountPaid: number;
    totalRemainingBalance: number;
  }

  const initialMap: Record<string, CustomerSummary> = {};
  const customerSummaryMap = invoices.reduce((acc, inv) => {
    const custName = inv.customerName || 'Lainnya';
    if (!acc[custName]) {
      acc[custName] = {
        customerName: custName,
        invoiceCount: 0,
        totalGrandTotal: 0,
        totalAmountPaid: 0,
        totalRemainingBalance: 0
      };
    }
    acc[custName].invoiceCount += 1;
    acc[custName].totalGrandTotal += inv.grandTotal;
    acc[custName].totalAmountPaid += inv.amountPaid;
    acc[custName].totalRemainingBalance += inv.remainingBalance;
    return acc;
  }, initialMap);

  const customerSummaries: CustomerSummary[] = Object.values(customerSummaryMap);

  // Filtered Invoices for detail table
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered Totals
  const filteredGrandTotal = filteredInvoices.reduce((sum, i) => sum + i.grandTotal, 0);
  const filteredAmountPaid = filteredInvoices.reduce((sum, i) => sum + i.amountPaid, 0);
  const filteredRemainingBalance = filteredInvoices.reduce((sum, i) => sum + i.remainingBalance, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-600" /> Laporan Piutang Usaha (Accounts Receivable)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Rekapitalisasi tagihan pelanggan, analisis umur piutang (aging analysis), dan status penagihan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportInvoicesExcel(invoices)}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs shadow-xs flex items-center gap-2 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export Excel
          </button>
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" /> Cetak Laporan AR
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Gross Invoiced"
          value={formatCurrency(totalGrandTotal)}
          subtitle="Akumulasi tagihan terbit"
          icon={DollarSign}
          colorScheme="indigo"
        />
        <StatCard
          title="Total Piutang Berjalan (AR)"
          value={formatCurrency(totalAR)}
          subtitle="Sisa tagihan wajib ditagih"
          icon={CreditCard}
          colorScheme="sky"
        />
        <StatCard
          title="Lancar (Dalam Masa Termin)"
          value={formatCurrency(currentLancar)}
          subtitle="Belum melampaui jatuh tempo"
          icon={Clock}
          colorScheme="emerald"
        />
        <StatCard
          title="Menunggak (Overdue)"
          value={formatCurrency(totalOverdue)}
          subtitle="Melewati batas jatuh tempo"
          icon={AlertTriangle}
          colorScheme="rose"
        />
      </div>

      {/* Total Rekapan Keseluruhan AR Summary Box */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center border border-emerald-500/30">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight text-white uppercase">
                Rekapan Keseluruhan Piutang Usaha (AR Overall Recap)
              </h3>
              <p className="text-[11px] text-slate-300">
                Ringkasan akumulasi seluruh kewajiban pembayaran dari pelanggan PT Boston Indo Global
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-xs border border-emerald-500/40">
              Realisasi Pelunasan: {collectionPct.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Nilai Penjualan Invoiced</span>
            <span className="text-lg font-black text-white block">{formatCurrency(totalGrandTotal)}</span>
            <span className="text-[10px] text-slate-400 block">{invoices.length} Dokumen Invoice Terbit</span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-300 block">Total Realisasi Penerimaan (Paid)</span>
            <span className="text-lg font-black text-emerald-300 block">{formatCurrency(totalAmountPaid)}</span>
            <span className="text-[10px] text-emerald-400 block font-semibold">Telah Masuk ke Rekening / Kas</span>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-800/60 space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-300 block">Total Sisa Piutang Berjalan (Outstanding AR)</span>
            <span className="text-lg font-black text-amber-300 block">{formatCurrency(totalAR)}</span>
            <span className="text-[10px] text-amber-400 block font-semibold">Aktif Ditagih oleh Tim Finance</span>
          </div>
        </div>

        {/* Customer Rekapitulasi Table */}
        <div className="mt-4 pt-4 border-t border-slate-700/80 space-y-2">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-400" /> Rekapitulasi Sisa Piutang Per Pelanggan
          </h4>

          <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/90 text-slate-300 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">Pelanggan / Klien</th>
                  <th className="p-2.5 text-center">Jml Inv</th>
                  <th className="p-2.5 text-right">Total Invoice</th>
                  <th className="p-2.5 text-right">Telah Dibayar</th>
                  <th className="p-2.5 text-right">Sisa Piutang</th>
                  <th className="p-2.5 text-center">Capaian Pelunasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-[11px]">
                {customerSummaries.map((c, i) => {
                  const pct = c.totalGrandTotal > 0 ? (c.totalAmountPaid / c.totalGrandTotal) * 100 : 0;
                  return (
                    <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-2.5 font-extrabold text-white">{c.customerName}</td>
                      <td className="p-2.5 text-center font-bold text-slate-300">{c.invoiceCount}</td>
                      <td className="p-2.5 text-right font-medium text-slate-200">{formatCurrency(c.totalGrandTotal)}</td>
                      <td className="p-2.5 text-right font-medium text-emerald-400">{formatCurrency(c.totalAmountPaid)}</td>
                      <td className="p-2.5 text-right font-bold text-amber-400">{formatCurrency(c.totalRemainingBalance)}</td>
                      <td className="p-2.5 text-center font-bold text-slate-300">{pct.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Main AR Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Detail Tagihan Piutang Per Klien</h3>
            <p className="text-xs text-slate-500">Daftar seluruh invoice terbit & rincian pelunasan</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari Invoice / Pelanggan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
            >
              <option value="ALL">Semua Status ({invoices.length})</option>
              <option value="UNPAID">Belum Bayar (UNPAID)</option>
              <option value="PARTIAL">Bayar Sebagian (PARTIAL)</option>
              <option value="PAID">Lunas (PAID)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-600 dark:text-slate-400">
              <tr>
                <th className="p-3">No. Invoice</th>
                <th className="p-3">Pelanggan</th>
                <th className="p-3">Tgl Terbit</th>
                <th className="p-3">Jatuh Tempo</th>
                <th className="p-3 text-right">Nilai Invoice</th>
                <th className="p-3 text-right">Telah Dibayar</th>
                <th className="p-3 text-right">Sisa Piutang</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{inv.invoiceNumber}</td>
                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{inv.customerName}</td>
                  <td className="p-3 text-slate-500 font-medium">{formatDateIndo(inv.issueDate)}</td>
                  <td className="p-3 text-rose-600 font-semibold">{formatDateIndo(inv.dueDate)}</td>
                  <td className="p-3 text-right font-medium">{formatCurrency(inv.grandTotal)}</td>
                  <td className="p-3 text-right font-medium text-emerald-600">{formatCurrency(inv.amountPaid)}</td>
                  <td className="p-3 text-right font-bold text-amber-600">{formatCurrency(inv.remainingBalance)}</td>
                  <td className="p-3 text-center">
                    <Badge variant={inv.status === 'PAID' ? 'emerald' : inv.status === 'PARTIAL' ? 'warning' : 'error'}>
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedInvoiceForPrint(inv)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] hover:bg-emerald-100 transition-colors"
                      >
                        Invoice PDF
                      </button>
                      <button
                        onClick={() => setDeletingInvoice(inv)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                        title="Hapus Invoice"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-900 text-white font-extrabold text-xs">
              <tr>
                <td colSpan={4} className="p-3 text-center uppercase tracking-wider">
                  TOTAL REKAPAN ({filteredInvoices.length} INVOICE)
                </td>
                <td className="p-3 text-right font-black">{formatCurrency(filteredGrandTotal)}</td>
                <td className="p-3 text-right font-black text-emerald-400">{formatCurrency(filteredAmountPaid)}</td>
                <td className="p-3 text-right font-black text-amber-400">{formatCurrency(filteredRemainingBalance)}</td>
                <td colSpan={2} className="p-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <ARPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        invoices={invoices}
      />

      <ConfirmDeleteModal
        isOpen={!!deletingInvoice}
        onClose={() => setDeletingInvoice(null)}
        onConfirm={() => {
          if (deletingInvoice) deleteInvoice(deletingInvoice.id);
        }}
        title="Hapus Invoice"
        description="Apakah Anda yakin ingin menghapus invoice ini dari daftar piutang?"
        itemName={deletingInvoice ? `Invoice #${deletingInvoice.invoiceNumber} (${deletingInvoice.customerName})` : ''}
      />
    </div>
  );
};
