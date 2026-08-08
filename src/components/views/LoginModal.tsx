import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { User } from '../../types';
import { Shield, KeyRound, CheckCircle2, UserCheck, AlertCircle, Eye, EyeOff, RefreshCw, Lock, HelpCircle } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, setCurrentUser, users, updateUserPassword, companyInfo } = useApp();
  const [activeTab, setActiveTab] = useState<'login' | 'forgot'>('login');
  
  // Login State
  const [selectedUser, setSelectedUser] = useState<User>(currentUser);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Forgot / Reset Password State
  const [resetUserId, setResetUserId] = useState<string>(currentUser.id);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  const handleSwitchUser = (user: User) => {
    setSelectedUser(user);
    setPassword('');
    setErrorMessage('');
  };

  const handleConfirmLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Check password against selected user's stored password (default 'BOSTON123')
    const targetUserInState = users.find(u => u.id === selectedUser.id) || selectedUser;
    const expectedPassword = targetUserInState.password || 'BOSTON123';

    if (!password) {
      setErrorMessage('Harap masukkan password terlebih dahulu!');
      return;
    }

    if (password !== expectedPassword) {
      setErrorMessage('Password salah! Akses ditolak. Harap periksa password Anda atau klik "Lupa Password" untuk memperbarui.');
      return;
    }

    // Login success
    setCurrentUser(targetUserInState);
    setLoginSuccess(true);
    setErrorMessage('');
    setTimeout(() => {
      setLoginSuccess(false);
      setPassword('');
      onClose();
    }, 800);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (!newPassword) {
      setResetError('Password baru tidak boleh kosong!');
      return;
    }

    if (newPassword.length < 3) {
      setResetError('Password baru minimal 3 karakter!');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Konfirmasi password tidak cocok! Mohon periksa kembali.');
      return;
    }

    const targetUser = users.find(u => u.id === resetUserId);
    if (!targetUser) return;

    updateUserPassword(targetUser.id, newPassword);

    setResetSuccess(`Password untuk ${targetUser.name} (${targetUser.role}) berhasil diperbarui! Silakan login.`);
    setNewPassword('');
    setConfirmPassword('');

    // Switch to login tab after brief moment
    setTimeout(() => {
      setSelectedUser(targetUser);
      setPassword(newPassword);
      setActiveTab('login');
      setResetSuccess('');
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={activeTab === 'login' ? 'Login & Otorisasi Hak Akses' : 'Reset / Ubah Password Pengguna'}
      subtitle={`${companyInfo.name} - Pest Control System`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Navigation Tabs (Login vs Ubah Password) */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" /> Login Akun
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('forgot');
              setResetError('');
              setResetSuccess('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'forgot'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <RefreshCw className="w-4 h-4" /> Lupa / Edit Password
          </button>
        </div>

        {activeTab === 'login' ? (
          <form onSubmit={handleConfirmLogin} className="space-y-4">
            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300">
              <p className="font-semibold flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-600 shrink-0" /> Pilih Akun Pengguna Terdaftar:
              </p>
              <p className="mt-0.5 text-[11px] text-emerald-700/80 dark:text-emerald-400">
                Password default semua akun: <strong className="font-mono bg-emerald-200 dark:bg-emerald-900 px-1 py-0.5 rounded text-emerald-950 dark:text-emerald-100">BOSTON123</strong>
              </p>
            </div>

            {/* User Selector Cards */}
            <div className="space-y-2">
              {users.map((user) => {
                const isSelected = selectedUser.id === user.id;
                return (
                  <div
                    key={user.id}
                    onClick={() => handleSwitchUser(user)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {user.name}
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono">
                            {user.role}
                          </span>
                        </h4>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          {user.title}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Password input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password Akses ({selectedUser.name})
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetUserId(selectedUser.id);
                    setActiveTab('forgot');
                  }}
                  className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <HelpCircle className="w-3 h-3" /> Lupa Password?
                </button>
              </div>

              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Masukkan Password (default: BOSTON123)"
                  className={`w-full pl-9 pr-10 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl focus:ring-2 focus:ring-emerald-500/30 text-slate-900 dark:text-white font-medium ${
                    errorMessage ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-semibold flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Message */}
            {loginSuccess && (
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-bold text-center animate-in fade-in flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Berhasil masuk sebagai {selectedUser.name}!
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-900/20 flex items-center gap-1.5"
              >
                <UserCheck className="w-4 h-4" /> Masuk Aplikasi
              </button>
            </div>
          </form>
        ) : (
          /* Reset / Forgot Password Form */
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-300">
              <p className="font-bold flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" /> Fitur Edit / Ubah Password Akun:
              </p>
              <p className="mt-0.5 text-[11px] text-amber-800/80 dark:text-amber-400">
                Pilih akun yang ingin diperbarui password-nya dan buat password baru.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pilih Akun Pengguna *
              </label>
              <select
                value={resetUserId}
                onChange={(e) => setResetUserId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.title} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password Baru *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masukkan Password Baru (min. 3 karakter)"
                  className="w-full pl-9 pr-10 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500/30 text-slate-900 dark:text-white font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Konfirmasi Password Baru *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik Ulang Password Baru"
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500/30 text-slate-900 dark:text-white font-medium"
                />
              </div>
            </div>

            {resetError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            {resetSuccess && (
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-bold text-center animate-in fade-in flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{resetSuccess}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Kembali ke Login
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-900/20 flex items-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" /> Simpan Password Baru
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
