const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(/const \[customers, setCustomers\] = useState<any\[\]>\(\[\]\);/, 'const [customers, setCustomers] = useState<Customer[]>([]);');
code = code.replace(/const \[suppliers, setSuppliers\] = useState<any\[\]>\(\[\]\);/, 'const [suppliers, setSuppliers] = useState<Supplier[]>([]);');
code = code.replace(/const \[salesOrders, setSalesOrders\] = useState<any\[\]>\(\[\]\);/, 'const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);');
code = code.replace(/const \[invoices, setInvoices\] = useState<any\[\]>\(\[\]\);/, 'const [invoices, setInvoices] = useState<Invoice[]>([]);');
code = code.replace(/const \[purchaseOrders, setPurchaseOrders\] = useState<any\[\]>\(\[\]\);/, 'const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);');
code = code.replace(/const \[cashTransactions, setCashTransactions\] = useState<any\[\]>\(\[\]\);/, 'const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>([]);');
code = code.replace(/const \[bankAccounts, setBankAccounts\] = useState<any\[\]>\(\[\]\);/, 'const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);');
code = code.replace(/const \[journalEntries, setJournalEntries\] = useState<any\[\]>\(\[\]\);/, 'const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);');

fs.writeFileSync('src/context/AppContext.tsx', code);
console.log("Fixed types");
