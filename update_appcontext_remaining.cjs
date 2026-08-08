const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// For Users
if (!code.includes("const unsubusers = onSnapshot(collection(db, 'users')")) {
  code = code.replace(/const \[users, setUsers\] = useState<User\[\]>\(\(\) => \{[\s\S]*?\}\);/, 'const [users, setUsers] = useState<User[]>(INITIAL_USERS);');
}

// Just default to INITIAL_USERS so authentication works. Wait, if I change users, other users won't see it?
// The users array doesn't seem to have a CRUD interface anyway, it's just for login.
// Actually, companyInfo and financialConfig are meant to be updated.

// Let's add them to Firebase!
code = code.replace(/const \[companyInfo, setCompanyInfo\] = useState<CompanyInfo>\(\(\) => \{[\s\S]*?\}\);/, 'const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(COMPANY_DETAILS);');
code = code.replace(/const \[financialConfig, setFinancialConfig\] = useState<FinancialConfig>\(\(\) => \{[\s\S]*?\}\);/, 'const [financialConfig, setFinancialConfig] = useState<FinancialConfig>({\n    currency: \'IDR\',\n    taxRate: 11\n  });');

code = code.replace(/const \[marketingTeam, setMarketingTeam\] = useState<MarketingTarget\[\]>\(\(\) => \{[\s\S]*?\}\);/, 'const [marketingTeam, setMarketingTeam] = useState<MarketingTarget[]>([]);');

// Now inject listeners for marketingTeam, companyInfo, etc.
let firestoreHooks = `
    const unsubmarketingTeam = onSnapshot(collection(db, 'marketingTeam'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMarketingTeam(data as any);
    });

    const unsubsettings = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.companyInfo) setCompanyInfo(data.companyInfo);
        if (data.financialConfig) setFinancialConfig(data.financialConfig);
        if (data.kasBesarInitialBalance !== undefined) setKasBesarInitialBalance(data.kasBesarInitialBalance);
        if (data.kasKecilInitialBalance !== undefined) setKasKecilInitialBalance(data.kasKecilInitialBalance);
      }
    });
`;

code = code.replace(/  \/\/ Firebase Listeners\n  useEffect\(\(\) => \{/, match => match + firestoreHooks);
code = code.replace(/unsubjournalEntries\(\);/, match => match + '\n      unsubmarketingTeam();\n      unsubsettings();');

// Also update setter functions for settings
code = code.replace(/const updateCompanyInfo = \(info: Partial<CompanyInfo>\) => \{[\s\S]*?setCompanyInfo\(prev => \(\{ \.\.\.prev, \.\.\.info \}\)\);[\s\S]*?\};/, 
`const updateCompanyInfo = async (info: Partial<CompanyInfo>) => {
    try {
      await setDoc(doc(db, 'settings', 'global'), { companyInfo: { ...companyInfo, ...info } }, { merge: true });
    } catch (e) {
      console.error(e);
    }
  };`);

// Remove localStorage use effects for company, financial, etc.
const toRemoveEffects = ['big_users', 'big_company_info', 'big_financial_config', 'big_kas_besar_initial', 'big_kas_kecil_initial', 'big_marketing_team'];
toRemoveEffects.forEach(key => {
  const regex = new RegExp(`  useEffect\\(\\(\\) => \\{\\s*localStorage\\.setItem\\('${key}'.*?\\);\\s*\\}, \\[.*?\\]\\);\\n*`, 'g');
  code = code.replace(regex, '');
});

fs.writeFileSync('src/context/AppContext.tsx', code);
console.log("Updated AppContext with settings in Firebase");
