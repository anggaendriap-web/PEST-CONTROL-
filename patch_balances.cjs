const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(/const \[kasBesarInitialBalance, setKasBesarInitialBalance\] = useState<number>\(\(\) => \{[\s\S]*?\}\);/, 'const [kasBesarInitialBalance, setKasBesarInitialBalanceState] = useState<number>(0);');
code = code.replace(/const \[kasKecilInitialBalance, setKasKecilInitialBalance\] = useState<number>\(\(\) => \{[\s\S]*?\}\);/, 'const [kasKecilInitialBalance, setKasKecilInitialBalanceState] = useState<number>(0);');

const newSetters = `
  const setKasBesarInitialBalance = async (val: number | ((prev: number) => number)) => {
    const newValue = typeof val === 'function' ? val(kasBesarInitialBalance) : val;
    setKasBesarInitialBalanceState(newValue);
    try { await setDoc(doc(db, 'settings', 'global'), { kasBesarInitialBalance: newValue }, { merge: true }); } catch(e) {}
  };
  const setKasKecilInitialBalance = async (val: number | ((prev: number) => number)) => {
    const newValue = typeof val === 'function' ? val(kasKecilInitialBalance) : val;
    setKasKecilInitialBalanceState(newValue);
    try { await setDoc(doc(db, 'settings', 'global'), { kasKecilInitialBalance: newValue }, { merge: true }); } catch(e) {}
  };
`;

code = code.replace(/const transferFunds = /g, newSetters + 'const transferFunds = ');

// Also in the settings listener
code = code.replace(/if \(data\.kasBesarInitialBalance \!== undefined\) setKasBesarInitialBalance\(data\.kasBesarInitialBalance\);/g, 'if (data.kasBesarInitialBalance !== undefined) setKasBesarInitialBalanceState(data.kasBesarInitialBalance);');
code = code.replace(/if \(data\.kasKecilInitialBalance \!== undefined\) setKasKecilInitialBalance\(data\.kasKecilInitialBalance\);/g, 'if (data.kasKecilInitialBalance !== undefined) setKasKecilInitialBalanceState(data.kasKecilInitialBalance);');

fs.writeFileSync('src/context/AppContext.tsx', code);
console.log("Updated balances setters");
