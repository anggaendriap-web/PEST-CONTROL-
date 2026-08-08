import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, Column } from '../common/DataTable';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { Supplier } from '../../types';
import { exportSuppliersExcel } from '../../utils/excelExport';
import {
  Truck,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Building,
  CreditCard,
  FileSpreadsheet,
  PackageCheck,
  FileCheck
} from 'lucide-react';

export const SupplierView: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, formatCurrency, setActiveTab } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'CHEMICALS' as Supplier['category'],
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    bankName: 'BCA',
    bankAccount: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    npwp: '',
    npwpName: '',
    npwpAddress: '',
    isPKP: true
  });

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setFormData({
      code: `SUP-BIG-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      category: 'CHEMICALS',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      bankName: 'BCA',
      bankAccount: '',
      status: 'ACTIVE',
      npwp: '',
      npwpName: '',
      npwpAddress: '',
      isPKP: true
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingSupplier) {
      updateSupplier({
        ...editingSupplier,
        ...formData
      });
    } else {
      addSupplier(formData);
    }
    setIsModalOpen(false);
  };

  const columns: Column<Supplier>[] = [
    {
      key: 'code',
      header: 'Kode Supplier',
      render: (s) => (
        <span className="font-bold text-slate-900 dark:text-white">{s.code}</span>
      )
    },
    {
      key: 'name',
      header: 'Nama Supplier & NPWP',
      render: (s) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-white block">{s.name}</span>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block">
            {s.category === 'CHEMICALS' ? 'Bahan Kimia Termitisida/Insecticide' : s.category === 'EQUIPMENT' ? 'Sprayer & Mesin Fogging' : s.category === 'SAFETY_PPE' ? 'APD & Hazmat Technisi' : 'Consumables & Bait Station'}
          </span>
          {s.npwp ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 mt-0.5">
              <FileCheck className="w-3 h-3 text-emerald-600" /> NPWP: {s.npwp}
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 italic block">NPWP Belum Diisi</span>
          )}
        </div>
      )
    },
    {
      key: 'contactPerson',
      header: 'PIC & Telepon',
      render: (s) => (
        <div className="text-xs">
          <p className="font-semibold text-slate-800 dark:text-slate-200">{s.contactPerson}</p>
          <p className="text-[11px] text-slate-500">{s.phone}</p>
        </div>
      )
    },
    {
      key: 'bankName',
      header: 'Rekening Pembayaran',
      render: (s) => (
        <div className="text-xs text-slate-700 dark:text-slate-300">
          <p className="font-bold text-slate-900 dark:text-white">{s.bankName}</p>
          <p className="text-[11px] text-slate-500">{s.bankAccount || '-'}</p>
        </div>
      )
    },
    {
      key: 'totalBalanceDue',
      header: 'Hutang Berjalan (AP)',
      render: (s) => (
        <span className={`font-bold ${s.totalBalanceDue > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
          {formatCurrency(s.totalBalanceDue)}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (s) => (
        <Badge variant={s.status === 'ACTIVE' ? 'emerald' : 'neutral'}>
          {s.status === 'ACTIVE' ? 'AKTIF' : 'NON-AKTIF'}
        </Badge>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Truck className="w-6 h-6 text-emerald-600" /> Database Supplier & Vendor
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Distributor bahan kimia pestisida (Bayer, Syngenta, BASF), peralatan sprayer, bait station, & APD.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportSuppliersExcel(suppliers)}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs shadow-xs flex items-center gap-2 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export Excel
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-950/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Tambah Supplier Baru
          </button>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        data={suppliers}
        columns={columns}
        searchPlaceholder="Cari supplier, NPWP, kategori, PIC..."
        searchKeys={['name', 'contactPerson', 'phone', 'category', 'code', 'npwp']}
        actions={(sup) => (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => setActiveTab('purchase-orders')}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors flex items-center gap-1"
              title={`Buat PO baru ke ${sup.name}`}
            >
              <PackageCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Buat PO</span>
            </button>
            <button
              onClick={() => {
                setEditingSupplier(sup);
                setFormData({
                  code: sup.code,
                  name: sup.name,
                  category: sup.category,
                  contactPerson: sup.contactPerson,
                  phone: sup.phone,
                  email: sup.email,
                  address: sup.address,
                  bankName: sup.bankName,
                  bankAccount: sup.bankAccount,
                  status: sup.status,
                  npwp: sup.npwp || '',
                  npwpName: sup.npwpName || sup.name,
                  npwpAddress: sup.npwpAddress || sup.address,
                  isPKP: sup.isPKP !== false
                });
                setIsModalOpen(true);
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
              title="Edit Supplier"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeletingSupplier(sup)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
              title="Hapus Supplier"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? 'Edit Data Supplier' : 'Tambah Supplier / Vendor Baru'}
        subtitle="Spesifikasi vendor bahan kimia pestisida & alat operasional"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kode Supplier
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
                Nama Perusahaan Supplier *
              </label>
              <input
                type="text"
                placeholder="Contoh: PT Bayer Indonesia"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kategori Bahan / Alat
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="CHEMICALS">CHEMICALS (Termitisida/Insektisida)</option>
                <option value="EQUIPMENT">EQUIPMENT (Cold Fogger/Sprayer)</option>
                <option value="BAIT_STATION">BAIT STATION & Umpan Tikus/Rayap</option>
                <option value="SAFETY_PPE">SAFETY PPE (Masker Respirator/Hazmat)</option>
                <option value="GENERAL_CONSUMABLES">GENERAL CONSUMABLES</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contact Person (PIC Sales)
              </label>
              <input
                type="text"
                placeholder="Bpk. Budi Rahardjo"
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
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Vendor
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Bank Tujuan
              </label>
              <input
                type="text"
                placeholder="BCA / Mandiri / BNI"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Rekening Supplier
              </label>
              <input
                type="text"
                placeholder="123-456-7890"
                value={formData.bankAccount}
                onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
              />
            </div>
          </div>

          {/* Section: NPWP & Tax Info */}
          <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800/60 space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <FileCheck className="w-4 h-4 text-amber-600" /> Informasi Perpajakan Supplier (NPWP & PPh 23 / PPN Masukan)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Status PKP Vendor
                </label>
                <select
                  value={formData.isPKP ? 'PKP' : 'NON_PKP'}
                  onChange={(e) => setFormData({ ...formData, isPKP: e.target.value === 'PKP' })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                >
                  <option value="PKP">PKP (Menyediakan Faktur Pajak Masukan)</option>
                  <option value="NON_PKP">NON-PKP (Bukan Pengusaha Kena Pajak)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor NPWP Vendor (15 Digit)
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
                  placeholder="Nama Vendor di NPWP..."
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
                  placeholder="Alamat NPWP Vendor..."
                  value={formData.npwpAddress}
                  onChange={(e) => setFormData({ ...formData, npwpAddress: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Alamat Lengkap Distributor
            </label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
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
              Simpan Supplier
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDeleteModal
        isOpen={!!deletingSupplier}
        onClose={() => setDeletingSupplier(null)}
        onConfirm={() => {
          if (deletingSupplier) deleteSupplier(deletingSupplier.id);
        }}
        title="Hapus Data Supplier"
        description="Apakah Anda yakin ingin menghapus data supplier ini?"
        itemName={deletingSupplier ? `${deletingSupplier.name} (${deletingSupplier.code})` : ''}
      />
    </div>
  );
};
