import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sun,
  Moon,
  Building2,
  UserCheck,
  ChevronDown,
  Sparkles,
  ShieldAlert,
  Search,
  Bell
} from 'lucide-react';

interface HeaderProps {
  onOpenLoginModal: () => void;
  toggleSidebarMobile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenLoginModal }) => {
  const { currentUser, companyInfo, darkMode, toggleDarkMode, activeTab } = useApp();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const activeTabTitles: Record<string, string> = {
    dashboard: 'Dashboard Utama Overview',
    customers: 'Database Customer & Klien',
    'sales-orders': 'Input Penjualan & Kontrak Pest Control',
    invoices: 'Cetak & Kelola Invoice Penjualan',
    suppliers: 'Database Supplier & Vendor',
    'purchase-orders': 'Input Purchase Order (PO) Supplier',
    'ar-report': 'Laporan Piutang Usaha (Accounts Receivable)',
    'ap-report': 'Laporan Hutang Supplier (Accounts Payable)',
    'kas-besar': 'Kas Besar Perusahaan',
    'kas-kecil': 'Kas Kecil Operasional Teknisi',
    'buku-bank': 'Buku Bank & Transaksi Rekening',
    jurnal: 'Jurnal Umum & Laporan Transaksi',
    'financial-statements': 'Neraca Laba Rugi & Arus Kas',
    'annual-report': 'Laporan Tahunan PT Boston Indo Global',
    npwp: 'Database & Manajemen NPWP (Pajak e-Faktur)'
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 lg:px-8 flex items-center justify-between gap-4 transition-colors">
      {/* Title & Page Header */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {activeTabTitles[activeTab] || 'Pest Control Management'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            {companyInfo.name} • {companyInfo.address.split(',')[1] || 'Bekasi'}
          </p>
        </div>
      </div>

      {/* Quick Search & Actions */}
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="hidden md:flex items-center relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          <input
            type="text"
            placeholder="Cari kontrak, invoice, customer..."
            className="pl-9 pr-4 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500/30 w-64"
          />
        </div>

        {/* Dark Mode Switcher */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-4 text-xs z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> Notifikasi Operasional
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                  3 Baru
                </span>
              </div>
              <div className="space-y-2.5">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Kontrak Rayap Jababeka</p>
                  <p className="text-[11px] text-slate-500">Termin ke-2 akan jatuh tempo dalam 5 hari.</p>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Penerimaan Transfer Astra</p>
                  <p className="text-[11px] text-slate-500">DP Rp 20.000.000 telah terkonfirmasi di Buku Bank.</p>
                </div>
                <div className="p-2 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/40">
                  <p className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-amber-500" /> Stok Bahan Kimia Bayer
                  </p>
                  <p className="text-[11px] text-amber-700/80 dark:text-amber-400">Restock termitisida diperlukan untuk pengerjaan pekan depan.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Role Switcher Pill */}
        <button
          onClick={onOpenLoginModal}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 border border-emerald-200/60 dark:border-emerald-800/60 transition-all text-left"
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-500/30"
          />
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-slate-900 dark:text-emerald-300 leading-tight">
              {currentUser.name}
            </p>
            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
              {currentUser.role === 'OWNER' ? 'Owner / Direktur' : currentUser.role === 'FINANCE' ? 'Finance & Accounting' : 'Admin Sales'}
            </p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ml-1" />
        </button>
      </div>
    </header>
  );
};
