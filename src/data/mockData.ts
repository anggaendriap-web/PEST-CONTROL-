import {
  User,
  Customer,
  Supplier,
  SalesOrder,
  Invoice,
  PurchaseOrder,
  CashTransaction,
  BankAccount,
  JournalEntry,
  CompanyInfo,
  MarketingTarget
} from '../types';

export const COMPANY_DETAILS: CompanyInfo = {
  name: 'PT BOSTON INDO GLOBAL',
  field: 'PEST CONTROL MANAGEMENT & FUMIGATION',
  address: 'RUKO GRAND BUSINESS PARK - GRAND WISATA BEKASI, Jl. Celebration Boulevard No.GB.1, RW.No. 29, Lambangsari, Kec. Tambun Sel., Kabupaten Bekasi, Jawa Barat 17510',
  phone: '(021) 8261-5588 / 0812-8899-7711',
  email: 'sales@bostonindoglobal.co.id',
  website: 'www.bostonindoglobal.co.id',
  owner: 'MUHAMMAD SAIPUL',
  finance: 'FANGGIE',
  adminSales: 'SUTARDJAT',
  bankBJB: 'BANK JABAR BANTEN No. Rek 0160849096001 a/n BOSTON INDO GLOBAL PT',
  npwp: '01.234.567.8-012.000',
  npwpName: 'PT BOSTON INDO GLOBAL',
  npwpAddress: 'RUKO GRAND BUSINESS PARK - GRAND WISATA BEKASI, Jl. Celebration Boulevard No.GB.1, Lambangsari, Tambun Selatan, Kab. Bekasi 17510',
  nitku: '0123456780120000',
  kpp: 'KPP Pratama Cibitung (012)',
  sppkpNumber: 'PEM-00492/WPJ.22/KP.0803/2021',
  isPKP: true
};

