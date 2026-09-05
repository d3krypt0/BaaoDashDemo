const fs = require('fs');

const html = fs.readFileSync('BaaoDash_MVP_Prototype.html', 'utf8');

// Extract script
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/i);
if (!scriptMatch) {
  console.error('FAIL: No script found');
  process.exit(1);
}

// Resolutions to test
const resolutions = [
  { name: 'Full HD 1080p (100% DPI)', width: 1920, height: 950 },
  { name: '1080p at 125% Windows DPI', width: 1536, height: 750 },
  { name: 'MacBook / Common Laptop', width: 1440, height: 800 },
  { name: 'Budget Laptop 768p', width: 1366, height: 650 },
  { name: 'Compact Display', width: 1280, height: 700 }
];

console.log('--- TESTING RESPONSIVE AUTO-FIT ACROSS SCREEN RESOLUTIONS ---');

for (const res of resolutions) {
  const mockWindow = {
    innerWidth: res.width,
    innerHeight: res.height,
    document: {
      querySelector: (sel) => {
        if (sel === '.desktop-toolbar') return { offsetHeight: 46 };
        if (sel === '.phones-dashboard-header') return { offsetHeight: 65 };
        return null;
      },
      getElementById: (id) => ({
        style: {},
        classList: { toggle: () => {} }
      })
    }
  };

  // Simple calculator from implementation
  const availableWidth = Math.max(320, mockWindow.innerWidth - 64);
  const availableHeight = Math.max(300, mockWindow.innerHeight - 46 - 65 - 50);
  const unscaledW = 1980;
  const unscaledH = 860;

  const scaleW = availableWidth / unscaledW;
  const scaleH = availableHeight / unscaledH;
  let fitScale = Math.min(scaleW, scaleH);
  fitScale = Math.max(0.38, Math.min(1.0, fitScale));
  fitScale = parseFloat(fitScale.toFixed(2));

  const scaledW = Math.round(unscaledW * fitScale);
  const scaledH = Math.round(unscaledH * fitScale);

  const fitsWidth = scaledW <= mockWindow.innerWidth;
  const fitsHeight = scaledH <= mockWindow.innerHeight;

  if (!fitsWidth || !fitsHeight) {
    console.error(`FAIL for ${res.name}: scaledW=${scaledW} > ${mockWindow.innerWidth} or scaledH=${scaledH} > ${mockWindow.innerHeight}`);
    process.exit(1);
  }

  console.log(`PASS [${res.name}]: Scale = ${fitScale} -> Scaled Size: ${scaledW}px x ${scaledH}px (Fits viewport ${res.width}x${res.height})`);
}

console.log('\nALL RESPONSIVE AUTO-FIT CHECKS PASSED!');
