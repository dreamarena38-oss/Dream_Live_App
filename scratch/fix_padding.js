const fs = require('fs');
const files = [
  'app/admin/videos.tsx',
  'app/admin/matches.tsx',
  'app/admin/leagues.tsx',
  'app/admin/highlights.tsx',
  'app/admin/featured.tsx'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/edges=\{\['top', 'bottom'\]\}/g, "edges={['bottom']}");
  fs.writeFileSync(f, content);
  console.log('Updated ' + f);
});