export const INITIAL_USERS: User[] = [
  {
    id: 'USR-001',
    name: 'MUHAMMAD SAIPUL',
    role: 'OWNER',
    title: 'Owner / Direktur Utama',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    email: 'saipul@bostonindoglobal.co.id',
    phone: '0811-9988-7766',
    password: 'BOSTON123'
  },
  {
    id: 'USR-002',
    name: 'FANGGIE',
    role: 'FINANCE',
    title: 'Head of Finance & Accounting',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    email: 'fanggie@bostonindoglobal.co.id',
    phone: '0812-3344-5566',
    password: 'BOSTON123'
  },
  {
    id: 'USR-003',
    name: 'SUTARDJAT',
    role: 'ADMIN_SALES',
    title: 'Senior Admin Sales & Operations',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    email: 'sutardjat@bostonindoglobal.co.id',
    phone: '0813-7788-9900',
    password: 'BOSTON123'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-001',
    code: 'CUST-JAB-01',
    name: 'PT Jababeka Industrial Park',
    industry: 'Kawasan Industri',
    contactPerson: 'Bpk. Irwan Santoso',
    phone: '021-8934567',
    email: 'facility@jababeka.com',
    address: 'Kawasan Industri Jababeka 1, Cikarang, Bekasi',
    city: 'Kabupaten Bekasi',
    pestRisk: 'HIGH',
    status: 'ACTIVE',
    createdAt: '2026-01-10',
    totalOrders: 4,
    totalSpent: 96000000,
    contractStartDate: '2026-01-01',
    contractEndDate: '2026-12-31',
    annualContractValue: 96000000,
    monthlyContractValue: 8000000,
    npwp: '01.888.333.2-411.000',
    npwpName: 'PT JABABEKA INDUSTRIAL PARK TBM',
    npwpAddress: 'Kawasan Industri Jababeka 1, Cikarang, Bekasi',
    isPKP: true
  },
  {
    id: 'CUST-002',
    code: 'CUST-AST-02',
    name: 'PT Astra Honda Motor Plant Cikarang',
    industry: 'Manufaktur Otomotif',
    contactPerson: 'Ibu Ratna Pertiwi',
    phone: '021-8983000',
    email: 'ga.cikarang@astra-honda.com',
    address: 'Kawasan MM2100, Cikarang Barat, Bekasi',
    city: 'Kabupaten Bekasi',
    pestRisk: 'MEDIUM',
    status: 'ACTIVE',
    createdAt: '2026-01-15',
    totalOrders: 6,
    totalSpent: 145000000,
    contractStartDate: '2026-01-01',
    contractEndDate: '2026-12-31',
    annualContractValue: 144000000,
    monthlyContractValue: 12000000,
    npwp: '01.001.222.3-091.000',
    npwpName: 'PT ASTRA HONDA MOTOR',
    npwpAddress: 'Kawasan MM2100 Blok AA-1, Cikarang Barat, Kab. Bekasi',
    isPKP: true
  },
  {
    id: 'CUST-003',
    code: 'CUST-SNT-03',
    name: 'Hotel Santika Mega City Bekasi',
    industry: 'Perhotelan & Hospitality',
    contactPerson: 'Bpk. Hendra Gunawan',
    phone: '021-29285555',
    email: 'eng.megacity@santika.com',
    address: 'Jl. Ahmad Yani No. 1, Bekasi Selatan',
    city: 'Kota Bekasi',
    pestRisk: 'HIGH',
    status: 'ACTIVE',
    createdAt: '2026-02-01',
    totalOrders: 3,
    totalSpent: 42000000,
    contractStartDate: '2026-02-01',
    contractEndDate: '2027-01-31',
    annualContractValue: 48000000,
    monthlyContractValue: 4000000,
    npwp: '02.555.777.9-424.000',
    npwpName: 'PT HOTEL SANTIKA UTAMA BEKASI',
    npwpAddress: 'Jl. Ahmad Yani No. 1, Bekasi Selatan, Kota Bekasi',
    isPKP: true
  },
  {
    id: 'CUST-004',
    code: 'CUST-HER-04',
    name: 'RS Hermina Grand Wisata',
    industry: 'Kesehatan / Rumah Sakit',
    contactPerson: 'dr. Anita Syafrudin',
    phone: '021-82612000',
    email: 'kesling.grandwisata@herminahospitals.com',
    address: 'Jl. Lambang Jaya No. 1, Grand Wisata, Tambun Selatan',
    city: 'Kabupaten Bekasi',
    pestRisk: 'HIGH',
    status: 'ACTIVE',
    createdAt: '2026-02-10',
    totalOrders: 5,
    totalSpent: 88000000,
    contractStartDate: '2026-02-01',
    contractEndDate: '2027-01-31',
    annualContractValue: 60000000,
    monthlyContractValue: 5000000,
    npwp: '03.111.999.4-432.000',
    npwpName: 'PT MEDIKALOKA HERMINA BEKASI',
    npwpAddress: 'Jl. Lambang Jaya No. 1, Grand Wisata, Tambun Selatan',
    isPKP: true
  },
  {
    id: 'CUST-005',
    code: 'CUST-HYU-05',
    name: 'PT Hyundai Motors Manufacturing Indonesia',
    industry: 'Manufaktur',
    contactPerson: 'Mr. Park Ji-Hoon / Bpk. Adi',
    phone: '021-89980000',
    email: 'site.safety@hyundai-id.com',
    address: 'Kawasan GIIC Cikarang Pusat, Bekasi',
    city: 'Kabupaten Bekasi',
    pestRisk: 'MEDIUM',
    status: 'ACTIVE',
    createdAt: '2026-03-01',
    totalOrders: 2,
    totalSpent: 120000000,
    contractStartDate: '2026-03-01',
    contractEndDate: '2027-02-28',
    annualContractValue: 120000000,
    monthlyContractValue: 10000000
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'SUP-001',
    code: 'SUP-BAY-01',
    name: 'PT Bayer Indonesia',
    category: 'CHEMICALS',
    contactPerson: 'Bpk. Budi Rahardjo',
    phone: '021-5703661',
    email: 'sales.environmental@bayer.co.id',
    address: 'Menara Astra Lt. 33, Jl. Jend. Sudirman, Jakarta',
    bankName: 'Bank Mandiri',
    bankAccount: '122-000-4433221',
    status: 'ACTIVE',
    totalPO: 8,
    totalBalanceDue: 18500000
  },
  {
    id: 'SUP-002',
    code: 'SUP-SYN-02',
    name: 'PT Syngenta Indonesia',
    category: 'CHEMICALS',
    contactPerson: 'Ibu Maya Lestari',
    phone: '021-78836000',
    email: 'ppm.indonesia@syngenta.com',
    address: 'Cilandak Commercial Estate, Jakarta Selatan',
    bankName: 'BCA',
    bankAccount: '001-3344-551',
    status: 'ACTIVE',
    totalPO: 5,
    totalBalanceDue: 12000000
  },
  {
    id: 'SUP-003',
    code: 'SUP-GLO-03',
    name: 'Toko Equipment Pest Control Glodok',
    category: 'EQUIPMENT',
    contactPerson: 'Ko Ahok / Bpk. Steven',
    phone: '0812-9876-5432',
    email: 'pest.equipment@glodok.com',
    address: 'LTC Glodok Lt. GF2 Blok B10, Jakarta Barat',
    bankName: 'BCA',
    bankAccount: '600-1122-334',
    status: 'ACTIVE',
    totalPO: 4,
    totalBalanceDue: 4500000
  },
  {
    id: 'SUP-004',
    code: 'SUP-BAS-04',
    name: 'PT BASF Indonesia',
    category: 'CHEMICALS',
    contactPerson: 'Bpk. Dedi Kurniawan',
    phone: '021-5262200',
    email: 'pestcontrol@basf.co.id',
    address: 'DBS Bank Tower Lt. 27, Ciputra World 1, Jakarta',
    bankName: 'Bank Citibank',
    bankAccount: '0-300123-001',
    status: 'ACTIVE',
    totalPO: 3,
    totalBalanceDue: 0
  }
];

