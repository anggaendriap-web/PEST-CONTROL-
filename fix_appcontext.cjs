const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// The duplicate currentUser definition in AppContextType
code = code.replace(/currentUser: User \| null;\n  login: \(email: string, password: string\) => boolean;\n  logout: \(\) => void;\n/, '');

fs.writeFileSync('src/context/AppContext.tsx', code);
console.log("Fixed duplicate definition");
