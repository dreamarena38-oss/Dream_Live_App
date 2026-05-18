const fs = require('fs');
const path = require('path');

const PURPLE = '#6D28D9';
const WHITE = '#FFFFFF';
const DARK_TEXT = '#1F2937';
const LIGHT_BG = '#F3F4F6';
const GRAY_TEXT = '#6B7280';

// Files to update
const tabScreens = [
  'app/(tabs)/index.tsx',
  'app/(tabs)/videos.tsx',
  'app/(tabs)/leagues.tsx',
  'app/(tabs)/highlights.tsx',
];

const adminScreens = [
  'app/admin/videos.tsx',
  'app/admin/matches.tsx',
  'app/admin/leagues.tsx',
  'app/admin/highlights.tsx',
  'app/admin/dashboard.tsx',
  'app/admin/login.tsx',
];

const components = [
  'components/Header.tsx',
  'components/MatchCard.tsx',
  'components/VideoCard.tsx',
  'components/LeagueCard.tsx',
];

const skeletons = [
  'components/Skeleton.tsx',
  'components/MatchCardSkeleton.tsx',
  'components/LeagueCardSkeleton.tsx',
  'components/VideoCardSkeleton.tsx',
];

// 1. Update _layout.tsx
let layoutPath = 'app/(tabs)/_layout.tsx';
let layoutContent = fs.readFileSync(layoutPath, 'utf8');
layoutContent = layoutContent.replace(/backgroundColor:\s*'#0F172A'/g, `backgroundColor: '${PURPLE}'`);
layoutContent = layoutContent.replace(/backgroundColor:\s*'#1E293B'/g, `backgroundColor: '${WHITE}'`);
layoutContent = layoutContent.replace(/tabBarActiveTintColor:\s*'#38BDF8'/g, `tabBarActiveTintColor: '${WHITE}'`);
layoutContent = layoutContent.replace(/tabBarInactiveTintColor:\s*'#64748B'/g, `tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)'`);
layoutContent = layoutContent.replace(/borderTopColor:\s*'#1E293B'/g, `borderTopColor: '${PURPLE}'`);
fs.writeFileSync(layoutPath, layoutContent);

// 2. Update Header.tsx
let headerPath = 'components/Header.tsx';
let headerContent = fs.readFileSync(headerPath, 'utf8');
headerContent = headerContent.replace(/backgroundColor:\s*'#0F172A'/g, `backgroundColor: '${PURPLE}'`);
headerContent = headerContent.replace(/backgroundColor:\s*'#1E293B'/g, `backgroundColor: '${PURPLE}'`);
fs.writeFileSync(headerPath, headerContent);

// 3. Update Screens and Components
const allFiles = [...tabScreens, ...adminScreens, ...components];

allFiles.forEach(f => {
  if (!fs.existsSync(f)) return;
  let content = fs.readFileSync(f, 'utf8');
  
  // Backgrounds
  content = content.replace(/backgroundColor:\s*'#0F172A'/g, `backgroundColor: '${WHITE}'`);
  content = content.replace(/backgroundColor:\s*'#1E293B'/g, `backgroundColor: '${WHITE}'`); // Card backgrounds to white
  content = content.replace(/backgroundColor:\s*'#111827'/g, `backgroundColor: '${WHITE}'`);
  
  // Section Headers / Empty States / Filter Sections
  content = content.replace(/backgroundColor:\s*'rgba\(255, 255, 255, 0.1\)'/g, `backgroundColor: '${LIGHT_BG}'`);
  content = content.replace(/backgroundColor:\s*'rgba\(255, 255, 255, 0.2\)'/g, `backgroundColor: '${WHITE}'`);
  
  // Texts
  content = content.replace(/color:\s*'#FFFFFF'/g, `color: '${DARK_TEXT}'`);
  content = content.replace(/color:\s*'#F8FAFC'/g, `color: '${DARK_TEXT}'`);
  content = content.replace(/color:\s*'#94A3B8'/g, `color: '${GRAY_TEXT}'`);
  content = content.replace(/color:\s*'#64748B'/g, `color: '${GRAY_TEXT}'`);
  
  // Cyan accents to Purple
  content = content.replace(/'#38BDF8'/g, `'${PURPLE}'`);
  content = content.replace(/'#0EA5E9'/g, `'${PURPLE}'`);
  
  // Specific fixes for buttons (should stay dark/purple text on light)
  if (f.includes('admin')) {
      content = content.replace(/color: '#FFFFFF'/g, `color: '#FFFFFF'`); // Restore white text for primary buttons
  }

  // Padding fixes for Tab Bar clearance
  // Already mostly present, but let's ensure it's on all tab screens
  if (tabScreens.includes(f)) {
      if (!content.includes('paddingBottom: 90')) {
          content = content.replace(/contentContainerStyle=\{\{[^}]*\}\}/g, (m) => {
              if (m.includes('paddingBottom')) return m;
              return m.replace('}}', ', paddingBottom: 110 }}');
          });
      } else {
          content = content.replace(/paddingBottom: 90/g, 'paddingBottom: 110'); // Increase padding slightly for safety
      }
  }

  fs.writeFileSync(f, content);
});

// 4. Update Skeletons to light theme
skeletons.forEach(f => {
    if (!fs.existsSync(f)) return;
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/'#1E293B'/g, `'#E5E7EB'`); // bg
    content = content.replace(/'#334155'/g, `'#F3F4F6'`); // highlights
    fs.writeFileSync(f, content);
});

console.log('Theme migration complete!');
