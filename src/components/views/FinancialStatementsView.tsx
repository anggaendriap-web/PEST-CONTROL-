import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { Modal } from '../common/Modal';
import { PieChart, TrendingUp, DollarSign, Printer, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';

export const FinancialStatementsView: React.FC = () => {
  const { salesOrders, cashTransactions, invoices, purchaseOrders, bankAccounts, formatCurrency, companyInfo, kasBesarInitialBalance, kasKecilInitialBalance, financialConfig, setFinancialConfig } = useApp();

  const [activeTab, setActiveTab] = useState<'LABA_RUGI' | 'NERACA' | 'ARUS_KAS'>('LABA_RUGI');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [config, setConfig] = useState(financialConfig);

  const handleSave = () => {
    setFinancialConfig(config);
    setIsEditModalOpen(false);
  };

  const handlePrint = () => {
    const printContent = document.getElementById('printable-wrapper');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Laporan Keuangan</title>
              <style>
                body { font-family: sans-serif; padding: 20px; }
                .flex { display: flex; }
                .justify-between { justify-content: space-between; }
                .border-b { border-bottom: 1px solid #ddd; }
                .py-2 { padding-top: 8px; padding-bottom: 8px; }
                .font-bold { font-weight: bold; }
                .text-rose-600 { color: #e11d48; }
                .text-emerald-600 { color: #059669; }
                .pl-4 { padding-left: 16px; }
                .space-y-1 > * + * { margin-top: 4px; }
                .border-t { border-top: 1px solid #ddd; }
                .font-extrabold { font-weight: 800; }
                .rounded-lg { border-radius: 8px; }
                .bg-slate-50 { background-color: #f9fafb; }
                .px-3 { padding-left: 12px; padding-right: 12px; }
                h3, h4 { margin: 0; }
                .text-center { text-align: center; }
                .max-w-3xl { max-width: 800px; margin: 0 auto; }
                .logo { width: 150px; margin-bottom: 15px; }
              </style>
            </head>
            <body>
              <div class="text-center"><img src="/logo.png" alt="Company Logo" class="logo" /></div>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  // Calculated Financial Metrics
  const totalOmsetWO = salesOrders.reduce((sum, so) => sum + so.subtotal, 0); // Gross revenue DPP
  const totalPPNCollected = invoices.reduce((sum, i) => sum + i.taxAmount, 0);

  const totalChemicalCost = purchaseOrders.reduce((sum, po) => sum + po.subtotal, 0);
  
  const grossProfit = totalOmsetWO - totalChemicalCost;
  const operatingExpense = financialConfig.bebanOperasional.reduce((sum, item) => sum + item.value, 0);
  const netProfit = grossProfit - operatingExpense;

  // Balance Sheet Assets
  const kasBesarBalance = cashTransactions
    .filter(t => t.ledgerType === 'KAS_BESAR')
    .reduce((bal, t) => t.type === 'INCOME' ? bal + t.amount : bal - t.amount, kasBesarInitialBalance);

  const kasKecilBalance = cashTransactions
    .filter(t => t.ledgerType === 'KAS_KECIL')
    .reduce((bal, t) => t.type === 'INCOME' ? bal + t.amount : bal - t.amount, kasKecilInitialBalance);

  const totalBank = bankAccounts.reduce((sum, b) => sum + b.balance, 0);
  const totalAR = invoices.reduce((sum, i) => sum + i.remainingBalance, 0);
  const totalAP = purchaseOrders.reduce((sum, po) => sum + (po.grandTotal - po.amountPaid), 0);

  const totalAsetLancar = kasBesarBalance + kasKecilBalance + totalBank + totalAR;
  const totalAsetTetap = financialConfig.asetTetap.reduce((sum, item) => sum + item.value, 0);
  const totalAset = totalAsetLancar + totalAsetTetap;

  const totalLiabilitas = totalAP + totalPPNCollected;
  const ekuitasModal = financialConfig.modalAwal; // Use modalAwal from config
  const netProfitForEquity = netProfit;
  const totalPasiva = totalLiabilitas + ekuitasModal + netProfitForEquity;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <PieChart className="w-6 h-6 text-emerald-600" /> Laporan Keuangan Utama
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Laporan Laba Rugi Komprehensif, Neraca Keuangan (Balance Sheet), dan Laporan Arus Kas PT Boston Indo Global.
          </p>
        </div>

        <button
          onClick={() => setIsEditModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-600 dark:bg-amber-700 text-white font-bold text-xs shadow-md flex items-center gap-2"
        >
          <Layers className="w-4 h-4" /> Edit Kategori/Aset
        </button>
        <button
          onClick={handlePrint}
          className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs shadow-md flex items-center gap-2"
        >
          <Printer className="w-4 h-4" /> Cetak Laporan Keuangan
        </button>
      </div>

      {/* Financial Statement Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('LABA_RUGI')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'LABA_RUGI'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          Laporan Laba Rugi (Income Statement)
        </button>
        <button
          onClick={() => setActiveTab('NERACA')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'NERACA'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          Neraca Keuangan (Balance Sheet)
        </button>
        <button
          onClick={() => setActiveTab('ARUS_KAS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ARUS_KAS'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          Laporan Arus Kas (Cash Flow)
        </button>
      </div>

      <div id="printable-wrapper">
        {/* LABA RUGI VIEW */}
        {activeTab === 'LABA_RUGI' && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4 text-center">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              {companyInfo.name}
            </h3>
            <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              LAPORAN LABA RUGI KOMPREHENSIF
            </h4>
            <p className="text-xs text-slate-500">Untuk Periode Berjalan 2026 (Dalam Rupiah / IDR)</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4 text-xs">
            {/* Pendapatan Usaha */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-slate-900 dark:text-white uppercase py-2 bg-slate-50 dark:bg-slate-800/60 px-3 rounded-lg">
                <span>1. PENDAPATAN JASA PEST CONTROL</span>
                <span>{formatCurrency(totalOmsetWO)}</span>
              </div>
              <div className="pl-4 space-y-1 text-slate-600 dark:text-slate-400">
                {financialConfig.pendapatan.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1 border-b border-slate-100">
                    <span>{item.name}</span>
                    <span>{formatCurrency(totalOmsetWO * item.percentage / 100)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* HPP / Bahan Kimia */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-slate-900 dark:text-white uppercase py-2 bg-slate-50 dark:bg-slate-800/60 px-3 rounded-lg">
                <span>2. BEBAN POKOK PENJUALAN (HPP - KIMIA & CONSUMABLES)</span>
                <span className="text-rose-600">({formatCurrency(totalChemicalCost)})</span>
              </div>
              <div className="pl-4 space-y-1 text-slate-600 dark:text-slate-400">
                {financialConfig.bebanPokok.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1 border-b border-slate-100">
                    <span>{item.name}</span>
                    <span>{formatCurrency(totalChemicalCost * item.percentage / 100)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* LABA KOTOR */}
            <div className="flex justify-between font-extrabold text-sm py-2.5 px-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 rounded-xl border border-emerald-200">
              <span>LABA KOTOR (GROSS PROFIT):</span>
              <span>{formatCurrency(grossProfit)}</span>
            </div>

            {/* Beban Operasional */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-slate-900 dark:text-white uppercase py-2 bg-slate-50 dark:bg-slate-800/60 px-3 rounded-lg">
                <span>3. BEBAN OPERASIONAL LAPANGAN & RUKO</span>
                <span className="text-rose-600">({formatCurrency(operatingExpense)})</span>
              </div>
              <div className="pl-4 space-y-1 text-slate-600 dark:text-slate-400">
                {financialConfig.bebanOperasional.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1 border-b border-slate-100">
                    <span>{item.name}</span>
                    <span>{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* LABA BERSIH */}
            <div className="flex justify-between font-black text-base py-3 px-4 bg-emerald-700 text-white rounded-2xl shadow-md">
              <span>LABA BERSIH TAHUN BERJALAN (NET PROFIT):</span>
              <span>{formatCurrency(netProfit)}</span>
            </div>
          </div>
        </div>
      )}

      {/* NERACA VIEW */}
      {activeTab === 'NERACA' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4 text-center">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              {companyInfo.name}
            </h3>
            <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              NERACA KEUANGAN (BALANCE SHEET)
            </h4>
            <p className="text-xs text-slate-500">Posisi Aset, Liabilitas, & Ekuitas Per 2026</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* ASET */}
            <div className="space-y-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <h4 className="font-extrabold text-sm text-emerald-700 uppercase border-b border-slate-200 pb-2">
                ASET (AKTIVA)
              </h4>

              <div className="space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">ASET LANCAR:</p>
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Kas Besar Kantor</span>
                  <span>{formatCurrency(kasBesarBalance)}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Kas Kecil Operasional</span>
                  <span>{formatCurrency(kasKecilBalance)}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-600">
                  <span>{bankAccounts[0]?.bankName || 'Bank BJB'}</span>
                  <span>{formatCurrency(totalBank)}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Piutang Pelanggan (AR)</span>
                  <span>{formatCurrency(totalAR)}</span>
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-200">
                <p className="font-bold text-slate-900 dark:text-white">ASET TETAP:</p>
                {financialConfig.asetTetap.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1 text-slate-600">
                    <span>{item.name}</span>
                    <span>{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-extrabold text-sm py-2 px-3 bg-emerald-600 text-white rounded-lg">
                <span>TOTAL ASET (AKTIVA):</span>
                <span>{formatCurrency(totalAset)}</span>
              </div>
            </div>

            {/* LIABILITAS & EKUITAS */}
            <div className="space-y-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <h4 className="font-extrabold text-sm text-amber-700 uppercase border-b border-slate-200 pb-2">
                LIABILITAS & EKUITAS (PASIVA)
              </h4>

              <div className="space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">LIABILITAS (HUTANG):</p>
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Hutang Supplier Chemical (AP)</span>
                  <span>{formatCurrency(totalAP)}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Hutang PPN Keluaran (11%)</span>
                  <span>{formatCurrency(totalPPNCollected)}</span>
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-200">
                <p className="font-bold text-slate-900 dark:text-white">EKUITAS (MODAL OWNER):</p>
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Modal Disetor Owner</span>
                  <span>{formatCurrency(financialConfig.modalAwal)}</span>
                </div>
                <div className="flex justify-between py-1 text-emerald-700 font-bold">
                  <span>Laba Ditahan Tahun Berjalan</span>
                  <span>{formatCurrency(netProfit)}</span>
                </div>
              </div>

              <div className="flex justify-between font-extrabold text-sm py-2 px-3 bg-amber-600 text-white rounded-lg">
                <span>TOTAL PASIVA:</span>
                <span>{formatCurrency(totalLiabilitas + financialConfig.modalAwal + netProfit)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ARUS KAS VIEW */}
      {activeTab === 'ARUS_KAS' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4 text-center">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              {companyInfo.name}
            </h3>
            <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              LAPORAN ARUS KAS (CASH FLOW STATEMENT)
            </h4>
            <p className="text-xs text-slate-500">Arus Kas Operasional, Investasi, & Pendanaan 2026</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
              <p className="font-bold text-slate-900 dark:text-white uppercase">1. ARUS KAS DARI AKTIVITAS OPERASIONAL</p>
              <div className="flex justify-between text-slate-600">
                <span>Penerimaan Kas dari Pelanggan (Pelunasan Invoice)</span>
                <span className="font-bold text-emerald-600">{formatCurrency(totalOmsetWO * 0.85)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Pembayaran Kas ke Supplier Bahan Kimia</span>
                <span className="font-bold text-rose-600">({formatCurrency(totalChemicalCost * 0.70)})</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Pembayaran Kas Beban Operasional Lapangan</span>
                <span className="font-bold text-rose-600">({formatCurrency(operatingExpense)})</span>
              </div>
            </div>

            <div className="flex justify-between font-extrabold text-sm py-3 px-4 bg-emerald-600 text-white rounded-xl">
              <span>SALDO KAS & BANK AKHIR:</span>
              <span>{formatCurrency(kasBesarBalance + kasKecilBalance + totalBank)}</span>
            </div>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Konfigurasi Keuangan" maxWidth="lg">
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Modal Awal Owner (Rp)</label>
            <input
              type="number"
              value={config.modalAwal}
              onChange={(e) => setConfig({ ...config, modalAwal: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Pendapatan Jasa (%)</h4>
            {config.pendapatan.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-2 items-center">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => {
                    const newP = [...config.pendapatan];
                    newP[idx].name = e.target.value;
                    setConfig({ ...config, pendapatan: newP });
                  }}
                  className="flex-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <input
                  type="number"
                  value={item.percentage}
                  onChange={(e) => {
                    const newP = [...config.pendapatan];
                    newP[idx].percentage = Number(e.target.value);
                    setConfig({ ...config, pendapatan: newP });
                  }}
                  className="w-20 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <span className="text-xs text-slate-500">%</span>
              </div>
            ))}
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Beban Pokok / HPP (%)</h4>
            {config.bebanPokok.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-2 items-center">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => {
                    const newP = [...config.bebanPokok];
                    newP[idx].name = e.target.value;
                    setConfig({ ...config, bebanPokok: newP });
                  }}
                  className="flex-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <input
                  type="number"
                  value={item.percentage}
                  onChange={(e) => {
                    const newP = [...config.bebanPokok];
                    newP[idx].percentage = Number(e.target.value);
                    setConfig({ ...config, bebanPokok: newP });
                  }}
                  className="w-20 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <span className="text-xs text-slate-500">%</span>
              </div>
            ))}
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Beban Operasional (Rp)</h4>
            {config.bebanOperasional.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-2 items-center">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => {
                    const newP = [...config.bebanOperasional];
                    newP[idx].name = e.target.value;
                    setConfig({ ...config, bebanOperasional: newP });
                  }}
                  className="flex-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <input
                  type="number"
                  value={item.value}
                  onChange={(e) => {
                    const newP = [...config.bebanOperasional];
                    newP[idx].value = Number(e.target.value);
                    setConfig({ ...config, bebanOperasional: newP });
                  }}
                  className="w-32 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            ))}
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Aset Tetap (Rp)</h4>
            {config.asetTetap.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-2 items-center">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => {
                    const newP = [...config.asetTetap];
                    newP[idx].name = e.target.value;
                    setConfig({ ...config, asetTetap: newP });
                  }}
                  className="flex-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <input
                  type="number"
                  value={item.value}
                  onChange={(e) => {
                    const newP = [...config.asetTetap];
                    newP[idx].value = Number(e.target.value);
                    setConfig({ ...config, asetTetap: newP });
                  }}
                  className="w-32 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleSave}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition-colors"
          >
            Simpan Perubahan
          </button>
        </div>
      </Modal>
      </div>
    </div>
  );
};
