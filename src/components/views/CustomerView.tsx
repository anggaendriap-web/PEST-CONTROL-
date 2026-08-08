import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, Column } from '../common/DataTable';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { Customer } from '../../types';
import { exportCustomersExcel } from '../../utils/excelExport';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Building2,
  Phone,
  Mail,
  MapPin,
  ShieldAlert,
  Calendar,
  FileSpreadsheet,
  FileCheck
} from 'lucide-react';

export const CustomerView: React.FC = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer, formatCurrency } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  // Helper for 1 year default end date
  const calcOneYearLater = (startDateStr: string) => {
    if (!startDateStr) return '';
    const d = new Date(startDateStr);
    if (isNaN(d.getTime())) return '';
    d.setFullYear(d.getFullYear() + 1);
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  };

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    industry: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    city: 'Kabupaten Bekasi',
    pestRisk: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    contractStartDate: '',
    contractEndDate: '',
    annualContractValue: 0,
    monthlyContractValue: 0,
    npwp: '',
    npwpName: '',
    npwpAddress: '',
    isPKP: true
  });

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    const today = new Date().toISOString().split('T')[0];
    const oneYearLater = calcOneYearLater(today);
    setFormData({
      code: `CUST-BIG-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      industry: 'Manufaktur Otomotif',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      city: 'Kabupaten Bekasi',
      pestRisk: 'MEDIUM',
      status: 'ACTIVE',
      contractStartDate: today,
      contractEndDate: oneYearLater,
      annualContractValue: 120000000,
      monthlyContractValue: 10000000,
      npwp: '',
      npwpName: '',
      npwpAddress: '',
      isPKP: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    const defaultAnnual = cust.annualContractValue ?? cust.totalSpent ?? 0;
    const defaultMonthly = cust.monthlyContractValue ?? (defaultAnnual > 0 ? defaultAnnual / 12 : 0);
    const startDate = cust.contractStartDate || cust.createdAt || new Date().toISOString().split('T')[0];
    const endDate = cust.contractEndDate || calcOneYearLater(startDate);
    
    setFormData({
      code: cust.code,
      name: cust.name,
      industry: cust.industry,
      contactPerson: cust.contactPerson,
      phone: cust.phone,
      email: cust.email,
      address: cust.address,
      city: cust.city,
      pestRisk: cust.pestRisk,
      status: cust.status,
      contractStartDate: startDate,
      contractEndDate: endDate,
      annualContractValue: defaultAnnual,
      monthlyContractValue: defaultMonthly,
      npwp: cust.npwp || '',
      npwpName: cust.npwpName || cust.name,
      npwpAddress: cust.npwpAddress || cust.address,
      isPKP: cust.isPKP !== false
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingCustomer) {
      updateCustomer({
        ...editingCustomer,
        ...formData,
        totalSpent: formData.annualContractValue > 0 ? formData.annualContractValue : editingCustomer.totalSpent
      });
    } else {
      addCustomer({
        ...formData,
        totalSpent: formData.annualContractValue
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (cust: Customer) => {
    setDeletingCustomer(cust);
  };

  const columns: Column<Customer>[] = [
    {
      key: 'code',
      header: 'Kode Customer',
      render: (c) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-white">{c.code}</span>
          <p className="text-[10px] text-slate-400">{c.createdAt}</p>
        </div>
      )
    },
    {
      key: 'name',
      header: 'Nama Perusahaan & NPWP',
      render: (c) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-white block">{c.name}</span>
          <span className="text-[11px] text-slate-500 block">{c.industry}</span>
          {c.npwp ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 mt-0.5">
              <FileCheck className="w-3 h-3 text-emerald-600" /> NPWP: {c.npwp}
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 italic block">NPWP Belum Diisi</span>
          )}
        </div>
      )
    },
    {
      key: 'contactPerson',
      header: 'Kontak PIC',
      render: (c) => (
        <div className="space-y-0.5 text-xs">
          <p className="font-semibold text-slate-800 dark:text-slate-200">{c.contactPerson}</p>
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <Phone className="w-3 h-3 text-slate-400" /> {c.phone}
          </p>
        </div>
      )
    },
    {
      key: 'address',
      header: 'Alamat Lokasi & Kota',
      render: (c) => (
        <div className="max-w-xs text-xs">
          <p className="truncate text-slate-700 dark:text-slate-300">{c.address}</p>
          <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">{c.city}</p>
        </div>
      )
    },
    {
      key: 'pestRisk',
      header: 'Tingkat Risiko Hama',
      render: (c) => (
        <Badge
          variant={c.pestRisk === 'HIGH' ? 'error' : c.pestRisk === 'MEDIUM' ? 'warning' : 'info'}
        >
          {c.pestRisk === 'HIGH' ? 'RISIKO TINGGI' : c.pestRisk === 'MEDIUM' ? 'SEDANG' : 'RENDAH'}
        </Badge>
      )
    },
    {
      key: 'contractStartDate',
      header: 'Periode Kontrak',
      render: (c) => (
        <div className="flex flex-col text-xs text-slate-700 dark:text-slate-300 gap-0.5">
          <div className="flex items-center gap-1.5 font-semibold">
            <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{c.contractStartDate || c.createdAt || '-'}</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 pl-5 font-medium">
            s/d {c.contractEndDate || calcOneYearLater(c.contractStartDate || c.createdAt) || '-'}
          </div>
        </div>
      )
    },
    {
      key: 'totalSpent',
      header: 'Nilai Kontrak (Tahunan / Bulan)',
      render: (c) => {
        const annual = c.annualContractValue ?? c.totalSpent ?? 0;
        const monthly = c.monthlyContractValue ?? (annual > 0 ? annual / 12 : 0);
        return (
          <div className="text-xs">
            <span className="font-bold text-slate-900 dark:text-white block">
              {formatCurrency(annual)} <span className="text-[10px] text-slate-500 font-normal">/thn</span>
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold block">
              {formatCurrency(monthly)} <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 font-normal">/bln</span>
            </span>
          </div>
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      render: (c) => (
        <Badge variant={c.status === 'ACTIVE' ? 'emerald' : 'neutral'}>
          {c.status === 'ACTIVE' ? 'AKTIF' : 'NON-AKTIF'}
        </Badge>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" /> Database Customer & Klien
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Kelola profil perusahaan klien pest control, tingkat risiko hama, alamat lokasi, dan PIC.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportCustomersExcel(customers)}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs shadow-xs flex items-center gap-2 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export Excel
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-950/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Tambah Customer Baru
          </button>
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable
        data={customers}
        columns={columns}
        searchPlaceholder="Cari nama customer, NPWP, PIC, alamat, kota..."
        searchKeys={['name', 'contactPerson', 'phone', 'address', 'city', 'npwp']}
        filterOptions={[
          {
            key: 'pestRisk',
            label: 'Risiko Hama',
            options: [
              { label: 'Risiko Tinggi', value: 'HIGH' },
              { label: 'Risiko Sedang', value: 'MEDIUM' },
              { label: 'Risiko Rendah', value: 'LOW' }
            ]
          },
          {
            key: 'status',
            label: 'Status',
            options: [
              { label: 'Aktif', value: 'ACTIVE' },
              { label: 'Non-Aktif', value: 'INACTIVE' }
            ]
          }
        ]}
        actions={(cust) => (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => handleOpenEditModal(cust)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
              title="Edit Data"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(cust)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
              title="Hapus Data"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Edit Data Customer' : 'Tambah Customer Baru'}
        subtitle="Masukkan detail perusahaan dan profil risiko pest control"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kode Customer
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Perusahaan / Klien *
              </label>
              <input
                type="text"
                placeholder="Contoh: PT Jababeka Industrial Park"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sektor Industri
              </label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="Manufaktur Otomotif">Manufaktur Otomotif</option>
                <option value="Kawasan Industri">Kawasan Industri</option>
                <option value="Perhotelan & Hospitality">Perhotelan & Hospitality</option>
                <option value="Kesehatan / Rumah Sakit">Kesehatan / Rumah Sakit</option>
                <option value="Gedung PerkANTORAN / Mall">Gedung Perkantoran / Mall</option>
                <option value="Perumahan / Residensial">Perumahan / Residensial</option>
                <option value="Restoran & Food Processing">Restoran & Food Processing</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Contact Person (PIC) *
              </label>
              <input
                type="text"
                placeholder="Contoh: Bpk. Irwan Santoso"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                No. Telepon / WhatsApp *
              </label>
              <input
                type="text"
                placeholder="021-8934567 atau 0812-..."
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Perusahaan
              </label>
              <input
                type="email"
                placeholder="facility@perusahaan.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kota / Wilayah *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tingkat Risiko Hama (Pest Risk Level)
              </label>
              <select
                value={formData.pestRisk}
                onChange={(e) => setFormData({ ...formData, pestRisk: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="HIGH">Risiko Tinggi (Pest Control Intensif)</option>
                <option value="MEDIUM">Risiko Sedang (Kontrol Rutin)</option>
                <option value="LOW">Risiko Rendah (Monitoring)</option>
              </select>
            </div>
          </div>

          {/* Section: NPWP & Tax Info */}
          <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800/60 space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <FileCheck className="w-4 h-4 text-blue-600" /> Informasi Perpajakan (NPWP & e-Faktur)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Status PKP Customer
                </label>
                <select
                  value={formData.isPKP ? 'PKP' : 'NON_PKP'}
                  onChange={(e) => setFormData({ ...formData, isPKP: e.target.value === 'PKP' })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                >
                  <option value="PKP">PKP (Pengusaha Kena Pajak - Wajib Faktur)</option>
                  <option value="NON_PKP">NON-PKP (Bukan Pengusaha Kena Pajak)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor NPWP (15 Digit)
                </label>
                <input
                  type="text"
                  placeholder="01.234.567.8-012.000"
                  value={formData.npwp}
                  onChange={(e) => setFormData({ ...formData, npwp: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Sesuai Kartu NPWP
                </label>
                <input
                  type="text"
                  placeholder="Nama di NPWP..."
                  value={formData.npwpName}
                  onChange={(e) => setFormData({ ...formData, npwpName: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alamat Terdaftar Pajak
                </label>
                <input
                  type="text"
                  placeholder="Alamat di NPWP..."
                  value={formData.npwpAddress}
                  onChange={(e) => setFormData({ ...formData, npwpAddress: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Section: Contract Details & Values */}
          <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-emerald-600" /> Informasi Kontrak & Nilai Layanan
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tanggal Mulai Kontrak *
                </label>
                <input
                  type="date"
                  value={formData.contractStartDate}
                  onChange={(e) => {
                    const newStart = e.target.value;
                    setFormData({
                      ...formData,
                      contractStartDate: newStart,
                      contractEndDate: calcOneYearLater(newStart)
                    });
                  }}
                  required
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tanggal Berakhir Kontrak *
                </label>
                <input
                  type="date"
                  value={formData.contractEndDate}
                  onChange={(e) => setFormData({ ...formData, contractEndDate: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nilai Kontrak / Bulan (Rp) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={formData.monthlyContractValue}
                  onChange={(e) => {
                    const monthly = Number(e.target.value);
                    setFormData({
                      ...formData,
                      monthlyContractValue: monthly,
                      annualContractValue: monthly * 12
                    });
                  }}
                  required
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                />
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                  {formatCurrency(formData.monthlyContractValue || 0)} /bln
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nilai Kontrak / Tahun (Rp) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={formData.annualContractValue}
                  onChange={(e) => {
                    const annual = Number(e.target.value);
                    setFormData({
                      ...formData,
                      annualContractValue: annual,
                      monthlyContractValue: annual > 0 ? annual / 12 : 0
                    });
                  }}
                  required
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                />
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                  {formatCurrency(formData.annualContractValue || 0)} /thn
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Alamat Lengkap Lokasi *
            </label>
            <textarea
              rows={3}
              placeholder="Jl. Raya Industri No. 1, Cikarang..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-950/20"
            >
              Simpan Customer
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDeleteModal
        isOpen={!!deletingCustomer}
        onClose={() => setDeletingCustomer(null)}
        onConfirm={() => {
          if (deletingCustomer) deleteCustomer(deletingCustomer.id);
        }}
        title="Hapus Data Customer"
        description="Apakah Anda yakin ingin menghapus data customer ini?"
        itemName={deletingCustomer ? `${deletingCustomer.name} (${deletingCustomer.code})` : ''}
      />
    </div>
  );
};
