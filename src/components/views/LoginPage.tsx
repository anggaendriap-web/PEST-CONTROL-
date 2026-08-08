import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { KeyRound, AlertCircle, Unlock } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { unlockApp, companyInfo } = useApp();
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'BOSTON2026') { // Simple access code
      unlockApp();
    } else {
      setErrorMessage('Kode akses salah!');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-950 p-4">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 text-center">{companyInfo.name}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 text-center">Silakan masukkan kode akses untuk melanjutkan.</p>
        
        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="relative">
            <KeyRound className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Kode Akses"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white font-medium"
            />
          </div>
          
          {errorMessage && (
            <div className="text-rose-500 text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {errorMessage}
            </div>
          )}
          
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
          >
            <Unlock className="w-4 h-4" /> Buka Akses
          </button>
        </form>
      </div>
    </div>
  );
};
