import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { APPrintModal } from './APPrintModal';
import { Supplier } from '../../types';
import { exportPurchaseOrdersExcel } from '../../utils/excelExport';
import { Receipt, Truck, DollarSign, Clock, Printer, FileSpreadsheet, Trash2 } from 'lucide-react';

export const APReportView: React.FC = () => {
  const { purchaseOrders, suppliers, deleteSupplier, formatCurrency } = useApp();
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const totalAP = purchaseOrders.reduce((sum, po) => sum + (po.grandTotal - po.amountPaid), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-emerald-600" /> Laporan Hutang Supplier (Accounts Payable)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Rekap kewajiban pembayaran ke vendor distributor bahan kimia dan peralatan kerja.
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
            onClick={() => setIsPrintModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs shadow-md flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Cetak Laporan AP
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Hutang Supplier (AP)"
          value={formatCurrency(totalAP)}
          subtitle="Total kewajiban PO belum lunas"
          icon={Receipt}
          colorScheme="amber"
        />
        <StatCard
          title="Jumlah Vendor Terkait"
          value={`${suppliers.length} Vendor`}
          subtitle="Bayer, Syngenta, BASF, dll"
          icon={Truck}
          colorScheme="emerald"
        />
        <StatCard
          title="Jatuh Tempo Bulan Ini"
          value={formatCurrency(totalAP)}
          subtitle="Masa termin berjalan"
          icon={Clock}
          colorScheme="sky"
        />
      </div>

      {/* Supplier Balances Summary */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Rekapitulasi Saldo Hutang Per Vendor</h3>
          <p className="text-xs text-slate-500">Saldo kewajiban terhutang berdasarkan database distributor</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-600 dark:text-slate-400">
              <tr>
                <th className="p-3">Kode Vendor</th>
                <th className="p-3">Nama Supplier</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">PIC Vendor</th>
                <th className="p-3">Rekening Pembayaran</th>
                <th className="p-3 text-right">Saldo Hutang Berjalan</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {suppliers.map((sup) => (
                <tr key={sup.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{sup.code}</td>
                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{sup.name}</td>
                  <td className="p-3 text-emerald-600 font-medium">{sup.category}</td>
                  <td className="p-3 text-slate-600">{sup.contactPerson} ({sup.phone})</td>
                  <td className="p-3 text-slate-600">{sup.bankName} - {sup.bankAccount}</td>
                  <td className="p-3 text-right font-bold text-amber-600 dark:text-amber-400">
                    {formatCurrency(sup.totalBalanceDue)}
                  </td>
                  <td className="p-3 text-center">
                    <Badge variant={sup.totalBalanceDue === 0 ? 'emerald' : 'warning'}>
                      {sup.totalBalanceDue === 0 ? 'LUNAS' : 'ADA HUTANG'}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setDeletingSupplier(sup)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                      title="Hapus Supplier"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={!!deletingSupplier}
        onClose={() => setDeletingSupplier(null)}
        onConfirm={() => {
          if (deletingSupplier) deleteSupplier(deletingSupplier.id);
        }}
        title="Hapus Supplier"
        description="Apakah Anda yakin ingin menghapus supplier ini dari daftar hutang?"
        itemName={deletingSupplier ? `${deletingSupplier.name} (${deletingSupplier.code})` : ''}
      />

      <APPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        purchaseOrders={purchaseOrders}
        suppliers={suppliers}
      />
    </div>
  );
};
