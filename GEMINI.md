# GEMINI.md — BaaoDash Project Guide & System Rules

This document serves as the single source of truth for the **BaaoDash** (and future regional **RinconaDash**) codebase, business model, operational rules, and development standards. All agents, contributors, and automated workflows must strictly adhere to these instructions.

---

## 1. Project Overview & Strategic Identity

- **Platform Name:** BaaoDash (*Regional Expansion:* RinconaDash)
- **Target Market:** Municipality of Baao, Camarines Sur, Philippines + 5th Congressional District (Rinconada: Nabua, Iriga City, Bula, Bato, Buhi)
- **Platform Type:** Hyperlocal on-demand delivery marketplace and micro-logistics platform.
- **Core Philosophy:**
  - **Provincial Realities $\ne$ Metro Manila:** Major platforms (Grab, Foodpanda, Lalamove) charge 25%–30% commissions and high minimum fees (₱60–₱100) that fail in 4th-class rural municipalities. BaaoDash operates on direct merchant pricing (0% food markup to customer/merchant) and flat, predictable delivery fees.
  - **Multi-Modal Vehicle Fleet:** Integrates traditional pedicab operators (₱20–₱25 micro-tier) alongside independent motorcycle couriers (₱50–₱70 standard, ₱100 outer zone).
  - **Commercial Anchor:** **LJK Consumer Goods Trading** (founder's operational ice manufacturing & distribution enterprise). Provides immediate day-1 baseline delivery volume, proof of rural willingness-to-pay, and early-morning B2B route batching ("Milk Runs").

---

## 2. Repository Sitemap & File Structure

```
d:/Antigravity/BaaoLocalDelivery/
├── GEMINI.md                               # This authoritative project manual & rules
├── BaaoDash_MVP_Prototype.html            # Primary Interactive 5-Phone Simulator & Multi-Device Harness
├── BaaoDash_PWA.html                      # Production Progressive Web App (PWA) for all browsers & devices
├── app.html                               # Standalone PWA Alias & Vercel Root Route
├── manifest.webmanifest                   # W3C PWA Manifest with icons, theme colors & shortcuts
├── sw.js                                  # Service Worker (offline cache, push events, background sync)
├── BaaoDash_Onboarding_Demo.html           # Multi-Persona Onboarding Mobile UI Demo (Customer, Merchant, Rider)
├── BaaoDash_Brand_Identity.html            # Comprehensive Brand Identity & 20 Master Mockups Portal
├── BaaoDash_Brand_Identity_Manual.md       # Authoritative Brand Guidelines & Regional Architecture Manual
├── BaaoDash_Business_Specification.md      # 1,000+ line master operational blueprint & financial model
├── BaaoDash_Business_Model_Infographic.html# Interactive visual infographic of business model & unit economics
├── BaaoDash_Poster_Concept.jpg             # High-resolution marketing & brand concept poster
├── assets/brand/                           # Vector SVG Brand Assets & 21-icon unified sprite
│   ├── logo-primary.svg                   # Primary full-color horizontal logo
│   ├── logo-stacked.svg                   # Stacked centered brand lockup
│   ├── logo-symbol.svg                    # Standalone 24px-512px icon mark
│   ├── logo-monochrome.svg                # 100% K Black monochrome version
│   ├── logo-reverse.svg                   # Reverse white on dark version
│   ├── logo-rinconadash.svg               # Regional expansion master logo
│   └── icons-sprite.svg                   # 21 consistent vector brand icons
└── tests/                                  # Automated regression & integration test suite
    ├── test_production_audit.js            # Prohibited label & clean UI audit
    ├── test_ui.js                          # Compiles JS & verifies 23 critical DOM IDs
    ├── test_ljk_logic.js                   # LJK single-product & tiered wholesale/retail pricing audit
    ├── test_directory.js                   # Grab-style merchant directory & filter tests
    ├── test_multi_phone_lifecycle.js       # 5-phone simultaneous real-time state propagation test
    ├── test_autofit.js                     # Viewport scaling & responsive auto-fit test
    ├── test_onboarding_audit.js            # Multi-persona onboarding verification & audit test
    ├── test_brand_identity.js              # Comprehensive brand identity, 20 mockups & SVG audit test
    └── test_pwa_audit.js                   # Standalone PWA manifest, service worker & cross-device audit
```

---

## 3. Strict Business Logic & Domain Rules (CRITICAL)

The following rules have zero tolerance for violations:

### A. Strict Exclusion Policy
- **Zero "Plastic bag" & Zero "Net sales"**: Never introduce "Plastic bag" or "Net sales" anywhere in the UI, code, data structures, receipt breakdowns, or tests.

### B. LJK Consumer Goods Trading Product Policy
- **Single Product Constraint:** The **only** available product under LJK Consumer Goods Trading is **Ice Cubes**. Do not add tubes, crushed ice, blocks, plastic bags, or other items.
- **Tiered Wholesale / Retail Pricing Logic:**
  - **Retail Tier (< 5 kg):** ₱10.00 / kg
  - **Wholesale Tier ($\ge$ 5 kg):** ₱9.00 / kg
  - Only this Price/KG calculation logic applies.

### C. MVP Service Scope Boundaries
- **Service A — Padala / Package Courier (Priority 1):** Point-to-point parcel delivery where the sender already has the item. Zero food spoilage risk, zero inventory sync required.
- **Service B — Partnered Merchant Orders (Priority 2):** Food and retail orders from curated local merchants (Extraction Point, But First Coffee, LJK) with synchronized kitchen prep timers.
- **Service C — Pabili / Personal Shopping:** **Strictly deferred to V2**. Prohibited during MVP to eliminate rider cash advances (*abono*), receipt disputes, item substitution confusion, and ghost-order fraud.

### D. Hyperlocal 3-Tier Addressing System
Addresses in rural Baao cannot rely on standard GPS house numbers. All orders require:
- **Tier 1 (Barangay):** Determines fare zone (Poblacion = ₱50 base; San Vicente, San Nicolas, San Juan, Agdangan, Sagrada = ₱70 standard; Antipolo = ₱100 outer perimeter).
- **Tier 2 (Purok / Sitio / Street):** Micro-locality (e.g., *Purok 3 - Maligaya*).
- **Tier 3 (Landmark / Visual House Detail):** Landmarks and gate descriptions (e.g., *Tapat ng tindahan ni Aling Cora, may green gate*).

### E. Financial & Payment Architecture
- **Cash on Delivery (COD):** Primary payment channel.
- **Direct Merchant GCash:** Customer pays merchant directly via QR code on delivery.
- **Prepaid Driver Float:** Couriers maintain a digital float (initial ₱150.00). Upon order completion, the platform fee (₱12.00) auto-deducts from the rider's float, eliminating manual driver remittances.

---

## 4. UI/UX Design & Multi-Phone Simulator Guidelines

### 4-Phone Synchronized Operational Architecture
The simulator renders 4 authentic mobile phone device shells side-by-side inside `.quad-stage` and `.quad-scaler`:
1. **Phone 1 (`#col-customer`):** Customer App (Directory, Store Menus, Padala Form, 5-Stage Stepper, In-phone Drawer Cart).
2. **Phone 2 (`#col-merchant`):** Kitchen Console (Store switcher dropdown, 3-stage Kanban with badge pills, 86 Stock toggles).
3. **Phone 3 (`#col-rider`):** Rider App (Duty toggle, Float card, Available jobs feed, Active route HUD, Proof modal).
4. **Phone 4 (`#col-admin`):** Central Dispatcher Tower (2x2 telemetry tiles, B2B milk run route trigger, Pedicab SMS modal, Master deliveries queue).

### UI Polish & Minimalism Standards
- **Authentic Commercial Look:** Never show prototype labels like `"0% Commission"`, `"0% Markup"`, `"Live Auditing"`, `"Hub Auditing"`, `"4-Phone Real-Time MVP"`. Use production terminology: `"Direct Store Pricing"`, `"Fast Local Delivery"`, `"Hub Active"`, `"Master Deliveries Queue"`.
- **Customer Navigation:** Strictly 3 production tabs in the mobile bottom bar: `🏪 Stores`, `📦 Padala`, `📍 Tracker`. No prototype role-switching buttons.
- **Customer Header:** Minimalist location pill (`📍 Poblacion, Baao`) and brand icon (`⚡ BaaoDash`). No dropdown role selectors.
- **Kitchen Store Switcher:** Must use `<select id="kitchen-merchant-select">` with live dynamic order counters.
- **Zero Tab Text Overflow:** Kanban tab headers must use `.segmented-tabs` and `.tab-badge` pills (`Incoming`, `Preparing`, `Dispatched`). Never use raw strings like `📥 Incoming (0)` that wrap and break phone layouts.
- **Responsive Auto-Fit:** The top harness provides `⚡ Auto-Fit` zoom (`setQuadZoom('auto')`) dynamically scaling the quad layout via CSS transform matrix to fit any screen resolution without clipping.

---

## 5. Critical DOM Elements (Do Not Rename or Remove)

The automated test suite verifies 23 critical DOM IDs that must be preserved:

| DOM ID | Component / Purpose |
|---|---|
| `cust-cafe-avatar` | Merchant Store Avatar in Customer View |
| `cust-cafe-title` | Merchant Store Title |
| `cust-cafe-tagline` | Merchant Tagline / Description |
| `cust-cafe-rating` | Merchant Review Rating Pill |
| `cust-cafe-prep` | Merchant Prep Duration Estimate |
| `cust-cafe-location` | Merchant Physical Location |
| `menu-catalog-grid` | Catalog Container for Store Menu Items |
| `cust-menu-footer-card` | Customer Catalog Footer Action Card |
| `floating-cart` | Slide-Up Floating Cart Bar |
| `floating-cart-qty` | Floating Cart Item Quantity Badge |
| `floating-cart-val` | Floating Cart Total Amount Value |
| `floating-cart-store` | Floating Cart Associated Store Name |
| `checkout-sheet-modal` | Slide-Up Checkout Drawer Modal |
| `checkout-items-list` | Container for Items inside Checkout Drawer |
| `btn-submit-cafe-order` | Place Cafe Order Submission CTA Button |
| `rider-active-job-box` | Active Delivery Route HUD in Rider View |
| `rider-job-pickup` | Step 1 Pickup Location Label |
| `rider-job-dropoff` | Step 2 Dropoff Destination Label |
| `rider-job-cod` | Cash on Delivery Collection Amount |
| `admin-stat-completed` | Total Completed Deliveries Metric Tile |
| `admin-stat-gross` | Total Gross Delivery Volume Metric Tile |
| `admin-stat-drivers` | Total Driver Payouts Metric Tile |
| `admin-stat-margin` | Net Platform Margin Metric Tile |

---

## 6. Technical Stack & Development Guidelines

- **Architecture:** Zero-build portable single-file web application (`BaaoDash_MVP_Prototype.html`).
- **Core Technologies:** HTML5, modern CSS3 (Flexbox, CSS Grid, Custom Properties, Backdrop Filters), Vanilla ES6+ JavaScript.
- **Audio Feedback:** Synthesized web audio via `AudioContext` (`playChime(freq1, freq2)`) — zero external MP3 dependencies.
- **Visual Feedback:** CSS keyframe pulse animations on phone frames (`pulsePhone(phoneId)`).
- **State Engine:** Central reactive `state` object:
  ```javascript
  const state = {
    role: 'customer',
    customerTab: 'food',
    orders: [...],
    cart: [],
    rider: { name: 'Kuya Jun', isOnline: true, floatBalance: 150.00, activeOrderId: null },
    stats: { completedOrders: 0, grossVolume: 0, driverPayouts: 0, platformMargin: 0 }
  };
  ```
- **State Synchronization:** Triggered on all actions via `saveState()` $\to$ `renderOrders()`.

---

## 7. Testing & Verification Protocols

Always run the full test suite after making any modifications to ensure zero regressions:

```bash
# 1. Run production polish & UI minimalism audit
node tests/test_production_audit.js

# 2. Run critical DOM ID & JS compilation check
node tests/test_ui.js

# 3. Verify LJK single-product & tiered wholesale/retail pricing
node tests/test_ljk_logic.js

# 4. Verify Grab-style directory, search, & category filters
node tests/test_directory.js

# 5. Verify 4-phone simultaneous real-time state lifecycle
node tests/test_multi_phone_lifecycle.js

# 6. Verify responsive auto-fit viewport scaling
node tests/test_autofit.js

# 7. Verify multi-persona onboarding suite & clean UI
node tests/test_onboarding_audit.js

# 8. Verify comprehensive brand identity, 20 mockups & SVG vector assets
node tests/test_brand_identity.js

# 9. Verify standalone PWA manifest, service worker & cross-device responsive UI
node tests/test_pwa_audit.js
```

To run the full suite in a single command:
```powershell
node tests/test_production_audit.js; node tests/test_ui.js; node tests/test_ljk_logic.js; node tests/test_directory.js; node tests/test_multi_phone_lifecycle.js; node tests/test_autofit.js; node tests/test_onboarding_audit.js; node tests/test_brand_identity.js; node tests/test_pwa_audit.js
```

### Local Dev Server
Serve the app locally using Python or any static HTTP server:
```bash
python -m http.server 8085
# Navigate to: http://localhost:8085/BaaoDash_MVP_Prototype.html
# Standalone PWA: http://localhost:8085/BaaoDash_PWA.html
```
