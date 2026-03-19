const fs = require('fs');

['inventory', 'reconcile', 'dashboard'].forEach(folder => {
  let pp = `src/app/manager/${folder}/page.tsx`;
  let cc = fs.readFileSync(pp, 'utf8');

  // Let's just strip out the exact problematic closing block and format it cleanly
  if (folder === 'dashboard') {
     cc = cc.replace(/<\/div>\n            <\/main>\n  <\/div>\n  \);\n}/, '    </main>\n  </div>\n  );\n}');
  } else {
     cc = cc.replace(/<\/div>\n    <\/div>\n  \);\n}/, '  </div>\n  );\n}'); // remove another </div> since they have 1 extra
  }
  fs.writeFileSync(pp, cc);
});
