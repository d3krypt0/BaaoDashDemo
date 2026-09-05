const fs = require('fs');
const html = fs.readFileSync('BaaoDash_MVP_Prototype.html', 'utf8');

const requiredIds = [
  'cust-cafe-avatar', 'cust-cafe-title', 'cust-cafe-tagline', 'cust-cafe-rating',
  'cust-cafe-prep', 'cust-cafe-location', 'menu-catalog-grid', 'cust-menu-footer-card',
  'floating-cart', 'floating-cart-qty', 'floating-cart-val', 'floating-cart-store',
  'checkout-sheet-modal', 'checkout-items-list', 'btn-submit-cafe-order',
  'rider-active-job-box', 'rider-job-pickup', 'rider-job-dropoff', 'rider-job-cod',
  'admin-stat-completed', 'admin-stat-gross', 'admin-stat-drivers', 'admin-stat-margin'
];

let missing = [];
for (const id of requiredIds) {
  if (!html.includes('id="' + id + '"') && !html.includes("id='" + id + "'")) {
    missing.push(id);
  }
}

if (missing.length > 0) {
  console.error('Missing IDs:', missing);
  process.exit(1);
} else {
  console.log('PASS: All ' + requiredIds.length + ' critical DOM IDs verified present!');
}

// Extract script
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/i);
if (!scriptMatch) {
  console.error('No script found!');
  process.exit(1);
}

// Compile script
try {
  new Function(scriptMatch[1]);
  console.log('PASS: JavaScript script block compiled cleanly with 0 syntax errors!');
} catch (e) {
  console.error('FAIL: Script syntax error:', e);
  process.exit(1);
}
