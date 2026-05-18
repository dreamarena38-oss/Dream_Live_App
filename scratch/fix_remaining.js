const fs = require('fs');

// Fix tab bar padding on all tab screens
const tabScreens = [
  'app/(tabs)/index.tsx',
  'app/(tabs)/videos.tsx',
  'app/(tabs)/leagues.tsx',
  'app/(tabs)/highlights.tsx',
];

tabScreens.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  
  // Add paddingBottom to ScrollViews that don't have it already for tab bar clearance
  content = content.replace(
    /(<ScrollView\s[^>]*style=\{styles\.content\}[^>]*>)/g,
    (match) => {
      if (match.includes('contentContainerStyle')) return match;
      return match.replace('>', '\n        contentContainerStyle={{ paddingBottom: 90 }}\n      >');
    }
  );

  fs.writeFileSync(f, content);
  console.log('Updated', f);
});

// Fix category badge text color in videos.tsx and highlights.tsx
const badgeFiles = [
  'app/(tabs)/videos.tsx',
  'app/(tabs)/highlights.tsx',
];

badgeFiles.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  // Fix categoryBadgeText / sportTag color from invisible dark to readable
  content = content.replace(/categoryBadgeText:\s*\{[^}]*color:\s*'#0F172A'/g, (m) => m.replace("'#0F172A'", "'#38BDF8'"));
  content = content.replace(/sportTag:\s*\{[^}]*color:\s*'#0F172A'/g, (m) => m.replace("'#0F172A'", "'#38BDF8'"));
  fs.writeFileSync(f, content);
  console.log('Fixed badge colors in', f);
});

// Fix RefreshControl colors
const refreshFiles = [
  'app/(tabs)/index.tsx',
  'app/(tabs)/videos.tsx',
  'app/(tabs)/leagues.tsx',
  'app/(tabs)/highlights.tsx',
];

refreshFiles.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(
    /<RefreshControl refreshing=\{refreshing\} onRefresh=\{onRefresh\} \/>/g,
    '<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38BDF8" colors={["#38BDF8"]} />'
  );
  fs.writeFileSync(f, content);
  console.log('Fixed RefreshControl in', f);
});

console.log('All fixes applied!');
