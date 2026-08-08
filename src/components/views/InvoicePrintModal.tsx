import React from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Invoice } from '../../types';
import { Printer, Download, Share2, Building, CheckCircle2, ShieldCheck, Mail, Phone } from 'lucide-react';
import { BostonPestLogo } from '../common/BostonPestLogo';
import { formatPaymentTermLabel } from './SalesOrderView';
import { formatDateIndo } from '../../utils/dateUtils';

interface InvoicePrintModalProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({ invoice, onClose }) => {
  const { companyInfo, formatCurrency, bankAccounts } = useApp();
  
  const defaultBank = bankAccounts[0] || {
    bankName: 'BANK JABAR BANTEN (BJB)',
    accountNumber: '0160849096001',
    accountHolder: 'BOSTON INDO GLOBAL PT'
  };

  if (!invoice) return null;

  const triggerPrint = () => {
    const printElement = document.getElementById('printable-invoice');
    if (!printElement) {
      window.print();
      return;
    }

    try {
      const printWin = window.open('', '_blank', 'width=950,height=1000');
      if (printWin) {
        printWin.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Invoice - ${invoice.invoiceNumber}</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                @page { size: A4 portrait; margin: 8mm; }
                html, body { background: white; color: #0f172a; font-family: ui-sans-serif, system-ui, sans-serif; margin: 0; padding: 0; }
                #printable-invoice { box-shadow: none !important; border: none !important; border-radius: 0 !important; width: 100% !important; max-width: 100% !important; padding: 12px !important; }
                * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; page-break-inside: avoid !important; }
              </style>
            </head>
            <body>
              ${printElement.outerHTML}
              <script>
                setTimeout(() => {
                  window.print();
                  setTimeout(() => window.close(), 800);
                }, 600);
              </script>
            </body>
          </html>
        `);
        printWin.document.close();
        return;
      }
    } catch (err) {
      console.warn('Popup blocked, using window.print fallback', err);
    }

    window.print();
  };

  const handlePrint = () => {
    triggerPrint();
  };

  const handleDownloadPDF = () => {
    triggerPrint();
  };

  return (
    <Modal
      isOpen={!!invoice}
      onClose={onClose}
      title={`Faktur Invoice Resmi - #${invoice.invoiceNumber}`}
      subtitle="Pratinjau Cetak & Simpan PDF Invoice PT Boston Indo Global"
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Action Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 print:hidden">
          <div className="flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
            <span>Dokumen sah terverifikasi. Klik <strong>Simpan PDF</strong> untuk menyimpan file PDF invoice secara langsung.</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
              title="Cetak Fisik ke Printer"
            >
              <Printer className="w-4 h-4" /> Cetak
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-950/20 flex items-center gap-1.5 transition-colors"
              title="Simpan sebagai file PDF (Save as PDF)"
            >
              <Download className="w-4 h-4" /> Buat / Simpan PDF
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div id="printable-invoice" className="p-5 sm:p-6 bg-white text-slate-900 border border-slate-200 rounded-2xl shadow-sm text-xs font-sans space-y-4">
          {/* Company Header with Logo */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-emerald-700 pb-3 gap-3">
            <div className="space-y-1">
              <BostonPestLogo height={48} />
              <div>
                <h1 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  {companyInfo.name}
                </h1>
                <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                  {companyInfo.field}
                </p>
                <p className="text-[9.5px] text-slate-600 max-w-lg leading-tight mt-0.5">
                  {companyInfo.address}
                </p>
                <p className="text-[9.5px] text-slate-500 font-medium">
                  Telp: {companyInfo.phone} | Email: {companyInfo.email} | Web: {companyInfo.website}
                </p>
              </div>
            </div>

            <div className="text-right flex flex-col items-end justify-between">
              <div className="inline-block px-3 py-1 bg-emerald-800 text-white font-black text-lg rounded-lg tracking-wider mb-1 shadow-xs">
                INVOICE
              </div>
              <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">NO. INVOICE / WO</p>
              <p className="font-extrabold text-sm text-slate-900 font-mono">{invoice.invoiceNumber}</p>
              {invoice.salesOrderNumber !== invoice.invoiceNumber && (
                <p className="text-[9.5px] text-slate-500 mt-0.5">
                  Ref WO: <span className="font-bold text-slate-800 font-mono">{invoice.salesOrderNumber}</span>
                </p>
              )}
            </div>
          </div>

          {/* Client & Invoice Meta Grid */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                DITUJUKAN KEPADA (TAGIHAN KEPADA):
              </span>
              <h3 className="text-xs font-bold text-slate-900">{invoice.customerName}</h3>
              <p className="text-[10px] text-slate-600 mt-0.5 leading-snug">{invoice.customerAddress}</p>
            </div>

            <div className="text-right space-y-0.5 text-[11px]">
              <div>
                <span className="text-slate-500">Tanggal Terbit: </span>
                <span className="font-bold text-slate-800">{formatDateIndo(invoice.issueDate)}</span>
              </div>
              <div>
                <span className="text-slate-500">Syarat Pembayaran: </span>
                <span className="font-bold text-amber-800 bg-amber-100 dark:bg-amber-950/50 px-1.5 py-0.5 rounded text-[9.5px]">
                  {formatPaymentTermLabel(invoice.paymentTerm)}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Jatuh Tempo: </span>
                <span className="font-bold text-rose-700">{formatDateIndo(invoice.dueDate)}</span>
              </div>
              <div>
                <span className="text-slate-500">Status: </span>
                <span className="font-bold text-emerald-700 uppercase">{invoice.status}</span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-emerald-700 text-white font-bold uppercase text-[9px] tracking-wider">
                <tr>
                  <th className="p-2">No</th>
                  <th className="p-2">Deskripsi Layanan Pest Control</th>
                  <th className="p-2 text-center">Volume / Area</th>
                  <th className="p-2 text-right">Harga Satuan</th>
                  <th className="p-2 text-right">Jumlah Total (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoice.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-2 font-semibold text-center">{idx + 1}</td>
                    <td className="p-2">
                      <p className="font-bold text-slate-900">{item.description}</p>
                      <p className="text-[9.5px] text-emerald-700 font-semibold">{item.serviceType}</p>
                    </td>
                    <td className="p-2 text-center text-slate-600">{item.areaSize || '1 Lot'}</td>
                    <td className="p-2 text-right font-medium">{formatCurrency(item.unitPrice)}</td>
                    <td className="p-2 text-right font-bold text-slate-900">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculations Summary & Payment Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Payment Transfer Info */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                INFORMASI PEMBAYARAN REKENING RESMI:
              </span>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-0.5">
                <p className="font-extrabold text-emerald-800 text-[11px]">{defaultBank.bankName}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[9.5px] text-slate-500">No. Rekening:</span>
                  <span className="font-black text-slate-900 font-mono text-xs">{defaultBank.accountNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9.5px] text-slate-500">Atas Nama:</span>
                  <span className="font-bold text-slate-800 text-[10.5px]">{defaultBank.accountHolder}</span>
                </div>
              </div>
            </div>

            {/* Total Calculation */}
            <div className="space-y-1 text-right text-[11px]">
              <div className="flex justify-between py-0.5 border-b border-slate-100">
                <span className="text-slate-500">Subtotal (DPP):</span>
                <span className="font-bold text-slate-800">{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-100">
                <span className="text-slate-500">
                  {invoice.taxType === 'NON_PPN' || invoice.taxAmount === 0 ? 'PPN (NON-PKP):' : 'PPN 11%:'}
                </span>
                <span className="font-bold text-slate-800">{formatCurrency(invoice.taxAmount)}</span>
              </div>
              <div className="flex justify-between py-1 border-b-2 border-slate-900 font-extrabold text-emerald-800 text-xs">
                <span>GRAND TOTAL INVOICE:</span>
                <span>{formatCurrency(invoice.grandTotal)}</span>
              </div>
              {invoice.isPPh23 && (
                <div className="flex justify-between py-0.5 border-b border-slate-100 text-amber-700 text-[10.5px]">
                  <span>Potongan PPh 23 (2%):</span>
                  <span className="font-bold">-{formatCurrency(invoice.taxPPh23 || Math.round(invoice.subtotal * 0.02))}</span>
                </div>
              )}
              {invoice.isPPh23 && (
                <div className="flex justify-between py-0.5 font-bold text-emerald-700 text-[10.5px]">
                  <span>Kas Net Diterima:</span>
                  <span>{formatCurrency(invoice.netPayable || (invoice.grandTotal - (invoice.taxPPh23 || Math.round(invoice.subtotal * 0.02))))}</span>
                </div>
              )}
            </div>
          </div>

          {/* Authorization Signatures Block */}
          <div className="pt-3 border-t border-slate-200">
            <p className="text-[9px] text-slate-400 text-center uppercase tracking-wider font-semibold mb-3">
              LEMBAR PENGESAHAN DOKUMEN FAKTUR RESMI PT BOSTON INDO GLOBAL
            </p>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-[9.5px] text-slate-500 mb-8">Hormat Kami (Sales Admin),</p>
                <div className="border-t border-slate-400 pt-0.5">
                  <p className="font-bold text-slate-900 text-[11px]">{companyInfo.adminSales}</p>
                  <p className="text-[9px] text-slate-500">Admin Sales & Operations</p>
                </div>
              </div>

              <div>
                <p className="text-[9.5px] text-slate-500 mb-8">Disetujui (Finance Head),</p>
                <div className="border-t border-slate-400 pt-0.5">
                  <p className="font-bold text-slate-900 text-[11px]">{companyInfo.finance}</p>
                  <p className="text-[9px] text-slate-500">Finance & Accounting</p>
                </div>
              </div>

              <div>
                <p className="text-[9.5px] text-slate-500 mb-8">Mengetahui (Owner),</p>
                <div className="border-t border-slate-400 pt-0.5">
                  <p className="font-bold text-slate-900 text-[11px]">{companyInfo.owner}</p>
                  <p className="text-[9px] text-slate-500">Direktur Utama</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
