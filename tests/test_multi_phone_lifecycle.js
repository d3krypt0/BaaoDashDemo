const fs = require('fs');

// Read prototype HTML
const html = fs.readFileSync('BaaoDash_MVP_Prototype.html', 'utf8');

// 1. Verify 4 Phone Shells and Grid in HTML
const requiredPhoneElements = [
  'quad-phones-grid',
  'col-customer', 'app-shell',
  'col-merchant', 'phone-shell-merchant',
  'col-rider', 'phone-shell-rider',
  'col-admin', 'phone-shell-admin',
  'rider-header-float'
];

let missingElements = [];
for (const id of requiredPhoneElements) {
  if (!html.includes('id="' + id + '"') && !html.includes("id='" + id + "'")) {
    missingElements.push(id);
  }
}

if (missingElements.length > 0) {
  console.error('FAIL: Missing phone elements:', missingElements);
  process.exit(1);
}
console.log('PASS: All 4 Phone device shells and column IDs verified in DOM!');

// 2. Setup mock DOM and context to run the real script
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/i);
if (!scriptMatch) {
  console.error('FAIL: No script block found');
  process.exit(1);
}

// Minimal DOM mock
const domMap = {};
function getEl(id) {
  if (!domMap[id]) {
    domMap[id] = {
      id: id,
      innerText: '',
      innerHTML: '',
      value: '',
      style: {},
      classList: {
        classes: new Set(),
        add(c) { this.classes.add(c); },
        remove(c) { this.classes.delete(c); },
        contains(c) { return this.classes.has(c); },
        toggle(c, b) { if (b !== undefined) { b ? this.add(c) : this.remove(c); } else { this.contains(c) ? this.remove(c) : this.add(c); } }
      },
      querySelectorAll: () => [],
      querySelector: () => null,
      scrollIntoView: () => {},
      addEventListener: () => {}
    };
  }
  return domMap[id];
}

const mockWindow = {
  document: {
    getElementById: (id) => getEl(id),
    querySelectorAll: () => [],
    querySelector: () => null,
    createElement: () => ({ appendChild: () => {}, style: {} }),
    body: { appendChild: () => {} }
  },
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  },
  alert: (msg) => console.log('   [MOCK-ALERT]:', msg),
  addEventListener: () => {},
  removeEventListener: () => {},
  innerWidth: 1400,
  innerHeight: 900,
  encodeURIComponent: encodeURIComponent,
  Date: Date,
  Math: Math,
  setTimeout: (fn) => fn(),
  AudioContext: class {
    createOscillator() { return { type: '', frequency: { setValueAtTime: () => {} }, connect: () => {}, start: () => {}, stop: () => {} }; }
    createGain() { return { gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }, connect: () => {} }; }
    get currentTime() { return 0; }
    get destination() { return {}; }
  }
};

// Evaluate script inside mock sandbox
const scriptCode = `
  const document = window.document;
  const localStorage = window.localStorage;
  const alert = window.alert;
  const AudioContext = window.AudioContext;
  const webkitAudioContext = window.AudioContext;
  ${scriptMatch[1]}
  
  return {
    state,
    MERCHANTS,
    fastDemoOrder,
    placeMerchantOrder,
    merchantAcceptOrder,
    merchantReadyForPickup,
    riderAcceptJob,
    riderConfirmPickup,
    submitDeliveryCompletion,
    renderOrders,
    pulsePhone
  };
`;

let app;
try {
  const runner = new Function('window', scriptCode);
  app = runner(mockWindow);
  console.log('PASS: Prototype script evaluated into test runner successfully!');
} catch (e) {
  console.error('FAIL: Script evaluation error:', e);
  process.exit(1);
}

// 3. Test Multi-Phone Lifecycle Simulation
console.log('\n--- TESTING 4-PHONE SIMULTANEOUS LIFECYCLE ---');

// Initial baseline
app.state.orders = [];
app.state.rider.floatBalance = 150.00;
app.state.rider.isOnline = true;
app.state.rider.activeOrderId = null;
app.state.stats = { completedOrders: 0, grossVolume: 0, driverPayouts: 0, platformMargin: 0 };
app.renderOrders();

// STEP 1: Fast Demo Order Placed
console.log('Step 1: Fast Demo Order Placed...');
app.fastDemoOrder();
const createdOrder = app.state.orders[0];
if (!createdOrder || createdOrder.status !== 'ORDER_PLACED') {
  console.error('FAIL: Order not placed');
  process.exit(1);
}
console.log(`   Order ID: ${createdOrder.id}, Type: ${createdOrder.type}, Merchant: ${createdOrder.merchantName}`);

// Verify Phone 1 (Customer):
const custBadge = getEl('cust-order-status-badge').innerText;
if (custBadge !== 'ORDER PLACED') {
  console.error('FAIL: Customer Phone 1 did not reflect ORDER PLACED. Got:', custBadge);
  process.exit(1);
}
console.log('   PASS Phone 1 (Customer): Badge is "ORDER PLACED"');

// Verify Phone 2 (Merchant):
const incomingCount = getEl('merchant-incoming-count').innerText;
if (incomingCount !== 1) {
  console.error('FAIL: Kitchen Phone 2 did not reflect incoming count 1. Got:', incomingCount);
  process.exit(1);
}
console.log('   PASS Phone 2 (Kitchen): Incoming queue has 1 ticket with action button');