export const INITIAL_SALES_ORDERS: SalesOrder[] = [
  {
    id: 'SO-001',
    orderNumber: 'WO/BIG/2026/07/041',
    customerId: 'CUST-001',
    customerName: 'PT Jababeka Industrial Park',
    serviceType: 'Termite Control (Rayap)',
    contractStartDate: '2026-07-01',
    contractEndDate: '2027-06-30',
    visitFrequency: 'BULANAN',
    items: [
      {
        id: 'ITM-01',
        description: 'Sistem Injeksi & Baiting Termite Control Gedung Utama Jababeka (Luas 2.500 m2)',
        serviceType: 'Termite Control (Rayap)',
        areaSize: '2500 m2',
        quantity: 12,
        unitPrice: 2000000,
        total: 24000000
      }
    ],
    subtotal: 24000000,
    taxType: 'PPN_11',
    taxPPN: 2640000,
    isPPh23: true,
    taxPPh23: 480000,
    grandTotal: 26640000,
    netPayable: 26160000,
    status: 'ACTIVE',
    paymentTerm: 'TERMIN_BULANAN',
    salesPerson: 'SUTARDJAT',
    notes: 'Injeksi perimeter pondasi dan pemasangan 30 titik umpan rayap tanah.',
    createdAt: '2026-07-01'
  },
  {
    id: 'SO-002',
    orderNumber: 'WO/BIG/2026/07/052',
    customerId: 'CUST-002',
    customerName: 'PT Astra Honda Motor Plant Cikarang',
    serviceType: 'General Pest Control (Serangga/Nyamuk/Lalat/Kecoa)',
    contractStartDate: '2026-07-15',
    contractEndDate: '2027-07-14',
    visitFrequency: 'DWI_MINGGUAN',
    items: [
      {
        id: 'ITM-02',
        description: 'Cold Fogging & Residual Spraying Kantin, Lobi & Area Produksi Plant 3',
        serviceType: 'General Pest Control (Serangga/Nyamuk/Lalat/Kecoa)',
        areaSize: '8000 m2',
        quantity: 1,
        unitPrice: 45000000,
        total: 45000000
      }
    ],
    subtotal: 45000000,
    taxPPN: 4950000,
    grandTotal: 49950000,
    status: 'ACTIVE',
    paymentTerm: 'NET_30',
    salesPerson: 'SUTARDJAT',
    notes: 'Kunjungan rutin 2x seminggu. Penanganan lalat & kecoa area dapur/kantin.',
    createdAt: '2026-07-10'
  },
  {
    id: 'SO-003',
    orderNumber: 'WO/BIG/2026/08/001',
    customerId: 'CUST-004',
    customerName: 'RS Hermina Grand Wisata',
    serviceType: 'Disinfection & Sterilization',
    contractStartDate: '2026-08-01',
    contractEndDate: '2026-08-31',
    visitFrequency: 'MINGGUAN',
    items: [
      {
        id: 'ITM-03',
        description: 'Misting Disinfeksi Sterilisasi Kamar Operasi & Ruang Rawat Inap',
        serviceType: 'Disinfection & Sterilization',
        areaSize: '3500 m2',
        quantity: 4,
        unitPrice: 3500000,
        total: 14000000
      }
    ],
    subtotal: 14000000,
    taxPPN: 1540000,
    grandTotal: 15540000,
    status: 'ACTIVE',
    paymentTerm: 'TERMIN_BULANAN',
    salesPerson: 'SUTARDJAT',
    notes: 'Disinfeksi standar medis tingkat tinggi.',
    createdAt: '2026-08-01'
  },
  {
    id: 'SO-004',
    orderNumber: 'WO/BIG/2026/08/012',
    customerId: 'CUST-003',
    customerName: 'PT Mayora Indah Tbk Cikarang',
    serviceType: 'Rodent Control (Tikus)',
    contractStartDate: '2026-08-01',
    contractEndDate: '2027-07-31',
    visitFrequency: 'MINGGUAN',
    items: [
      {
        id: 'ITM-04',
        description: 'Pemasangan 80 Unit Rat Baiting Box & E-Trap Gudang Logistik Makanan',
        serviceType: 'Rodent Control (Tikus)',
        areaSize: '6000 m2',
        quantity: 1,
        unitPrice: 42000000,
        total: 42000000
      }
    ],
    subtotal: 42000000,
    taxPPN: 4620000,
    grandTotal: 46620000,
    status: 'ACTIVE',
    paymentTerm: 'NET_30',
    salesPerson: 'RIAN HIDAYAT',
    notes: 'Kontrak 1 tahun monitoring tikus standar HACCP makanan.',
    createdAt: '2026-08-02'
  },
  {
    id: 'SO-005',
    orderNumber: 'WO/BIG/2026/08/018',
    customerId: 'CUST-005',
    customerName: 'PT Hyundai Motor Manufacturing Indonesia',
    serviceType: 'Fumigation (Fumigasi)',
    contractStartDate: '2026-08-03',
    contractEndDate: '2026-08-10',
    visitFrequency: 'INSIDENTIL',
    items: [
      {
        id: 'ITM-05',
        description: 'Fumigasi Kontainer Ekspor Komponen Mobil (20 Kontainer x 40ft)',
        serviceType: 'Fumigation (Fumigasi)',
        areaSize: '20 Kontainer',
        quantity: 20,
        unitPrice: 6000000,
        total: 120000000
      }
    ],
    subtotal: 120000000,
    taxPPN: 13200000,
    grandTotal: 133200000,
    status: 'ACTIVE',
    paymentTerm: 'CASH_IN_ADVANCE',
    salesPerson: 'DENNY SETIAWAN',
    notes: 'Fumigasi standar internasional karantina ekspor.',
    createdAt: '2026-08-03'
  },
  {
    id: 'SO-006',
    orderNumber: 'WO/BIG/2026/08/025',
    customerId: 'CUST-001',
    customerName: 'PT Jababeka Industrial Park',
    serviceType: 'General Pest Control (Serangga/Nyamuk/Lalat/Kecoa)',
    contractStartDate: '2026-08-05',
    contractEndDate: '2027-08-04',
    visitFrequency: 'DWI_MINGGUAN',
    items: [
      {
        id: 'ITM-06',
        description: 'Pengasapan Fogging & Larvasida Nyamuk Area Taman & Dapur Karyawan',
        serviceType: 'General Pest Control (Serangga/Nyamuk/Lalat/Kecoa)',
        areaSize: '4000 m2',
        quantity: 1,
        unitPrice: 32000000,
        total: 32000000
      }
    ],
    subtotal: 32000000,
    taxPPN: 3520000,
    grandTotal: 35520000,
    status: 'ACTIVE',
    paymentTerm: 'TERMIN_BULANAN',
    salesPerson: 'DEWI LESTARI',
    notes: 'Penanganan pencegahan wabah DBD musim hujan.',
    createdAt: '2026-08-03'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'INV-001',
    invoiceNumber: 'WO/BIG/2026/07/041',
    salesOrderId: 'SO-001',
    salesOrderNumber: 'WO/BIG/2026/07/041',
    customerId: 'CUST-001',
    customerName: 'PT Jababeka Industrial Park',
    customerAddress: 'Kawasan Industri Jababeka 1, Cikarang, Bekasi',
    issueDate: '2026-07-02',
    dueDate: '2026-08-01',
    items: [
      {
        id: 'ITM-01',
        description: 'Pembayaran Termin 1 (Bulan Juli 2026) - Pest Control & Rayap Gedung Utama Jababeka',
        serviceType: 'Termite Control (Rayap)',
        areaSize: '2500 m2',
        quantity: 1,
        unitPrice: 2220000,
        total: 2220000
      }
    ],
    subtotal: 2000000,
    taxAmount: 220000,
    grandTotal: 2220000,
    amountPaid: 2220000,
    remainingBalance: 0,
    status: 'PAID',
    notes: 'Lunas ditransfer ke Rekening BJB PT BOSTON INDO GLOBAL',
    createdById: 'USR-003',
    createdByName: 'SUTARDJAT',
    signedBySales: 'SUTARDJAT',
    signedByFinance: 'FANGGIE',
    signedByOwner: 'MUHAMMAD SAIPUL'
  },
  {
    id: 'INV-002',
    invoiceNumber: 'WO/BIG/2026/07/052',
    salesOrderId: 'SO-002',
    salesOrderNumber: 'WO/BIG/2026/07/052',
    customerId: 'CUST-002',
    customerName: 'PT Astra Honda Motor Plant Cikarang',
    customerAddress: 'Kawasan MM2100, Cikarang Barat, Bekasi',
    issueDate: '2026-07-15',
    dueDate: '2026-08-14',
    items: [
      {
        id: 'ITM-02',
        description: 'Jasa Pest Control General & Cold Fogging Rutin Bulan Juli 2026',
        serviceType: 'General Pest Control (Serangga/Nyamuk/Lalat/Kecoa)',
        areaSize: '8000 m2',
        quantity: 1,
        unitPrice: 45000000,
        total: 45000000
      }
    ],
    subtotal: 45000000,
    taxAmount: 4950000,
    grandTotal: 49950000,
    amountPaid: 20000000,
    remainingBalance: 29950000,
    status: 'PARTIAL',
    notes: 'Pembayaran Dp 40% sudah masuk. Sisa jatuh tempo 14 Agustus 2026.',
    createdById: 'USR-003',
    createdByName: 'SUTARDJAT',
    signedBySales: 'SUTARDJAT',
    signedByFinance: 'FANGGIE'
  },
  {
    id: 'INV-003',
    invoiceNumber: 'WO/BIG/2026/08/001',
    salesOrderId: 'SO-003',
    salesOrderNumber: 'WO/BIG/2026/08/001',
    customerId: 'CUST-004',
    customerName: 'RS Hermina Grand Wisata',
    customerAddress: 'Jl. Lambang Jaya No. 1, Grand Wisata, Tambun Selatan',
    issueDate: '2026-08-01',
    dueDate: '2026-08-15',
    items: [
      {
        id: 'ITM-03',
        description: 'Jasa Disinfeksi Sterilisasi Ruang Operasi & Rawat Inap (4 Kunjungan)',
        serviceType: 'Disinfection & Sterilization',
        areaSize: '3500 m2',
        quantity: 1,
        unitPrice: 14000000,
        total: 14000000
      }
    ],
    subtotal: 14000000,
    taxAmount: 1540000,
    grandTotal: 15540000,
    amountPaid: 0,
    remainingBalance: 15540000,
    status: 'UNPAID',
    notes: 'Invoice dikirimkan via email ke Bagian Kesling RS Hermina.',
    createdById: 'USR-003',
    createdByName: 'SUTARDJAT',
    signedBySales: 'SUTARDJAT',
    signedByFinance: 'FANGGIE'
  }
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'PO-001',
    poNumber: 'PO/BIG/2026/07/012',
    supplierId: 'SUP-001',
    supplierName: 'PT Bayer Indonesia',
    orderDate: '2026-07-05',
    expectedDeliveryDate: '2026-07-10',
    paymentTerm: 'NET_30',
    items: [
      {
        id: 'POI-01',
        itemName: 'Bayer Agenda 25 EC (Termitisida Fipronil)',
        category: 'CHEMICALS',
        quantity: 10,
        unit: 'Jerigen (5L)',
        unitPrice: 1250000,
        totalPrice: 12500000
      },
      {
        id: 'POI-02',
        itemName: 'Bayer Maxforce Forte (Gel Umphan Kecoa)',
        category: 'CHEMICALS',
        quantity: 20,
        unit: 'Tube',
        unitPrice: 300000,
        totalPrice: 6000000
      }
    ],
    subtotal: 18500000,
    taxPPN: 2035000,
    grandTotal: 20535000,
    amountPaid: 2035000,
    status: 'RECEIVED',
    paymentStatus: 'PARTIAL',
    notes: 'Barang diterima lengkap di gudang Grand Wisata.',
    createdAt: '2026-07-05'
  },
  {
    id: 'PO-002',
    poNumber: 'PO/BIG/2026/07/020',
    supplierId: 'SUP-002',
    supplierName: 'PT Syngenta Indonesia',
    orderDate: '2026-07-18',
    expectedDeliveryDate: '2026-07-22',
    paymentTerm: 'NET_14',
    items: [
      {
        id: 'POI-03',
        itemName: 'Syngenta Icon 25 EC (Insecticide Spray)',
        category: 'CHEMICALS',
        quantity: 8,
        unit: 'Botol (1L)',
        unitPrice: 850000,
        totalPrice: 6800000
      },
      {
        id: 'POI-04',
        itemName: 'Syngenta Klerat 0.005 BB (Umpan Tikus Rodentisida)',
        category: 'CHEMICALS',
        quantity: 10,
        unit: 'Ember (5kg)',
        unitPrice: 520000,
        totalPrice: 5200000
      }
    ],
    subtotal: 12000000,
    taxPPN: 1320000,
    grandTotal: 13320000,
    amountPaid: 13320000,
    status: 'RECEIVED',
    paymentStatus: 'PAID',
    notes: 'Lunas dibayar via Bank BJB PT Boston Indo Global.',
    createdAt: '2026-07-18'
  }
];

