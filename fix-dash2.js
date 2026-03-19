const fs = require('fs');

let pDash = 'src/app/manager/dashboard/page.tsx';
let cDash = fs.readFileSync(pDash, 'utf8');
cDash = cDash.replace(/      <\/main>\n  <\/div>\n  \);\n}/, '    </div>\n  </main>\n</div>\n  );\n}'); 
fs.writeFileSync(pDash, cDash);

