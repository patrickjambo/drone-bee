const fs = require('fs');
let header = fs.readFileSync('src/app/manager/ManagerHeader.tsx', 'utf8');

// Replace "ManagerHeader" with "AdminHeader"
header = header.replace(/ManagerHeader/g, 'AdminHeader');
// Change initial profile
header = header.replace(/name: 'Jambo Patrick', role: 'Agent'/g, "name: 'System Owner', role: 'Super Admin'");
header = header.replace(/name=Jambo\+Patrick/g, "name=System+Owner");

fs.writeFileSync('src/app/admin/AdminHeader.tsx', header);
console.log('Created AdminHeader.tsx');
