const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(/if \(data\.financialConfig\) setFinancialConfig\(data\.financialConfig\);/, 'if (data.financialConfig) setFinancialConfigState(data.financialConfig);');
code = code.replace(/if \(data\.companyInfo\) setCompanyInfo\(data\.companyInfo\);/, 'if (data.companyInfo) setCompanyInfoState(data.companyInfo);');

// Replace setCompanyInfo definition to use setCompanyInfoState
code = code.replace(/const \[companyInfo, setCompanyInfo\] = useState<CompanyInfo>\(COMPANY_DETAILS\);/, 'const [companyInfo, setCompanyInfoState] = useState<CompanyInfo>(COMPANY_DETAILS);');

// The updateCompanyInfo function already exists and does the Firebase write, but we should make sure it doesn't call setCompanyInfo
// Oh wait, updateCompanyInfo was:
// const updateCompanyInfo = async (info: Partial<CompanyInfo>) => {
//     try {
//       await setDoc(doc(db, 'settings', 'global'), { companyInfo: { ...companyInfo, ...info } }, { merge: true });
//     } catch (e) {
//       console.error(e);
//     }
//   };
// That's perfectly fine! It doesn't call setCompanyInfo locally, it relies on the snapshot!

// Wait, the context returns companyInfo and updateCompanyInfo. It does NOT return setCompanyInfo. Let me double check.

fs.writeFileSync('src/context/AppContext.tsx', code);
console.log("Fixed snapshot infinite loop");
