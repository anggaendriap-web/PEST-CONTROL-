import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer, Supplier } from '../../types';
import {
  FileCheck,
  Building,
  Users,
  Truck,
  Copy,
  Check,
  Search,
  Edit3,
  BadgeCheck,
  ShieldCheck,
  Info,
  ExternalLink,
  Save,
  X,
  Plus,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';

export const NPWPView: React.FC = () => {
  const {
    companyInfo,
    updateCompanyInfo,
    customers,
    updateCustomer,
    suppliers,
    updateSupplier,
    bankAccounts
  } = useApp();

  const [activeTab, setActiveTab] = useState<'company' | 'customer' | 'supplier' | 'rules'>('company');
  
  // Search states
  const [customerSearch, setCustomerSearch] = useState('');
  const [supplierSearch, setSupplierSearch] = useState('');
  
  // Copy notification toast
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Edit Modals State
  const [editingCompanyModal, setEditingCompanyModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Form states for edits
  const [companyForm, setCompanyForm] = useState({
    npwp: companyInfo.npwp || '01.234.567.8-012.000',
    npwpName: companyInfo.npwpName || companyInfo.name,
    npwpAddress: companyInfo.npwpAddress || companyInfo.address,
    nitku: companyInfo.nitku || '0123456780120000',
    kpp: companyInfo.kpp || 'KPP Pratama Cibitung (012)',
    sppkpNumber: companyInfo.sppkpNumber || 'PEM-00492/WPJ.22/KP.0803/2021',
    isPKP: companyInfo.isPKP !== false
  });

  const [customerForm, setCustomerForm] = useState({
    npwp: '',
    npwpName: '',
    npwpAddress: '',
    isPKP: true
  });

  const [supplierForm, setSupplierForm] = useState({
    npwp: '',
    npwpName: '',
    npwpAddress: '',
    isPKP: true
  });

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleSaveCompanyNPWP = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyInfo({
      npwp: companyForm.npwp,
      npwpName: companyForm.npwpName,
      npwpAddress: companyForm.npwpAddress,
      nitku: companyForm.nitku,
      kpp: companyForm.kpp,
      sppkpNumber: companyForm.sppkpNumber,
      isPKP: companyForm.isPKP
    });
    setEditingCompanyModal(false);
  };

  const handleOpenEditCustomer = (cust: Customer) => {
    setEditingCustomer(cust);
    setCustomerForm({
      npwp: cust.npwp || '',
      npwpName: cust.npwpName || cust.name,
      npwpAddress: cust.npwpAddress || cust.address,
      isPKP: cust.isPKP !== false
    });
  };

  const handleSaveCustomerNPWP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    updateCustomer({
      ...editingCustomer,
      npwp: customerForm.npwp,
      npwpName: customerForm.npwpName,
      npwpAddress: customerForm.npwpAddress,
      isPKP: customerForm.isPKP
    });
    setEditingCustomer(null);
  };

  const handleOpenEditSupplier = (sup: Supplier) => {
    setEditingSupplier(sup);
    setSupplierForm({
      npwp: sup.npwp || '',
      npwpName: sup.npwpName || sup.name,
      npwpAddress: sup.npwpAddress || sup.address,
      isPKP: sup.isPKP !== false
    });
  };

  const handleSaveSupplierNPWP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier) return;
    updateSupplier({
      ...editingSupplier,
      npwp: supplierForm.npwp,
      npwpName: supplierForm.npwpName,
      npwpAddress: supplierForm.npwpAddress,
      isPKP: supplierForm.isPKP
    });
    setEditingSupplier(null);
  };

  // Filtered Lists
  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.code.toLowerCase().includes(customerSearch.toLowerCase()) ||
    (c.npwp && c.npwp.toLowerCase().includes(customerSearch.toLowerCase()))
  );

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
    s.code.toLowerCase().includes(supplierSearch.toLowerCase()) ||
    (s.npwp && s.npwp.toLowerCase().includes(supplierSearch.toLowerCase()))
  );

  const totalCustomerPKP = customers.filter(c => c.isPKP !== false).length;
  const totalSupplierPKP = suppliers.filter(s => s.isPKP !== false).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Toast alert for copied NPWP */}
      {copiedText && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-800 text-white px-4 py-3 rounded-xl shadow-lg border border-emerald-600 flex items-center gap-2 animate-bounce">
          <Check className="w-5 h-5 text-emerald-300" />
          <span className="text-sm font-semibold">{copiedText} tersalin ke clipboard!</span>
        </div>
      )}

      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
              Perpajakan & E-Faktur
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300">
              Status PKP Aktif
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FileCheck className="w-7 h-7 text-emerald-600" />
            Database & Manajemen NPWP
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pengelolaan Data NPWP Wajib Pajak Perusahaan, Customer (Pajak Keluaran), dan Supplier (Pajak Masukan) untuk Integrasi DJP Online & e-Faktur.
          </p>
        </div>

        <button
          onClick={() => {
            setCompanyForm({
              npwp: companyInfo.npwp || '01.234.567.8-012.000',
              npwpName: companyInfo.npwpName || companyInfo.name,
              npwpAddress: companyInfo.npwpAddress || companyInfo.address,
              nitku: companyInfo.nitku || '0123456780120000',
              kpp: companyInfo.kpp || 'KPP Pratama Cibitung (012)',
              sppkpNumber: companyInfo.sppkpNumber || 'PEM-00492/WPJ.22/KP.0803/2021',
              isPKP: companyInfo.isPKP !== false
            });
            setEditingCompanyModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Edit3 className="w-4 h-4" />
          Edit NPWP Perusahaan
        </button>
      </div>

      {/* Summary KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>NPWP Utama Perusahaan</span>
            <Building className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg font-bold text-slate-800 dark:text-white font-mono">
            {companyInfo.npwp || '01.234.567.8-012.000'}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <BadgeCheck className="w-3.5 h-3.5" /> Terdaftar di KPP Cibitung
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Customer Wajib Pajak (PKP)</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-white">
            {totalCustomerPKP} <span className="text-xs text-slate-400 font-normal">/ {customers.length} Client</span>
          </div>
          <div className="text-xs text-slate-500">
            Faktur Penjualan (e-Faktur PPN 11%)
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Supplier Terdaftar (PKP)</span>
            <Truck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-white">
            {totalSupplierPKP} <span className="text-xs text-slate-400 font-normal">/ {suppliers.length} Vendor</span>
          </div>
          <div className="text-xs text-slate-500">
            Faktur Pembelian & PPh 23 (2%)
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Tarif Pajak Terkait</span>
            <FileCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-lg font-bold text-slate-800 dark:text-white">
            PPN 11% & PPh 2%
          </div>
          <div className="text-xs text-slate-500">
            PMK Jasa Pest Control & Fumigasi
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('company')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'company'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building className="w-4 h-4" />
          NPWP Perusahaan (PT BIG)
        </button>

        <button
          onClick={() => setActiveTab('customer')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'customer'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          NPWP Customer / Client ({customers.length})
        </button>

        <button
          onClick={() => setActiveTab('supplier')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'supplier'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Truck className="w-4 h-4" />
          NPWP Supplier / Vendor ({suppliers.length})
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'rules'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Info className="w-4 h-4" />
          Ketentuan Pajak & e-Faktur
        </button>
      </div>

      {/* TAB 1: COMPANY NPWP DETAILS */}
      {activeTab === 'company' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Card NPWP Perusahaan */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xl">
                  BIG
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                    {companyInfo.npwpName || companyInfo.name}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Kartu Identitas Wajib Pajak Badan & Pengusaha Kena Pajak (PKP)
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                STATUS: PKP AKTIF
              </span>
            </div>

            {/* Grid Detail Tax Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-1">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nomor NPWP (15 Digit)</div>
                <div className="text-lg font-bold text-slate-800 dark:text-white font-mono flex items-center justify-between">
                  <span>{companyInfo.npwp || '01.234.567.8-012.000'}</span>
                  <button
                    onClick={() => handleCopy(companyInfo.npwp || '01.234.567.8-012.000', 'NPWP Perusahaan')}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Salin NPWP"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-1">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">NITKU / NPWP 16 Digit</div>
                <div className="text-lg font-bold text-slate-800 dark:text-white font-mono flex items-center justify-between">
                  <span>{companyInfo.nitku || '0123456780120000'}</span>
                  <button
                    onClick={() => handleCopy(companyInfo.nitku || '0123456780120000', 'NITKU 16 Digit')}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Salin NITKU"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-1">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">KPP Terdaftar</div>
                <div className="text-sm font-bold text-slate-800 dark:text-white">
                  {companyInfo.kpp || 'KPP Pratama Cibitung (012)'}
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-1">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">No. Pengukuhan SPPKP</div>
                <div className="text-sm font-bold text-slate-800 dark:text-white font-mono">
                  {companyInfo.sppkpNumber || 'PEM-00492/WPJ.22/KP.0803/2021'}
                </div>
              </div>
            </div>

            {/* Address Details */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-1">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Alamat Lengkap Terdaftar Pajak</div>
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {companyInfo.npwpAddress || companyInfo.address}
              </div>
            </div>

            {/* Fast Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => handleCopy(`${companyInfo.npwp || '01.234.567.8-012.000'}#${companyInfo.name}#${companyInfo.address}`, 'Format e-Faktur')}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl flex items-center gap-2 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                Salin Format e-Faktur (NPWP#Nama#Alamat)
              </button>
              <button
                onClick={() => handleCopy((companyInfo.npwp || '012345678012000').replace(/[^0-9]/g, ''), 'NPWP Polos (Angka Only)')}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl flex items-center gap-2 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                Salin Angka Polos (Untuk CSV DJP)
              </button>
            </div>
          </div>

          {/* Side Info Box */}
          <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white p-6 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Kepatuhan Pajak Pest Control
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Setiap penyerahan Jasa Pest Control, Termite Control, dan Fumigasi oleh PT BOSTON INDO GLOBAL diwajibkan menerbitkan Faktur Pajak PPN 11% dan dipotong PPh Pasal 23 sebesar 2%.
              </p>

              <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-700/50 space-y-1">
                <div className="text-[11px] font-bold text-emerald-300 uppercase">Rekening Penerimaan PPN & Operasional</div>
                <div className="text-xs font-semibold text-white">{bankAccounts[0] ? `${bankAccounts[0].bankName} No. Rek ${bankAccounts[0].accountNumber} a/n ${bankAccounts[0].accountHolder}` : companyInfo.bankBJB}</div>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Sertifikat Elektronik e-Faktur Terverifikasi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Penanggung Jawab Pajak: {companyInfo.finance} (Finance)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Direktur Utama: {companyInfo.owner}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700/60">
              <a
                href="https://efaktur.pajak.go.id"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors"
              >
                <span>Buka Portal DJP e-Faktur</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOMER NPWP DIRECTORY */}
      {activeTab === 'customer' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                Data NPWP Customer (Faktur Penjualan)
              </h2>
              <p className="text-xs text-slate-500">
                Data NPWP seluruh Klien/Customer untuk pembuatan Faktur Pajak Keluaran di e-Faktur.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari Customer / NPWP..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-semibold">
                  <th className="p-3">Kode & Customer</th>
                  <th className="p-3">Status PKP</th>
                  <th className="p-3">Nomor NPWP</th>
                  <th className="p-3">Nama di NPWP</th>
                  <th className="p-3">Alamat Pajak</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-slate-800 dark:text-white">{c.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{c.code} • {c.industry}</div>
                      </td>
                      <td className="p-3">
                        {c.isPKP !== false ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                            PKP (Wajib Faktur)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            NON PKP
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-slate-800 dark:text-slate-200 font-bold">
                        {c.npwp || <span className="text-slate-400 italic font-normal">Belum Diisi</span>}
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300">
                        {c.npwpName || c.name}
                      </td>
                      <td className="p-3 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                        {c.npwpAddress || c.address}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {c.npwp && (
                            <button
                              onClick={() => handleCopy(c.npwp!, `NPWP ${c.name}`)}
                              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Salin NPWP"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEditCustomer(c)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors font-semibold flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit NPWP</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      Tidak ada customer yang sesuai dengan pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SUPPLIER NPWP DIRECTORY */}
      {activeTab === 'supplier' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-600" />
                Data NPWP Supplier / Vendor (Faktur Pembelian)
              </h2>
              <p className="text-xs text-slate-500">
                Data NPWP Vendor penyedia bahan kimia, peralatan pest control, dan perlengkapan safety K3.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari Supplier / NPWP..."
                value={supplierSearch}
                onChange={(e) => setSupplierSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-semibold">
                  <th className="p-3">Kode & Vendor</th>
                  <th className="p-3">Kategori Supplier</th>
                  <th className="p-3">Status PKP</th>
                  <th className="p-3">Nomor NPWP</th>
                  <th className="p-3">Bank Pembayaran</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredSuppliers.length > 0 ? (
                  filteredSuppliers.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-slate-800 dark:text-white">{s.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{s.code} • {s.contactPerson}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {s.category}
                        </span>
                      </td>
                      <td className="p-3">
                        {s.isPKP !== false ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                            PKP
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            NON PKP
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-slate-800 dark:text-slate-200 font-bold">
                        {s.npwp || <span className="text-slate-400 italic font-normal">Belum Diisi</span>}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">
                        {s.bankName} - {s.bankAccount}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {s.npwp && (
                            <button
                              onClick={() => handleCopy(s.npwp!, `NPWP ${s.name}`)}
                              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Salin NPWP"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEditSupplier(s)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors font-semibold flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit NPWP</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      Tidak ada supplier yang sesuai dengan pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: TAX RULES & E-FAKTUR GUIDE */}
      {activeTab === 'rules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <BadgeCheck className="w-5 h-5 text-emerald-600" />
              1. Ketentuan PPN Jasa Pest Control & Fumigasi
            </h3>
            <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
                <span><strong>Tarif PPN 11%:</strong> Dikenakan atas DPP (Dasar Pengenaan Pajak) penggantian harga jasa pest control, termite control, rodent control, dan fumigasi.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
                <span><strong>Kode Transaksi Faktur 010:</strong> Digunakan untuk penyerahan jasa pest control kepada Pembeli BKN Pemungut PPN (Perusahaan Swasta / Badan Usaha).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
                <span><strong>Kode Transaksi Faktur 030:</strong> Digunakan jika transaksi penyerahan dilakukan kepada BUMN / Instansi Pemerintah Pemungut.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <BadgeCheck className="w-5 h-5 text-blue-600" />
              2. Ketentuan PPh Pasal 23 Pemotongan (2%)
            </h3>
            <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0"></span>
                <span><strong>Tarif PPh 23 (2%):</strong> Dipotong oleh Customer dari DPP Jasa. PT Boston Indo Global akan menerima Bukti Potong PPh 23 dari Customer.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0"></span>
                <span><strong>Fungsi Bukti Potong:</strong> Bukti Potong PPh 23 berfungsi sebagai kredit pajak penghasilan badan pada SPT Tahunan PPh Badan.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0"></span>
                <span><strong>Persyaratan Tanpa NPWP:</strong> Jika Wajib Pajak Penerima tidak memiliki NPWP, tarif pemotongan PPh 23 menjadi 100% lebih tinggi (4%).</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* MODAL EDIT COMPANY NPWP */}
      {editingCompanyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-white text-base flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-600" />
                Edit Informasi NPWP PT Boston Indo Global
              </h3>
              <button
                onClick={() => setEditingCompanyModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCompanyNPWP} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor NPWP (15 Digit)
                </label>
                <input
                  type="text"
                  required
                  value={companyForm.npwp}
                  onChange={(e) => setCompanyForm({ ...companyForm, npwp: e.target.value })}
                  placeholder="01.234.567.8-012.000"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  NITKU / NPWP 16 Digit
                </label>
                <input
                  type="text"
                  value={companyForm.nitku}
                  onChange={(e) => setCompanyForm({ ...companyForm, nitku: e.target.value })}
                  placeholder="0123456780120000"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Terdaftar Wajib Pajak
                </label>
                <input
                  type="text"
                  required
                  value={companyForm.npwpName}
                  onChange={(e) => setCompanyForm({ ...companyForm, npwpName: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  KPP Terdaftar
                </label>
                <input
                  type="text"
                  value={companyForm.kpp}
                  onChange={(e) => setCompanyForm({ ...companyForm, kpp: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  No. SPPKP
                </label>
                <input
                  type="text"
                  value={companyForm.sppkpNumber}
                  onChange={(e) => setCompanyForm({ ...companyForm, sppkpNumber: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alamat Lengkap Terdaftar Pajak
                </label>
                <textarea
                  rows={2}
                  value={companyForm.npwpAddress}
                  onChange={(e) => setCompanyForm({ ...companyForm, npwpAddress: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCompanyModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT CUSTOMER NPWP */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                Edit NPWP Customer: {editingCustomer.name}
              </h3>
              <button
                onClick={() => setEditingCustomer(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomerNPWP} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Status Pengusaha Kena Pajak (PKP)
                </label>
                <select
                  value={customerForm.isPKP ? 'PKP' : 'NON_PKP'}
                  onChange={(e) => setCustomerForm({ ...customerForm, isPKP: e.target.value === 'PKP' })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="PKP">PKP (Wajib Faktur Pajak Keluaran PPN)</option>
                  <option value="NON_PKP">NON-PKP (Bukan Pengusaha Kena Pajak)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor NPWP (15 Digit)
                </label>
                <input
                  type="text"
                  value={customerForm.npwp}
                  onChange={(e) => setCustomerForm({ ...customerForm, npwp: e.target.value })}
                  placeholder="01.234.567.8-012.000"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Sesuai Kartu NPWP
                </label>
                <input
                  type="text"
                  value={customerForm.npwpName}
                  onChange={(e) => setCustomerForm({ ...customerForm, npwpName: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alamat Terdaftar Pajak
                </label>
                <textarea
                  rows={2}
                  value={customerForm.npwpAddress}
                  onChange={(e) => setCustomerForm({ ...customerForm, npwpAddress: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  Simpan NPWP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT SUPPLIER NPWP */}
      {editingSupplier && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-600" />
                Edit NPWP Supplier: {editingSupplier.name}
              </h3>
              <button
                onClick={() => setEditingSupplier(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplierNPWP} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Status Pengusaha Kena Pajak (PKP)
                </label>
                <select
                  value={supplierForm.isPKP ? 'PKP' : 'NON_PKP'}
                  onChange={(e) => setSupplierForm({ ...supplierForm, isPKP: e.target.value === 'PKP' })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="PKP">PKP (Menyediakan Faktur Pajak Masukan)</option>
                  <option value="NON_PKP">NON-PKP (Bukan Pengusaha Kena Pajak)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor NPWP Vendor (15 Digit)
                </label>
                <input
                  type="text"
                  value={supplierForm.npwp}
                  onChange={(e) => setSupplierForm({ ...supplierForm, npwp: e.target.value })}
                  placeholder="01.234.567.8-012.000"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Sesuai Kartu NPWP
                </label>
                <input
                  type="text"
                  value={supplierForm.npwpName}
                  onChange={(e) => setSupplierForm({ ...supplierForm, npwpName: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alamat Terdaftar Pajak
                </label>
                <textarea
                  rows={2}
                  value={supplierForm.npwpAddress}
                  onChange={(e) => setSupplierForm({ ...supplierForm, npwpAddress: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingSupplier(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  Simpan NPWP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
