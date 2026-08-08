import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { LoginModal } from './components/views/LoginModal';
import { LoginPage } from './components/views/LoginPage';

import { SlipGajiView } from './components/views/SlipGajiView';
import { DashboardView } from './components/views/DashboardView';
import { SalesDashboardView } from './components/views/SalesDashboardView';
import { CustomerView } from './components/views/CustomerView';
import { SalesOrderView } from './components/views/SalesOrderView';
import { InvoiceView } from './components/views/InvoiceView';
import { SupplierView } from './components/views/SupplierView';
import { PurchaseOrderView } from './components/views/PurchaseOrderView';
import { ARReportView } from './components/views/ARReportView';
import { APReportView } from './components/views/APReportView';
import { KasBesarView } from './components/views/KasBesarView';
import { KasKecilView } from './components/views/KasKecilView';
import { BukuBankView } from './components/views/BukuBankView';
import { JurnalReportView } from './components/views/JurnalReportView';
import { FinancialStatementsView } from './components/views/FinancialStatementsView';
import { AnnualReportView } from './components/views/AnnualReportView';
import { NPWPView } from './components/views/NPWPView';
import { TaxReportView } from './components/views/TaxReportView';

import { Menu } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, isAppUnlocked } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  if (!isAppUnlocked) {
    return <LoginPage />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'slip-gaji':
        return <SlipGajiView />;
      case 'dashboard':
        return <DashboardView />;
      case 'sales-dashboard':
        return <SalesDashboardView />;
      case 'customers':
        return <CustomerView />;
      case 'sales-orders':
        return <SalesOrderView />;
      case 'invoices':
        return <InvoiceView />;
      case 'suppliers':
        return <SupplierView />;
      case 'purchase-orders':
        return <PurchaseOrderView />;
      case 'ar-report':
        return <ARReportView />;
      case 'ap-report':
        return <APReportView />;
      case 'kas-besar':
        return <KasBesarView />;
      case 'kas-kecil':
        return <KasKecilView />;
      case 'buku-bank':
        return <BukuBankView />;
      case 'jurnal':
        return <JurnalReportView />;
      case 'financial-statements':
        return <FinancialStatementsView />;
      case 'annual-report':
        return <AnnualReportView />;
      case 'npwp':
        return <NPWPView />;
      case 'tax-report':
        return <TaxReportView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onOpenLoginModal={() => setLoginModalOpen(true)}
      />

      {/* Main Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-3 text-slate-600 dark:text-slate-300 lg:hidden hover:bg-slate-200 dark:hover:bg-slate-800"
            title="Open Mobile Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <Header
              onOpenLoginModal={() => setLoginModalOpen(true)}
              toggleSidebarMobile={() => setMobileSidebarOpen(true)}
            />
          </div>
        </div>

        {/* View Body Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-800">
          {renderActiveView()}
        </main>
      </div>

      {/* User Login / Switch Role Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
