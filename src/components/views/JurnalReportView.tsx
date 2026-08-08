import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { Modal } from '../common/Modal';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { JournalEntry } from '../../types';
import { exportJournalExcel } from '../../utils/excelExport';
import { BookOpen, Plus, Printer, CheckCircle2, FileSpreadsheet, Trash2 } from 'lucide-react';

export const JurnalReportView: React.FC = () => {
  const { journalEntries, addJournalEntry, deleteJournalEntry, formatCurrency } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingJournal, setDeletingJournal] = useState<JournalEntry | null>(null);

  const totalDebit = journalEntries.reduce((sum, j) => sum + j.debit, 0);
  const totalCredit = journalEntries.reduce((sum, j) => sum + j.credit, 0);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    accountCode: '1110',
    accountName: 'Kas Besar / Bank',
    debit: 0,
    credit: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description) return;

    const entryNum = `JRN/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${Math.floor(Math.random() * 900 + 100)}`;

    addJournalEntry({
      entryNumber: entryNum,
      date: formData.date,
      description: formData.description,
      accountCode: formData.accountCode,
      accountName: formData.accountName,
      debit: formData.debit,
      credit: formData.credit
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-600" /> Jurnal Umum & Laporan Transaksi Keuangan
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Buku jurnal transaksi berpasangan (Double-Entry Debit & Kredit) standar akuntansi Indonesia.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportJournalExcel(journalEntries)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs shadow-xs flex items-center gap-2 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export Excel
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs shadow-md flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Cetak Jurnal
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Tambah Ayat Jurnal
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Debit Jurnal"
          value={formatCurrency(totalDebit)}
          subtitle="Pencatatan Debit"
          icon={BookOpen}
          colorScheme="emerald"
        />
        <StatCard
          title="Total Kredit Jurnal"
          value={formatCurrency(totalCredit)}
          subtitle="Pencatatan Kredit"
          icon={BookOpen}
          colorScheme="sky"
        />
        <StatCard
          title="Status Keseimbangan (Balance)"
          value={totalDebit === totalCredit ? 'SEIMBANG (OK)' : 'SELISIH'}
          subtitle="Prinsip Double Entry"
          icon={CheckCircle2}
          colorScheme={totalDebit === totalCredit ? 'emerald' : 'rose'}
        />
      </div>

      {/* Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Daftar Entry Jurnal Umum</h3>
          <p className="text-xs text-slate-500">Pencatatan keuangan terintegrasi sistem sales, invoice, & PO</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-600 dark:text-slate-400">
              <tr>
                <th className="p-3">No. Jurnal</th>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Kode Akun</th>
                <th className="p-3">Nama Akun</th>
                <th className="p-3">Keterangan Transaksi</th>
                <th className="p-3 text-right">Debit (Rp)</th>
                <th className="p-3 text-right">Kredit (Rp)</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {journalEntries.map((j) => (
                <tr key={j.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{j.entryNumber}</td>
                  <td className="p-3 text-slate-500">{j.date}</td>
                  <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">{j.accountCode}</td>
                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{j.accountName}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{j.description}</td>
                  <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                    {j.debit > 0 ? formatCurrency(j.debit) : '-'}
                  </td>
                  <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                    {j.credit > 0 ? formatCurrency(j.credit) : '-'}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setDeletingJournal(j)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                      title="Hapus Entry Jurnal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100 dark:bg-slate-800 font-extrabold text-slate-900 dark:text-white border-t border-slate-300">
              <tr>
                <td colSpan={5} className="p-3 text-right uppercase">Total Jurnal:</td>
                <td className="p-3 text-right text-emerald-700 dark:text-emerald-400">{formatCurrency(totalDebit)}</td>
                <td className="p-3 text-right text-emerald-700 dark:text-emerald-400">{formatCurrency(totalCredit)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modal Add Entry */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Input Ayat Jurnal Umum Baru"
        subtitle="Tambah baris transaksi jurnal debit atau kredit manual"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Entry</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kode Akun</label>
              <input
                type="text"
                value={formData.accountCode}
                onChange={(e) => setFormData({ ...formData, accountCode: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Akun COA</label>
              <input
                type="text"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Keterangan Jurnal</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nilai Debit (Rp)</label>
              <input
                type="number"
                value={formData.debit}
                onChange={(e) => setFormData({ ...formData, debit: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nilai Kredit (Rp)</label>
              <input
                type="number"
                value={formData.credit}
                onChange={(e) => setFormData({ ...formData, credit: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
              />
            </div>
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
              Simpan Jurnal
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDeleteModal
        isOpen={!!deletingJournal}
        onClose={() => setDeletingJournal(null)}
        onConfirm={() => {
          if (deletingJournal) deleteJournalEntry(deletingJournal.id);
        }}
        title="Hapus Entry Jurnal Umum"
        description="Apakah Anda yakin ingin menghapus catatan entry jurnal umum ini?"
        itemName={deletingJournal ? `${deletingJournal.entryNumber} (${deletingJournal.accountName})` : ''}
      />
    </div>
  );
};
