const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(/const addMarketingTarget = \(target: Omit<MarketingTarget, 'id'>\) => \{[\s\S]*?setMarketingTeam\(prev => \[\.\.\.prev, newTarget\]\);\s*\};/g,
`const addMarketingTarget = async (target: Omit<MarketingTarget, 'id'>) => {
    try { await addDoc(collection(db, 'marketingTeam'), target); } catch(e) { console.error(e); }
  };`);
  
code = code.replace(/const updateMarketingTarget = \(target: MarketingTarget\) => \{[\s\S]*?setMarketingTeam\(prev => prev\.map\(m => m\.id === target\.id \? target : m\)\);\s*\};/g,
`const updateMarketingTarget = async (target: MarketingTarget) => {
    try { const { id, ...data } = target; await updateDoc(doc(db, 'marketingTeam', id), data as any); } catch(e) { console.error(e); }
  };`);
  
code = code.replace(/const deleteMarketingTarget = \(id: string\) => \{[\s\S]*?setMarketingTeam\(prev => prev\.filter\(m => m\.id !== id\)\);\s*\};/g,
`const deleteMarketingTarget = async (id: string) => {
    try { await deleteDoc(doc(db, 'marketingTeam', id)); } catch(e) { console.error(e); }
  };`);

// And fix financialConfig state setter so it updates Firebase
// Let's rename the setFinancialConfig given by useState to setFinancialConfigState
// Then define a setFinancialConfig that updates firebase
code = code.replace(/const \[financialConfig, setFinancialConfig\] = useState<FinancialConfig>/g, 'const [financialConfig, setFinancialConfigState] = useState<FinancialConfig>');

const financialConfigUpdate = `
  const setFinancialConfig = async (config: FinancialConfig) => {
    try {
      await setDoc(doc(db, 'settings', 'global'), { financialConfig: config }, { merge: true });
    } catch(e) { console.error(e); }
  };
`;
// Insert before transferFunds
code = code.replace(/const transferFunds = /g, financialConfigUpdate + 'const transferFunds = ');

fs.writeFileSync('src/context/AppContext.tsx', code);
console.log("Updated marketing targets and financial config");
