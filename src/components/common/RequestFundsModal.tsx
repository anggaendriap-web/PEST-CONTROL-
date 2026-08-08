import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, DollarSign, FileText } from 'lucide-react';

interface RequestFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RequestFundsModal: React.FC<RequestFundsModalProps> = ({ isOpen, onClose }) => {
  const { transferFunds, formatCurrency } = useApp();
  const [amount, setAmount] = useState<string>('');
  const [targetLedger, setTargetLedger] = useState<'KAS_BESAR' | 'KAS_KECIL'>('KAS_BESAR');
  const [description, setDescription] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    transferFunds(parseFloat(amount), targetLedger, description);
    onClose();
    setAmount('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Permintaan Dana (Transfer)</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Jumlah</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Tujuan</label>
            <select
              value={targetLedger}
              onChange={(e) => setTargetLedger(e.target.value as 'KAS_BESAR' | 'KAS_KECIL')}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            >
              <option value="KAS_BESAR">Kas Besar</option>
              <option value="KAS_KECIL">Kas Kecil</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Keterangan</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              required
            />
          </div>
          <button type="submit" className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm">
            Kirim Permintaan
          </button>
        </form>
      </div>
    </div>
  );
};
