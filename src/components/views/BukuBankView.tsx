import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { Modal } from '../common/Modal';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { CashTransaction } from '../../types';
import { exportCashTransactionsExcel } from '../../utils/excelExport';
import { Building, CreditCard, ArrowUpRight, ArrowDownRight, CheckCircle2, FileSpreadsheet, Trash2, Edit3, Printer, PlusCircle } from 'lucide-react';
import { RequestFundsModal } from '../common/RequestFundsModal';

export const BukuBankView: React.FC = () => {
  const { bankAccounts, updateBankAccount, cashTransactions, deleteCashTransaction, addCashTransaction, updateCashTransaction, formatCurrency } = useApp();
  const [deletingTrx, setDeletingTrx] = useState<CashTransaction | null>(null);
  const [editingTrx, setEditingTrx] = useState<CashTransaction | null>(null);
  const [isAddManualTrxModalOpen, setIsAddManualTrxModalOpen] = useState(false);
  const [isRequestFundsModalOpen, setIsRequestFundsModalOpen] = useState(false);
  const [newTrx, setNewTrx] = useState<Omit<CashTransaction, 'id' | 'balanceAfter' | 'createdBy' | 'refNumber'>>({
    ledgerType: 'BUKU_BANK',
    date: new Date().toISOString().split('T')[0],
    category: 'Transfer Masuk',
    description: '',
    type: 'INCOME',
    amount: 0
  });

  const [isEditBalanceModalOpen, setIsEditBalanceModalOpen] = useState(false);
  const [targetAccountId, setTargetAccountId] = useState('');
  const [targetBalance, setTargetBalance] = useState(0);
  const [targetBankName, setTargetBankName] = useState('');
  const [targetAccountNumber, setTargetAccountNumber] = useState('');
  const [targetAccountHolder, setTargetAccountHolder] = useState('');

  const totalBankBalance = bankAccounts.reduce((sum, b) => sum + b.balance, 0);

  const bankTransactions = cashTransactions
    .filter(t => t.ledgerType === 'BUKU_BANK')
    .sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return b.id.localeCompare(a.id);
    });
  
  let currentRunningBalance = bankAccounts[0]?.balance || 0;
  const bankTransactionsWithBalance = bankTransactions.map(t => {
    const balance = currentRunningBalance;
    if (t.type === 'INCOME') {
      currentRunningBalance -= t.amount;
    } else {
      currentRunningBalance += t.amount;
    }
    return { ...t, dynamicBalance: balance };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Building className="w-6 h-6 text-emerald-600" /> Buku Bank & Rekening Perusahaan
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Monitoring transaksi rekening koran {bankAccounts[0]?.bankName || 'Resmi'} PT Boston Indo Global.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsAddManualTrxModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> Input Transaksi Manual
          </button>
          <button
            onClick={() => setIsRequestFundsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs shadow-xs flex items-center gap-2 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> Permintaan Dana
          </button>
          <button
            onClick={() => exportCashTransactionsExcel(bankTransactions, 'Buku_Bank')}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs shadow-xs flex items-center gap-2 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export Excel
          </button>
          <button
            onClick={() => {
              const printContent = document.getElementById('printable-wrapper');
              if (printContent) {
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>Laporan Mutasi Bank</title>
                        <style>
                          body { font-family: sans-serif; padding: 20px; }
                          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                          th { background-color: #f8f9fa; font-weight: bold; }
                          .text-right { text-align: right; }
                          h3 { margin-bottom: 5px; }
                          p { margin-top: 0; color: #555; }
                        </style>
                      </head>
                      <body>
                        ${printContent.innerHTML}
                      </body>
                    </html>
                  `);
                  printWindow.document.close();
                  printWindow.print();
                  printWindow.close();
                }
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs shadow-xs flex items-center gap-2 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4 text-emerald-600" /> Print PDF
          </button>
        </div>
      </div>

      {/* Bank Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bankAccounts.map((account) => (
          <div
            key={account.id}
            className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white shadow-lg border border-slate-800 space-y-4 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  REKENING RESMI PERUSAHAAN
                </span>
                <h3 className="text-lg font-bold">{account.bankName}</h3>
              </div>
              <Building className="w-7 h-7 text-emerald-400/80" />
            </div>

            <div>
              <p className="text-xs text-slate-400">Nomor Rekening Giro:</p>
              <p className="text-xl font-black tracking-widest text-emerald-300 font-mono">
                {account.accountNumber}
              </p>
              <p className="text-xs text-slate-300 font-medium mt-0.5">a/n {account.accountHolder}</p>
            </div>

            <div className="pt-3 border-t border-slate-700/80 flex items-center justify-between">
              <span className="text-xs text-slate-400">Saldo Efektif:</span>
              <div className="flex items-center gap-3">
                <span className="text-xl font-extrabold text-white">{formatCurrency(account.balance)}</span>
                <button
                  onClick={() => {
                    setTargetAccountId(account.id);
                    setTargetBalance(account.balance);
                    setTargetBankName(account.bankName);
                    setTargetAccountNumber(account.accountNumber);
                    setTargetAccountHolder(account.accountHolder);
                    setIsEditBalanceModalOpen(true);
                  }}
                  className="p-1.5 rounded-lg bg-emerald-800/50 hover:bg-emerald-700/80 text-emerald-300 transition-colors"
                  title="Edit Data Rekening & Saldo Awal"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bank Transactions History Table */}
      <div id="printable-wrapper" className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Mutasi Transaksi Bank</h3>
          <p className="text-xs text-slate-500">Rekap transfer masuk pembayaran invoice & transfer keluar supplier</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-600 dark:text-slate-400">
              <tr>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Keterangan Transfer</th>
                <th className="p-3 text-right">Kredit (Transfer Masuk)</th>
                <th className="p-3 text-right">Debet (Transfer Keluar)</th>
                <th className="p-3 text-right">Saldo Running</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {bankTransactionsWithBalance.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                  <td className="p-3 text-slate-500">{t.date}</td>
                  <td className="p-3 font-semibold text-emerald-700 dark:text-emerald-400">{t.category}</td>
                  <td className="p-3 text-slate-700 dark:text-slate-300 max-w-xs">{t.description}</td>
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
                      onClick={() => setEditingTrx(t)}
                      className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 mr-2"
                      title="Edit Transaksi"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
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

      <ConfirmDeleteModal
        isOpen={!!deletingTrx}
        onClose={() => setDeletingTrx(null)}
        onConfirm={() => {
          if (deletingTrx) deleteCashTransaction(deletingTrx.id);
        }}
        title="Hapus Mutasi Bank"
        description="Apakah Anda yakin ingin menghapus catatan mutasi bank ini?"
        itemName={deletingTrx ? `${deletingTrx.refNumber} (${deletingTrx.category})` : ''}
      />
      
      {/* Add Manual Transaction Modal */}
      {isAddManualTrxModalOpen && (
        <Modal
          isOpen={isAddManualTrxModalOpen}
          onClose={() => setIsAddManualTrxModalOpen(false)}
          title="Input Transaksi Bank Manual"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addCashTransaction(newTrx);
              setIsAddManualTrxModalOpen(false);
              setNewTrx({
                ledgerType: 'BUKU_BANK',
                date: new Date().toISOString().split('T')[0],
                category: 'Transfer Masuk',
                description: '',
                type: 'INCOME',
                amount: 0
              });
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tipe
              </label>
              <select
                value={newTrx.type}
                onChange={(e) => setNewTrx({ ...newTrx, type: e.target.value as 'INCOME' | 'EXPENSE' })}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
              >
                <option value="INCOME">Kredit (Transfer Masuk)</option>
                <option value="EXPENSE">Debet (Transfer Keluar)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kategori
              </label>
              <input
                type="text"
                value={newTrx.category}
                onChange={(e) => setNewTrx({ ...newTrx, category: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Keterangan
              </label>
              <input
                type="text"
                value={newTrx.description}
                onChange={(e) => setNewTrx({ ...newTrx, description: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nominal (Rp)
              </label>
              <input
                type="number"
                value={newTrx.amount}
                onChange={(e) => setNewTrx({ ...newTrx, amount: Number(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsAddManualTrxModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md"
              >
                Simpan
              </button>
            </div>
          </form>
        </Modal>
      )}
      
      <RequestFundsModal
        isOpen={isRequestFundsModalOpen}
        onClose={() => setIsRequestFundsModalOpen(false)}
      />

      {/* Edit Transaction Modal */}
      {editingTrx && (
        <Modal
          isOpen={!!editingTrx}
          onClose={() => setEditingTrx(null)}
          title="Edit Transaksi Bank"
          subtitle={`Transaksi: ${editingTrx.refNumber}`}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateCashTransaction(editingTrx.id, {
                category: editingTrx.category,
                description: editingTrx.description,
                amount: editingTrx.amount
              });
              setEditingTrx(null);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kategori
              </label>
              <input
                type="text"
                value={editingTrx.category}
                onChange={(e) => setEditingTrx({ ...editingTrx, category: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Keterangan
              </label>
              <input
                type="text"
                value={editingTrx.description}
                onChange={(e) => setEditingTrx({ ...editingTrx, description: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nominal (Rp)
              </label>
              <input
                type="number"
                value={editingTrx.amount}
                onChange={(e) => setEditingTrx({ ...editingTrx, amount: Number(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setEditingTrx(null)}
                className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Rekening Modal */}
      <Modal
        isOpen={isEditBalanceModalOpen}
        onClose={() => setIsEditBalanceModalOpen(false)}
        title="Edit Rekening Resmi Perusahaan"
        subtitle="Sesuaikan detail rekening dan saldo efektif"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateBankAccount(targetAccountId, {
              bankName: targetBankName,
              accountNumber: targetAccountNumber,
              accountHolder: targetAccountHolder,
              balance: targetBalance
            });
            setIsEditBalanceModalOpen(false);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nama Bank
            </label>
            <input
              type="text"
              required
              value={targetBankName}
              onChange={(e) => setTargetBankName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
              placeholder="Contoh: BANK JABAR BANTEN (BJB)"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nomor Rekening
            </label>
            <input
              type="text"
              required
              value={targetAccountNumber}
              onChange={(e) => setTargetAccountNumber(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
              placeholder="Contoh: 0160849096001"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Atas Nama (a/n)
            </label>
            <input
              type="text"
              required
              value={targetAccountHolder}
              onChange={(e) => setTargetAccountHolder(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
              placeholder="Contoh: PT Boston Indo Global"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nominal Saldo (Rp)
            </label>
            <input
              type="number"
              required
              value={targetBalance || ''}
              onChange={(e) => setTargetBalance(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
              placeholder="Contoh: 150000000"
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
              Simpan Perubahan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
