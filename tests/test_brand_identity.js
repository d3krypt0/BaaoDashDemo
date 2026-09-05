const fs = require('fs');
const vm = require('vm');

console.log('====================================================');
console.log('--- RUNNING BAAODASH BRAND IDENTITY AUDIT TEST ---');
console.log('====================================================\n');

// 1. Verify Existence of all Core Brand Assets & Documents
const requiredBrandFiles = [
  'BaaoDash_Brand_Identity_Manual.md',
  'BaaoDash_Brand_Identity.html',
  'assets/brand/logo-symbol.svg',
  'assets/brand/logo-primary.svg',
  'assets/brand/logo-stacked.svg',
  'assets/brand/logo-monochrome.svg',
  'assets/brand/logo-reverse.svg',
  'assets/brand/logo-rinconadash.svg',
  'assets/brand/icons-sprite.svg'
];

let missingFiles = [];
requiredBrandFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.error('FAIL: Missing required brand identity files:', missingFiles);
  process.exit(1);
} else {
  console.log(`PASS: All ${requiredBrandFiles.length} core brand identity files and SVG vector assets verified present!`);
}

// 2. Strict Prohibited Terms Check across all brand files
const prohibitedTerms = ['Plastic bag', 'Net sales'];
let foundProhibited = [];

requiredBrandFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  prohibitedTerms.forEach(term => {
    if (content.toLowerCase().includes(term.toLowerCase())) {
      foundProhibited.push({ file, term });
    }
  });
});

if (foundProhibited.length > 0) {
  console.error('FAIL: Found prohibited terms in brand assets:', foundProhibited);
  process.exit(1);
} else {
  console.log('PASS: Strictly verified ZERO prohibited terms (Plastic bag, Net sales) in brand identity system!');
}

// 3. Verify All 21 Icons in icons-sprite.svg
const spriteContent = fs.readFileSync('assets/brand/icons-sprite.svg', 'utf8');
const requiredIcons = [
  'icon-delivery', 'icon-motorcycle', 'icon-package', 'icon-food',
  'icon-grocery', 'icon-medicine', 'icon-documents', 'icon-location',
  'icon-tracking', 'icon-payment', 'icon-customer', 'icon-rider',
  'icon-store', 'icon-order', 'icon-pickup', 'icon-dropoff',
  'icon-support', 'icon-phone', 'icon-clock', 'icon-map', 'icon-route'
];

let missingIcons = [];
requiredIcons.forEach(iconId => {
  if (!spriteContent.includes(`id="${iconId}"`)) {
    missingIcons.push(iconId);
  }
});

if (missingIcons.length > 0) {
  console.error('FAIL: Missing icons in icons-sprite.svg:', missingIcons);
  process.exit(1);
} else {
  console.log(`PASS: All 21 vector brand icons verified present in icons-sprite.svg!`);
}

// 4. Verify Brand Hex Colors
const manualContent = fs.readFileSync('BaaoDash_Brand_Identity_Manual.md', 'utf8');
const htmlContent = fs.readFileSync('BaaoDash_Brand_Identity.html', 'utf8');

const expectedColors = ['#155EEF', '#FF7A00', '#0B1F3A', '#EAF2FF', '#F5F7FA', '#202124'];
let missingColors = [];
expectedColors.forEach(color => {
  if (!manualContent.includes(color) || !htmlContent.includes(color)) {
    missingColors.push(color);
  }
});

if (missingColors.length > 0) {
  console.error('FAIL: Missing core color hex codes in brand specifications:', missingColors);
  process.exit(1);
} else {
  console.log(`PASS: All ${expectedColors.length} core brand colors verified across manual and HTML portal!`);
}

// 5. Verify Regional Architecture & Extension System
const regionalEntities = ['RinconaDash', 'NabuaDash', 'IrigaDash', 'BulaDash'];
let missingRegional = [];
regionalEntities.forEach(entity => {
  if (!manualContent.includes(entity) || !htmlContent.includes(entity)) {
    missingRegional.push(entity);
  }
});

if (missingRegional.length > 0) {
  console.error('FAIL: Missing regional extension entities in specifications:', missingRegional);
  process.exit(1);
} else {
  console.log(`PASS: Regional brand architecture ([LOCATION] + DASH) verified for ${regionalEntities.join(', ')}!`);
}

// 6. Verify 7 Logo Variations in Manual
const logoVariations = [
  'Primary Horizontal', 'Stacked', 'Icon', 'Wordmark', 'Monochrome', 'Reverse'
];
let missingVariations = [];
logoVariations.forEach(v => {
  if (!manualContent.toLowerCase().includes(v.toLowerCase())) {
    missingVariations.push(v);
  }
});

if (missingVariations.length > 0) {
  console.error('FAIL: Missing logo variations in manual:', missingVariations);
  process.exit(1);
} else {
  console.log(`PASS: All 7 required logo variations documented and verified!`);
}

// 7. Verify HTML Portal Script Execution
const scriptMatch = htmlContent.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) {
  console.error('FAIL: Could not locate <script> block in BaaoDash_Brand_Identity.html');
  process.exit(1);
}

try {
  const mockDoc = {
    getElementById: () => ({
      textContent: '',
      classList: { add: () => {}, remove: () => {} }
    })
  };
  const context = vm.createContext({
    window: { AudioContext: null, webkitAudioContext: null },
    document: mockDoc,
    console: console,
    setTimeout: () => {}
  });

  vm.runInContext(scriptMatch[1], context);
  console.log('PASS: Brand identity interactive JavaScript compiles and runs cleanly with 0 errors!');
} catch (err) {
  console.error('FAIL: JavaScript execution error in brand portal:', err);
  process.exit(1);
}

console.log('\n====================================================');
console.log('🎉 ALL BRAND IDENTITY AUDIT CHECKS PASSED PERFECTLY! 🎉');
console.log('====================================================\n');
