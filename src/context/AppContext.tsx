import { collection, doc, onSnapshot, setDoc, addDoc, updateDoc, deleteDoc, writeBatch, getDocFromServer } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import React, { createContext, useContext, useState, useEffect } from 'react';
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
  MarketingTarget,
  FinancialConfig
} from '../types';
import {
  COMPANY_DETAILS,
  INITIAL_USERS,
  INITIAL_CUSTOMERS,
  INITIAL_SUPPLIERS,
  INITIAL_SALES_ORDERS,
  INITIAL_INVOICES,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_BANK_ACCOUNTS,
  INITIAL_CASH_TRANSACTIONS,
  INITIAL_JOURNAL_ENTRIES,
  INITIAL_MARKETING_TEAM
} from '../data/mockData';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  updateUserPassword: (userId: string, newPassword: string) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  deleteUser: (userId: string) => void;
  companyInfo: CompanyInfo;
  updateCompanyInfo: (info: Partial<CompanyInfo>) => void;
  
  // Navigation & Theme
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  toggleDarkMode: () => void;
  isAppUnlocked: boolean;
  unlockApp: () => void;
  
  // Customers CRUD
  customers: Customer[];
  addCustomer: (cust: Omit<Customer, 'id' | 'createdAt' | 'totalOrders' | 'totalSpent'>) => void;
  updateCustomer: (cust: Customer) => void;
  deleteCustomer: (id: string) => void;

  // Suppliers CRUD
  suppliers: Supplier[];
  addSupplier: (sup: Omit<Supplier, 'id' | 'totalPO' | 'totalBalanceDue'>) => void;
  updateSupplier: (sup: Supplier) => void;
  deleteSupplier: (id: string) => void;

  // Sales Orders CRUD
  salesOrders: SalesOrder[];
  addSalesOrder: (so: Omit<SalesOrder, 'id' | 'createdAt'>) => void;
  updateSalesOrder: (so: SalesOrder) => void;
  deleteSalesOrder: (id: string) => void;

  // Invoices CRUD
  invoices: Invoice[];
  addInvoice: (inv: Omit<Invoice, 'id' | 'amountPaid' | 'remainingBalance' | 'status'>) => void;
  updateInvoice: (inv: Invoice) => void;
  deleteInvoice: (id: string) => void;
  recordInvoicePayment: (invoiceId: string, paymentAmount: number, targetLedger: 'KAS_BESAR' | 'BUKU_BANK', notes?: string) => void;

  // Purchase Orders CRUD
  purchaseOrders: PurchaseOrder[];
  addPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'amountPaid' | 'status' | 'paymentStatus' | 'createdAt'>) => void;
  updatePurchaseOrder: (po: PurchaseOrder) => void;
  deletePurchaseOrder: (id: string) => void;
  recordPOPayment: (poId: string, paymentAmount: number, sourceLedger: 'KAS_BESAR' | 'BUKU_BANK', notes?: string) => void;
  // Financial Settings
  financialConfig: FinancialConfig;
  setFinancialConfig: (config: FinancialConfig) => void;
  
  transferFunds: (amount: number, targetLedger: 'KAS_BESAR' | 'KAS_KECIL', description: string) => void;

  // Cash & Bank
  cashTransactions: CashTransaction[];
  addCashTransaction: (trx: Omit<CashTransaction, 'id' | 'balanceAfter' | 'createdBy' | 'refNumber'> & { refNumber?: string }) => void;
  updateCashTransaction: (id: string, updates: Partial<CashTransaction>) => void;
  deleteCashTransaction: (id: string) => void;
  bankAccounts: BankAccount[];
  journalEntries: JournalEntry[];
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  deleteJournalEntry: (id: string) => void;

  // Marketing Team CRUD
  marketingTeam: MarketingTarget[];
  addMarketingTarget: (target: Omit<MarketingTarget, 'id'>) => void;
  updateMarketingTarget: (target: MarketingTarget) => void;
  deleteMarketingTarget: (id: string) => void;

  kasBesarInitialBalance: number;
  setKasBesarInitialBalance: (val: number) => void;
  kasKecilInitialBalance: number;
  setKasKecilInitialBalance: (val: number) => void;

  updateBankAccount: (id: string, updates: Partial<BankAccount>) => void;

  // Global search & modal triggers
  selectedInvoiceForPrint: Invoice | null;
  setSelectedInvoiceForPrint: (inv: Invoice | null) => void;
  formatCurrency: (amount: number) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial states from localStorage if available
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('big_user');
    if (saved) {
      try {
        const u: User = JSON.parse(saved);
        return { ...u, password: u.password || 'BOSTON123' };
      } catch (e) {
        console.error('Failed to parse big_user', e);
      }
    }
    return INITIAL_USERS[0];
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAppUnlocked, setIsAppUnlocked] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('big_theme') === 'dark';
  });

  const unlockApp = () => setIsAppUnlocked(true);

  const [companyInfo, setCompanyInfoState] = useState<CompanyInfo>(COMPANY_DETAILS);

  const updateCompanyInfo = async (info: Partial<CompanyInfo>) => {
    try {
      await setDoc(doc(db, 'settings', 'global'), { companyInfo: { ...companyInfo, ...info } }, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'settings/global');
    }
  };

  const [customers, setCustomers] = useState<Customer[]>([]);

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);

  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);

  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>([]);

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  const [kasBesarInitialBalance, setKasBesarInitialBalanceState] = useState<number>(0);

  const [kasKecilInitialBalance, setKasKecilInitialBalanceState] = useState<number>(0);

  const [financialConfig, setFinancialConfigState] = useState<FinancialConfig>({
    currency: 'IDR',
    taxRate: 11
  });

  
  // Firebase Listeners
  useEffect(() => {
    testConnection();

    // Anonymous sign-in for Firestore rules compatibility
    signInAnonymously(auth).catch(err => console.error("Auth Error:", err));

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Authenticated as:", user.uid);
      }
    });

    const seedDatabase = async () => {
      // Check if already seeded by looking at settings
      try {
        const settingsDoc = await getDocFromServer(doc(db, 'settings', 'global'));
        if (settingsDoc.exists()) {
          console.log('Database already initialized.');
          return;
        }

        console.log('Initializing database with mock data...');
        const batch = writeBatch(db);

        // Seed Settings
        batch.set(doc(db, 'settings', 'global'), {
          companyInfo: COMPANY_DETAILS,
          financialConfig: { currency: 'IDR', taxRate: 11 },
          kasBesarInitialBalance: 48500000,
          kasKecilInitialBalance: 4270000
        });

        // Seed Users
        INITIAL_USERS.forEach(u => {
          batch.set(doc(db, 'users', u.id), u);
        });

        // Seed Customers
        INITIAL_CUSTOMERS.forEach(c => {
          batch.set(doc(db, 'customers', c.id), c);
        });

        // Seed Suppliers
        INITIAL_SUPPLIERS.forEach(s => {
          batch.set(doc(db, 'suppliers', s.id), s);
        });

        // Seed Sales Orders
        INITIAL_SALES_ORDERS.forEach(so => {
          batch.set(doc(db, 'salesOrders', so.id), so);
        });

        // Seed Invoices
        INITIAL_INVOICES.forEach(inv => {
          batch.set(doc(db, 'invoices', inv.id), inv);
        });

        // Seed Purchase Orders
        INITIAL_PURCHASE_ORDERS.forEach(po => {
          batch.set(doc(db, 'purchaseOrders', po.id), po);
        });

        // Seed Bank Accounts
        INITIAL_BANK_ACCOUNTS.forEach(ba => {
          batch.set(doc(db, 'bankAccounts', ba.id), ba);
        });

        // Seed Cash Transactions
        INITIAL_CASH_TRANSACTIONS.forEach(trx => {
          batch.set(doc(db, 'cashTransactions', trx.id), trx);
        });

        // Seed Journal Entries
        INITIAL_JOURNAL_ENTRIES.forEach(j => {
          batch.set(doc(db, 'journalEntries', j.id), j);
        });

        // Seed Marketing Team
        INITIAL_MARKETING_TEAM.forEach(m => {
          batch.set(doc(db, 'marketingTeam', m.id), m);
        });

        await batch.commit();
        console.log('Database seeding completed successfully.');
      } catch (e) {
        console.error('Error seeding database:', e);
      }
    };

    seedDatabase();
    
    const unsubmarketingTeam = onSnapshot(collection(db, 'marketingTeam'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMarketingTeam(data as any);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'marketingTeam'));

    const unsubsettings = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.companyInfo) setCompanyInfoState(data.companyInfo);
        if (data.financialConfig) setFinancialConfigState(data.financialConfig);
        if (data.kasBesarInitialBalance !== undefined) setKasBesarInitialBalanceState(data.kasBesarInitialBalance);
        if (data.kasKecilInitialBalance !== undefined) setKasKecilInitialBalanceState(data.kasKecilInitialBalance);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'settings/global'));

    const unsubcustomers = onSnapshot(collection(db, 'customers'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCustomers(data as any);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'customers'));

    const unsubsuppliers = onSnapshot(collection(db, 'suppliers'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSuppliers(data as any);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'suppliers'));

    const unsubsalesOrders = onSnapshot(collection(db, 'salesOrders'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSalesOrders(data as any);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'salesOrders'));

    const unsubinvoices = onSnapshot(collection(db, 'invoices'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInvoices(data as any);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'invoices'));

    const unsubpurchaseOrders = onSnapshot(collection(db, 'purchaseOrders'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPurchaseOrders(data as any);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'purchaseOrders'));

    const unsubcashTransactions = onSnapshot(collection(db, 'cashTransactions'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCashTransactions(data as any);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'cashTransactions'));

    const unsubbankAccounts = onSnapshot(collection(db, 'bankAccounts'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBankAccounts(data as any);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'bankAccounts'));

    const unsubjournalEntries = onSnapshot(collection(db, 'journalEntries'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJournalEntries(data as any);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'journalEntries'));

    const unsubusers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (data.length > 0) {
        setUsers(data as any);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'users'));

    return () => {
      unsubAuth();
      unsubcustomers();
      unsubsuppliers();
      unsubsalesOrders();
      unsubinvoices();
      unsubpurchaseOrders();
      unsubcashTransactions();
      unsubbankAccounts();
      unsubjournalEntries();
      unsubmarketingTeam();
      unsubsettings();
      unsubusers();
    };
  }, []);

