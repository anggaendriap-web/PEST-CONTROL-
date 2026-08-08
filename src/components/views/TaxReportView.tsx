import React from 'react';
import { useApp } from '../../context/AppContext';
import { FileCheck, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { StatCard } from '../common/StatCard';

export const TaxReportView: React.FC = () => {
  const { invoices, purchaseOrders, formatCurrency } = useApp();

  const totalSalesTax = invoices.reduce((sum, inv) => sum + inv.taxAmount, 0);
  const totalPurchaseTax = purchaseOrders.reduce((sum, po) => sum + po.taxPPN, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <FileCheck className="w-6 h-6 text-emerald-600" /> Dashboard Laporan Pajak
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Total PPN Penjualan"
          value={formatCurrency(totalSalesTax)}
          subtitle="PPN 11% dari Invoice"
          icon={ArrowUpRight}
          colorScheme="emerald"
        />
        <StatCard
          title="Total PPN Pembelian"
          value={formatCurrency(totalPurchaseTax)}
          subtitle="PPN dari PO Supplier"
          icon={ArrowDownRight}
          colorScheme="rose"
        />
      </div>

      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Ringkasan Pajak</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
            Pajak PPN Bersih yang harus dilaporkan: {formatCurrency(totalSalesTax - totalPurchaseTax)}
        </p>
      </div>
    </div>
  );
};
