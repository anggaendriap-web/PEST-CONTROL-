import React from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { PurchaseOrder, Supplier } from '../../types';
import { formatDateIndo } from '../../utils/dateUtils';
import { Printer, ShieldCheck, Building2, Receipt, CheckCircle2, FileText, Truck } from 'lucide-react';

interface APPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrders: PurchaseOrder[];
  suppliers: Supplier[];
}

export const APPrintModal: React.FC<APPrintModalProps> = ({ isOpen, onClose, purchaseOrders, suppliers }) => {
  const { companyInfo, formatCurrency } = useApp();

  if (!isOpen) return null;

  const currentDateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Calculate Overall Totals
  const totalGrandTotal = purchaseOrders.reduce((sum, po) => sum + po.grandTotal, 0);
  const totalAmountPaid = purchaseOrders.reduce((sum, po) => sum + po.amountPaid, 0);
  const totalRemainingAP = purchaseOrders.reduce((sum, po) => sum + (po.grandTotal - po.amountPaid), 0);
  const paymentRatePct = totalGrandTotal > 0 ? (totalAmountPaid / totalGrandTotal) * 100 : 0;

  // Status Breakdown
  const totalPaidPOs = purchaseOrders.filter(po => po.paymentStatus === 'PAID').length;
  const totalPartialPOs = purchaseOrders.filter(po => po.paymentStatus === 'PARTIAL').length;
  const totalUnpaidPOs = purchaseOrders.filter(po => po.paymentStatus === 'UNPAID').length;

  interface SupplierSummary {
    supplierName: string;
    supplierCode: string;
    poCount: number;
    totalGrandTotal: number;
    totalAmountPaid: number;
    totalRemainingAP: number;
  }

  // Group POs by Supplier for Summary
  const initialMap: Record<string, SupplierSummary> = {};
  const supplierSummaryMap = purchaseOrders.reduce((acc, po) => {
    const supName = po.supplierName || 'Distributor Lainnya';
    if (!acc[supName]) {
      const foundSup = suppliers.find(s => s.name === supName);
      acc[supName] = {
        supplierName: supName,
        supplierCode: foundSup?.code || '-',
        poCount: 0,
        totalGrandTotal: 0,
        totalAmountPaid: 0,
        totalRemainingAP: 0
      };
    }
    acc[supName].poCount += 1;
    acc[supName].totalGrandTotal += po.grandTotal;
    acc[supName].totalAmountPaid += po.amountPaid;
    acc[supName].totalRemainingAP += (po.grandTotal - po.amountPaid);
    return acc;
  }, initialMap);

  const supplierSummaries: SupplierSummary[] = Object.values(supplierSummaryMap);

  const handlePrint = () => {
    const printElement = document.getElementById('printable-ap-report');
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
              <title>Laporan Hutang Supplier (AP) - ${companyInfo.name}</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                @page { size: A4 portrait; margin: 8mm; }
                html, body { background: white; color: #0f172a; font-family: ui-sans-serif, system-ui, sans-serif; margin: 0; padding: 0; }
                #printable-ap-report { box-shadow: none !important; border: none !important; border-radius: 0 !important; width: 100% !important; max-width: 100% !important; padding: 12px !important; }
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
      title="Form Cetak Laporan Hutang Supplier (AP Report)"
      subtitle="Pratinjau Resmi Rekapitulasi Kewajiban Pembayaran Ke Distributor & Vendor"
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Action Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/60 print:hidden">
          <div className="flex items-center gap-2 text-xs text-amber-900 dark:text-amber-300 font-semibold">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            Dokumen Laporan Keuangan & Hutang Usaha Resmi {companyInfo.name}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" /> Cetak / Save PDF Laporan AP
            </button>
          </div>
        </div>

        {/* Printable AP Container */}
        <div id="printable-ap-report" className="p-8 bg-white text-slate-900 border border-slate-200 rounded-2xl shadow-xs text-xs font-sans space-y-6">
          {/* Header Kop Surat */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b-2 border-slate-900 pb-6 gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-md">
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

            <div className="sm:text-right border-l-2 sm:border-l-0 sm:border-r-0 border-amber-600 sm:pl-0 pl-3">
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-[10px] font-black uppercase tracking-wider mb-2">
                DOKUMEN AP KEUANGAN
              </span>
              <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
                LAPORAN HUTANG SUPPLIER
              </h2>
              <p className="text-[11px] font-extrabold text-amber-700 mt-0.5">ACCOUNTS PAYABLE (AP)</p>
              <p className="text-[10px] text-slate-500 font-medium mt-1">
                Dicetak: <span className="font-bold text-slate-800">{currentDateStr}</span>
              </p>
            </div>
          </div>

          {/* Section 1: REKAPAN KESELURUHAN AP (SUMMARY KPI BOXES) */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-l-4 border-amber-600 pl-2">
              1. Rekapan Keseluruhan Hutang Supplier (AP Overall Summary)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Total Pembelian PO</span>
                <span className="text-sm font-black text-slate-900 block mt-0.5">{formatCurrency(totalGrandTotal)}</span>
                <span className="text-[9px] text-slate-400 font-semibold">{purchaseOrders.length} Lembar PO</span>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Telah Dibayar Ke Vendor</span>
                <span className="text-sm font-black text-emerald-700 block mt-0.5">{formatCurrency(totalAmountPaid)}</span>
                <span className="text-[9px] text-emerald-600 font-bold">{paymentRatePct.toFixed(1)}% Terbayar</span>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-amber-300 bg-amber-50/50">
                <span className="text-[9.5px] font-bold text-amber-900 uppercase block">Sisa Hutang Berjalan (AP)</span>
                <span className="text-sm font-black text-amber-700 block mt-0.5">{formatCurrency(totalRemainingAP)}</span>
                <span className="text-[9px] text-amber-800 font-semibold">Wajib Dilunasi</span>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Status PO Pembelian</span>
                <div className="text-[10px] font-bold text-slate-800 mt-1 space-y-0.5">
                  <p className="text-emerald-700">Lunas: {totalPaidPOs}</p>
                  <p className="text-amber-600">Sebagian: {totalPartialPOs}</p>
                  <p className="text-rose-600">Belum Bayar: {totalUnpaidPOs}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: REKAPITULASI HUTANG PER SUPPLIER */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-l-4 border-amber-600 pl-2">
              2. Rekapitulasi Saldo Hutang Per Vendor / Supplier
            </h3>

            <table className="w-full text-left text-[11px] border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-900 text-white font-bold uppercase text-[9.5px]">
                <tr>
                  <th className="p-2.5">No</th>
                  <th className="p-2.5">Kode</th>
                  <th className="p-2.5">Nama Vendor / Supplier</th>
                  <th className="p-2.5 text-center">Jml PO</th>
                  <th className="p-2.5 text-right">Total Pembelian</th>
                  <th className="p-2.5 text-right">Total Dibayar</th>
                  <th className="p-2.5 text-right">Sisa Hutang (AP)</th>
                  <th className="p-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {supplierSummaries.map((s, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="p-2.5 font-bold text-slate-500 text-center">{idx + 1}</td>
                    <td className="p-2.5 font-mono text-slate-600">{s.supplierCode}</td>
                    <td className="p-2.5 font-extrabold text-slate-900">{s.supplierName}</td>
                    <td className="p-2.5 text-center font-bold text-slate-700">{s.poCount}</td>
                    <td className="p-2.5 text-right font-medium text-slate-900">{formatCurrency(s.totalGrandTotal)}</td>
                    <td className="p-2.5 text-right font-medium text-emerald-700">{formatCurrency(s.totalAmountPaid)}</td>
                    <td className="p-2.5 text-right font-bold text-amber-600">{formatCurrency(s.totalRemainingAP)}</td>
                    <td className="p-2.5 text-center font-bold">
                      <span className={`px-2 py-0.5 rounded text-[9px] ${
                        s.totalRemainingAP === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {s.totalRemainingAP === 0 ? 'LUNAS' : 'ADA HUTANG'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 font-extrabold text-slate-900 border-t-2 border-slate-900">
                <tr>
                  <td colSpan={4} className="p-2.5 text-center uppercase tracking-wider">TOTAL REKAPAN KESELURUHAN AP</td>
                  <td className="p-2.5 text-right font-black">{formatCurrency(totalGrandTotal)}</td>
                  <td className="p-2.5 text-right font-black text-emerald-700">{formatCurrency(totalAmountPaid)}</td>
                  <td className="p-2.5 text-right font-black text-amber-700">{formatCurrency(totalRemainingAP)}</td>
                  <td className="p-2.5 text-center font-black">{paymentRatePct.toFixed(1)}%</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Section 3: DETAIL RINCIAN PURCHASE ORDER (PO) */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-l-4 border-amber-600 pl-2">
              3. Detail Rincian Purchase Order & Hutang Berjalan
            </h3>

            <table className="w-full text-left text-[10px] border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-800 text-white font-bold uppercase text-[9px]">
                <tr>
                  <th className="p-2">No. PO</th>
                  <th className="p-2">Supplier / Vendor</th>
                  <th className="p-2">Tanggal Order</th>
                  <th className="p-2 text-right">Nilai Total PO</th>
                  <th className="p-2 text-right">Telah Dibayar</th>
                  <th className="p-2 text-right">Sisa Hutang (AP)</th>
                  <th className="p-2 text-center">Status Bayar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {purchaseOrders.map((po) => {
                  const remaining = po.grandTotal - po.amountPaid;
                  return (
                    <tr key={po.id} className="hover:bg-slate-50">
                      <td className="p-2 font-mono font-bold text-slate-900">{po.poNumber}</td>
                      <td className="p-2 font-bold text-slate-900">{po.supplierName}</td>
                      <td className="p-2 text-slate-600">{formatDateIndo(po.orderDate)}</td>
                      <td className="p-2 text-right font-medium">{formatCurrency(po.grandTotal)}</td>
                      <td className="p-2 text-right font-medium text-emerald-700">{formatCurrency(po.amountPaid)}</td>
                      <td className="p-2 text-right font-bold text-amber-600">{formatCurrency(remaining)}</td>
                      <td className="p-2 text-center font-bold">
                        <span className={`px-2 py-0.5 rounded text-[9px] ${
                          po.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                          po.paymentStatus === 'PARTIAL' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {po.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-900 text-white font-bold border-t border-slate-900">
                <tr>
                  <td colSpan={3} className="p-2 text-center uppercase tracking-wider font-black">TOTAL AKUMULASI DOKUMEN AP</td>
                  <td className="p-2 text-right font-black">{formatCurrency(totalGrandTotal)}</td>
                  <td className="p-2 text-right font-black text-emerald-400">{formatCurrency(totalAmountPaid)}</td>
                  <td className="p-2 text-right font-black text-amber-400">{formatCurrency(totalRemainingAP)}</td>
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
                <p className="text-[9px] text-slate-500">Finance & Purchasing Lead</p>
              </div>
            </div>

            <div className="space-y-12">
              <p className="font-semibold text-slate-600">Diperiksa Oleh (Manager):</p>
              <div>
                <p className="font-bold underline text-slate-900">SUTARDJAT</p>
                <p className="text-[9px] text-slate-500">Procurement & Operations Manager</p>
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
            Dokumen Laporan Hutang Supplier ini dicetak secara otomatis dari Sistem ERP Keuangan PT Boston Indo Global. Dokumen resmi tanpa coretan.
          </div>
        </div>
      </div>
    </Modal>
  );
};