useEffect(() => {
    localStorage.setItem('big_financial_config', JSON.stringify(financialConfig));
  }, [financialConfig]);

  const [marketingTeam, setMarketingTeam] = useState<MarketingTarget[]>([]);

  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('big_user', JSON.stringify(currentUser));
    
    // Automatically redirect Owner away from operational tabs like sales-orders or invoices
    if (currentUser.role === 'OWNER') {
      const allowedOwnerTabs = [
        'dashboard',
        'sales-dashboard',
        'ar-report',
        'buku-bank',
        'ap-report',
        'financial-statements',
        'kas-besar',
        'kas-kecil',
        'annual-report',
        'npwp'
      ];
      if (!allowedOwnerTabs.includes(activeTab)) {
        setActiveTab('dashboard');
      }
    }
  }, [currentUser, activeTab]);

  const updateUserPassword = async (userId: string, newPassword: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { password: newPassword });
      if (currentUser.id === userId) {
        setCurrentUser(prev => ({ ...prev, password: newPassword }));
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const addUser = async (user: Omit<User, 'id'>) => {
    try {
      await addDoc(collection(db, 'users'), user);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'users');
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${userId}`);
    }
  };

  useEffect(() => {
    localStorage.setItem('big_theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const formatCurrency = (amount: number): string => {
    const hasDecimals = Math.abs(amount % 1) >= 0.001;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: hasDecimals ? 2 : 0
    }).format(amount);
  };

  // Customers Handlers
  const addCustomer = async (data: Omit<Customer, 'id' | 'createdAt' | 'totalOrders' | 'totalSpent'>) => {
    try {
      const newCustomer = {
        ...data,
        createdAt: new Date().toISOString().split('T')[0],
        totalOrders: 0,
        totalSpent: 0
      };
      await addDoc(collection(db, 'customers'), newCustomer);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'customers');
    }
  };

  const updateCustomer = async (updated: Customer) => {
    try {
      const { id, ...data } = updated;
      await updateDoc(doc(db, 'customers', id), data as any);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `customers/${updated.id}`);
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'customers', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `customers/${id}`);
    }
  };

  // Suppliers Handlers
  const addSupplier = async (data: Omit<Supplier, 'id' | 'totalPO' | 'totalBalanceDue'>) => {
    try {
      const newSupplier = {
        ...data,
        totalPO: 0,
        totalBalanceDue: 0
      };
      await addDoc(collection(db, 'suppliers'), newSupplier);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'suppliers');
    }
  };

  const updateSupplier = async (updated: Supplier) => {
    try {
      const { id, ...data } = updated;
      await updateDoc(doc(db, 'suppliers', id), data as any);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `suppliers/${updated.id}`);
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'suppliers', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `suppliers/${id}`);
    }
  };

  // Sales Orders Handlers
  const addSalesOrder = async (data: Omit<SalesOrder, 'id' | 'createdAt'>) => {
    try {
      const newSO = {
        ...data,
        createdAt: new Date().toISOString().split('T')[0]
      };
      await addDoc(collection(db, 'salesOrders'), newSO);

      // Update customer total orders
      const targetCust = customers.find(c => c.id === data.customerId);
      if (targetCust) {
        await updateDoc(doc(db, 'customers', targetCust.id), {
          totalOrders: targetCust.totalOrders + 1,
          totalSpent: targetCust.totalSpent + data.grandTotal
        });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'salesOrders');
    }
  };

  const updateSalesOrder = async (updated: SalesOrder) => {
    try {
      const { id, ...data } = updated;
      await updateDoc(doc(db, 'salesOrders', id), data as any);

      // Otomatis sinkronkan invoice terkait agar nomor invoice = nomor WO
      const relatedInvoices = invoices.filter(inv => inv.salesOrderId === updated.id);
      for (const inv of relatedInvoices) {
        await updateDoc(doc(db, 'invoices', inv.id), {
          invoiceNumber: updated.orderNumber,
          salesOrderNumber: updated.orderNumber,
          paymentTerm: updated.paymentTerm || inv.paymentTerm
        });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `salesOrders/${updated.id}`);
    }
  };

  const deleteSalesOrder = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'salesOrders', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `salesOrders/${id}`);
    }
  };

  // Invoices Handlers
  const addInvoice = async (data: Omit<Invoice, 'id' | 'amountPaid' | 'remainingBalance' | 'status'>) => {
    try {
      const newInv = {
        ...data,
        amountPaid: 0,
        remainingBalance: data.grandTotal,
        status: 'UNPAID'
      };
      await addDoc(collection(db, 'invoices'), newInv);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'invoices');
    }
  };

  const updateInvoice = async (updated: Invoice) => {
    try {
      const { id, ...data } = updated;
      await updateDoc(doc(db, 'invoices', id), data as any);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `invoices/${updated.id}`);
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'invoices', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `invoices/${id}`);
    }
  };

  const generateRefNumber = (ledgerType: string, dateStr: string, existingTrx: CashTransaction[]) => {
    const prefixMap: Record<string, string> = {
      'KAS_BESAR': 'KB',
      'KAS_KECIL': 'KK',
      'BUKU_BANK': 'BB'
    };
    const prefix = prefixMap[ledgerType] || 'UNK';
    const yearMonth = dateStr.substring(0, 7).replace('-', '/');
    const prefixFull = `TRX/${prefix}/${yearMonth}`;
    
    const related = existingTrx.filter(t => t.refNumber && t.refNumber.startsWith(prefixFull));
    let maxSeq = 0;
    related.forEach(t => {
      const parts = t.refNumber.split('/');
      const seqStr = parts[parts.length - 1];
      const seq = parseInt(seqStr, 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    });
    
    const nextSeq = maxSeq + 1;
    return `${prefixFull}/${nextSeq.toString().padStart(3, '0')}`;
  };

  // Payment Recording for Invoices
  const recordInvoicePayment = async (
    invoiceId: string,
    paymentAmount: number,
    targetLedger: 'KAS_BESAR' | 'BUKU_BANK',
    notes?: string
  ) => {
    try {
      const targetInv = invoices.find(i => i.id === invoiceId);
      if (!targetInv) return;

      const newPaid = targetInv.amountPaid + paymentAmount;
      const newRemaining = Math.max(0, targetInv.grandTotal - newPaid);
      const newStatus = newRemaining === 0 ? 'PAID' : 'PARTIAL';

      const batch = writeBatch(db);

      // Update invoice
      batch.update(doc(db, 'invoices', invoiceId), {
        amountPaid: newPaid,
        remainingBalance: newRemaining,
        status: newStatus
      });

      const currentBankBalance = bankAccounts.length > 0 ? bankAccounts[0].balance : 0;
      const currentBalance = targetLedger === 'KAS_BESAR' ? kasBesarInitialBalance : currentBankBalance;

      // Record Cash Transaction
      const todayStr = new Date().toISOString().split('T')[0];
      const generatedRefNumber = generateRefNumber(targetLedger, todayStr, cashTransactions);
      
      const newTrxRef = doc(collection(db, 'cashTransactions'));
      const newTrx = {
        refNumber: generatedRefNumber,
        ledgerType: targetLedger,
        date: todayStr,
        category: 'Pelunasan Piutang Invoice',
        description: `Pembayaran ${formatCurrency(paymentAmount)} untuk Invoice #${targetInv.invoiceNumber} (${targetInv.customerName}). ${notes || ''}`,
        type: 'INCOME',
        amount: paymentAmount,
        balanceAfter: currentBalance + paymentAmount,
        referenceId: targetInv.invoiceNumber,
        createdBy: currentUser.name
      };
      batch.set(newTrxRef, newTrx);

      // Update Bank Balance if BUKU_BANK
      if (targetLedger === 'BUKU_BANK' && bankAccounts.length > 0) {
        batch.update(doc(db, 'bankAccounts', bankAccounts[0].id), {
          balance: bankAccounts[0].balance + paymentAmount
        });
      }

      // Auto Journal Entry
      const entryNumber = `JRN/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${Math.floor(Math.random() * 900 + 100)}`;
      
      const jrnDebitRef = doc(collection(db, 'journalEntries'));
      batch.set(jrnDebitRef, {
        entryNumber,
        date: todayStr,
        description: `Penerimaan Kas/Bank dari Invoice #${targetInv.invoiceNumber}`,
        accountCode: targetLedger === 'KAS_BESAR' ? '1110' : '1130',
        accountName: targetLedger === 'KAS_BESAR' ? 'Kas Besar' : (bankAccounts[0]?.bankName || 'Buku Bank'),
        debit: paymentAmount,
        credit: 0,
        refId: targetInv.invoiceNumber
      });

      const jrnCreditRef = doc(collection(db, 'journalEntries'));
      batch.set(jrnCreditRef, {
        entryNumber,
        date: todayStr,
        description: `Pelunasan Piutang Usaha ${targetInv.customerName}`,
        accountCode: '1140',
        accountName: 'Piutang Usaha (AR)',
        debit: 0,
        credit: paymentAmount,
        refId: targetInv.invoiceNumber
      });

      await batch.commit();
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'invoice-payment');
    }
  };

  // Purchase Orders Handlers
  const addPurchaseOrder = async (data: Omit<PurchaseOrder, 'id' | 'amountPaid' | 'status' | 'paymentStatus' | 'createdAt'>) => {
    try {
      const newPO = {
        ...data,
        amountPaid: 0,
        status: 'ORDERED',
        paymentStatus: 'UNPAID',
        createdAt: new Date().toISOString().split('T')[0]
      };
      await addDoc(collection(db, 'purchaseOrders'), newPO);

      // Update Supplier total PO and due
      const targetSup = suppliers.find(s => s.id === data.supplierId);
      if (targetSup) {
        await updateDoc(doc(db, 'suppliers', targetSup.id), {
          totalPO: targetSup.totalPO + 1,
          totalBalanceDue: targetSup.totalBalanceDue + data.grandTotal
        });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'purchaseOrders');
    }
  };

  const updatePurchaseOrder = async (updated: PurchaseOrder) => {
    try {
      const { id, ...data } = updated;
      await updateDoc(doc(db, 'purchaseOrders', id), data as any);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `purchaseOrders/${updated.id}`);
    }
  };

  const deletePurchaseOrder = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'purchaseOrders', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `purchaseOrders/${id}`);
    }
  };

  const recordPOPayment = async (
    poId: string,
    paymentAmount: number,
    sourceLedger: 'KAS_BESAR' | 'BUKU_BANK',
    notes?: string
  ) => {
    try {
      const targetPO = purchaseOrders.find(p => p.id === poId);
      if (!targetPO) return;

      const newPaid = targetPO.amountPaid + paymentAmount;
      const newRemaining = Math.max(0, targetPO.grandTotal - newPaid);
      const newPaymentStatus = newRemaining === 0 ? 'PAID' : 'PARTIAL';

      const batch = writeBatch(db);

      // Update PO
      batch.update(doc(db, 'purchaseOrders', poId), {
        amountPaid: newPaid,
        paymentStatus: newPaymentStatus
      });

      const currentBankBalance = bankAccounts.length > 0 ? bankAccounts[0].balance : 0;
      const currentBalance = sourceLedger === 'KAS_BESAR' ? kasBesarInitialBalance : currentBankBalance;

      // Record Cash Transaction
      const todayStr = new Date().toISOString().split('T')[0];
      const generatedRefNumber = generateRefNumber(sourceLedger, todayStr, cashTransactions);
      
      const newTrxRef = doc(collection(db, 'cashTransactions'));
      batch.set(newTrxRef, {
        refNumber: generatedRefNumber,
        ledgerType: sourceLedger,
        date: todayStr,
        category: 'Pembayaran Hutang Supplier',
        description: `Pembayaran ${formatCurrency(paymentAmount)} PO #${targetPO.poNumber} ke ${targetPO.supplierName}. ${notes || ''}`,
        type: 'EXPENSE',
        amount: paymentAmount,
        balanceAfter: currentBalance - paymentAmount,
        referenceId: targetPO.poNumber,
        createdBy: currentUser.name
      });

      // Update Bank Balance if BUKU_BANK
      if (sourceLedger === 'BUKU_BANK' && bankAccounts.length > 0) {
        batch.update(doc(db, 'bankAccounts', bankAccounts[0].id), {
          balance: bankAccounts[0].balance - paymentAmount
        });
      }

      // Reduce Supplier balance due
      const targetSup = suppliers.find(s => s.id === targetPO.supplierId);
      if (targetSup) {
        batch.update(doc(db, 'suppliers', targetSup.id), {
          totalBalanceDue: Math.max(0, targetSup.totalBalanceDue - paymentAmount)
        });
      }

      await batch.commit();
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'po-payment');
    }
  };

  // Cash Transactions
  const addCashTransaction = async (trx: Omit<CashTransaction, 'id' | 'balanceAfter' | 'createdBy' | 'refNumber'> & { refNumber?: string }) => {
    try {
      const currentBankBalance = bankAccounts.length > 0 ? bankAccounts[0].balance : 0;
      const currentBalance = trx.ledgerType === 'KAS_BESAR' ? kasBesarInitialBalance : currentBankBalance;
      
      const generatedRefNumber = generateRefNumber(trx.ledgerType, trx.date || new Date().toISOString().split('T')[0], cashTransactions);
      
      const batch = writeBatch(db);
      
      const newTrxRef = doc(collection(db, 'cashTransactions'));
      const balanceAfter = trx.type === 'INCOME' ? currentBalance + trx.amount : currentBalance - trx.amount;
      
      const newTrx = {
        ...trx,
        refNumber: generatedRefNumber,
        balanceAfter: balanceAfter,
        createdBy: currentUser.name
      };
      batch.set(newTrxRef, newTrx);

      // Update Ledger Balance
      if (trx.ledgerType === 'BUKU_BANK' && bankAccounts.length > 0) {
        batch.update(doc(db, 'bankAccounts', bankAccounts[0].id), {
          balance: trx.type === 'INCOME' ? bankAccounts[0].balance + trx.amount : bankAccounts[0].balance - trx.amount
        });
      }

      // Auto Journal Entry
      const entryNumber = `JRN/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${Math.floor(Math.random() * 900 + 100)}`;
      const date = trx.date || new Date().toISOString().split('T')[0];
      
      const jrnDebitRef = doc(collection(db, 'journalEntries'));
      batch.set(jrnDebitRef, {
        entryNumber,
        date,
        description: trx.description,
        accountCode: trx.ledgerType === 'KAS_BESAR' ? '1110' : (trx.ledgerType === 'KAS_KECIL' ? '1120' : '1130'),
        accountName: trx.ledgerType === 'KAS_BESAR' ? 'Kas Besar' : (trx.ledgerType === 'KAS_KECIL' ? 'Kas Kecil' : (bankAccounts[0]?.bankName || 'Buku Bank')),
        debit: trx.type === 'INCOME' ? trx.amount : 0,
        credit: trx.type === 'EXPENSE' ? trx.amount : 0,
        refId: generatedRefNumber
      });
      
      const jrnCreditRef = doc(collection(db, 'journalEntries'));
      batch.set(jrnCreditRef, {
        entryNumber,
        date,
        description: `Lawan transaksi: ${trx.category}`,
        accountCode: '3000',
        accountName: trx.category,
        debit: trx.type === 'EXPENSE' ? trx.amount : 0,
        credit: trx.type === 'INCOME' ? trx.amount : 0,
        refId: generatedRefNumber
      });

      await batch.commit();
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'cashTransactions');
    }
  };

  const deleteCashTransaction = async (id: string) => {
    try {
      const trx = cashTransactions.find(t => t.id === id);
      if (!trx) return;
      
      const batch = writeBatch(db);
      batch.delete(doc(db, 'cashTransactions', id));
      
      if (trx.ledgerType === 'BUKU_BANK' && bankAccounts.length > 0) {
        batch.update(doc(db, 'bankAccounts', bankAccounts[0].id), {
          balance: trx.type === 'INCOME' ? bankAccounts[0].balance - trx.amount : bankAccounts[0].balance + trx.amount
        });
      }
      
      // Delete Journal Entries
      const relatedJournals = journalEntries.filter(j => j.refId === trx.refNumber);
      for (const j of relatedJournals) {
        batch.delete(doc(db, 'journalEntries', j.id));
      }
      
      await batch.commit();
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `cashTransactions/${id}`);
    }
  };

  const updateCashTransaction = async (id: string, updates: Partial<CashTransaction>) => {
    try {
      const trx = cashTransactions.find(t => t.id === id);
      if (!trx) return;
      
      const updatedTrx = { ...trx, ...updates };
      const batch = writeBatch(db);

      if (trx.ledgerType === 'BUKU_BANK' && bankAccounts.length > 0) {
        const oldEffect = trx.type === 'INCOME' ? trx.amount : -trx.amount;
        const newEffect = updatedTrx.type === 'INCOME' ? updatedTrx.amount : -updatedTrx.amount;
        const diff = newEffect - oldEffect;
        
        batch.update(doc(db, 'bankAccounts', bankAccounts[0].id), {
          balance: bankAccounts[0].balance + diff
        });
      }
      
      const { id: _, ...updateData } = updatedTrx;
      batch.update(doc(db, 'cashTransactions', id), updateData as any);
      
      // Update Journal Entries: Delete old and create new ones
      const relatedJournals = journalEntries.filter(j => j.refId === trx.refNumber);
      for (const j of relatedJournals) {
        batch.delete(doc(db, 'journalEntries', j.id));
      }
      
      const entryNumber = `JRN/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${Math.floor(Math.random() * 900 + 100)}`;
      const date = updatedTrx.date || new Date().toISOString().split('T')[0];

      const jrnDebitRef = doc(collection(db, 'journalEntries'));
      batch.set(jrnDebitRef, {
        entryNumber,
        date,
        description: updatedTrx.description,
        accountCode: updatedTrx.ledgerType === 'KAS_BESAR' ? '1110' : (updatedTrx.ledgerType === 'KAS_KECIL' ? '1120' : '1130'),
        accountName: updatedTrx.ledgerType === 'KAS_BESAR' ? 'Kas Besar' : (updatedTrx.ledgerType === 'KAS_KECIL' ? 'Kas Kecil' : (bankAccounts[0]?.bankName || 'Buku Bank')),
        debit: updatedTrx.type === 'INCOME' ? updatedTrx.amount : 0,
        credit: updatedTrx.type === 'EXPENSE' ? updatedTrx.amount : 0,
        refId: updatedTrx.refNumber
      });
      
      const jrnCreditRef = doc(collection(db, 'journalEntries'));
      batch.set(jrnCreditRef, {
        entryNumber,
        date,
        description: `Lawan transaksi: ${updatedTrx.category}`,
        accountCode: '3000',
        accountName: updatedTrx.category,
        debit: updatedTrx.type === 'EXPENSE' ? updatedTrx.amount : 0,
        credit: updatedTrx.type === 'INCOME' ? updatedTrx.amount : 0,
        refId: updatedTrx.refNumber
      });

      await batch.commit();
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `cashTransactions/${id}`);
    }
  };

  const addJournalEntry = async (entry: Omit<JournalEntry, 'id'>) => {
    try {
      await addDoc(collection(db, 'journalEntries'), entry);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'journalEntries');
    }
  };

  const deleteJournalEntry = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'journalEntries', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `journalEntries/${id}`);
    }
  };

  const updateBankAccount = async (id: string, updates: Partial<BankAccount>) => {
    try {
      await updateDoc(doc(db, 'bankAccounts', id), updates as any);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `bankAccounts/${id}`);
    }
  };

  const addMarketingTarget = async (target: Omit<MarketingTarget, 'id'>) => {
    try { await addDoc(collection(db, 'marketingTeam'), target); } catch(e) { handleFirestoreError(e, OperationType.CREATE, 'marketingTeam'); }
  };

  const updateMarketingTarget = async (target: MarketingTarget) => {
    try { const { id, ...data } = target; await updateDoc(doc(db, 'marketingTeam', id), data as any); } catch(e) { handleFirestoreError(e, OperationType.UPDATE, `marketingTeam/${target.id}`); }
  };

  const deleteMarketingTarget = async (id: string) => {
    try { await deleteDoc(doc(db, 'marketingTeam', id)); } catch(e) { handleFirestoreError(e, OperationType.DELETE, `marketingTeam/${id}`); }
  };

  
  const setFinancialConfig = async (config: FinancialConfig) => {
    try {
      await setDoc(doc(db, 'settings', 'global'), { financialConfig: config }, { merge: true });
    } catch(e) { handleFirestoreError(e, OperationType.WRITE, 'settings/global'); }
  };

  const setKasBesarInitialBalance = async (val: number | ((prev: number) => number)) => {
    const newValue = typeof val === 'function' ? val(kasBesarInitialBalance) : val;
    setKasBesarInitialBalanceState(newValue);
    try { await setDoc(doc(db, 'settings', 'global'), { kasBesarInitialBalance: newValue }, { merge: true }); } catch(e) { handleFirestoreError(e, OperationType.WRITE, 'settings/global'); }
  };
  const setKasKecilInitialBalance = async (val: number | ((prev: number) => number)) => {
    const newValue = typeof val === 'function' ? val(kasKecilInitialBalance) : val;
    setKasKecilInitialBalanceState(newValue);
    try { await setDoc(doc(db, 'settings', 'global'), { kasKecilInitialBalance: newValue }, { merge: true }); } catch(e) { handleFirestoreError(e, OperationType.WRITE, 'settings/global'); }
  };
