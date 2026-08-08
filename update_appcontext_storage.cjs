const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// Remove localStorage saving for Firebase collections
const collectionsToPatch = [
  'customers', 'suppliers', 'sales_orders', 'invoices', 
  'purchase_orders', 'cash_transactions', 'bank_accounts', 'journal_entries'
];

collectionsToPatch.forEach(col => {
  const camelCol = col.replace(/_([a-z])/g, function (g) { return g[1].toUpperCase(); });
  // Remove useEffect for localStorage
  const regex = new RegExp(`  useEffect\\(\\(\\) => \\{\\s*localStorage\\.setItem\\('big_${col}', JSON\\.stringify\\(${camelCol}\\)\\);\\s*\\}, \\[${camelCol}\\]\\);\\n*`, 'g');
  code = code.replace(regex, '');
  
  // Remove mockData initialization
  // e.g. const [customers, setCustomers] = useState<Customer[]>(() => { ... return saved ? ... : INITIAL_CUSTOMERS; });
  const initRegex = new RegExp(`const \\\[${camelCol}, set${camelCol.charAt(0).toUpperCase() + camelCol.slice(1)}\\\] = useState<.*?\\>\\(\\(\\) => \\{[\\s\\S]*?\\}\\);`, 'g');
  code = code.replace(initRegex, `const [${camelCol}, set${camelCol.charAt(0).toUpperCase() + camelCol.slice(1)}] = useState<any[]>([]);`);
});

// Update the Firebase listener so it ALWAYS sets the state, even if empty (data.length > 0 removed)
code = code.replace(/if \(data\.length > 0\) (set[A-Za-z]+)\(data as any\);/g, '$1(data as any);');

fs.writeFileSync('src/context/AppContext.tsx', code);
console.log("Updated AppContext storage and initialization");
