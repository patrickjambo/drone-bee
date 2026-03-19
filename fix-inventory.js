const fs = require('fs');

['inventory', 'reconcile'].forEach(folder => {
  let pp = `src/app/manager/${folder}/page.tsx`;
  let cc = fs.readFileSync(pp, 'utf8');

  // I introduced incorrect nested divs when trying to fix it earlier. I will restore their simple layout wrapper closure.
  cc = cc.replace(/<\/div>\n  \);\n}/, '    </main>\n  </div>\n  );\n}'); 
  fs.writeFileSync(pp, cc);
});

let pDash = 'src/app/manager/dashboard/page.tsx';
let cDash = fs.readFileSync(pDash, 'utf8');
cDash = cDash.replace(/              <\/main>\n  <\/div>\n  \);\n}/, '        </div>\n      </main>\n  </div>\n  );\n}'); 
fs.writeFileSync(pDash, cDash);

