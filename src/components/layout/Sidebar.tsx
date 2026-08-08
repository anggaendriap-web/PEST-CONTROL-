import React from 'react';
import { useApp } from '../../context/AppContext';
import { BostonPestLogo } from '../common/BostonPestLogo';
import {
  LayoutDashboard,
  Award,
  Users,
  ShoppingCart,
  FileText,
  Truck,
  PackageCheck,
  CreditCard,
  Receipt,
  Wallet,
  Coins,
  Building,
  BookOpen,
  PieChart,
  CalendarCheck,
  ShieldCheck,
  FileCheck,
  LogOut,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenLoginModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpenMobile,
  onCloseMobile,
  onOpenLoginModal
}) => {
  const { activeTab, setActiveTab, currentUser, companyInfo } = useApp();

  const isOwner = currentUser.role === 'OWNER';
  const isRestrictedRole = currentUser.role === 'FINANCE' || currentUser.role === 'ADMIN_SALES';

  const menuGroups = isOwner ? [
    {
      groupTitle: 'DASHBOARD & PERFORMANCE',
      items: [
        { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard },
        { id: 'sales-dashboard', label: 'Performa Marketing', icon: Award }
      ]
    },
    {
      groupTitle: 'OMSET & ARUS KAS',
      items: [
        { id: 'ar-report', label: 'Laporan Omset', icon: CreditCard },
        { id: 'buku-bank', label: 'Laporan Uang Masuk', icon: Building },
        { id: 'ap-report', label: 'Laporan Uang Keluar', icon: Receipt }
      ]
    },
    {
      groupTitle: 'KAS & PERBENDAHARAAN',
      items: [
        { id: 'kas-besar', label: 'Kas Besar', icon: Wallet },
        { id: 'kas-kecil', label: 'Kas Kecil (Operational)', icon: Coins },
        { id: 'slip-gaji', label: 'Slip Gaji', icon: FileText }
      ]
    },
    {
      groupTitle: 'PERPAJAKAN & MANAJEMEN',
      items: [
        { id: 'financial-statements', label: 'Laporan Keuangan', icon: PieChart },
        { id: 'annual-report', label: 'Laporan Tahunan 2026', icon: CalendarCheck },
        { id: 'npwp', label: 'Menu NPWP (Pajak)', icon: FileCheck },
        { id: 'tax-report', label: 'Dashboard Laporan Pajak', icon: FileCheck }
      ]
    }
  ] : [
    {
      groupTitle: 'UTAMA & SALES',
      items: [
        { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard },
        { id: 'sales-dashboard', label: 'Performa Marketing', icon: Award },
        { id: 'customers', label: 'Database Customer', icon: Users },
        { id: 'sales-orders', label: 'Input Penjualan', icon: ShoppingCart },
        { id: 'invoices', label: 'Cetak Invoice', icon: FileText },
        { id: 'npwp', label: 'Menu NPWP (Pajak)', icon: FileCheck }
      ]
    },
    {
      groupTitle: 'SUPPLIER & PEMBELIAN',
      items: [
        { id: 'suppliers', label: 'Database Supplier', icon: Truck },
        { id: 'purchase-orders', label: 'Input PO Supplier', icon: PackageCheck }
      ]
    },
    {
      groupTitle: 'HUTANG & PIUTANG',
      items: [
        { id: 'ar-report', label: 'Laporan Piutang (AR)', icon: CreditCard },
        { id: 'ap-report', label: 'Laporan Hutang (AP)', icon: Receipt }
      ]
    },
    {
      groupTitle: 'KEUANGAN & KAS',
      items: [
        { id: 'kas-besar', label: 'Kas Besar', icon: Wallet },
        { id: 'kas-kecil', label: 'Kas Kecil (Operational)', icon: Coins },
        { id: 'buku-bank', label: 'Buku Bank', icon: Building },
        { id: 'jurnal', label: 'Jurnal Laporan', icon: BookOpen },
        { id: 'slip-gaji', label: 'Slip Gaji', icon: FileText }
      ]
    },
    ...(isRestrictedRole ? [] : [{
      groupTitle: 'LAPORAN MANAJEMEN',
      items: [
        { id: 'financial-statements', label: 'Neraca & Laba Rugi', icon: PieChart },
        { id: 'annual-report', label: 'Laporan Tahunan 2026', icon: CalendarCheck }
      ]
    }])
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      <aside
        className={`fixed lg:static top-0 left-0 z-40 h-screen w-72 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/70">
          <BostonPestLogo variant="dark" height={42} />
        </div>

        {/* User Status Bar */}
        <div className="px-5 py-3 bg-emerald-950/30 border-b border-emerald-900/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] font-semibold text-emerald-200">
              User: <span className="text-white">{currentUser.name}</span>
            </span>
          </div>
          <button
            onClick={onOpenLoginModal}
            className="text-[10px] text-emerald-400 hover:underline font-bold"
          >
            Ganti
          </button>
        </div>

        {/* Navigation Items List */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {menuGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                {group.groupTitle}
              </h3>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-center">
          <p className="text-[10px] text-slate-500 font-medium">
            © 2026 {companyInfo.name}
          </p>
          <p className="text-[9px] text-slate-600 mt-0.5">
            Grand Wisata Bekasi • v2.4 Pro
          </p>
        </div>
      </aside>
    </>
  );
};
