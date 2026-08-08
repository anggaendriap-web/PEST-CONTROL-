import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { CalendarCheck, Printer, Award, Building2, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const AnnualReportView: React.FC = () => {
  const { companyInfo, salesOrders, customers, suppliers, formatCurrency } = useApp();

  const totalOmset = salesOrders.reduce((sum, so) => sum + so.grandTotal, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-emerald-600" /> Laporan Tahunan PT Boston Indo Global (2026)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Ringkasan eksekutif kinerja operasional, pertumbuhan klien kawasan industri, dan stabilitas finansial.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs shadow-md flex items-center gap-2"
        >
          <Printer className="w-4 h-4" /> Cetak Laporan Tahunan
        </button>
      </div>

      {/* Hero Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-900 via-slate-900 to-emerald-950 text-white shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xl flex items-center justify-center">
            BIG
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">{companyInfo.name}</h1>
            <p className="text-xs text-emerald-300 font-semibold">{companyInfo.field}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-emerald-800/80">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-400">Total Revenue WO 2026</span>
            <p className="text-2xl font-extrabold text-white mt-1">{formatCurrency(totalOmset)}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-400">Total Klien Industri Aktif</span>
            <p className="text-2xl font-extrabold text-white mt-1">{customers.length} Klien Corporate</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-400">Jaringan Distributor Kimia</span>
            <p className="text-2xl font-extrabold text-white mt-1">{suppliers.length} Supplier Resmi</p>
          </div>
        </div>
      </div>

      {/* Annual Summary Text & Authorizations */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 text-xs text-slate-700 dark:text-slate-300">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" /> Ringkasan Pencapaian Manajemen Tahun 2026
          </h3>
          <p className="leading-relaxed text-slate-600 dark:text-slate-400">
            Sepanjang tahun 2026, PT Boston Indo Global berhasil memperluas cakupan layanan pest control, termite control, dan sterilisasi disinfeksi di kawasan industri Jababeka Cikarang, MM2100, dan Bekasi. Penggunaan bahan kimia berstandar internasional dari Bayer, Syngenta, dan BASF memastikan efektivitas penanganan hama dengan tingkat kepuasan klien mencapai 98%.
          </p>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
          <p className="text-[10px] text-slate-400 text-center uppercase tracking-wider font-semibold mb-8">
            LEMBAR PENGESAHAN LAPORAN TAHUNAN 2026
          </p>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-[10px] text-slate-500 mb-12">Disiapkan Oleh (Sales),</p>
              <div className="border-t border-slate-300 dark:border-slate-700 pt-1">
                <p className="font-bold text-slate-900 dark:text-white">{companyInfo.adminSales}</p>
                <p className="text-[10px] text-slate-500">Admin Sales & Operations</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] text-slate-500 mb-12">Diperiksa Oleh (Finance),</p>
              <div className="border-t border-slate-300 dark:border-slate-700 pt-1">
                <p className="font-bold text-slate-900 dark:text-white">{companyInfo.finance}</p>
                <p className="text-[10px] text-slate-500">Finance & Accounting</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] text-slate-500 mb-12">Disetujui Oleh (Owner),</p>
              <div className="border-t border-slate-300 dark:border-slate-700 pt-1">
                <p className="font-bold text-slate-900 dark:text-white">{companyInfo.owner}</p>
                <p className="text-[10px] text-slate-500">Direktur Utama</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