export const INITIAL_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'BNK-01',
    bankName: 'BANK JABAR BANTEN',
    accountNumber: '0160849096001',
    accountHolder: 'BOSTON INDO GLOBAL PT',
    balance: 378250000
  }
];

export const INITIAL_CASH_TRANSACTIONS: CashTransaction[] = [
  {
    id: 'TRX-001',
    refNumber: 'TRX/KB/2026/08/001',
    ledgerType: 'KAS_BESAR',
    date: '2026-08-01',
    category: 'Penerimaan Invoice Pelanggan',
    description: 'Penerimaan pembayaran Invoice INV/BIG/2026/07/088 dari PT Jababeka Industrial Park',
    type: 'INCOME',
    amount: 2220000,
    balanceAfter: 48500000,
    createdBy: 'FANGGIE'
  },
  {
    id: 'TRX-002',
    refNumber: 'TRX/KK/2026/08/001',
    ledgerType: 'KAS_KECIL',
    date: '2026-08-02',
    category: 'Bensin & Tol Tim Operasional',
    description: 'Bensin Mobil Operasional B 1234 PEST (3 Unit Sprayer) + Tol Cikarang - Tambun',
    type: 'EXPENSE',
    amount: 450000,
    balanceAfter: 4550000,
    createdBy: 'SUTARDJAT'
  },
  {
    id: 'TRX-003',
    refNumber: 'TRX/KK/2026/08/002',
    ledgerType: 'KAS_KECIL',
    date: '2026-08-03',
    category: 'Konsumsi & Uang Makan Teknisi',
    description: 'Uang makan & ekstra joss tim teknisi pengerjaan malam RS Hermina',
    type: 'EXPENSE',
    amount: 280000,
    balanceAfter: 4270000,
    createdBy: 'SUTARDJAT'
  },
  {
    id: 'TRX-004',
    refNumber: 'TRX/BB/2026/08/001',
    ledgerType: 'BUKU_BANK',
    date: '2026-08-01',
    category: 'Penerimaan Transfer Pelanggan (Astra)',
    description: 'Transfer DP 40% Invoice INV/BIG/2026/07/099 a/n PT Astra Honda Motor',
    type: 'INCOME',
    amount: 20000000,
    balanceAfter: 245800000,
    createdBy: 'FANGGIE'
  },
  {
    id: 'TRX-005',
    refNumber: 'TRX/BB/2026/08/002',
    ledgerType: 'BUKU_BANK',
    date: '2026-08-02',
    category: 'Pembayaran Supplier (Syngenta)',
    description: 'Pelunasan PO/BIG/2026/07/020 ke PT Syngenta Indonesia via BJB',
    type: 'EXPENSE',
    amount: 13320000,
    balanceAfter: 132450000,
    createdBy: 'FANGGIE'
  }
];

