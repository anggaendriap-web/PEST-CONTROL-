const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

if (!code.includes("firebase/firestore")) {
  code = `import { collection, doc, onSnapshot, setDoc, addDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';\nimport { db } from '../lib/firebase';\n` + code;
}

const collections = [
  { name: 'customers', set: 'setCustomers' },
  { name: 'suppliers', set: 'setSuppliers' },
  { name: 'salesOrders', set: 'setSalesOrders' },
  { name: 'invoices', set: 'setInvoices' },
  { name: 'purchaseOrders', set: 'setPurchaseOrders' },
  { name: 'cashTransactions', set: 'setCashTransactions' },
  { name: 'bankAccounts', set: 'setBankAccounts' },
  { name: 'journalEntries', set: 'setJournalEntries' }
];

let firestoreHooks = `\n  // Firebase Listeners\n  useEffect(() => {\n`;
collections.forEach(col => {
  firestoreHooks += `    const unsub${col.name} = onSnapshot(collection(db, '${col.name}'), (snapshot) => {\n`;
  firestoreHooks += `      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));\n`;
  firestoreHooks += `      if (data.length > 0) ${col.set}(data as any);\n`;
  firestoreHooks += `    });\n`;
});
firestoreHooks += `    return () => {\n`;
collections.forEach(col => {
  firestoreHooks += `      unsub${col.name}();\n`;
});
firestoreHooks += `    };\n  }, []);\n\n`;

code = code.replace(/const \[financialConfig, setFinancialConfig\] = useState<FinancialConfig>\(\(\) => \{[\s\S]*?\}\);\s*/, match => match + firestoreHooks);

// Regex replacements for Customer (we can do similar for others, but for now I'll just apply customer and maybe a few others to show functionality)
code = code.replace(/const addCustomer = \(cust.*?\).*?\{[\s\S]*?setCustomers\(prev => \[...prev, newCust\]\);[\s\S]*?\}/, 
`const addCustomer = async (cust: Omit<Customer, 'id' | 'createdAt' | 'totalOrders' | 'totalSpent'>) => {
    const newCust = {
      ...cust,
      createdAt: new Date().toISOString(),
      totalOrders: 0,
      totalSpent: 0
    };
    try {
      await addDoc(collection(db, 'customers'), newCust);
    } catch (e) {
      console.error(e);
    }
  }`);

code = code.replace(/const updateCustomer = \(cust: Customer\) => \{[\s\S]*?setCustomers\(prev => prev.map.*?\).*?\}/, 
`const updateCustomer = async (cust: Customer) => {
    try {
      const { id, ...data } = cust;
      await updateDoc(doc(db, 'customers', id), data as any);
    } catch (e) {
      console.error(e);
    }
  }`);

code = code.replace(/const deleteCustomer = \(id: string\) => \{[\s\S]*?setCustomers\(prev => prev.filter.*?\).*?\}/, 
`const deleteCustomer = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'customers', id));
    } catch (e) {
      console.error(e);
    }
  }`);

fs.writeFileSync('src/context/AppContext.tsx', code);
console.log("Done patching customers and adding hooks");
