import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateIndo } from '../../utils/dateUtils';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import {
  TrendingUp,
  Award,
  TrendingDown,
  DollarSign,
  CreditCard,
  Receipt,
  Wallet,
  Coins,
  Building,
  ShieldAlert,
  Calendar,
  ArrowRight,
  FileText,
  Users,
  CheckCircle2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    formatCurrency,
    invoices,
    purchaseOrders,
    cashTransactions,
    bankAccounts,
    customers,
    salesOrders,
    setActiveTab,
    setSelectedInvoiceForPrint,
    kasBesarInitialBalance,
    kasKecilInitialBalance
  } = useApp();

  const isOwner = currentUser.role === 'OWNER';

  // Metrics calculation
  const totalOmset = salesOrders.reduce((sum, so) => sum + so.grandTotal, 0);
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const totalPaidInvoices = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const totalAR = invoices.reduce((sum, inv) => sum + inv.remainingBalance, 0);
  const totalAP = purchaseOrders.reduce((sum, po) => sum + (po.grandTotal - po.amountPaid), 0);

  const kasBesarBalance = cashTransactions
    .filter(t => t.ledgerType === 'KAS_BESAR')
    .reduce((bal, t) => t.type === 'INCOME' ? bal + t.amount : bal - t.amount, kasBesarInitialBalance);

  const kasKecilBalance = cashTransactions
    .filter(t => t.ledgerType === 'KAS_KECIL')
    .reduce((bal, t) => t.type === 'INCOME' ? bal + t.amount : bal - t.amount, kasKecilInitialBalance);

  const totalBankBalance = bankAccounts.reduce((sum, b) => sum + b.balance, 0);

  const totalExpense = cashTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const labaBersihEstimate = totalOmset - totalExpense;

  // Monthly Revenue Chart Data
  const currentYear = 2026;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
  
  const chartMonthlyData = months.map((month, index) => {
    const monthNumber = (index + 1).toString().padStart(2, '0');
    
    const omset = salesOrders
      .filter(so => so.createdAt.startsWith(`${currentYear}-${monthNumber}`))
      .reduce((sum, so) => sum + so.grandTotal, 0);
      
    const pengeluaran = cashTransactions
      .filter(t => t.type === 'EXPENSE' && t.date.startsWith(`${currentYear}-${monthNumber}`))
      .reduce((sum, t) => sum + t.amount, 0);
      
    return { month, Omset: omset, Pengeluaran: pengeluaran };
  });

  // Service Type Distribution Data
  const serviceDistribution = [
    { name: 'Termite Control (Rayap)', value: 45, color: '#059669' },
    { name: 'General Pest Control', value: 30, color: '#10b981' },
    { name: 'Rodent Control (Tikus)', value: 15, color: '#34d399' },
    { name: 'Fumigation & Steril', value: 10, color: '#064e3b' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Overview */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 translate-x-10 -translate-y-10 pointer-events-none">
          <div className="w-96 h-96 rounded-full bg-emerald-400 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 mb-2">
              Sistem Manajemen Pest Control Terpadu
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              PT BOSTON INDO GLOBAL
            </h2>
            <p className="text-xs text-emerald-200/80 mt-1 max-w-xl leading-relaxed">
              Selamat datang di Dashboard Utama. Pantau performa omset, arus kas, piutang pelanggan, hutang supplier, dan jadwal kontrak pest control secara realtime.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('sales-dashboard')}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-950/30 transition-all flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-slate-950" /> Performa Marketing
            </button>

            {!isOwner ? (
              <>
                <button
                  onClick={() => setActiveTab('sales-orders')}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all flex items-center gap-2"
                >
                  + Input Sales Order Baru
                </button>
                <button
                  onClick={() => setActiveTab('invoices')}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" /> Cetak Invoice
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('ar-report')}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all flex items-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" /> Laporan Omset
                </button>
                <button
                  onClick={() => setActiveTab('financial-statements')}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all flex items-center gap-2"
                >
                  <DollarSign className="w-4 h-4" /> Laporan Keuangan
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Omset Penjualan"
          value={formatCurrency(totalOmset)}
          icon={TrendingUp}
          colorScheme="emerald"
        />
        <StatCard
          title="Total Uang Keluar (Expenses)"
          value={formatCurrency(totalExpense)}
          subtitle="Bahan Kimia + Operasional"
          icon={TrendingDown}
          colorScheme="amber"
        />
        <StatCard
          title="Estimasi Laba Bersih"
          value={formatCurrency(labaBersihEstimate)}
          icon={DollarSign}
          colorScheme="emerald"
        />
        <StatCard
          title="Piutang Pelanggan (AR)"
          value={formatCurrency(totalAR)}
          subtitle={`${invoices.filter(i => i.remainingBalance > 0).length} Invoice Belum Lunas`}
          icon={CreditCard}
          colorScheme="sky"
        />
      </div>

      {/* Secondary Financial Ledgers Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Kas Besar Kantor</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(kasBesarBalance)}</p>
            </div>
          </div>
          <button onClick={() => setActiveTab('kas-besar')} className="text-xs text-emerald-600 font-bold hover:underline">
            Detail →
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Kas Kecil (Petty Cash)</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(kasKecilBalance)}</p>
            </div>
          </div>
          <button onClick={() => setActiveTab('kas-kecil')} className="text-xs text-emerald-600 font-bold hover:underline">
            Detail →
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Saldo Buku Bank ({bankAccounts[0]?.bankName || 'BJB'})</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(totalBankBalance)}</p>
            </div>
          </div>
          <button onClick={() => setActiveTab('buku-bank')} className="text-xs text-emerald-600 font-bold hover:underline">
            Detail →
          </button>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Expense Bar Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tren Omset vs Pengeluaran 2026</h3>
              <p className="text-xs text-slate-500">Pertumbuhan bulanan PT Boston Indo Global</p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full">
              Tahun 2026
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartMonthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tickLine={false} style={{ fontSize: '11px' }} />
                <YAxis tickLine={false} style={{ fontSize: '10px' }} tickFormatter={(v) => `Rp${v / 1000000}M`} />
                <RechartsTooltip
                  formatter={(value: any) => [formatCurrency(Number(value)), '']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="Omset" fill="#059669" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Pengeluaran" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Type Donut Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Distribusi Layanan Pest Control</h3>
            <p className="text-xs text-slate-500">Porsi pendapatan berdasarkan jenis treatment</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={serviceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {serviceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(val) => [`${val}%`, 'Porsi']} />
              </RePieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {serviceDistribution.map(item => (
              <div key={item.name} className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
                <span className="font-bold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Invoices & Pending Payments Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Invoice & Piutang Terbaru</h3>
            <p className="text-xs text-slate-500">Daftar tagihan yang dikirim ke pelanggan</p>
          </div>
          {!isOwner ? (
            <button
              onClick={() => setActiveTab('invoices')}
              className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
            >
              Lihat Semua Invoice <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('ar-report')}
              className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
            >
              Lihat Detail Laporan Omset <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-600 dark:text-slate-400">
              <tr>
                <th className="p-3">No. Invoice</th>
                <th className="p-3">Pelanggan</th>
                <th className="p-3">Tgl Terbit</th>
                <th className="p-3">Jatuh Tempo</th>
                <th className="p-3 text-right">Total Tagihan</th>
                <th className="p-3 text-right">Sisa Piutang</th>
                <th className="p-3 text-center">Status</th>
                {!isOwner && <th className="p-3 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{inv.invoiceNumber}</td>
                  <td className="p-3 font-medium">{inv.customerName}</td>
                  <td className="p-3 text-slate-500 font-medium">{formatDateIndo(inv.issueDate)}</td>
                  <td className="p-3 text-slate-500 font-medium">{formatDateIndo(inv.dueDate)}</td>
                  <td className="p-3 text-right font-bold">{formatCurrency(inv.grandTotal)}</td>
                  <td className="p-3 text-right font-bold text-amber-600 dark:text-amber-400">
                    {formatCurrency(inv.remainingBalance)}
                  </td>
                  <td className="p-3 text-center">
                    <Badge variant={inv.status === 'PAID' ? 'emerald' : inv.status === 'PARTIAL' ? 'warning' : 'error'}>
                      {inv.status === 'PAID' ? 'LUNAS' : inv.status === 'PARTIAL' ? 'SEBAGIAN' : 'BELUM BAYAR'}
                    </Badge>
                  </td>
                  {!isOwner && (
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedInvoiceForPrint(inv);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px] hover:bg-emerald-100"
                      >
                        Cetak Invoice
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
