const fs = require('fs');
const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = require('path').join(dir, file);
    if (fs.statSync(file).isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx')) results.push(file);
    }
  });
  return results;
}

const pages = walk('src/app/admin').filter(f => !f.includes('login') && !f.includes('api'));

pages.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // text-[#2B3674] -> text-gray-900
  // text-[#A3AED0] -> text-gray-500
  // bg-[#4318FF] -> bg-amber-500 or bg-[#FFC107]
  // text-[#4318FF] -> text-amber-500
  
  content = content.replace(/text-\[#2B3674\]/g, 'text-gray-900');
  content = content.replace(/text-\[#A3AED0\]/g, 'text-gray-500');
  content = content.replace(/bg-\[#4318FF\]/g, 'bg-amber-500');
  content = content.replace(/text-\[#4318FF\]/g, 'text-amber-500');

  fs.writeFileSync(file, content);
  console.log('Updated colors in ' + file);
});
