const fs = require('fs');
const html = fs.readFileSync('BaaoDash_MVP_Prototype.html', 'utf8');

// Ensure no plastic bag or net sales on the app figures
if (/Plastic bag/i.test(html)) {
  console.error("FAIL: 'Plastic bag' found in HTML!");
  process.exit(1);
} else {
  console.log("PASS: Strictly verified NO 'Plastic bag' present in application!");
}

if (/Net sales/i.test(html)) {
  console.error("FAIL: 'Net sales' found in HTML!");
  process.exit(1);
} else {
  console.log("PASS: Strictly verified NO 'Net sales' present in application!");
}

// Check LJK merchant definition
if (!html.includes("'ljk'") && !html.includes('"ljk"')) {
  console.error("FAIL: 'ljk' key not found in HTML!");
  process.exit(1);
}

if (!html.includes('LJK Consumer Goods Trading')) {
  console.error("FAIL: 'LJK Consumer Goods Trading' merchant name not found!");
  process.exit(1);
} else {
  console.log("PASS: 'LJK Consumer Goods Trading' merchant verified present!");
}

// Extract script and verify runtime calculations
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/i);
if (!scriptMatch) {
  console.error('No script found!');
  process.exit(1);
}

const scriptCode = scriptMatch[1];
const sandbox = {
  console: console,
  document: {
    getElementById: () => ({
      classList: { add: () => {}, remove: () => {}, toggle: () => {} },
      style: {},
      value: 'Poblacion',
      innerText: '',
      innerHTML: ''
    }),
    querySelectorAll: () => []
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

try {
  const vm = require('vm');
  vm.createContext(sandbox);
  vm.runInContext(scriptCode, sandbox);

  // In Node vm, block-scoped const at top level is accessed via vm expression:
  const ljk = vm.runInContext('MERCHANTS.ljk', sandbox);
  if (!ljk) throw new Error("MERCHANTS.ljk is undefined");
  console.log("PASS: MERCHANTS.ljk loaded with " + ljk.menu.length + " products");

  if (ljk.menu.length !== 1) {
    throw new Error(`Expected exactly 1 product under LJK, found ${ljk.menu.length}`);
  }
  console.log("PASS: Exactly 1 product available under LJK Consumer Goods Trading!");

  const iceCubesItem = ljk.menu[0];
  if (iceCubesItem.id !== 'ljk_ice_cubes' || iceCubesItem.name !== 'Ice Cubes') {
    throw new Error(`Expected 'Ice Cubes' (ljk_ice_cubes), found ${iceCubesItem.name} (${iceCubesItem.id})`);
  }
  console.log("PASS: Only product is verified as 'Ice Cubes'!");

  // Verify Price/KG logic: <5kg @ ₱10/kg, >=5kg @ ₱9/kg
  const getItemPrice = vm.runInContext('getItemPrice', sandbox);
  const getItemLineTotal = vm.runInContext('getItemLineTotal', sandbox);

  const price4kg = getItemPrice(iceCubesItem, 4);
  const total4kg = getItemLineTotal(iceCubesItem, 4);
  if (price4kg !== 10.00 || total4kg !== 40.00) {
    throw new Error(`4kg test failed: price=${price4kg}, total=${total4kg} (expected 10.00 and 40.00)`);
  }
  console.log(`PASS: 4kg Retail Tier verified: ₱${price4kg.toFixed(2)}/kg -> Total ₱${total4kg.toFixed(2)}`);

  const price5kg = getItemPrice(iceCubesItem, 5);
  const total5kg = getItemLineTotal(iceCubesItem, 5);
  if (price5kg !== 9.00 || total5kg !== 45.00) {
    throw new Error(`5kg test failed: price=${price5kg}, total=${total5kg} (expected 9.00 and 45.00)`);
  }
  console.log(`PASS: 5kg Wholesale Tier verified: ₱${price5kg.toFixed(2)}/kg -> Total ₱${total5kg.toFixed(2)}`);

  const price20kg = getItemPrice(iceCubesItem, 20);
  const total20kg = getItemLineTotal(iceCubesItem, 20);
  if (price20kg !== 9.00 || total20kg !== 180.00) {
    throw new Error(`20kg test failed: price=${price20kg}, total=${total20kg} (expected 9.00 and 180.00)`);
  }
  console.log(`PASS: 20kg Wholesale Tier verified: ₱${price20kg.toFixed(2)}/kg -> Total ₱${total20kg.toFixed(2)}`);

  console.log("ALL LOGIC AND INTEGRATION TESTS PASSED!");
} catch (err) {
  console.error("FAIL:", err);
  process.exit(1);
}
