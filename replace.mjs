import fs from 'fs';
const files = [
  'src/app/manager/dashboard/page.tsx',
  'src/app/manager/customers/page.tsx',
  'src/app/manager/reports/page.tsx',
  'src/app/manager/sync/page.tsx',
  'src/app/manager/settings/page.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  const regex = /<header[\s\S]*?<\/header>/;
  if (regex.test(content) && !content.includes('ManagerHeader')) {
      content = content.replace(regex, '<ManagerHeader title="Search..." />');
      content = content.replace(/import ManagerSidebar from '\.\.\/ManagerSidebar';/, "import ManagerSidebar from '../ManagerSidebar';\nimport ManagerHeader from '../ManagerHeader';");
      fs.writeFileSync(file, content);
      console.log('Updated ' + file);
  }
});
