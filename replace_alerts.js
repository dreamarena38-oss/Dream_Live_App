const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, 'app', 'admin');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Add Toast import if not present
  if (!content.includes("import Toast from 'react-native-toast-message';") && content.includes('Alert.alert')) {
    content = content.replace(
      "import { View, Text",
      "import Toast from 'react-native-toast-message';\nimport { View, Text"
    );
  }

  // Regex to match Alert.alert('Title', 'Message' or `Message`)
  // We only match cases with exactly 2 arguments (no buttons array)
  // This is a simplified regex and might need refinement, but we can do it more carefully:
  
  // Replace simple Alert.alert(title, message) 
  // with Toast.show({ type: type, text1: title, text2: message })
  
  const regex = /Alert\.alert\(\s*([^,]+?)\s*,\s*([^,]+?)\s*\)(?!;?\s*\[)/g;
  
  content = content.replace(regex, (match, p1, p2) => {
    // Determine type based on title
    let type = 'info';
    let titleStr = p1.toLowerCase();
    if (titleStr.includes('error') || titleStr.includes('failed')) type = 'error';
    if (titleStr.includes('success')) type = 'success';
    
    return `Toast.show({\n          type: '${type}',\n          text1: ${p1},\n          text2: ${p2}\n        })`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

fs.readdirSync(adminDir).forEach(file => {
  if (file.endsWith('.tsx')) {
    processFile(path.join(adminDir, file));
  }
});
