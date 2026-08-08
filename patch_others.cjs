const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// Sales Orders
code = code.replace(/const addSalesOrder = \(so: Omit<SalesOrder.*?\{[\s\S]*?setSalesOrders\(prev => \[...prev, newSO\]\);[\s\S]*?\}/,
`const addSalesOrder = async (so: Omit<SalesOrder, 'id' | 'createdAt'>) => {
    const newSO = { ...so, createdAt: new Date().toISOString() };
    try { await addDoc(collection(db, 'salesOrders'), newSO); } catch (e) { console.error(e); }
  }`);
code = code.replace(/const updateSalesOrder = \(so: SalesOrder\) => \{[\s\S]*?setSalesOrders\(prev => prev.map.*?\).*?\}/,
`const updateSalesOrder = async (so: SalesOrder) => {
    try { const { id, ...data } = so; await updateDoc(doc(db, 'salesOrders', id), data as any); } catch(e) { console.error(e); }
  }`);
code = code.replace(/const deleteSalesOrder = \(id: string\) => \{[\s\S]*?setSalesOrders\(prev => prev.filter.*?\).*?\}/,
`const deleteSalesOrder = async (id: string) => {
    try { await deleteDoc(doc(db, 'salesOrders', id)); } catch(e) { console.error(e); }
  }`);

// Suppliers
code = code.replace(/const addSupplier = \(sup: Omit<Supplier.*?\{[\s\S]*?setSuppliers\(prev => \[...prev, newSup\]\);[\s\S]*?\}/,
`const addSupplier = async (sup: Omit<Supplier, 'id' | 'totalPO' | 'totalBalanceDue'>) => {
    const newSup = { ...sup, totalPO: 0, totalBalanceDue: 0 };
    try { await addDoc(collection(db, 'suppliers'), newSup); } catch (e) { console.error(e); }
  }`);
code = code.replace(/const updateSupplier = \(sup: Supplier\) => \{[\s\S]*?setSuppliers\(prev => prev.map.*?\).*?\}/,
`const updateSupplier = async (sup: Supplier) => {
    try { const { id, ...data } = sup; await updateDoc(doc(db, 'suppliers', id), data as any); } catch(e) { console.error(e); }
  }`);
code = code.replace(/const deleteSupplier = \(id: string\) => \{[\s\S]*?setSuppliers\(prev => prev.filter.*?\).*?\}/,
`const deleteSupplier = async (id: string) => {
    try { await deleteDoc(doc(db, 'suppliers', id)); } catch(e) { console.error(e); }
  }`);

// Invoices
code = code.replace(/const addInvoice = \(inv: Omit<Invoice.*?\{[\s\S]*?setInvoices\(prev => \[...prev, newInv\]\);[\s\S]*?\}/,
`const addInvoice = async (inv: Omit<Invoice, 'id' | 'amountPaid' | 'remainingBalance' | 'status'>) => {
    const newInv = { ...inv, amountPaid: 0, remainingBalance: inv.netPayable || inv.grandTotal, status: 'UNPAID' };
    try { await addDoc(collection(db, 'invoices'), newInv); } catch(e) { console.error(e); }
  }`);
code = code.replace(/const updateInvoice = \(inv: Invoice\) => \{[\s\S]*?setInvoices\(prev => prev.map.*?\).*?\}/,
`const updateInvoice = async (inv: Invoice) => {
    try { const { id, ...data } = inv; await updateDoc(doc(db, 'invoices', id), data as any); } catch(e) { console.error(e); }
  }`);
code = code.replace(/const deleteInvoice = \(id: string\) => \{[\s\S]*?setInvoices\(prev => prev.filter.*?\).*?\}/,
`const deleteInvoice = async (id: string) => {
    try { await deleteDoc(doc(db, 'invoices', id)); } catch(e) { console.error(e); }
  }`);

// Purchase Orders
code = code.replace(/const addPurchaseOrder = \(po: Omit<PurchaseOrder.*?\{[\s\S]*?setPurchaseOrders\(prev => \[...prev, newPO\]\);[\s\S]*?\}/,
`const addPurchaseOrder = async (po: Omit<PurchaseOrder, 'id' | 'amountPaid' | 'status' | 'paymentStatus' | 'createdAt'>) => {
    const newPO = { ...po, amountPaid: 0, status: 'PENDING', paymentStatus: 'UNPAID', createdAt: new Date().toISOString() };
    try { await addDoc(collection(db, 'purchaseOrders'), newPO); } catch(e) { console.error(e); }
  }`);
code = code.replace(/const updatePurchaseOrder = \(po: PurchaseOrder\) => \{[\s\S]*?setPurchaseOrders\(prev => prev.map.*?\).*?\}/,
`const updatePurchaseOrder = async (po: PurchaseOrder) => {
    try { const { id, ...data } = po; await updateDoc(doc(db, 'purchaseOrders', id), data as any); } catch(e) { console.error(e); }
  }`);
code = code.replace(/const deletePurchaseOrder = \(id: string\) => \{[\s\S]*?setPurchaseOrders\(prev => prev.filter.*?\).*?\}/,
`const deletePurchaseOrder = async (id: string) => {
    try { await deleteDoc(doc(db, 'purchaseOrders', id)); } catch(e) { console.error(e); }
  }`);

// Cash Transactions
code = code.replace(/const addCashTransaction = \(trx.*?\) => \{[\s\S]*?setCashTransactions\(prev => \[...prev, newTrx\]\);[\s\S]*?\}/,
`const addCashTransaction = async (trx: Omit<CashTransaction, 'id' | 'balanceAfter' | 'createdBy' | 'refNumber'> & { refNumber?: string }) => {
    const newTrx = { ...trx, refNumber: trx.refNumber || \`TRX-\${Date.now()}\`, balanceAfter: 0, createdBy: currentUser.name };
    try { await addDoc(collection(db, 'cashTransactions'), newTrx); } catch(e) { console.error(e); }
  }`);
code = code.replace(/const updateCashTransaction = \(id: string, updates: Partial<CashTransaction>\) => \{[\s\S]*?setCashTransactions\(prev => prev.map.*?\).*?\}/,
`const updateCashTransaction = async (id: string, updates: Partial<CashTransaction>) => {
    try { await updateDoc(doc(db, 'cashTransactions', id), updates as any); } catch(e) { console.error(e); }
  }`);
code = code.replace(/const deleteCashTransaction = \(id: string\) => \{[\s\S]*?setCashTransactions\(prev => prev.filter.*?\).*?\}/,
`const deleteCashTransaction = async (id: string) => {
    try { await deleteDoc(doc(db, 'cashTransactions', id)); } catch(e) { console.error(e); }
  }`);

// Journal Entries
code = code.replace(/const addJournalEntry = \(entry: Omit<JournalEntry.*?\{[\s\S]*?setJournalEntries\(prev => \[...prev, newEntry\]\);[\s\S]*?\}/,
`const addJournalEntry = async (entry: Omit<JournalEntry, 'id'>) => {
    try { await addDoc(collection(db, 'journalEntries'), entry); } catch(e) { console.error(e); }
  }`);
code = code.replace(/const deleteJournalEntry = \(id: string\) => \{[\s\S]*?setJournalEntries\(prev => prev.filter.*?\).*?\}/,
`const deleteJournalEntry = async (id: string) => {
    try { await deleteDoc(doc(db, 'journalEntries', id)); } catch(e) { console.error(e); }
  }`);

fs.writeFileSync('src/context/AppContext.tsx', code);
console.log("Done patching others");
