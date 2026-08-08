import * as XLSX from 'xlsx';
import { Customer, Supplier, SalesOrder, Invoice, PurchaseOrder, CashTransaction, JournalEntry } from '../types';

/**
 * Generic Helper to generate and trigger download of an Excel (.xlsx) file
 */
export const downloadExcel = (
  filename: string,
  sheetName: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
) => {
  const worksheetData = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Auto column widths
  const colWidths = headers.map((header, colIdx) => {
    let maxLen = header.length;
    rows.forEach(row => {
      const val = row[colIdx];
      if (val !== null && val !== undefined) {
        const strVal = String(val);
        if (strVal.length > maxLen) maxLen = strVal.length;
      }
    });
    return { wch: Math.min(Math.max(maxLen + 3, 12), 50) };
  });

  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Export Sales Orders (Work Orders)
 */
export const exportSalesOrdersExcel = (salesOrders: SalesOrder[]) => {
  const headers = [
    'No. Work Order / SO',
    'Customer ID',
    'Nama Customer',
    'Jenis Layanan',
    'Frekuensi Kunjungan',
    'Tgl Mulai Periode Pekerjaan',
    'Tgl Selesai Periode Pekerjaan',
    'DPP Jasa (Rp)',
    'PPN 11% (Rp)',
    'Total Kontrak (Rp)',
    'Status Kontrak',
    'Sales Rep',
    'Catatan'
  ];

  const rows = salesOrders.map(so => [
    so.orderNumber,
    so.customerId,
    so.customerName,
    so.serviceType,
    so.visitFrequency,
    so.contractStartDate,
    so.contractEndDate,
    so.subtotal,
    so.taxPPN,
    so.grandTotal,
    so.status,
    so.salesPerson,
    so.notes || '-'
  ]);

  downloadExcel('Sales_Orders_PT_BIG', 'Sales Orders', headers, rows);
};

/**
 * Export Invoices
 */
export const exportInvoicesExcel = (invoices: Invoice[]) => {
  const headers = [
    'No. Invoice',
    'Ref Work Order',
    'Nama Customer',
    'Alamat Customer',
    'Tgl Terbit',
    'Jatuh Tempo',
    'DPP (Rp)',
    'PPN 11% (Rp)',
    'Grand Total (Rp)',
    'Status Pembayaran',
    'Dibuat Oleh'
  ];

  const rows = invoices.map(inv => [
    inv.invoiceNumber,
    inv.salesOrderNumber,
    inv.customerName,
    inv.customerAddress,
    inv.issueDate,
    inv.dueDate,
    inv.subtotal,
    inv.taxAmount,
    inv.grandTotal,
    inv.status === 'PAID' ? 'LUNAS' : inv.status === 'PARTIAL' ? 'SEBAGIAN' : 'BELUM BAYAR',
    inv.createdByName
  ]);

  downloadExcel('Invoices_Penjualan_PT_BIG', 'Invoices', headers, rows);
};

/**
 * Export Purchase Orders (POs)
 */
export const exportPurchaseOrdersExcel = (purchaseOrders: PurchaseOrder[]) => {
  const headers = [
    'No. PO',
    'Supplier / Vendor',
    'Tgl Pemesanan',
    'Estimasi Kirim',
    'Tempo Pembayaran',
    'DPP (Rp)',
    'PPN 11% (Rp)',
    'Grand Total (Rp)',
    'Telah Dibayar (Rp)',
    'Status Pengiriman',
    'Status Pembayaran (Hutang)',
    'Catatan'
  ];

  const rows = purchaseOrders.map(po => [
    po.poNumber,
    po.supplierName,
    po.orderDate,
    po.expectedDeliveryDate,
    po.paymentTerm || 'NET 30',
    po.subtotal,
    po.taxPPN,
    po.grandTotal,
    po.amountPaid,
    po.status,
    po.paymentStatus === 'PAID' ? 'LUNAS' : po.paymentStatus === 'PARTIAL' ? 'SEBAGIAN' : 'BELUM BAYAR',
    po.notes || '-'
  ]);

  downloadExcel('Purchase_Orders_PT_BIG', 'Purchase Orders', headers, rows);
};

/**
 * Export Customers Database
 */
export const exportCustomersExcel = (customers: Customer[]) => {
  const headers = [
    'Kode Customer',
    'Nama Perusahaan',
    'Sektor Industri',
    'PIC (Contact Person)',
    'No. Telepon / WA',
    'Email',
    'Alamat',
    'Kota / Wilayah',
    'Tingkat Risiko Hama',
    'Tgl Mulai Kontrak',
    'Tgl Berakhir Kontrak',
    'Nilai Kontrak Tahunan (Rp)',
    'Nilai Kontrak Per Bulan (Rp)',
    'Status Customer',
    'Tanggal Registrasi'
  ];

  const rows = customers.map(c => {
    const annual = c.annualContractValue ?? c.totalSpent ?? 0;
    const monthly = c.monthlyContractValue ?? (annual > 0 ? annual / 12 : 0);
    return [
      c.code,
      c.name,
      c.industry,
      c.contactPerson,
      c.phone,
      c.email,
      c.address,
      c.city,
      c.pestRisk === 'HIGH' ? 'RISIKO TINGGI' : c.pestRisk === 'MEDIUM' ? 'SEDANG' : 'RENDAH',
      c.contractStartDate || c.createdAt || '-',
      c.contractEndDate || '-',
      annual,
      monthly,
      c.status === 'ACTIVE' ? 'AKTIF' : 'NON-AKTIF',
      c.createdAt
    ];
  });

  downloadExcel('Database_Customer_PT_BIG', 'Customers', headers, rows);
};

/**
 * Export Suppliers Database
 */
export const exportSuppliersExcel = (suppliers: Supplier[]) => {
  const headers = [
    'Kode Supplier',
    'Nama Vendor / Supplier',
    'Kategori Produk',
    'Contact Person',
    'No. Telepon',
    'Email',
    'Alamat',
    'Nama Bank',
    'No. Rekening',
    'Total Sisa Hutang (Rp)'
  ];

  const rows = suppliers.map(s => [
    s.code,
    s.name,
    s.category,
    s.contactPerson,
    s.phone,
    s.email,
    s.address,
    s.bankName,
    s.bankAccount,
    s.totalBalanceDue || 0
  ]);

  downloadExcel('Database_Supplier_PT_BIG', 'Suppliers', headers, rows);
};

/**
 * Export Cash & Bank Transactions
 */
export const exportCashTransactionsExcel = (transactions: CashTransaction[], titleName: string = 'Kas_Besar') => {
  const headers = [
    'Ref Transaksi',
    'Buku Kas / Ledger',
    'Tanggal',
    'Kategori',
    'Keterangan Transaksi',
    'Tipe Transaksi',
    'Debit / Masuk (Rp)',
    'Kredit / Keluar (Rp)',
    'Saldo Akhir (Rp)',
    'Pencatat'
  ];

  const rows = transactions.map(t => [
    t.refNumber,
    t.ledgerType === 'KAS_BESAR' ? 'Kas Besar' : t.ledgerType === 'KAS_KECIL' ? 'Kas Kecil (Petty Cash)' : 'Buku Bank',
    t.date,
    t.category,
    t.description,
    t.type === 'INCOME' ? 'MASUK' : 'KELUAR',
    t.type === 'INCOME' ? t.amount : 0,
    t.type === 'EXPENSE' ? t.amount : 0,
    t.balanceAfter,
    t.createdBy
  ]);

  downloadExcel(`Mutasi_${titleName}_PT_BIG`, titleName, headers, rows);
};

/**
 * Export Journal Entries
 */
export const exportJournalExcel = (journalEntries: JournalEntry[]) => {
  const headers = [
    'No. Jurnal',
    'Tanggal',
    'Kode Akun (COA)',
    'Nama Akun',
    'Keterangan Jurnal',
    'Debit (Rp)',
    'Kredit (Rp)',
    'Referensi Document'
  ];

  const rows = journalEntries.map(j => [
    j.entryNumber,
    j.date,
    j.accountCode,
    j.accountName,
    j.description,
    j.debit,
    j.credit,
    j.refId || '-'
  ]);

  downloadExcel('Jurnal_Umum_PT_BIG', 'Jurnal Umum', headers, rows);
};

/**
 * Export Sales & Marketing Achievement Report
 */
export const exportSalesAchievementExcel = (marketingData: Array<{
  name: string;
  role: string;
  target: number;
  actual: number;
  achievementPct: number;
  dealsCount: number;
  estimatedCommission: number;
  status: string;
}>) => {
  const headers = [
    'Nama Marketing / Sales Executive',
    'Jabatan & Wilayah Sales',
    'Target Omset (Rp)',
    'Realisasi Omset Sales (Rp)',
    'Persentase Capaian (%)',
    'Jumlah Kontrak Terjual (Deals)',
    'Estimasi Komisi (Rp)',
    'Status Target'
  ];

  const rows = marketingData.map(m => [
    m.name,
    m.role,
    m.target,
    m.actual,
    `${m.achievementPct.toFixed(1)}%`,
    m.dealsCount,
    m.estimatedCommission,
    m.status
  ]);

  downloadExcel('Laporan_Achievement_Marketing_PT_BIG', 'Sales_Achievement', headers, rows);
};
