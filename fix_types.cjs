const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(/useState<any\[\]>\(\[\]\);/g, match => {
  return match;
});

// Since the linter task is running, I'll let it finish and see.