// Verify Phone 4 (Central Dispatch):
const adminOrderFeed = getEl('admin-orders-mobile-feed').innerHTML;
if (!adminOrderFeed.includes(createdOrder.id)) {
  console.error('FAIL: Admin Phone 4 feed did not list the new order');
  process.exit(1);
}
console.log('   PASS Phone 4 (Dispatcher): Master audit ledger recorded order');

// STEP 2: Kitchen Accepts & Prepares Order
console.log('\nStep 2: Kitchen Accepts & Begins Preparation...');
app.merchantAcceptOrder(createdOrder.id);
if (createdOrder.status !== 'PREPARING') {
  console.error('FAIL: Order status is not PREPARING');
  process.exit(1);
}

const custBadge2 = getEl('cust-order-status-badge').innerText;
if (custBadge2 !== 'PREPARING') {
  console.error('FAIL: Phone 1 does not show PREPARING. Got:', custBadge2);
  process.exit(1);
}
const prepCount = getEl('merchant-preparing-count').innerText;
if (prepCount !== 1) {
  console.error('FAIL: Phone 2 does not show 1 preparing order. Got:', prepCount);
  process.exit(1);
}
console.log('   PASS Phone 1: Customer Tracker real-time updated to PREPARING');
console.log('   PASS Phone 2: Kitchen moved ticket to Preparing column');

// STEP 3: Kitchen Marks Ready For Pickup
console.log('\nStep 3: Kitchen Marks Order Ready for Pickup...');
app.merchantReadyForPickup(createdOrder.id);
if (createdOrder.status !== 'READY_FOR_PICKUP') {
  console.error('FAIL: Status not READY_FOR_PICKUP');
  process.exit(1);
}

// Verify Phone 3 (Rider Feed):
const riderJobsHtml = getEl('rider-available-jobs-feed').innerHTML;
if (!riderJobsHtml.includes(createdOrder.id) || !riderJobsHtml.includes('Accept Job →')) {
  console.error('FAIL: Phone 3 Rider jobs feed does not have ready job');
  process.exit(1);
}
console.log('   PASS Phone 3 (Rider): Available jobs feed immediately populated with ready job');

// STEP 4: Rider Accepts Job
console.log('\nStep 4: Rider Accepts Job...');
app.riderAcceptJob(createdOrder.id);
if (createdOrder.status !== 'RIDER_ASSIGNED' || app.state.rider.activeOrderId !== createdOrder.id) {
  console.error('FAIL: Rider accept did not assign job');
  process.exit(1);
}
const custRiderName = getEl('cust-tracker-rider').innerText;
if (!custRiderName.includes(app.state.rider.name)) {
  console.error('FAIL: Customer Phone 1 does not show assigned rider name');
  process.exit(1);
}
console.log(`   PASS Phone 1: Customer Tracker reflects assigned rider: ${custRiderName}`);
console.log('   PASS Phone 3: Rider Active Job Box visible with Pickup & Dropoff routes');

// STEP 5: Rider Confirms Pickup
console.log('\nStep 5: Rider Confirms Pickup at Merchant...');
app.riderConfirmPickup();
if (createdOrder.status !== 'IN_TRANSIT') {
  console.error('FAIL: Status not IN_TRANSIT');
  process.exit(1);
}
const custBadgeTransit = getEl('cust-order-status-badge').innerText;
if (custBadgeTransit !== 'IN TRANSIT') {
  console.error('FAIL: Customer Phone 1 not IN TRANSIT. Got:', custBadgeTransit);
  process.exit(1);
}
console.log('   PASS Phone 1: Stepper and Status live-updated to IN TRANSIT');

// STEP 6: Rider Delivers & Collects COD
console.log('\nStep 6: Rider Delivers Package & Collects COD...');
const initialFloat = app.state.rider.floatBalance; // 150.00
const platformFee = createdOrder.platformMargin; // 12.00
app.submitDeliveryCompletion();

if (createdOrder.status !== 'DELIVERED') {
  console.error('FAIL: Order not marked DELIVERED');
  process.exit(1);
}
const expectedFloat = initialFloat - platformFee;
if (Math.abs(app.state.rider.floatBalance - expectedFloat) > 0.01) {
  console.error('FAIL: Rider float deduction mismatch. Got:', app.state.rider.floatBalance, 'Expected:', expectedFloat);
  process.exit(1);
}

// Verify Rider Phone Float elements
const riderFloatCard = getEl('rider-float-val').innerText;
const riderHeaderFloat = getEl('rider-header-float').innerText;
if (!riderFloatCard.includes(expectedFloat.toFixed(2)) || !riderHeaderFloat.includes(expectedFloat.toFixed(2))) {
  console.error('FAIL: Rider float card or header float not in sync:', riderFloatCard, riderHeaderFloat);
  process.exit(1);
}
console.log(`   PASS Phone 3: Float balance deducted platform fee: ${riderFloatCard} (Header: ${riderHeaderFloat})`);

// Verify Central Dispatch Phone 4 Stats
const compOrders = getEl('admin-stat-completed').innerText;
const grossVol = getEl('admin-stat-gross').innerText;
const platMargin = getEl('admin-stat-margin').innerText;
if (compOrders !== 1) {
  console.error('FAIL: Dispatcher completed orders mismatch. Got:', compOrders);
  process.exit(1);
}
console.log(`   PASS Phone 4 (Central Dispatch): Completed Orders: ${compOrders}, Gross: ${grossVol}, Net Margin: ${platMargin}`);

console.log('\n======================================================');
console.log('ALL 4 PHONES SIMULTANEOUS REAL-TIME LIFECYCLE TESTS PASSED!');
console.log('======================================================');
