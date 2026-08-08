import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { exportSalesAchievementExcel } from '../../utils/excelExport';
import { SalesOrder, MarketingTarget } from '../../types';
import {
  TrendingUp,
  Award,
  Users,
  FileSpreadsheet,
  Target,
  BarChart3,
  Briefcase,
  Star,
  Percent,
  Search,
  Eye,
  Edit,
  Plus,
  Trash2,
  Save,
  UserCheck,
  Building,
  DollarSign
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

// Helper to generate initials from name without using photo images
const getInitials = (name: string) => {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return 'MK';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

export const SalesDashboardView: React.FC = () => {
  const {
    salesOrders,
    formatCurrency,
    marketingTeam,
    addMarketingTarget,
    updateMarketingTarget,
    deleteMarketingTarget
  } = useApp();

  // Period Controls State
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedMonth, setSelectedMonth] = useState<string>('08');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Marketing ID for Viewing Work Orders
  const [selectedMarketingId, setSelectedMarketingId] = useState<string | null>(null);
  const [woSearchModal, setWoSearchModal] = useState('');
  const [woStatusFilterModal, setWoStatusFilterModal] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'DRAFT'>('ALL');

  // Modal State for Manage/Edit Marketing & Target Omset
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<MarketingTarget | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form Data for Edit / Create Marketing
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    area: '',
    targetOmset: 0,
    commissionRate: 0.04
  });

  // Month Names Helper
  const MONTH_NAMES: Record<string, string> = {
    '01': 'Januari',
    '02': 'Februari',
    '03': 'Maret',
    '04': 'April',
    '05': 'Mei',
    '06': 'Juni',
    '07': 'Juli',
    '08': 'Agustus',
    '09': 'September',
    '10': 'Oktober',
    '11': 'November',
    '12': 'Desember'
  };

  // Human Readable Active Period Label
  const periodLabel = React.useMemo(() => {
    if (selectedYear === 'ALL' && selectedMonth === 'ALL') return 'Semua Periode Data';
    if (selectedMonth !== 'ALL' && selectedYear !== 'ALL') return `Bulan ${MONTH_NAMES[selectedMonth] || selectedMonth} ${selectedYear}`;
    if (selectedMonth !== 'ALL' && selectedYear === 'ALL') return `Bulan ${MONTH_NAMES[selectedMonth] || selectedMonth} (Semua Tahun)`;
    return `Tahun ${selectedYear} (12 Bulan)`;
  }, [selectedYear, selectedMonth]);

  // Extract Year & Month from Sales Order (from contractStartDate, createdAt, or WO number)
  const getSoYearMonth = (so: SalesOrder) => {
    let dateStr = so.contractStartDate || so.createdAt || '';
    let year = '';
    let month = '';

    if (dateStr && dateStr.length >= 7) {
      const parts = dateStr.split('-');
      if (parts.length >= 2) {
        year = parts[0];
        month = parts[1];
      }
    }

    if (!year && so.orderNumber) {
      const parts = so.orderNumber.split('/');
      if (parts.length >= 5) {
        year = parts[2];
        month = parts[3];
      }
    }

    return { year, month };
  };

  // Filter Sales Orders based on Year & Month Controls
  const filteredSalesOrders = salesOrders.filter((so) => {
    if (so.status === 'CANCELLED') return false;

    const { year, month } = getSoYearMonth(so);

    if (selectedYear !== 'ALL' && year && year !== selectedYear) {
      return false;
    }
    if (selectedMonth !== 'ALL' && month && month !== selectedMonth) {
      return false;
    }
    return true;
  });

  // Calculate Achievement per Marketing
  const marketingAchievements = marketingTeam.map((member) => {
    const orders = filteredSalesOrders.filter(
      (so) => so.salesPerson.toUpperCase().trim() === member.name.toUpperCase().trim()
    );

    const actualOmset = orders.reduce((sum, so) => sum + so.grandTotal, 0);

    // Effective Target Omset based on selected period length
    // Member's targetOmset is monthly target. If full year is selected, target is x12.
    const effectiveTarget = selectedMonth !== 'ALL' ? member.targetOmset : member.targetOmset * 12;
    const achievementPct = effectiveTarget > 0 ? (actualOmset / effectiveTarget) * 100 : 0;

    // Effective commission (bonus 1% extra if over 100% target)
    const effectiveCommissionRate = achievementPct >= 100 ? member.commissionRate + 0.01 : member.commissionRate;
    const estimatedCommission = actualOmset * effectiveCommissionRate;

    let statusLabel = 'Dalam Proses';
    let statusBadgeColor: 'success' | 'warning' | 'info' | 'danger' = 'info';

    if (achievementPct >= 100) {
      statusLabel = 'TARGET ACHIEVED 🎉';
      statusBadgeColor = 'success';
    } else if (achievementPct >= 75) {
      statusLabel = 'HAMPIR TARGET';
      statusBadgeColor = 'info';
    } else {
      statusLabel = 'BELUM TARGET';
      statusBadgeColor = 'warning';
    }

    return {
      info: member,
      orders,
      actualOmset,
      effectiveTarget,
      achievementPct,
      dealsCount: orders.length,
      estimatedCommission,
      statusLabel,
      statusBadgeColor
    };
  });

  // Selected Marketing for View Work Orders
  const selectedMarketing = marketingAchievements.find((item) => item.info.id === selectedMarketingId) || null;

  // Filter Search Marketing
  const searchFilteredAchievements = marketingAchievements.filter(
    (item) =>
      item.info.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.info.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.info.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Overall Metrics
  const totalOmsetRealized = filteredSalesOrders.reduce((sum, so) => sum + so.grandTotal, 0);
  const totalTargetCollective = marketingAchievements.reduce((sum, m) => sum + m.effectiveTarget, 0);
  const overallAchievementPct = totalTargetCollective > 0 ? (totalOmsetRealized / totalTargetCollective) * 100 : 0;
  const totalDealsWon = filteredSalesOrders.length;

  // Top Performer
  const topPerformer = [...marketingAchievements].sort((a, b) => b.actualOmset - a.actualOmset)[0];

  // Recharts Data for Marketing Omset Comparison
  const chartBarData = marketingAchievements.map((m) => ({
    name: m.info.name.split(' ')[0],
    Target: m.info.targetOmset,
    Realisasi: m.actualOmset
  }));

  // Recharts Service Type Breakdown
  const serviceCategories = [
    'Termite Control (Rayap)',
    'General Pest Control (Serangga/Nyamuk/Lalat/Kecoa)',
    'Rodent Control (Tikus)',
    'Fumigation (Fumigasi)',
    'Bed Bug Treatment (Kutu Busuk)',
    'Disinfection & Sterilization',
    'Snake Control (Ular)',
    'Bird Control (Burung)',
    'Cat Control (Kucing)'
  ];

  const COLORS = ['#059669', '#10b981', '#34d399', '#064e3b', '#6ee7b7', '#0284c7', '#f59e0b', '#8b5cf6', '#ec4899'];

  const serviceChartData = serviceCategories
    .map((cat) => {
      const totalVal = filteredSalesOrders
        .filter((so) => so.serviceType === cat)
        .reduce((sum, so) => sum + so.grandTotal, 0);
      return {
        name: cat.split('(')[0].trim(),
        fullName: cat,
        value: totalVal
      };
    })
    .filter((d) => d.value > 0);

  // Form Handlers
  const handleOpenAdd = () => {
    setEditingTarget(null);
    setFormData({
      name: '',
      role: 'Corporate Sales Specialist',
      area: 'Kawasan Industri Bekasi',
      targetOmset: 50000000,
      commissionRate: 0.04
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (target: MarketingTarget) => {
    setEditingTarget(target);
    setFormData({
      name: target.name,
      role: target.role,
      area: target.area,
      targetOmset: target.targetOmset,
      commissionRate: target.commissionRate
    });
    setIsFormOpen(true);
  };

  const handleSaveMarketing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingTarget) {
      updateMarketingTarget({
        ...editingTarget,
        name: formData.name.toUpperCase().trim(),
        role: formData.role,
        area: formData.area,
        targetOmset: Number(formData.targetOmset),
        commissionRate: Number(formData.commissionRate)
      });
    } else {
      addMarketingTarget({
        name: formData.name.toUpperCase().trim(),
        role: formData.role,
        area: formData.area,
        targetOmset: Number(formData.targetOmset),
        commissionRate: Number(formData.commissionRate)
      });
    }

    setIsFormOpen(false);
  };

  const handleDeleteMarketing = (id: string, name: string) => {
    if (window.confirm(`Hapus data marketing ${name}?`)) {
      deleteMarketingTarget(id);
    }
  };

  // Export Handler
  const handleExportExcel = () => {
    const dataToExport = marketingAchievements.map((m) => ({
      name: m.info.name,
      role: `${m.info.role} (${m.info.area})`,
      target: m.info.targetOmset,
      actual: m.actualOmset,
      achievementPct: m.achievementPct,
      dealsCount: m.dealsCount,
      estimatedCommission: m.estimatedCommission,
      status: m.statusLabel
    }));
    exportSalesAchievementExcel(dataToExport);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* View Title Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Performance & Target Marketing Executive
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold text-[10px] uppercase tracking-wider">
              📍 Control: {periodLabel}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Dashboard Sales & Target Marketing
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitoring Pencapaian Target Omset Penjualan per Nama Marketing, Work Orders, & Estimasi Bonus Komisi PT Boston Indo Global
          </p>
        </div>

        {/* Action Buttons & Period Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Period Presets */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => {
                setSelectedYear('2026');
                setSelectedMonth('08');
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedYear === '2026' && selectedMonth === '08'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Agustus 2026
            </button>
            <button
              onClick={() => {
                setSelectedYear('2026');
                setSelectedMonth('07');
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedYear === '2026' && selectedMonth === '07'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Juli 2026
            </button>
            <button
              onClick={() => {
                setSelectedYear('2026');
                setSelectedMonth('ALL');
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedYear === '2026' && selectedMonth === 'ALL'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Tahun 2026
            </button>
            <button
              onClick={() => {
                setSelectedYear('ALL');
                setSelectedMonth('ALL');
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedYear === 'ALL' && selectedMonth === 'ALL'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Semua Periode
            </button>
          </div>

          {/* Custom Month / Year Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
            >
              <option value="ALL">-- Semua Bulan --</option>
              <option value="01">Januari</option>
              <option value="02">Februari</option>
              <option value="03">Maret</option>
              <option value="04">April</option>
              <option value="05">Mei</option>
              <option value="06">Juni</option>
              <option value="07">Juli</option>
              <option value="08">Agustus</option>
              <option value="09">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
            >
              <option value="ALL">-- Semua Tahun --</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>

          {/* Manage Target Marketing Button */}
          <button
            onClick={() => setIsManageModalOpen(true)}
            className="px-3.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 transition-all"
          >
            <Edit className="w-4 h-4" /> Kelola Target
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400 dark:text-white" /> Export Excel
          </button>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="TOTAL OMSET SALES REALISASI"
          value={formatCurrency(totalOmsetRealized)}
          description={`${totalDealsWon} Transaksi / Work Order Terjual`}
          icon={TrendingUp}
          trend={{ value: `${overallAchievementPct.toFixed(1)}% Target`, isPositive: overallAchievementPct >= 100 }}
        />

        <StatCard
          title="TARGET OMSET TIM MARKETING"
          value={formatCurrency(totalTargetCollective)}
          description="Target Kolektif Tim Sales"
          icon={Target}
        />

        <StatCard
          title="OVERALL ACHIEVEMENT TARGET"
          value={`${overallAchievementPct.toFixed(1)}%`}
          description={overallAchievementPct >= 100 ? 'Target Kolektif Tercapai!' : 'Mengejar Target Perusahaan'}
          icon={Percent}
          badge={{
            text: overallAchievementPct >= 100 ? 'ACHIEVED' : 'IN PROGRESS',
            variant: overallAchievementPct >= 100 ? 'success' : 'warning'
          }}
        />

        {topPerformer && (
          <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white shadow-lg border border-slate-800 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1 border border-emerald-500/30">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> TOP PERFORMER MARKETING
              </span>
              <Award className="w-6 h-6 text-amber-400" />
            </div>

            <div className="my-3 flex items-center gap-3">
              {/* Initial Badge instead of photo */}
              <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-emerald-100 font-black text-lg flex items-center justify-center border-2 border-amber-400 shadow-md shrink-0">
                {getInitials(topPerformer.info.name)}
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white tracking-tight">{topPerformer.info.name}</h3>
                <p className="text-[11px] text-emerald-400 font-bold">{formatCurrency(topPerformer.actualOmset)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-2">
              <span>Capaian Target:</span>
              <span className="font-extrabold text-emerald-300">{topPerformer.achievementPct.toFixed(1)}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard Table & Marketing Cards Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" /> Leaderboard & Capaian Per Marketing Executive
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Rincian perolehan omset penjualan, status pencapaian target, serta estimasi komisi per nama tim marketing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama marketing / area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={handleOpenAdd}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Sales
            </button>
          </div>
        </div>

        {/* Marketing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {searchFilteredAchievements.map((item, index) => {
            const isTop = index === 0;

            return (
              <div
                key={item.info.id}
                className={`p-5 rounded-2xl border transition-all relative flex flex-col justify-between ${
                  item.achievementPct >= 100
                    ? 'bg-gradient-to-br from-emerald-50/70 via-white to-white dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-900 border-emerald-200 dark:border-emerald-800/80 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Header Profile (No photos used) */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      {/* Typographic Initials Icon Badge */}
                      <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 dark:from-emerald-900 dark:to-slate-950 text-white font-extrabold text-sm flex items-center justify-center border border-slate-700 shadow-sm shrink-0">
                          {getInitials(item.info.name)}
                        </div>
                        {isTop && (
                          <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center shadow-md border border-white dark:border-slate-900">
                            🏆
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {item.info.name}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{item.info.role}</p>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md inline-block mt-0.5">
                          📍 {item.info.area}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={item.statusBadgeColor}>{item.statusLabel}</Badge>
                      <button
                        onClick={() => handleOpenEdit(item.info)}
                        className="text-[10px] text-amber-600 hover:text-amber-700 dark:text-amber-400 font-extrabold underline flex items-center gap-0.5 mt-1"
                      >
                        <Edit className="w-3 h-3" /> Edit Target
                      </button>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs mb-3">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold uppercase">
                        Target Omset
                      </span>
                      <span className="font-extrabold text-slate-900 dark:text-slate-100">
                        {formatCurrency(item.effectiveTarget)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold uppercase">
                        Realisasi Omset
                      </span>
                      <span className="font-extrabold text-emerald-700 dark:text-emerald-400">
                        {formatCurrency(item.actualOmset)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold uppercase">
                        Kontrak Terjual
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {item.dealsCount} Work Order
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold uppercase">
                        Estimasi Komisi ({(item.info.commissionRate * 100).toFixed(0)}%
                        {item.achievementPct >= 100 ? '+1%' : ''})
                      </span>
                      <span className="font-extrabold text-amber-600 dark:text-amber-400">
                        {formatCurrency(item.estimatedCommission)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-slate-600 dark:text-slate-400">Progres Capaian Target:</span>
                      <span
                        className={
                          item.achievementPct >= 100
                            ? 'text-emerald-600 dark:text-emerald-400 font-black'
                            : item.achievementPct >= 75
                            ? 'text-sky-600 dark:text-sky-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }
                      >
                        {item.achievementPct.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.achievementPct >= 100
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-sm'
                            : item.achievementPct >= 75
                            ? 'bg-sky-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(item.achievementPct, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedMarketingId(item.info.id);
                      setWoSearchModal('');
                      setWoStatusFilterModal('ALL');
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-700 dark:hover:text-emerald-300 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Rincian WO ({item.dealsCount})</span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(item.info)}
                    className="py-2 px-3 rounded-xl bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-300 font-bold text-xs flex items-center gap-1 transition-colors border border-amber-200 dark:border-amber-800"
                    title="Edit Data Marketing & Target"
                  >
                    <Edit className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Edit Target</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Target vs Realisasi Omset per Marketing */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" /> Target vs Realisasi Omset (Per Marketing)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Perbandingan grafik target omset bulanan dengan capaian realisasi sales.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartBarData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(0)}Jt`}
                />
                <RechartsTooltip
                  formatter={(value: any) => [formatCurrency(Number(value)), 'Nominal']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                <Bar dataKey="Target" fill="#94a3b8" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Realisasi" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Kontribusi Layanan Pest Control */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-600" /> Omset Berdasarkan Kategori Layanan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Persentase kontribusi omset dari setiap divisi layanan pest control.
            </p>
          </div>

          {serviceChartData.length > 0 ? (
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={serviceChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {serviceChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value: any) => [formatCurrency(Number(value)), 'Omset']}
                    contentStyle={{ borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400 italic">
              Belum ada transaksi pada periode ini
            </div>
          )}
        </div>
      </div>

      {/* Modal 1: Manage Marketing & Target Omset Team */}
      {isManageModalOpen && (
        <Modal
          isOpen={isManageModalOpen}
          onClose={() => {
            setIsManageModalOpen(false);
            setIsFormOpen(false);
          }}
          title="Kelola & Edit Target Omset Marketing"
          subtitle="Atur nama sales/marketing executive, wilayah kerja, target omset bulanan, dan persentase komisi."
          maxWidth="3xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Daftar Marketing Executive ({marketingTeam.length} Orang)
                </span>
              </div>
              <button
                onClick={handleOpenAdd}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Marketing Baru
              </button>
            </div>

            {/* List Table of Marketing */}
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Inisial / Nama</th>
                    <th className="p-3">Jabatan & Wilayah</th>
                    <th className="p-3 text-right">Target Omset</th>
                    <th className="p-3 text-center">Komisi Base</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {marketingTeam.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-extrabold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-800 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                            {getInitials(m.name)}
                          </div>
                          <span>{m.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">
                        <div className="font-semibold">{m.role}</div>
                        <div className="text-[10px] text-slate-400">📍 {m.area}</div>
                      </td>
                      <td className="p-3 text-right font-black text-emerald-700 dark:text-emerald-400">
                        {formatCurrency(m.targetOmset)}
                      </td>
                      <td className="p-3 text-center font-bold text-slate-700 dark:text-slate-300">
                        {(m.commissionRate * 100).toFixed(0)}%
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(m)}
                            className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 hover:bg-amber-200"
                            title="Edit Data Marketing & Target"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMarketing(m.id, m.name)}
                            className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 hover:bg-rose-200"
                            title="Hapus Marketing"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal 2: Form Edit / Add Marketing Target */}
      {isFormOpen && (
        <Modal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title={editingTarget ? `Edit Target Omset - ${editingTarget.name}` : 'Tambah Marketing Executive Baru'}
          subtitle="Masukkan data nama marketing executive dan target omset penjualan perusahaan."
          maxWidth="lg"
        >
          <form onSubmit={handleSaveMarketing} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nama Marketing Executive *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Contoh: SUTARDJAT / DENNY SETIAWAN"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-extrabold uppercase"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Nama ini akan dicocokkan dengan field 'Sales/Marketing' pada Input Penjualan Work Order.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Jabatan / Role *
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                  placeholder="Senior B2B Marketing Specialist"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Wilayah Sales / Area *
                </label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  required
                  placeholder="Kawasan Industri Jababeka / MM2100"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                />
              </div>
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-3">
              <h4 className="font-extrabold text-slate-900 dark:text-white text-xs flex items-center gap-1.5 uppercase">
                <Target className="w-4 h-4 text-emerald-600" /> Pengaturan Target Omset & Bonus
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Omset Penjualan (Rp) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000000"
                    value={formData.targetOmset}
                    onChange={(e) => setFormData({ ...formData, targetOmset: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-extrabold text-sm"
                  />
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                    {formatCurrency(formData.targetOmset || 0)}
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Persentase Komisi Dasar (%) *
                  </label>
                  <select
                    value={formData.commissionRate}
                    onChange={(e) => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                  >
                    <option value={0.02}>2% Omset</option>
                    <option value={0.03}>3% Omset</option>
                    <option value={0.04}>4% Omset</option>
                    <option value={0.05}>5% Omset</option>
                    <option value={0.06}>6% Omset</option>
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Bonus +1% komisi otomatis apabila capaian melebihi 100% target.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-md"
              >
                <Save className="w-4 h-4" /> Simpan Target
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Detail Work Orders Modal for Selected Marketing */}
      {selectedMarketing && (
        <Modal
          isOpen={!!selectedMarketing}
          onClose={() => setSelectedMarketingId(null)}
          title={`Detail Work Orders (WO) - ${selectedMarketing.info.name}`}
          subtitle={`Daftar seluruh pesanan penjualan & kontrak WO pada Periode: ${periodLabel}`}
          maxWidth="4xl"
        >
          <div className="space-y-4">
            {/* Header info card with initials badge */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white font-black text-xs flex items-center justify-center shrink-0">
                  {getInitials(selectedMarketing.info.name)}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{selectedMarketing.info.name}</h4>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {selectedMarketing.info.role} • 📍 {selectedMarketing.info.area}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                    📍 Periode Control: {periodLabel}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase">Target Periode</span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {formatCurrency(selectedMarketing.effectiveTarget)}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase">Realisasi Omset</span>
                  <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
                    {formatCurrency(selectedMarketing.actualOmset)}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase">Capaian vs Target</span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {selectedMarketing.achievementPct.toFixed(1)}%
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase">Bonus Komisi</span>
                  <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
                    {formatCurrency(selectedMarketing.estimatedCommission)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Internal Filter Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari No. WO, Customer, Layanan..."
                  value={woSearchModal}
                  onChange={(e) => setWoSearchModal(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <span className="text-[10px] font-bold text-slate-500">Status WO:</span>
                <select
                  value={woStatusFilterModal}
                  onChange={(e) => setWoStatusFilterModal(e.target.value as any)}
                  className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs"
                >
                  <option value="ALL">Semua Status ({selectedMarketing.orders.length})</option>
                  <option value="ACTIVE font-bold">Aktif / Berjalan</option>
                  <option value="COMPLETED">Selesai Kontrak</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </div>
            </div>

            {/* List of Filtered Orders */}
            {(() => {
              const modalFilteredOrders = selectedMarketing.orders.filter((so) => {
                const matchSearch =
                  so.orderNumber.toLowerCase().includes(woSearchModal.toLowerCase()) ||
                  so.customerName.toLowerCase().includes(woSearchModal.toLowerCase()) ||
                  so.serviceType.toLowerCase().includes(woSearchModal.toLowerCase());
                const matchStatus = woStatusFilterModal === 'ALL' || so.status === woStatusFilterModal;
                return matchSearch && matchStatus;
              });

              if (modalFilteredOrders.length === 0) {
                return (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl space-y-2">
                    <p className="text-slate-500 text-xs font-semibold">
                      Belum ada Work Order (WO) terdaftar untuk {selectedMarketing.info.name} pada {periodLabel}.
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Anda dapat mengubah periode filter di bagian atas dashboard atau menambah Work Order baru di menu Input Penjualan.
                    </p>
                  </div>
                );
              }

              return (
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-white font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-3">No. WO</th>
                        <th className="p-3">Klien / Perusahaan</th>
                        <th className="p-3">Layanan Pest Control</th>
                        <th className="p-3">Periode Kontrak</th>
                        <th className="p-3 text-center">Status</th>
                        <th className="p-3 text-right">Nilai Kontrak</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {modalFilteredOrders.map((so) => (
                        <tr key={so.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                            {so.orderNumber}
                          </td>
                          <td className="p-3 font-extrabold text-slate-900 dark:text-white">{so.customerName}</td>
                          <td className="p-3 text-slate-600 dark:text-slate-300 font-medium">{so.serviceType}</td>
                          <td className="p-3 text-slate-500 font-medium">
                            {so.contractStartDate} s/d {so.contractEndDate}
                          </td>
                          <td className="p-3 text-center">
                            <Badge variant={so.status === 'ACTIVE' ? 'emerald' : 'neutral'}>{so.status}</Badge>
                          </td>
                          <td className="p-3 text-right">
                            <span className="font-extrabold text-slate-900 dark:text-white block">
                              {formatCurrency(so.grandTotal)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold block">
                              DPP: {formatCurrency(so.subtotal)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        </Modal>
      )}
    </div>
  );
};
