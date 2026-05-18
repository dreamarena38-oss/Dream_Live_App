const fs = require('fs');
const path = require('path');

const directories = ['app', 'components'];

const hexMap = {
  // Backgrounds & Surfaces (Purple -> Dark Slate)
  '#8B5CF6': '#0F172A',
  '#FFFFFF': '#1E293B',
  '#F3F4F6': '#0F172A',
  '#F9FAFB': '#0F172A',
  
  // Header Blues
  '#3B82F6': '#0F172A',
  '#2563EB': '#1E293B',
  
  // Text & Accents (Purples -> Slate/Cyan)
  '#6B46C1': '#F8FAFC',
  '#6B7280': '#94A3B8',
  '#D1D5DB': '#475569',
  
  // Tab Bar
  '#E0E7FF': '#64748B',
  
  // Skeletons
  '#E1E9EE': '#334155',
};

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      // Specifically target color="#8B5CF6" or color: '#8B5CF6'
      // Since #8B5CF6 is used for both background and accents, we need to handle it.
      // In dark theme, accent should be Cyan (#38BDF8).
      // Backgrounds were '#8B5CF6', '#FFFFFF', '#3B82F6'.
      
      // First, handle the icons and text that are explicitly colored #8B5CF6
      const accentRegex = /color={?['"]#8B5CF6['"]}?/g;
      if (accentRegex.test(content)) {
        content = content.replace(accentRegex, 'color="#38BDF8"');
        changed = true;
      }
      
      const styleColorRegex = /color:\s*['"]#8B5CF6['"]/g;
      if (styleColorRegex.test(content)) {
        content = content.replace(styleColorRegex, "color: '#38BDF8'");
        changed = true;
      }

      for (const [oldColor, newColor] of Object.entries(hexMap)) {
        if (content.includes(oldColor)) {
          content = content.split(oldColor).join(newColor);
          changed = true;
        }
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

directories.forEach(dir => processDirectory(path.join(__dirname, '..', dir)));
console.log('Theme update complete!');
