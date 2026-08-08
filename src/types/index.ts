export type UserRole = 'OWNER' | 'FINANCE' | 'ADMIN_SALES';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  avatar: string;
  email: string;
  phone: string;
  password?: string;
}

export type ServiceType = 
  | 'Termite Control (Rayap)'
  | 'General Pest Control (Serangga/Nyamuk/Lalat/Kecoa)'
  | 'Rodent Control (Tikus)'
  | 'Fumigation (Fumigasi)'
  | 'Bed Bug Treatment (Kutu Busuk)'
  | 'Disinfection & Sterilization'
  | 'Snake Control (Ular)'
  | 'Bird Control (Burung)'
  | 'Cat Control (Kucing)'
  | 'Snake Control'
  | 'Bird Control'
  | 'Cat Control';

export interface Customer {
  id: string;
  code: string;
  name: string;
  industry: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  pestRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  contractStartDate?: string;
  contractEndDate?: string;
  annualContractValue?: number;
  monthlyContractValue?: number;
  npwp?: string;
  npwpName?: string;
  npwpAddress?: string;
  isPKP?: boolean;
}

export interface ServiceItem {
  id: string;
  description: string;
  serviceType: ServiceType;
  areaSize: string; // e.g. "500 m2"
  quantity: number;
  unitPrice: number;
  total: number;
}

export type OrderStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  serviceType: ServiceType;
  contractStartDate: string;
  contractEndDate: string;
  visitFrequency: 'MINGGUAN' | 'DWI_MINGGUAN' | 'BULANAN' | 'INSIDENTIL';
  items: ServiceItem[];
  subtotal: number;
  taxType?: 'PPN_11' | 'NON_PPN';
  taxPPN: number; // 11% or 0
  isPPh23?: boolean;
  taxPPh23?: number; // 2% deduction
  grandTotal: number;
  netPayable?: number; // grandTotal - taxPPh23
  status: OrderStatus;
  paymentTerm?: 'CASH_IN_ADVANCE' | 'COD' | 'TERMIN_BULANAN' | 'NET_14' | 'NET_30' | 'NET_60' | string;
  salesPerson: string; // Sutardjat
  notes?: string;
  createdAt: string;
}

export type InvoiceStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE';

export interface Invoice {
  id: string;
  invoiceNumber: string; // INV/BIG/2026/08/001
  salesOrderId: string;
  salesOrderNumber: string;
  customerId: string;
  customerName: string;
  customerAddress: string;
  issueDate: string;
  dueDate: string;
  items: ServiceItem[];
  subtotal: number;
  taxType?: 'PPN_11' | 'NON_PPN';
  taxAmount: number;
  isPPh23?: boolean;
  taxPPh23?: number;
  grandTotal: number;
  netPayable?: number;
  amountPaid: number;
  remainingBalance: number;
  status: InvoiceStatus;
  paymentTerm?: string;
  notes?: string;
  createdById: string;
  createdByName: string;
  signedBySales?: string; // SUTARDJAT
  signedByFinance?: string; // FANGGIE
  signedByOwner?: string; // MUHAMMAD SAIPUL
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  category: 'CHEMICALS' | 'EQUIPMENT' | 'SAFETY_PPE' | 'BAIT_STATION' | 'GENERAL_CONSUMABLES';
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  bankName: string;
  bankAccount: string;
  status: 'ACTIVE' | 'INACTIVE';
  totalPO: number;
  totalBalanceDue: number;
  npwp?: string;
  npwpName?: string;
  npwpAddress?: string;
  isPKP?: boolean;
}

export interface POItem {
  id: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string; // liter, kg, pcs, box
  unitPrice: number;
  totalPrice: number;
}

export type POStatus = 'PENDING' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';
export type POPaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID';

export interface PurchaseOrder {
  id: string;
  poNumber: string; // PO/BIG/2026/08/001
  supplierId: string;
  supplierName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  paymentTerm?: string; // Tempo Pembayaran (e.g. NET_30, NET_14, CASH, CBD)
  items: POItem[];
  subtotal: number;
  taxPPN: number;
  grandTotal: number;
  amountPaid: number;
  status: POStatus;
  paymentStatus: POPaymentStatus;
  notes?: string;
  createdAt: string;
}

export type CashLedgerType = 'KAS_BESAR' | 'KAS_KECIL' | 'BUKU_BANK';
export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export interface CashTransaction {
  id: string;
  refNumber: string; // TRX-2026-08-001
  ledgerType: CashLedgerType;
  date: string;
  category: string; // e.g. "Pembayaran Invoice", "Pembelian Bahan Kimia Termisida", "Bensin & Tol Operasional Teknisi", "Gaji Karyawan", "Sewa Kantor"
  description: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  referenceId?: string; // Tied to Invoice or PO
  createdBy: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  balance: number;
}

export interface JournalEntry {
  id: string;
  entryNumber: string; // JRN/2026/08/001
  date: string;
  description: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  refId?: string;
}

export interface CompanyInfo {
  name: string;
  field: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  owner: string;
  finance: string;
  adminSales: string;
  bankBJB: string;
  npwp?: string;
  npwpName?: string;
  npwpAddress?: string;
  nitku?: string;
  kpp?: string;
  sppkpNumber?: string;
  isPKP?: boolean;
}

export interface MarketingTarget {
  id: string;
  name: string;
  role: string;
  area: string;
  targetOmset: number;
  commissionRate: number; // e.g. 0.04 (4%)
}

export interface FinancialConfig {
  pendapatan: { name: string; percentage: number }[];
  bebanPokok: { name: string; percentage: number }[];
  bebanOperasional: { name: string; value: number }[];
  asetTetap: { name: string; value: number }[];
  modalAwal: number;
}
