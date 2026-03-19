const fs = require('fs');
const files = [
  'src/app/manager/dashboard/page.tsx',
  'src/app/manager/customers/page.tsx',
  'src/app/manager/reports/page.tsx',
  'src/app/manager/sync/page.tsx',
  'src/app/manager/settings/page.tsx',
  'src/app/manager/inventory/page.tsx',
  'src/app/manager/reconcile/page.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  
  // Find <header>...</header>
  const headerStart = content.indexOf('<header');
  const headerEnd = content.indexOf('</header>') + '</header>'.length;
  
  if (headerStart !== -1 && headerEnd !== -1 && !content.includes('ManagerHeader')) {
      // replace header content
      content = content.substring(0, headerStart) + '<ManagerHeader title="Search..." />' + content.substring(headerEnd);
      
      // import
      // look for last import statement
      const lastImportIndex = content.lastIndexOf('import');
      let importEnd = content.indexOf('\\n', lastImportIndex);
      if (importEnd === -1) importEnd = lastImportIndex;
      
      content = content.substring(0, importEnd) + "\\nimport ManagerHeader from '../ManagerHeader';" + content.substring(importEnd);
      
      fs.writeFileSync(file, content);
      console.log('Updated ' + file);
  }
});
