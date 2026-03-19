const fs = require('fs');

let p = 'src/app/manager/dashboard/page.tsx';
let c = fs.readFileSync(p, 'utf8');

// There is an unclosed <main> tag that we added somewhere in `manager/dashboard/page.tsx`
// Wait, looking at the grep earlier:
// <main className="flex-1 flex flex-col overflow-hidden">
// Let's close it right before the last closing </div>

c = c.replace(/<\/div>\n  \);\n}/, '    </main>\n  </div>\n  );\n}');
fs.writeFileSync(p, c);
