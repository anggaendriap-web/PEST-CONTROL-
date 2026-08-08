import React from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { PurchaseOrder } from '../../types';
import { formatPOPaymentTermLabel } from './PurchaseOrderView';
import { Printer, ShieldCheck, Building, PackageCheck, Truck, FileText } from 'lucide-react';

interface POPrintModalProps {
  po: PurchaseOrder | null;
  onClose: () => void;
}

export const POPrintModal: React.FC<POPrintModalProps> = ({ po, onClose }) => {
  const { companyInfo, suppliers, formatCurrency } = useApp();

  if (!po) return null;

  const supplier = suppliers.find(s => s.id === po.supplierId);

  const handlePrint = () => {
    const printElement = document.getElementById('printable-po');
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
              <title>Purchase Order - ${po.poNumber}</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                @page { size: A4 portrait; margin: 5mm; }
                html, body { background: white; color: #0f172a; font-family: ui-sans-serif, system-ui, sans-serif; margin: 0; padding: 0; }
                #printable-po { box-shadow: none !important; border: none !important; border-radius: 0 !important; width: 100% !important; max-width: 100% !important; padding: 2mm !important; margin: 0 !important; font-size: 8px !important; line-height: 1.1 !important; }
                #printable-po * { font-size: 8px !important; line-height: 1.1 !important; }
                #printable-po h1 { font-size: 12px !important; }
                #printable-po h3 { font-size: 10px !important; }
                #printable-po .text-xs { font-size: 8px !important; }
                #printable-po .text-sm { font-size: 9px !important; }
                #printable-po .text-base { font-size: 10px !important; }
                * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                table { page-break-inside: auto; width: 100% !important; border-collapse: collapse !important; }
                tr { page-break-inside: avoid; page-break-after: auto; }
                thead { display: table-header-group; }
                tbody { display: table-row-group; }
                td, th { padding: 2px 4px !important; }
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
      isOpen={!!po}
      onClose={onClose}
      title={`Form Cetak Purchase Order (PO) - #${po.poNumber}`}
      subtitle="Pratinjau Cetak & Download PDF Dokumen Pemesanan Barang ke Supplier"
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Action Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 print:hidden">
          <div className="flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Dokumen PO Pemesanan Inventaris Resmi PT Boston Indo Global
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-950/20 flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> Cetak / Save PDF Form PO
            </button>
          </div>
        </div>

        {/* Printable PO Container */}
        <div id="printable-po" className="p-8 bg-white text-slate-900 border border-slate-200 rounded-2xl shadow-sm text-xs font-sans space-y-6">
          {/* Company Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b-2 border-slate-900 pb-6 gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-md">
                BIG
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {companyInfo.name}
                </h1>
                <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mt-0.5">
                  {companyInfo.field}
                </p>
                <p className="text-[10px] text-slate-600 max-w-md mt-1 leading-normal">
                  {companyInfo.address}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Telp: {companyInfo.phone} | Email: {companyInfo.email}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-slate-900 text-white font-black text-base rounded-xl tracking-wider mb-2">
                PURCHASE ORDER
              </div>
              <p className="font-bold text-sm text-slate-900 font-mono">{po.poNumber}</p>
              <p className="text-[10px] text-slate-500 mt-1">
                Tanggal Order: <span className="font-semibold text-slate-800">{po.orderDate}</span>
              </p>
              <p className="text-[10px] text-emerald-700 font-semibold">
                Est. Pengiriman: <span>{po.expectedDeliveryDate}</span>
              </p>
              <p className="text-[10px] text-slate-700 font-semibold">
                Tempo Bayar: <span className="font-bold text-slate-900">{formatPOPaymentTermLabel(po.paymentTerm)}</span>
              </p>
            </div>
          </div>

          {/* Supplier Info & Delivery Destination Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/90 p-4 rounded-xl border border-slate-200">
            {/* Vendor / Supplier */}
            <div className="space-y-1 border-b md:border-b-0 md:border-r border-slate-200 pb-3 md:pb-0 md:pr-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                SUPPLIER / VENDOR PENYEDIA:
              </span>
              <h3 className="text-sm font-bold text-slate-900">{po.supplierName}</h3>
              {supplier && (
                <>
                  <p className="text-[11px] text-slate-600">{supplier.address}</p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    PIC: <span className="font-semibold text-slate-800">{supplier.contactPerson}</span> ({supplier.phone})
                  </p>
                  <p className="text-[10px] text-slate-500">Email: {supplier.email}</p>
                </>
              )}
            </div>

            {/* Ship To / Destination Warehouse */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                ALAMAT PENGIRIMAN GUDANG (SHIP TO):
              </span>
              <h3 className="text-sm font-bold text-emerald-800">Gudang Operasional PT Boston Indo Global</h3>
              <p className="text-[11px] text-slate-600">
                Ruko Grand Wisata Blok AA5 No. 12, Tambun Selatan, Kab. Bekasi, Jawa Barat
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Penerima / Logistik: <span className="font-semibold text-slate-800">{companyInfo.adminSales}</span> (0812-9876-5432)
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-900 text-white font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3 text-center w-12">No</th>
                  <th className="p-3">Deskripsi Barang / Bahan Kimia / Equipment</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-center">Satuan</th>
                  <th className="p-3 text-right">Harga Satuan (Rp)</th>
                  <th className="p-3 text-right">Total Harga (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {po.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-center">{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-900">{item.itemName}</td>
                    <td className="p-3 text-slate-600 font-medium text-[11px]">{item.category}</td>
                    <td className="p-3 text-center font-extrabold text-slate-900">{item.quantity}</td>
                    <td className="p-3 text-center text-slate-600">{item.unit}</td>
                    <td className="p-3 text-right font-medium">{formatCurrency(item.unitPrice)}</td>
                    <td className="p-3 text-right font-bold text-slate-900">{formatCurrency(item.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculations & Special Instructions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* Special Instructions & Notes */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                CATATAN & INSTRUKSI PENGIRIMAN:
              </span>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                "{po.notes || 'Pengiriman bahan kimia harus menyertakan MSDS (Material Safety Data Sheet) dan segel resmi pabrik.'}"
              </p>
              <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 space-y-0.5">
                <p>• Mohon sertakan Surat Jalan resmi saat pengantaran barang ke gudang.</p>
                <p>• Penagihan invoice disertai tanda terima fisik dari staf gudang kami.</p>
              </div>
            </div>

            {/* Total Calculation */}
            <div className="space-y-2 text-right">
              <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                <span className="text-slate-500">Subtotal Barang:</span>
                <span className="font-bold text-slate-800">{formatCurrency(po.subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                <span className="text-slate-500">PPN (11%):</span>
                <span className="font-bold text-slate-800">{formatCurrency(po.taxPPN)}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b-2 border-slate-900 font-extrabold text-emerald-800">
                <span>GRAND TOTAL PO SUPPLIER:</span>
                <span>{formatCurrency(po.grandTotal)}</span>
              </div>
              <div className="flex justify-between text-xs py-1 text-slate-600">
                <span>Status Pembayaran Hutang:</span>
                <span className="font-bold text-emerald-700 uppercase">{po.paymentStatus}</span>
              </div>
            </div>
          </div>

          {/* Signatures Block */}
          <div className="pt-8 border-t border-slate-200">
            <p className="text-[10px] text-slate-400 text-center uppercase tracking-wider font-semibold mb-6">
              LEMBAR OTORISASI PURCHASE ORDER PT BOSTON INDO GLOBAL
            </p>

            <div className="grid grid-cols-4 gap-3 text-center text-xs">
              <div>
                <p className="text-[10px] text-slate-500 mb-12">Dibuat Oleh (Purchasing),</p>
                <div className="border-t border-slate-400 pt-1">
                  <p className="font-bold text-slate-900">{companyInfo.adminSales}</p>
                  <p className="text-[10px] text-slate-500">Logistik & Purchasing</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 mb-12">Disetujui (Finance Head),</p>
                <div className="border-t border-slate-400 pt-1">
                  <p className="font-bold text-slate-900">{companyInfo.finance}</p>
                  <p className="text-[10px] text-slate-500">Finance Manager</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 mb-12">Mengetahui (Owner),</p>
                <div className="border-t border-slate-400 pt-1">
                  <p className="font-bold text-slate-900">{companyInfo.owner}</p>
                  <p className="text-[10px] text-slate-500">Direktur Utama</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 mb-12">Konfirmasi Supplier,</p>
                <div className="border-t border-slate-400 pt-1">
                  <p className="font-bold text-slate-900">{po.supplierName}</p>
                  <p className="text-[10px] text-slate-500">Tanda Tangan & Stempel</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
