const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('BaaoDash_MVP_Prototype.html', 'utf8');

// 1. Verify critical DOM elements for Grab-style directory
const requiredElements = [
  'cust-merchants-home',
  'cust-merchant-detail',
  'home-merchant-search',
  'home-category-chips',
  'home-count-all',
  'home-count-cafe',
  'home-count-ice',
  'merchants-feed-heading',
  'merchants-feed-count',
  'merchants-list-container',
  'merchant-card-extraction',
  'merchant-card-butfirst',
  'merchant-card-ljk',
  'detail-store-status-pill',
  'cafe-banner-card',
  'menu-catalog-grid'
];

let missing = [];
for (const id of [
  'cust-merchants-home',
  'cust-merchant-detail',
  'home-merchant-search',
  'home-category-chips',
  'merchants-list-container'
]) {
  if (!html.includes(`id="${id}"`)) {
    missing.push(id);
  }
}

if (missing.length > 0) {
  console.error('FAIL: Missing directory DOM containers:', missing);
  process.exit(1);
}
console.log('PASS: Grab-style homepage and store detail DOM containers verified!');

// Verify back button with backToMerchantsHome()
if (!html.includes('backToMerchantsHome()')) {
  console.error('FAIL: backToMerchantsHome() not found in HTML!');
  process.exit(1);
}
console.log('PASS: backToMerchantsHome() verified in HTML!');

// Verify bottom nav Stores tab
if (!html.includes('handleCustomerNavFood()') || !html.includes('Stores')) {
  console.error('FAIL: Stores nav button or handleCustomerNavFood() missing!');
  process.exit(1);
}
console.log('PASS: Bottom nav Stores button verified!');

// 2. Mock DOM & Execute Script
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/i);
if (!scriptMatch) {
  console.error('FAIL: Script block not found!');
  process.exit(1);
}

const domElements = {
  'cust-food-section': { style: { display: 'block' } },
  'cust-padala-section': { style: { display: 'none' } },
  'cust-orders-section': { style: { display: 'none' } },
  'cust-merchants-home': { style: { display: 'block' } },
  'cust-merchant-detail': { style: { display: 'none' } },
  'merchants-list-container': { innerHTML: '' },
  'home-count-all': { innerText: '' },
  'home-count-cafe': { innerText: '' },
  'home-count-ice': { innerText: '' },
  'merchants-feed-count': { innerText: '' },
  'detail-store-status-pill': { innerText: '' },
  'menu-catalog-grid': { innerHTML: '' },
  'cust-cafe-title': { innerHTML: '', style: {} },
  'cust-cafe-tagline': { innerText: '' },
  'cust-cafe-avatar': { innerText: '', style: {} },
  'cust-cafe-rating': { innerText: '' },
  'cust-cafe-prep': { innerText: '' },
  'cust-cafe-location': { innerText: '' },
  'cafe-banner-card': { style: {} },
  'toast': { classList: { add: () => {}, remove: () => {} } },
  'toast-msg': { innerText: '' },
  'toast-icon': { innerText: '' },
  'floating-cart': { classList: { add: () => {}, remove: () => {} } },
  'cart-item-count': { innerText: '' },
  'cust-food-subtotal': { innerText: '' },
  'cust-food-delivery-fee': { innerText: '' },
  'cust-food-total': { innerText: '' },
  'cust-food-barangay': { value: 'Poblacion' },
  'nav-btn-food': { classList: { toggle: () => {}, add: () => {}, remove: () => {} } },
  'nav-btn-padala': { classList: { toggle: () => {}, add: () => {}, remove: () => {} } },
  'nav-btn-orders': { classList: { toggle: () => {}, add: () => {}, remove: () => {} } },
  'nav-btn-roles': { classList: { remove: () => {}, add: () => {} } },
  'home-merchant-search': { value: '' },
  'home-category-chips': { querySelectorAll: () => [] }
};

