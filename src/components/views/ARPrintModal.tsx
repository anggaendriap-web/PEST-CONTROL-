import React from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Invoice } from '../../types';
import { formatDateIndo } from '../../utils/dateUtils';
import { Printer, ShieldCheck, Building2, CreditCard, CheckCircle2, FileText } from 'lucide-react';

interface ARPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
}

export const ARPrintModal: React.FC<ARPrintModalProps> = ({ isOpen, onClose, invoices }) => {
  const { companyInfo, formatCurrency } = useApp();

  if (!isOpen) return null;

  const currentDateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Calculate Overall Totals
  const totalGrandTotal = invoices.reduce((sum, i) => sum + i.grandTotal, 0);
  const totalAmountPaid = invoices.reduce((sum, i) => sum + i.amountPaid, 0);
  const totalRemainingBalance = invoices.reduce((sum, i) => sum + i.remainingBalance, 0);
  const collectionRatePct = totalGrandTotal > 0 ? (totalAmountPaid / totalGrandTotal) * 100 : 0;

  // Aging & Status Breakdown
  const totalPaidInvoices = invoices.filter(i => i.status === 'PAID').length;
  const totalPartialInvoices = invoices.filter(i => i.status === 'PARTIAL').length;
  const totalUnpaidInvoices = invoices.filter(i => i.status === 'UNPAID').length;

  interface CustomerSummary {
    customerName: string;
    invoiceCount: number;
    totalGrandTotal: number;
    totalAmountPaid: number;
    totalRemainingBalance: number;
  }

  const initialMap: Record<string, CustomerSummary> = {};
  const customerSummaryMap = invoices.reduce((acc, inv) => {
    const custName = inv.customerName || 'Lainnya';
    if (!acc[custName]) {
      acc[custName] = {
        customerName: custName,
        invoiceCount: 0,
        totalGrandTotal: 0,
        totalAmountPaid: 0,
        totalRemainingBalance: 0
      };
    }
    acc[custName].invoiceCount += 1;
    acc[custName].totalGrandTotal += inv.grandTotal;
    acc[custName].totalAmountPaid += inv.amountPaid;
    acc[custName].totalRemainingBalance += inv.remainingBalance;
    return acc;
  }, initialMap);

  const customerSummaries: CustomerSummary[] = Object.values(customerSummaryMap);

  const handlePrint = () => {
    const printElement = document.getElementById('printable-ar-report');
    if (!printElement) {
      window.print();
      return;
    }

    try {
      const printWin = window.open('', '_blank', 'width=1000,height=1100');
      if (printWin) {
        printWin.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Laporan Piutang Usaha (AR) - ${companyInfo.name}</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                @page { size: A4 portrait; margin: 8mm; }
                html, body { background: white; color: #0f172a; font-family: ui-sans-serif, system-ui, sans-serif; margin: 0; padding: 0; }
                #printable-ar-report { box-shadow: none !important; border: none !important; border-radius: 0 !important; width: 100% !important; max-width: 100% !important; padding: 12px !important; }
                * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; page-break-inside: avoid !important; }
              </style>
            </head>
            <body>
              ${printElement.outerHTML}
              <script>
                setTimeout(() => {
                  window.print();
                  window.close();
                }, 750);
              </script>
            </body>
          </html>
        `);
        printWin.document.close();
      } else {
        window.print();
      }
    } catch {
      window.print();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Form Cetak Laporan Piutang Usaha (AR Report)"
      subtitle="Pratinjau Resmi Rekapitulasi Tagihan & Sisa Piutang Berjalan Klien"
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Action Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 print:hidden">
          <div className="flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Dokumen Laporan Keuangan & Piutang Usaha Resmi {companyInfo.name}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" /> Cetak / Save PDF Laporan AR
            </button>
          </div>
        </div>

        {/* Printable AR Container */}
        <div id="printable-ar-report" className="p-8 bg-white text-slate-900 border border-slate-200 rounded-2xl shadow-xs text-xs font-sans space-y-6">
          {/* Header Kop Surat */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b-2 border-slate-900 pb-6 gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-800 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-md">
                BIG
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {companyInfo.name}
                </h1>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed max-w-md mt-1">
                  {companyInfo.address}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 font-semibold mt-1">
                  <span>📞 {companyInfo.phone}</span>
                  <span>✉️ {companyInfo.email}</span>
                  <span>🆔 NPWP: {companyInfo.npwp}</span>
                </div>
              </div>
            </div>

            <div className="sm:text-right border-l-2 sm:border-l-0 sm:border-r-0 border-emerald-600 sm:pl-0 pl-3">
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black uppercase tracking-wider mb-2">
                DOKUMEN AR KEUANGAN
              </span>
              <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
                LAPORAN PIUTANG USAHA
              </h2>
              <p className="text-[11px] font-extrabold text-emerald-700 mt-0.5">ACCOUNTS RECEIVABLE (AR)</p>
              <p className="text-[10px] text-slate-500 font-medium mt-1">
                Dicetak: <span className="font-bold text-slate-800">{currentDateStr}</span>
              </p>
            </div>
          </div>

          {/* Section 1: REKAPAN KESELURUHAN AR (SUMMARY KPI BOXES) */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-l-4 border-emerald-600 pl-2">
              1. Rekapan Keseluruhan Piutang Usaha (AR Overall Summary)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Total Nilai Tagihan</span>
                <span className="text-sm font-black text-slate-900 block mt-0.5">{formatCurrency(totalGrandTotal)}</span>
                <span className="text-[9px] text-slate-400 font-semibold">{invoices.length} Lembar Invoice</span>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Telah Dibayar (Paid)</span>
                <span className="text-sm font-black text-emerald-700 block mt-0.5">{formatCurrency(totalAmountPaid)}</span>
                <span className="text-[9px] text-emerald-600 font-bold">{collectionRatePct.toFixed(1)}% Terkumpul</span>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-amber-200 bg-amber-50/40">
                <span className="text-[9.5px] font-bold text-amber-800 uppercase block">Sisa Piutang Berjalan</span>
                <span className="text-sm font-black text-amber-700 block mt-0.5">{formatCurrency(totalRemainingBalance)}</span>
                <span className="text-[9px] text-amber-800 font-semibold">Wajib Ditagih</span>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Status Invoice</span>
                <div className="text-[10px] font-bold text-slate-800 mt-1 space-y-0.5">
                  <p className="text-emerald-700">Lunas: {totalPaidInvoices}</p>
                  <p className="text-amber-600">Sebagian: {totalPartialInvoices}</p>
                  <p className="text-rose-600">Belum Bayar: {totalUnpaidInvoices}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: REKAPITULASI PIUTANG PER PELANGGAN */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-l-4 border-emerald-600 pl-2">
              2. Rekapitulasi Piutang Per Pelanggan / Klien
            </h3>

            <table className="w-full text-left text-[11px] border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-900 text-white font-bold uppercase text-[9.5px]">
                <tr>
                  <th className="p-2.5">No</th>
                  <th className="p-2.5">Nama Pelanggan / Klien</th>
                  <th className="p-2.5 text-center">Jml Inv</th>
                  <th className="p-2.5 text-right">Total Invoice</th>
                  <th className="p-2.5 text-right">Total Dibayar</th>
                  <th className="p-2.5 text-right">Sisa Piutang</th>
                  <th className="p-2.5 text-center">Capaian Pelunasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {customerSummaries.map((c, idx) => {
                  const pct = c.totalGrandTotal > 0 ? (c.totalAmountPaid / c.totalGrandTotal) * 100 : 0;
                  return (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="p-2.5 font-bold text-slate-500 text-center">{idx + 1}</td>
                      <td className="p-2.5 font-extrabold text-slate-900">{c.customerName}</td>
                      <td className="p-2.5 text-center font-bold text-slate-700">{c.invoiceCount}</td>
                      <td className="p-2.5 text-right font-medium text-slate-900">{formatCurrency(c.totalGrandTotal)}</td>
                      <td className="p-2.5 text-right font-medium text-emerald-700">{formatCurrency(c.totalAmountPaid)}</td>
                      <td className="p-2.5 text-right font-bold text-amber-600">{formatCurrency(c.totalRemainingBalance)}</td>
                      <td className="p-2.5 text-center font-bold text-slate-800">{pct.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-100 font-extrabold text-slate-900 border-t-2 border-slate-900">
                <tr>
                  <td colSpan={3} className="p-2.5 text-center uppercase tracking-wider">TOTAL REKAPAN KESELURUHAN AR</td>
                  <td className="p-2.5 text-right font-black">{formatCurrency(totalGrandTotal)}</td>
                  <td className="p-2.5 text-right font-black text-emerald-700">{formatCurrency(totalAmountPaid)}</td>
                  <td className="p-2.5 text-right font-black text-amber-700">{formatCurrency(totalRemainingBalance)}</td>
                  <td className="p-2.5 text-center font-black">{collectionRatePct.toFixed(1)}%</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Section 3: DETAIL RINCIAN INVOICE PIUTANG */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-l-4 border-emerald-600 pl-2">
              3. Detail Rincian Invoice & Tagihan Berjalan
            </h3>

            <table className="w-full text-left text-[10px] border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-800 text-white font-bold uppercase text-[9px]">
                <tr>
                  <th className="p-2">No. Invoice</th>
                  <th className="p-2">Pelanggan</th>
                  <th className="p-2">Tgl Terbit</th>
                  <th className="p-2">Jatuh Tempo</th>
                  <th className="p-2 text-right">Nilai Invoice</th>
                  <th className="p-2 text-right">Telah Dibayar</th>
                  <th className="p-2 text-right">Sisa Piutang</th>
                  <th className="p-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="p-2 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                    <td className="p-2 font-bold text-slate-900">{inv.customerName}</td>
                    <td className="p-2 text-slate-600">{formatDateIndo(inv.issueDate)}</td>
                    <td className="p-2 font-semibold text-rose-700">{formatDateIndo(inv.dueDate)}</td>
                    <td className="p-2 text-right font-medium">{formatCurrency(inv.grandTotal)}</td>
                    <td className="p-2 text-right font-medium text-emerald-700">{formatCurrency(inv.amountPaid)}</td>
                    <td className="p-2 text-right font-bold text-amber-600">{formatCurrency(inv.remainingBalance)}</td>
                    <td className="p-2 text-center font-bold">
                      <span className={`px-2 py-0.5 rounded text-[9px] ${
                        inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                        inv.status === 'PARTIAL' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-900 text-white font-bold border-t border-slate-900">
                <tr>
                  <td colSpan={4} className="p-2 text-center uppercase tracking-wider font-black">TOTAL AKUMULASI DOKUMEN AR</td>
                  <td className="p-2 text-right font-black">{formatCurrency(totalGrandTotal)}</td>
                  <td className="p-2 text-right font-black text-emerald-400">{formatCurrency(totalAmountPaid)}</td>
                  <td className="p-2 text-right font-black text-amber-400">{formatCurrency(totalRemainingBalance)}</td>
                  <td className="p-2"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Section 4: SIGNATURE & PENGESAHAN */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-3 gap-4 text-center text-[10px]">
            <div className="space-y-12">
              <p className="font-semibold text-slate-600">Dibuat Oleh (Finance):</p>
              <div>
                <p className="font-bold underline text-slate-900">FANGGIE LEANTO</p>
                <p className="text-[9px] text-slate-500">Finance & Accounting Lead</p>
              </div>
            </div>

            <div className="space-y-12">
              <p className="font-semibold text-slate-600">Diperiksa Oleh (Manager):</p>
              <div>
                <p className="font-bold underline text-slate-900">SUTARDJAT</p>
                <p className="text-[9px] text-slate-500">Sales & Operational Manager</p>
              </div>
            </div>

            <div className="space-y-12">
              <p className="font-semibold text-slate-600">Disetujui Oleh (Direktur):</p>
              <div>
                <p className="font-bold underline text-slate-900">MUHAMMAD SAIPUL</p>
                <p className="text-[9px] text-slate-500">Direktur Utama PT BIG</p>
              </div>
            </div>
          </div>

          {/* Footer Disclaimer */}
          <div className="text-[9px] text-slate-400 text-center border-t border-slate-100 pt-3">
            Dokumen Laporan Piutang Usaha ini dicetak secara otomatis dari Sistem ERP Keuangan PT Boston Indo Global. Dokumen resmi tanpa coretan.
          </div>
        </div>
      </div>
    </Modal>
  );
};
