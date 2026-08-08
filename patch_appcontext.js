const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// 1. Add Firebase imports
if (!code.includes("firebase/firestore")) {
  code = `import { collection, doc, onSnapshot, setDoc, addDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';\nimport { db } from '../lib/firebase';\n` + code;
}

// We will keep localStorage for initial sync to prevent flicker, but also use useEffect to listen to Firestore.
// Actually, it's easier to just overwrite the mockData with Firebase fetching.

// For each collection, e.g. customers, suppliers, etc.
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

// Add useEffects for listening
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

// Insert after the state definitions
code = code.replace(/const \[financialConfig, setFinancialConfig\] = useState<FinancialConfig>\(\(\) => \{[\s\S]*?\}\);\s*/, match => match + firestoreHooks);

// Replace addCustomer
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

// Replace updateCustomer
code = code.replace(/const updateCustomer = \(cust.*?\).*?\{[\s\S]*?setCustomers\(prev => prev.map.*?\}[\s\S]*?\}, \[\]\);?/, 
`const updateCustomer = async (cust: Customer) => {
    try {
      const { id, ...data } = cust;
      await updateDoc(doc(db, 'customers', id), data as any);
    } catch (e) {
      console.error(e);
    }
  }`);

// Replace deleteCustomer
code = code.replace(/const deleteCustomer = \(id.*?\).*?\{[\s\S]*?setCustomers\(prev => prev.filter.*?\}[\s\S]*?\}, \[\]\);?/, 
`const deleteCustomer = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'customers', id));
    } catch (e) {
      console.error(e);
    }
  }`);

fs.writeFileSync('src/context/AppContext.tsx', code);
console.log("Done");