const sandbox = {
  console: console,
  document: {
    getElementById: (id) => domElements[id] || { classList: { add: () => {}, remove: () => {}, toggle: () => {} }, style: {}, innerText: '', innerHTML: '' },
    querySelectorAll: (sel) => [],
    querySelector: (sel) => ({ scrollTop: 0 })
  },
  window: {
    addEventListener: () => {}
  },
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  }
};

vm.createContext(sandbox);
vm.runInContext(scriptMatch[1], sandbox);

// 3. Test renderMerchantsDirectory
const renderMerchantsDirectory = vm.runInContext('renderMerchantsDirectory', sandbox);
renderMerchantsDirectory();

const container = domElements['merchants-list-container'];
if (!container.innerHTML.includes('Extraction Point') || !container.innerHTML.includes('But First Coffee') || !container.innerHTML.includes('LJK Consumer Goods Trading')) {
  console.error('FAIL: renderMerchantsDirectory did not render all 3 merchants!');
  process.exit(1);
}
console.log('PASS: renderMerchantsDirectory rendered all 3 merchants!');

// 4. Test Category Filtering
const filterMerchantsCategory = vm.runInContext('filterMerchantsCategory', sandbox);

filterMerchantsCategory('cafe');
if (!container.innerHTML.includes('Extraction Point') || !container.innerHTML.includes('But First Coffee') || container.innerHTML.includes('LJK Consumer Goods Trading')) {
  console.error('FAIL: filterMerchantsCategory("cafe") failed to filter out LJK!');
  process.exit(1);
}
console.log('PASS: Category filter "cafe" correctly returned 2 cafes and excluded ice depot!');

filterMerchantsCategory('ice');
if (container.innerHTML.includes('Extraction Point') || !container.innerHTML.includes('LJK Consumer Goods Trading')) {
  console.error('FAIL: filterMerchantsCategory("ice") failed to isolate LJK!');
  process.exit(1);
}
console.log('PASS: Category filter "ice" correctly isolated LJK!');

filterMerchantsCategory('all');
if (!container.innerHTML.includes('Extraction Point') || !container.innerHTML.includes('LJK Consumer Goods Trading')) {
  console.error('FAIL: filterMerchantsCategory("all") failed to restore all merchants!');
  process.exit(1);
}
console.log('PASS: Category filter "all" correctly restored full directory!');

// 5. Test Search Filtering (deep search into products like 'Spanish Latte' or 'Waffle')
const filterMerchantsSearch = vm.runInContext('filterMerchantsSearch', sandbox);

filterMerchantsSearch('waffle');
if (container.innerHTML.includes('Extraction Point') || !container.innerHTML.includes('But First Coffee')) {
  console.error('FAIL: Search for "waffle" failed to match But First Coffee!');
  process.exit(1);
}
console.log('PASS: Search query "waffle" matched But First Coffee via menu item tags!');

filterMerchantsSearch('ice');
if (!container.innerHTML.includes('LJK Consumer Goods Trading')) {
  console.error('FAIL: Search for "ice" failed to match LJK!');
  process.exit(1);
}
console.log('PASS: Search query "ice" matched LJK Consumer Goods Trading!');

filterMerchantsSearch(''); // reset search

// 6. Test Store Drilldown and Back Navigation
const openMerchantStore = vm.runInContext('openMerchantStore', sandbox);
const backToMerchantsHome = vm.runInContext('backToMerchantsHome', sandbox);

openMerchantStore('butfirst');
if (domElements['cust-merchants-home'].style.display !== 'none' || domElements['cust-merchant-detail'].style.display !== 'block') {
  console.error('FAIL: openMerchantStore did not hide home and show detail view!');
  process.exit(1);
}
console.log('PASS: openMerchantStore successfully switched to Store Detail View!');

backToMerchantsHome();
if (domElements['cust-merchants-home'].style.display !== 'block' || domElements['cust-merchant-detail'].style.display !== 'none') {
  console.error('FAIL: backToMerchantsHome did not return to Homepage Directory!');
  process.exit(1);
}
console.log('PASS: backToMerchantsHome successfully returned to Homepage Directory!');

console.log('ALL DIRECTORY WORKFLOW TESTS PASSED PERFECTLY!');
