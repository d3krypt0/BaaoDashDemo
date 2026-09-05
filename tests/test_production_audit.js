const fs = require('fs');
const html = fs.readFileSync('BaaoDash_MVP_Prototype.html', 'utf8');

console.log('--- RUNNING PRODUCTION POLISH & MINIMALISM AUDIT ---');

// 1. Prohibited Labels & Elements
const prohibitedTerms = [
  '0% Commission',
  '0% Markup',
  'Hub Auditing',
  'Live Auditing',
  'Master Deliveries Audit',
  'id="role-pill-btn"',
  'id="nav-btn-roles"'
];

let foundProhibited = [];
prohibitedTerms.forEach(term => {
  if (html.includes(term)) {
    foundProhibited.push(term);
  }
});

if (foundProhibited.length > 0) {
  console.error('FAIL: Found prohibited non-production terms/elements:', foundProhibited);
  process.exit(1);
} else {
  console.log('PASS: Zero prohibited non-production terms or buttons found in app!');
}

// 2. Required New Minimalist Elements
const requiredElements = [
  'id="kitchen-merchant-select"',
  'id="ktab-incoming"',
  'id="ktab-preparing"',
  'id="ktab-dispatched"',
  'class="segmented-tabs"',
  'class="tab-badge"',
  'class="app-location-pill"'
];

let missingElements = [];
requiredElements.forEach(el => {
  if (!html.includes(el)) {
    missingElements.push(el);
  }
});

if (missingElements.length > 0) {
  console.error('FAIL: Missing required production UI elements:', missingElements);
  process.exit(1);
} else {
  console.log('PASS: All new minimalist UI elements and dropdowns verified present!');
}

// 3. Tab Text Overflow Check
const tabIncomingMatch = html.match(/id="ktab-incoming"[^>]*>([\s\S]*?)<\/button>/);
const tabPrepMatch = html.match(/id="ktab-preparing"[^>]*>([\s\S]*?)<\/button>/);
const tabDispMatch = html.match(/id="ktab-dispatched"[^>]*>([\s\S]*?)<\/button>/);

if (tabIncomingMatch && tabPrepMatch && tabDispMatch) {
  const inc = tabIncomingMatch[1].replace(/<[^>]+>/g, '').trim();
  const prep = tabPrepMatch[1].replace(/<[^>]+>/g, '').trim();
  const disp = tabDispMatch[1].replace(/<[^>]+>/g, '').trim();

  console.log(`Clean Kanban Tab Texts: [${inc}], [${prep}], [${disp}]`);
  if (inc.includes('(') || prep.includes('(') || disp.includes('(')) {
    console.error('FAIL: Unformatted parentheses still in tab labels!');
    process.exit(1);
  }
  console.log('PASS: Kanban tabs use sleek pill badges instead of overflowing raw text!');
} else {
  console.error('FAIL: Could not locate Kanban tab buttons in DOM!');
  process.exit(1);
}

console.log('ALL PRODUCTION AUDIT CHECKS PASSED!');
