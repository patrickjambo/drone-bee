const fs = require('fs');
let pAuth = 'src/app/api/auth/login/route.ts';
let cAuth = fs.readFileSync(pAuth, 'utf8');

// We add stack traces to the error output to debug it live
cAuth = cAuth.replace(
  /return NextResponse.json\(\s*\{\s*error:\s*'Internal server error'\s*\},/g,
  `return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },`
);

fs.writeFileSync(pAuth, cAuth);