export const INITIAL_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'JRN-001',
    entryNumber: 'JRN/2026/08/001',
    date: '2026-08-01',
    description: 'Pencatatan Pendapatan Jasa Termite Control PT Jababeka',
    accountCode: '1110',
    accountName: 'Kas Besar / Bank',
    debit: 2220000,
    credit: 0
  },
  {
    id: 'JRN-002',
    entryNumber: 'JRN/2026/08/001',
    date: '2026-08-01',
    description: 'Pendapatan Jasa Pest Control',
    accountCode: '4110',
    accountName: 'Pendapatan Jasa Pest Control',
    debit: 0,
    credit: 2000000
  },
  {
    id: 'JRN-003',
    entryNumber: 'JRN/2026/08/001',
    date: '2026-08-01',
    description: 'Hutang PPN Keluaran (11%)',
    accountCode: '2130',
    accountName: 'PPN Keluaran',
    debit: 0,
    credit: 220000
  },
  {
    id: 'JRN-004',
    entryNumber: 'JRN/2026/08/002',
    date: '2026-08-02',
    description: 'Biaya Operasional - BBM & Tol Teknisi Lapangan',
    accountCode: '5210',
    accountName: 'Beban Transportasi & Bensin Operasional',
    debit: 450000,
    credit: 0
  },
  {
    id: 'JRN-005',
    entryNumber: 'JRN/2026/08/002',
    date: '2026-08-02',
    description: 'Pengeluaran Kas Kecil Kantor',
    accountCode: '1120',
    accountName: 'Kas Kecil (Petty Cash)',
    debit: 0,
    credit: 450000
  }
];

export const INITIAL_MARKETING_TEAM: MarketingTarget[] = [
  {
    id: 'MKT-001',
    name: 'SUTARDJAT',
    role: 'Senior Admin Sales & Operations',
    area: 'Cikarang & Jababeka Industrial',
    targetOmset: 80000000,
    commissionRate: 0.04
  },
  {
    id: 'MKT-002',
    name: 'DENNY SETIAWAN',
    role: 'Senior B2B Marketing Specialist',
    area: 'MM2100 & EJIP Industrial Zone',
    targetOmset: 100000000,
    commissionRate: 0.05
  },
  {
    id: 'MKT-003',
    name: 'RIAN HIDAYAT',
    role: 'Industrial Account Manager',
    area: 'Kawasan Delta Silicon & GIIC',
    targetOmset: 50000000,
    commissionRate: 0.03
  },
  {
    id: 'MKT-004',
    name: 'DEWI LESTARI',
    role: 'Corporate Sales Representative',
    area: 'Kawasan Tambun & Grand Wisata',
    targetOmset: 40000000,
    commissionRate: 0.03
  }
];