const transferFunds = async (amount: number, targetLedger: 'KAS_BESAR' | 'KAS_KECIL', description: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    try {
      // 1. Transaction Out from Bank
      await addCashTransaction({
        ledgerType: 'BUKU_BANK',
        date: todayStr,
        category: 'Transfer ke Kas',
        description: `Transfer ke ${targetLedger === 'KAS_BESAR' ? 'Kas Besar' : 'Kas Kecil'}: ${description}`,
        type: 'EXPENSE',
        amount: amount
      });

      // 2. Transaction In to Target Ledger
      await addCashTransaction({
        ledgerType: targetLedger,
        date: todayStr,
        category: 'Transfer dari Bank',
        description: `Transfer dari Buku Bank: ${description}`,
        type: 'INCOME',
        amount: amount
      });

      // 3. Update Balance for Target Ledger
      if (targetLedger === 'KAS_BESAR') {
        await setKasBesarInitialBalance(prev => prev + amount);
      } else {
        await setKasKecilInitialBalance(prev => prev + amount);
      }
    } catch (e) {
      console.error('Error transferring funds:', e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        updateUserPassword,
        addUser,
        deleteUser,
        companyInfo,
        updateCompanyInfo,
        activeTab,
        setActiveTab,
        darkMode,
        setDarkMode,
        toggleDarkMode,
        isAppUnlocked,
        unlockApp,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        salesOrders,
        addSalesOrder,
        updateSalesOrder,
        deleteSalesOrder,
        invoices,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        recordInvoicePayment,
        purchaseOrders,
        addPurchaseOrder,
        updatePurchaseOrder,
        deletePurchaseOrder,
        recordPOPayment,
        transferFunds,
        cashTransactions,
        addCashTransaction,
        updateCashTransaction,
        deleteCashTransaction,
        bankAccounts,
        updateBankAccount,
        journalEntries,
        addJournalEntry,
        deleteJournalEntry,
        kasBesarInitialBalance,
        setKasBesarInitialBalance,
        kasKecilInitialBalance,
        setKasKecilInitialBalance,
        financialConfig,
        setFinancialConfig,
        marketingTeam,
        addMarketingTarget,
        updateMarketingTarget,
        deleteMarketingTarget,
        selectedInvoiceForPrint,
        setSelectedInvoiceForPrint,
        formatCurrency
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
