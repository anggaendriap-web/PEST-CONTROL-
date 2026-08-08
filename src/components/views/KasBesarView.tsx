import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { CashTransaction } from '../../types';
import { exportCashTransactionsExcel } from '../../utils/excelExport';
import { Wallet, Plus, ArrowUpRight, ArrowDownRight, DollarSign, FileSpreadsheet, Trash2, Edit3 } from 'lucide-react';

export const KasBesarView: React.FC = () => {
  const { cashTransactions, addCashTransaction, deleteCashTransaction, formatCurrency, currentUser, kasBesarInitialBalance, setKasBesarInitialBalance } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditBalanceModalOpen, setIsEditBalanceModalOpen] = useState(false);
  const [targetBalance, setTargetBalance] = useState(0);
  const [deletingTrx, setDeletingTrx] = useState<CashTransaction | null>(null);

  const kasBesarList = cashTransactions
    .filter(t => t.ledgerType === 'KAS_BESAR')
    .sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return b.id.localeCompare(a.id);
    });

  const currentBalance = kasBesarList.reduce((bal, t) => {
    return t.type === 'INCOME' ? bal + t.amount : bal - t.amount;
  }, kasBesarInitialBalance);

  let currentRunningKB = currentBalance;
  const kasBesarListWithBalance = kasBesarList.map(t => {
    const balance = currentRunningKB;
    if (t.type === 'INCOME') {
      currentRunningKB -= t.amount;
    } else {
      currentRunningKB += t.amount;
    }
    return { ...t, dynamicBalance: balance };
  });

  const totalIncome = kasBesarList
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = kasBesarList
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const [formData, setFormData] = useState({
    category: 'Penerimaan Tunai Pelanggan',
    description: '',
    type: 'INCOME' as 'INCOME' | 'EXPENSE',
    amount: 1000000
  });

  const CATEGORIES = [
    'Penerimaan Tunai Pelanggan',
    'Bahan / Alat',
    'Lain-lain'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0 || !formData.description) return;

    addCashTransaction({
      refNumber: `TRX/KB/${Date.now().toString().slice(-6)}`,
      ledgerType: 'KAS_BESAR',
      date: new Date().toISOString().split('T')[0],
      category: formData.category,
      description: formData.description,
      type: formData.type,
      amount: formData.amount
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-600" /> Buku Kas Besar Perusahaan
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pencatatan mutasi kas tunai utama kantor PT Boston Indo Global Grand Wisata Bekasi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setTargetBalance(currentBalance);
              setIsEditBalanceModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs shadow-xs flex items-center gap-2 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Edit3 className="w-4 h-4 text-emerald-600" /> Edit Saldo
          </button>

          <button
            onClick={() => exportCashTransactionsExcel(kasBesarList, 'Kas_Besar')}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs shadow-xs flex items-center gap-2 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export Excel
          </button>

          <button
            onClick={() => {
              setFormData({
                category: 'Penerimaan Tunai Pelanggan',
                description: '',
                type: 'INCOME',
                amount: 2500000
              });
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Input Transaksi Kas Besar
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Saldo Akhir Kas Besar"
          value={formatCurrency(currentBalance)}
          subtitle="Posisi kas saat ini"
          icon={Wallet}
          colorScheme="emerald"
        />
        <StatCard
          title="Total Kas Masuk"
          value={formatCurrency(totalIncome)}
          subtitle="Penerimaan tunai"
          icon={ArrowUpRight}
          colorScheme="sky"
        />
        <StatCard
          title="Total Kas Keluar"
          value={formatCurrency(totalExpense)}
          subtitle="Pengeluaran tunai"
          icon={ArrowDownRight}
          colorScheme="amber"
        />
      </div>

      {/* Transaction History Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Riwayat Mutasi Kas Besar</h3>
          <p className="text-xs text-slate-500">Buku kas harian terurut kronologis</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-600 dark:text-slate-400">
              <tr>
                <th className="p-3">Ref No.</th>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Keterangan Transaksi</th>
                <th className="p-3">Oleh</th>
                <th className="p-3 text-right">Debit (Masuk)</th>
                <th className="p-3 text-right">Kredit (Keluar)</th>
                <th className="p-3 text-right">Saldo Running</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {kasBesarListWithBalance.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{t.refNumber}</td>
                  <td className="p-3 text-slate-500">{t.date}</td>
                  <td className="p-3 font-semibold text-emerald-700 dark:text-emerald-400">{t.category}</td>
                  <td className="p-3 text-slate-700 dark:text-slate-300 max-w-xs">{t.description}</td>
                  <td className="p-3 text-slate-500 font-medium">{t.createdBy}</td>
                  <td className="p-3 text-right font-bold text-emerald-600">
                    {t.type === 'INCOME' ? formatCurrency(t.amount) : '-'}
                  </td>
                  <td className="p-3 text-right font-bold text-rose-600">
                    {t.type === 'EXPENSE' ? formatCurrency(t.amount) : '-'}
                  </td>
                  <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                    {formatCurrency(t.dynamicBalance)}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setDeletingTrx(t)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                      title="Hapus Transaksi"
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

      {/* Modal Transaction */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Input Transaksi Kas Besar Baru"
        subtitle="Catat penerimaan atau pengeluaran tunai Kas Besar"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Jenis Mutasi *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
            >
              <option value="INCOME">Kas Masuk (Penerimaan)</option>
              <option value="EXPENSE">Kas Keluar (Pengeluaran)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Kategori Transaksi
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Keterangan Transaksi *
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nominal Transaksi (Rp) *
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              required
              className="w-full px-3 py-2 font-bold text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
            >
              Simpan Transaksi
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDeleteModal
        isOpen={!!deletingTrx}
        onClose={() => setDeletingTrx(null)}
        onConfirm={() => {
          if (deletingTrx) deleteCashTransaction(deletingTrx.id);
        }}
        title="Hapus Transaksi Kas Besar"
        description="Apakah Anda yakin ingin menghapus catatan transaksi Kas Besar ini?"
        itemName={deletingTrx ? `${deletingTrx.refNumber} (${deletingTrx.category})` : ''}
      />

      {/* Edit Saldo Modal */}
      <Modal
        isOpen={isEditBalanceModalOpen}
        onClose={() => setIsEditBalanceModalOpen(false)}
        title="Edit Saldo Akhir Kas Besar"
        subtitle="Sesuaikan saldo akhir kas besar secara manual"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // Calculate what the initial balance should be to make currentBalance equal to targetBalance
            const netTransactions = totalIncome - totalExpense;
            const newInitial = targetBalance - netTransactions;
            setKasBesarInitialBalance(newInitial);
            setIsEditBalanceModalOpen(false);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nominal Saldo Akhir (Rp)
            </label>
            <input
              type="number"
              required
              value={targetBalance || ''}
              onChange={(e) => setTargetBalance(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
              placeholder="Contoh: 15000000"
            />
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsEditBalanceModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md"
            >
              Simpan Saldo
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
