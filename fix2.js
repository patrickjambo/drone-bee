const fs = require('fs');

['inventory', 'reconcile'].forEach(folder => {
  let p = `src/app/manager/${folder}/page.tsx`;
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace(/<\/div>\n    <\/div>\n  \);\n}/, '</div>\n  );\n}');
  fs.writeFileSync(p, c);
});
let p3 = 'src/app/manager/dashboard/page.tsx';
let c3 = fs.readFileSync(p3, 'utf8');
c3 = c3.replace(/<\/div><\/div><\/>/g, '</div></>');
fs.writeFileSync(p3, c3);
