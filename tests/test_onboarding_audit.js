const fs = require('fs');
const vm = require('vm');

console.log('====================================================');
console.log('--- RUNNING BAAODASH ONBOARDING SUITE AUDIT TEST ---');
console.log('====================================================\n');

// 1. Load File
const filePath = 'BaaoDash_Onboarding_Demo.html';
if (!fs.existsSync(filePath)) {
  console.error(`FAIL: File ${filePath} does not exist!`);
  process.exit(1);
}
const html = fs.readFileSync(filePath, 'utf8');
console.log(`PASS: Loaded ${filePath} (${(html.length / 1024).toFixed(1)} KB)`);

// 2. Strict Prohibited Term Audit (Zero Tolerance)
const prohibitedTerms = [
  '0% Commission',
  '0% Markup',
  'Hub Auditing',
  'Live Auditing',
  'Master Deliveries Audit',
  'Plastic bag',
  'Net sales'
];

let foundProhibited = [];
prohibitedTerms.forEach(term => {
  if (html.toLowerCase().includes(term.toLowerCase())) {
    foundProhibited.push(term);
  }
});

if (foundProhibited.length > 0) {
  console.error('FAIL: Found prohibited non-production terms:', foundProhibited);
  process.exit(1);
} else {
  console.log('PASS: Zero prohibited non-production terms found in Onboarding Suite!');
}

// 3. Customer Onboarding Critical Elements
const customerElements = [
  'id="cust-mobile-input"',
  'id="carrier-tag"',
  'id="otp-1"',
  'id="otp-2"',
  'id="otp-3"',
  'id="otp-4"',
  'id="cust-fullname"',
  'id="cust-barangay-select"',
  'id="cust-purok"',
  'id="cust-landmark"',
  'id="cust-fare-tag"',
  'name="cust-pay"'
];

let missingCust = [];
customerElements.forEach(el => {
  if (!html.includes(el)) missingCust.push(el);
});

if (missingCust.length > 0) {
  console.error('FAIL: Missing customer onboarding elements:', missingCust);
  process.exit(1);
} else {
  console.log('PASS: All 12 customer onboarding elements (<45s passwordless OTP + 3-tier address) verified!');
}

// 4. Business Owner / Merchant Registration Elements
const merchantElements = [
  'id="merch-owner-name"',
  'id="merch-store-name"',
  'id="merch-category"',
  'id="merch-barangay"',
  'id="merch-landmark"',
  'id="merch-gcash-name"',
  'id="merch-gcash-number"',
  'id="merch-hours-open"',
  'id="merch-hours-close"',
  'id="btn-ingest-photo"',
  'id="btn-ingest-fb"',
  'id="btn-ingest-manual"',
  'id="extracted-menu-list"'
];

let missingMerch = [];
merchantElements.forEach(el => {
  if (!html.includes(el)) missingMerch.push(el);
});

if (missingMerch.length > 0) {
  console.error('FAIL: Missing merchant onboarding elements:', missingMerch);
  process.exit(1);
} else {
  console.log('PASS: All 13 merchant registration elements (direct GCash + 3-way menu ingestion) verified!');
}

// 5. Rider Fleet Onboarding Elements
const riderElements = [
  'id="pill-mode-self"',
  'id="pill-mode-hub"',
  'id="rider-name"',
  'id="rider-mobile"',
  'id="rider-fleet-tier"',
  'id="rider-plate"',
  'id="drop-doc-1"',
  'id="drop-doc-2"',
  'id="rider-emergency"',
  'id="rider-gcash"',
  'id="chk-dole-terms"',
  'class="float-promo-banner"'
];

let missingRider = [];
riderElements.forEach(el => {
  if (!html.includes(el)) missingRider.push(el);
});

if (missingRider.length > 0) {
  console.error('FAIL: Missing rider onboarding elements:', missingRider);
  process.exit(1);
} else {
  console.log('PASS: All 12 rider onboarding elements (Assisted Hub Mode + ₱50 float bonus + DOLE terms) verified!');
}

// 6. Cross-Linking & Harness Integration
if (!html.includes('href="BaaoDash_MVP_Prototype.html"')) {
  console.error('FAIL: Onboarding Suite does not link to BaaoDash_MVP_Prototype.html');
  process.exit(1);
}
console.log('PASS: Direct link to 5-Phone Delivery Prototype verified!');

const mvpHtml = fs.readFileSync('BaaoDash_MVP_Prototype.html', 'utf8');
if (!mvpHtml.includes('href="BaaoDash_Onboarding_Demo.html"')) {
  console.error('FAIL: BaaoDash_MVP_Prototype.html does not link to BaaoDash_Onboarding_Demo.html');
  process.exit(1);
}
console.log('PASS: Reverse cross-link from BaaoDash_MVP_Prototype.html verified!');

// 7. JavaScript Syntax & Compilation Test
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) {
  console.error('FAIL: Could not locate <script> block in HTML!');
  process.exit(1);
}

try {
  // Create mock browser DOM environment
  const mockWindow = {
    innerWidth: 1440,
    addEventListener: () => {},
    AudioContext: null,
    webkitAudioContext: null
  };
  const mockDoc = {
    getElementById: (id) => ({
      value: '',
      style: {},
      classList: { add: () => {}, remove: () => {} },
      textContent: '',
      innerHTML: '',
      prepend: () => {},
      options: [{ getAttribute: () => '50.00' }],
      selectedIndex: 0,
      focus: () => {}
    }),
    querySelectorAll: () => [],
    querySelector: () => ({ classList: { add: () => {}, remove: () => {} } })
  };

  const context = vm.createContext({
    window: mockWindow,
    document: mockDoc,
    console: console,
    alert: () => {},
    parseFloat: parseFloat
  });

  vm.runInContext(scriptMatch[1], context);
  console.log('PASS: JavaScript compiles and executes without syntax or runtime initialization errors!');
} catch (err) {
  console.error('FAIL: JavaScript compilation error:', err);
  process.exit(1);
}

console.log('\n====================================================');
console.log('🎉 ALL ONBOARDING AUDIT CHECKS PASSED SUCCESSFULLY! 🎉');
console.log('====================================================\n');
