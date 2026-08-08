import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { Modal } from '../common/Modal';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { CashTransaction } from '../../types';
import { exportCashTransactionsExcel } from '../../utils/excelExport';
import { Coins, Plus, ArrowUpRight, ArrowDownRight, Fuel, Wrench, Utensils, RefreshCw, FileSpreadsheet, Trash2 } from 'lucide-react';

export const KasKecilView: React.FC = () => {
  const { cashTransactions, addCashTransaction, deleteCashTransaction, formatCurrency, currentUser, kasKecilInitialBalance, setKasKecilInitialBalance } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditBalanceModalOpen, setIsEditBalanceModalOpen] = useState(false);
  const [newBalance, setNewBalance] = useState(kasKecilInitialBalance);
  const [deletingTrx, setDeletingTrx] = useState<CashTransaction | null>(null);

  const kasKecilList = cashTransactions
    .filter(t => t.ledgerType === 'KAS_KECIL')
    .sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return b.id.localeCompare(a.id);
    });

  const currentBalance = kasKecilList.reduce((bal, t) => {
    return t.type === 'INCOME' ? bal + t.amount : bal - t.amount;
  }, kasKecilInitialBalance);

  let currentRunningKK = currentBalance;
  const kasKecilListWithBalance = kasKecilList.map(t => {
    const balance = currentRunningKK;
    if (t.type === 'INCOME') {
      currentRunningKK -= t.amount;
    } else {
      currentRunningKK += t.amount;
    }
    return { ...t, dynamicBalance: balance };
  });

  const totalSpent = kasKecilList
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const [formData, setFormData] = useState({
    category: 'Bensin & Tol Operasional Teknisi',
    description: '',
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    amount: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0 || !formData.description) return;

    addCashTransaction({
      refNumber: `TRX/KK/${Date.now().toString().slice(-6)}`,
      ledgerType: 'KAS_KECIL',
      date: new Date().toISOString().split('T')[0],
      category: formData.type === 'INCOME' ? 'Penerimaan Kas Kecil' : formData.category,
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
            <Coins className="w-6 h-6 text-amber-600" /> Buku Kas Kecil (Petty Cash Operasional)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pengeluaran operasional lapangan teknisi: bensin, e-toll, pembelian refill kimia darurat, & servis sprayer.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setNewBalance(kasKecilInitialBalance);
              setIsEditBalanceModalOpen(true);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-200 dark:border-slate-700"
          >
            Edit Saldo Awal
          </button>
          <button
            onClick={() => exportCashTransactionsExcel(kasKecilList, 'Kas_Kecil')}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-200 dark:border-slate-700"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export Excel
          </button>
          <button
            onClick={() => {
              setFormData({
                category: 'Penerimaan Kas Kecil',
                description: '',
                type: 'INCOME',
                amount: 0
              });
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Input Saldo Masuk
          </button>
          <button
            onClick={() => {
              setFormData({
                category: 'Bensin & Tol Operasional Teknisi',
                description: '',
                type: 'EXPENSE',
                amount: 0
              });
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Input Pengeluaran
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Saldo Kas Kecil Lapangan"
          value={formatCurrency(currentBalance)}
          subtitle="Tersedia di brankas kasir"
          icon={Coins}
          colorScheme="amber"
        />
        <StatCard
          title="Total Pengeluaran Bulan Ini"
          value={formatCurrency(totalSpent)}
          subtitle="Bbm, tol, servis, makan teknisi"
          icon={ArrowDownRight}
          colorScheme="rose"
        />
      </div>

      {/* Transactions Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Riwayat Pengeluaran Kas Kecil</h3>
          <p className="text-xs text-slate-500">Log pengeluaran mikro teknisi & operasional ruko</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-600 dark:text-slate-400">
              <tr>
                <th className="p-3">Ref No.</th>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Kategori Beban</th>
                <th className="p-3">Keterangan Biaya Operasional</th>
                <th className="p-3">Oleh</th>
                <th className="p-3 text-right">Masuk (Topup)</th>
                <th className="p-3 text-right">Keluar (Expense)</th>
                <th className="p-3 text-right">Sisa Kas Kecil</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {kasKecilListWithBalance.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{t.refNumber}</td>
                  <td className="p-3 text-slate-500">{t.date}</td>
                  <td className="p-3 font-semibold text-amber-700 dark:text-amber-400">{t.category}</td>
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

      {/* Modal Expense */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Input Pengeluaran Kas Kecil Operasional"
        subtitle="Pencatatan nota bensin, tol, konsumsi, dan perlengkapan kecil"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Jenis Transaksi *
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'INCOME', category: 'Penerimaan Kas Kecil' })}
                className={`flex-1 py-2 rounded-xl font-bold border ${formData.type === 'INCOME' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
              >
                Saldo Masuk
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'EXPENSE', category: 'Bensin & Tol Operasional Teknisi' })}
                className={`flex-1 py-2 rounded-xl font-bold border ${formData.type === 'EXPENSE' ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
              >
                Pengeluaran
              </button>
            </div>
          </div>
          
          {formData.type === 'EXPENSE' && (
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kategori Pengeluaran *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="Bensin & Tol Operasional Teknisi">Bensin & Tol Mobil Operasional</option>
                <option value="Konsumsi & Uang Makan Teknisi">Konsumsi & Uang Makan Lembur Teknisi</option>
                <option value="Refill Kimia & Pakan Baiting">Refill Kimia & Pakan Baiting Darurat</option>
                <option value="Bahan / Alat">Bahan / Alat</option>
                <option value="Servis & Sparepart Sprayer">Servis & Sparepart Sprayer / Fogger</option>
                <option value="Biaya Operasional Ruko / Parkir">Biaya Operasional Ruko / Parkir / Kebersihan</option>
              </select>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Rincian Pengeluaran / Nota *
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Bensin Pertalite Mobil B 1234 PEST + Tol Cikarang"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nominal Pengeluaran (Rp) *
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
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md"
            >
              Simpan Pengeluaran
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
        title="Hapus Transaksi Kas Kecil"
        description="Apakah Anda yakin ingin menghapus catatan pengeluaran Kas Kecil ini?"
        itemName={deletingTrx ? `${deletingTrx.refNumber} (${deletingTrx.category})` : ''}
      />

      <Modal
        isOpen={isEditBalanceModalOpen}
        onClose={() => setIsEditBalanceModalOpen(false)}
        title="Edit Saldo Awal Kas Kecil"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <input
            type="number"
            value={newBalance}
            onChange={(e) => setNewBalance(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl"
          />
          <button
            onClick={() => {
              setKasKecilInitialBalance(newBalance);
              setIsEditBalanceModalOpen(false);
            }}
            className="w-full py-2 bg-emerald-600 text-white rounded-xl font-bold"
          >
            Simpan
          </button>
        </div>
      </Modal>
    </div>
  );
};
