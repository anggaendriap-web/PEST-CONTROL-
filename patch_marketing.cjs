const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(/const addMarketingTarget = \(target.*?\) => \{[\s\S]*?setMarketingTeam.*?\}[\s\S]*?\};?/,
`const addMarketingTarget = async (target: Omit<MarketingTarget, 'id'>) => {
    try { await addDoc(collection(db, 'marketingTeam'), target); } catch(e) { console.error(e); }
  };`);
  
code = code.replace(/const updateMarketingTarget = \(target: MarketingTarget\) => \{[\s\S]*?setMarketingTeam.*?\}[\s\S]*?\};?/,
`const updateMarketingTarget = async (target: MarketingTarget) => {
    try { const { id, ...data } = target; await updateDoc(doc(db, 'marketingTeam', id), data as any); } catch(e) { console.error(e); }
  };`);
  
code = code.replace(/const deleteMarketingTarget = \(id: string\) => \{[\s\S]*?setMarketingTeam.*?\}[\s\S]*?\};?/,
`const deleteMarketingTarget = async (id: string) => {
    try { await deleteDoc(doc(db, 'marketingTeam', id)); } catch(e) { console.error(e); }
  };`);

// And setFinancialConfig should update firebase too
code = code.replace(/const \[financialConfig, setFinancialConfig\] = useState<FinancialConfig>\(([\s\S]*?)\);/, 'const [financialConfig, setFinancialConfigState] = useState<FinancialConfig>($1);');
// oh wait, I need to define setFinancialConfig differently if I renamed it
code = code.replace(/const setFinancialConfig = \(config: FinancialConfig\) => \{[\s\S]*?\};/, ''); // delete old if it exists
// But setFinancialConfig is probably destructured.

