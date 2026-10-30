// Captures the product screenshots used on the marketing site, from a demo copy of the clinic app.
//
//   npm run screenshots -w @daesthetics/site
//
// It starts a private MongoDB in a temp folder (port 27077), fills it with seed-demo.mjs, runs the API against it
// (port 5077) and drives the web app (port 3000) with Google Chrome. Your own database and API are never used:
// the web app keeps its usual settings, and the browser reroutes its API calls to the demo API.
// If apps/web is already running on port 3000 it is reused; otherwise it is started and stopped again.
//
// Needs mongod (on PATH, or MONGOD=/path/to/mongod) and Google Chrome (or CHROME_PATH=/path/to/chrome).
// The clinic is shown as "Lumen Health", a made-up name, by rewriting the page text before each capture.

import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const OUT = fileURLToPath(new URL('../public/screenshots/', import.meta.url));
const WEB_DIR = path.join(ROOT, 'apps/web');
const API_DIR = path.join(ROOT, 'apps/api');

const DB_PORT = 27077;
const API_PORT = 5077;
const WEB_PORT = 3000;
const WEB = `http://localhost:${WEB_PORT}`;
const DEMO_API = `http://localhost:${API_PORT}`;
const DB_URI = `mongodb://127.0.0.1:${DB_PORT}/clinic-demo`;

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

// ---------- Processes

const children = [];

function start(name, command, args, options = {}) {
  const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'], detached: true, ...options });
  child.log = '';
  const collect = (chunk) => {
    child.log = (child.log + chunk).slice(-20000);
  };
  child.stdout.on('data', collect);
  child.stderr.on('data', collect);
  child.on('exit', (code) => {
    if (code && !child.stopping) console.error(`${name} exited with code ${code}:\n${child.log.slice(-3000)}`);
  });
  children.push(child);
  return child;
}

function stopAll() {
  for (const child of children.reverse()) {
    child.stopping = true;
    try {
      process.kill(-child.pid, 'SIGTERM'); // the whole process group, e.g. next dev and its workers
    } catch {
      // Already gone.
    }
  }
}

function runNode(script, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script], { env, stdio: ['ignore', 'pipe', 'inherit'] });
    let output = '';
    child.stdout.on('data', (chunk) => {
      output += chunk;
    });
    child.on('exit', (code) => (code === 0 ? resolve(output) : reject(new Error(`${path.basename(script)} failed`))));
  });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function portInUse(port) {
  return new Promise((resolve) => {
    const socket = net.connect(port, '127.0.0.1');
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', () => resolve(false));
  });
}

async function waitFor(check, what, timeoutMs = 60000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await check().catch(() => false)) return;
    await sleep(500);
  }
  throw new Error(`Timed out waiting for ${what}`);
}

const isUp = async (url) => (await fetch(url)).ok;

// The API address apps/web calls, from its .env.local (same fallback as apps/web/lib/api.ts).
async function appApiOrigin() {
  const env = await readFile(path.join(WEB_DIR, '.env.local'), 'utf8').catch(() => '');
  const url = env.match(/^NEXT_PUBLIC_API_URL=(.+)$/m)?.[1]?.trim() || 'http://localhost:5050/api';
  return new URL(url).origin;
}

// ---------- Page helpers

// Shows the clinic as "Lumen Health" and hides dev-only overlays. Installed after the page has hydrated,
// so React never sees a mismatch; the observer keeps rewriting text React renders later.
function rebrand() {
  if (window.__rebranded) return;
  window.__rebranded = true;
  const swap = (text) =>
    text
      .replace(/d\.aesthetics/gi, (m) => (m === m.toUpperCase() ? 'LUMEN HEALTH' : 'Lumen Health'))
      .replace(/Laser \| Skin \| Hair \| Mind \| Body \| Soul/g, 'Dental | Physio | Skin | Family Medicine');
  const fix = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const next = swap(node.nodeValue);
      if (next !== node.nodeValue) node.nodeValue = next;
    } else {
      node.childNodes.forEach(fix);
    }
  };
  fix(document.documentElement);
  document.title = swap(document.title);
  new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'characterData') fix(m.target);
      m.addedNodes.forEach(fix);
    }
  }).observe(document.documentElement, { subtree: true, childList: true, characterData: true });

  const style = document.createElement('style');
  style.textContent = 'nextjs-portal, [data-sonner-toaster] { display: none !important; }';
  document.head.append(style);
}

async function settle(page, ready, extraWait = 500) {
  if (ready) await page.locator(ready).first().waitFor({ timeout: 60000 });
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForFunction(() => !/Loading|Checking available times/.test(document.body.innerText), null, { timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(rebrand);
  await sleep(extraWait);
}

async function open(page, url, ready, extraWait) {
  await page.goto(`${WEB}${url}`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await settle(page, ready, extraWait);
}

async function shoot(page, file, options = {}) {
  await page.screenshot({ path: path.join(OUT, file), ...options });
  console.log(`  ${file}`);
}

// ---------- Capture

async function capture(demo) {
  const appApi = await appApiOrigin();
  const login = await fetch(`${DEMO_API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(demo.admin),
  }).then((res) => res.json());
  if (!login.token) throw new Error(`Demo sign-in failed: ${JSON.stringify(login)}`);

  const browser = await chromium.launch(
    process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: 'chrome' }
  );

  async function newContext({ mobile = false, theme = 'light', scale } = {}) {
    const context = await browser.newContext({
      viewport: mobile ? MOBILE : DESKTOP,
      deviceScaleFactor: scale ?? (mobile ? 3 : 2),
      isMobile: mobile,
      hasTouch: mobile,
      locale: 'en-US',
      timezoneId: 'Asia/Karachi',
      colorScheme: theme,
      reducedMotion: 'reduce',
    });
    await context.addInitScript(
      ({ token, theme }) => {
        localStorage.setItem('hr-dashboard-token', token);
        localStorage.setItem('theme', theme);
      },
      { token: login.token, theme }
    );
    // Everything apps/web sends to its own API goes to the demo API instead.
    await context.route(
      (url) => url.origin === appApi && url.pathname.startsWith('/api/'),
      async (route) => {
        const response = await route.fetch({ url: route.request().url().replace(appApi, DEMO_API) });
        await route.fulfill({ response, headers: { ...response.headers(), 'access-control-allow-origin': WEB } });
      }
    );
    return context;
  }

  try {
    // Desktop, light
    const desktop = await newContext();
    const page = await desktop.newPage();
    await open(page, '/dashboard', 'text=Revenue vs Expenses', 2000); // the chart animates in
    await shoot(page, 'dashboard.png');
    await open(page, '/appointments?view=calendar', 'text=Passed, not marked', 1000);
    await shoot(page, 'calendar.png');
    await open(page, '/crm-leads', 'table tbody tr');
    await shoot(page, 'leads.png');
    await open(page, '/billing', 'text=INV-2026');
    await shoot(page, 'billing.png');
    await captureBillEditor(page);
    await open(page, '/services', 'text=Dental check-up');
    await shoot(page, 'services.png');
    await open(page, '/branches', 'text=Gulberg, Lahore');
    await shoot(page, 'branches.png');
    await open(page, '/team', 'text=Noor Fatima');
    await shoot(page, 'team.png');
    await open(page, '/roles', 'text=Receptionist');
    await shoot(page, 'roles.png');
    await open(page, `/clients/${demo.featuredClientId}`, 'text=INV-2026');
    await shoot(page, 'client.png');
    await desktop.close();

    // Desktop, dark
    const dark = await newContext({ theme: 'dark' });
    const darkPage = await dark.newPage();
    await open(darkPage, '/dashboard', 'text=Revenue vs Expenses', 2000);
    await shoot(darkPage, 'dashboard-dark.png');
    await dark.close();

    // The 80mm receipt
    const print = await newContext({ scale: 3 });
    const printPage = await print.newPage();
    await open(printPage, `/billing/${demo.receiptBillId}/print`, '.invoice-paper');
    await printPage.locator('.invoice-paper').screenshot({ path: path.join(OUT, 'receipt.png') });
    console.log('  receipt.png');
    await print.close();

    // Phone
    const mobile = await newContext({ mobile: true });
    const phone = await mobile.newPage();
    await open(phone, '/dashboard', 'text=Revenue vs Expenses', 2000);
    await shoot(phone, 'dashboard-mobile.png');
    await open(phone, '/book', 'text=F-7, Islamabad');
    await shoot(phone, 'book-branches.png');
    await captureBooking(phone, demo);
    await mobile.close();
  } finally {
    await browser.close();
  }
}

// A new dental bill with a discount and a part payment, as the front desk would fill it in.
// The sheet is scrolled to the bottom so the live totals (paid and due) are in view.
async function captureBillEditor(page) {
  await page.getByRole('button', { name: 'New Bill' }).click();
  const sheet = page.getByRole('dialog');
  await sheet.getByRole('combobox').first().click();
  await page.getByRole('option').nth(2).click();

  for (const search of ['Root canal', 'OPG', 'Composite']) {
    await sheet.getByRole('button', { name: 'Add Service' }).click();
    const picker = page.getByRole('dialog', { name: 'Add Service' });
    await picker.getByPlaceholder('Search services...').fill(search);
    await picker.getByRole('button', { name: new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }).first().click();
    await picker.waitFor({ state: 'hidden' });
  }

  await sheet.locator('label:text-is("Qty") + input').nth(2).fill('2');
  await sheet.locator('label:text-is("Payment Method") + button').click();
  await page.getByRole('option', { name: 'Easypaisa/JazzCash' }).click();
  await sheet.locator('label:text-is("Discount") + input').fill('2500');
  await sheet.locator('label:text-is("Due") + input').fill('10000');
  await sheet.locator('label:text-is("Notes") + textarea').fill('Second sitting for the root canal next week');
  await page.evaluate(() => document.activeElement?.blur());
  await sheet.evaluate((el) => el.scrollTo(0, el.scrollHeight));
  await page.mouse.move(0, 0);
  await sleep(500);
  await shoot(page, 'bill-editor.png');
  await page.keyboard.press('Escape');
}

// The public booking page: treatment, tomorrow, the time slots, then a confirmed booking.
async function captureBooking(page, demo) {
  await open(page, '/book/lahore', 'text=Book at Gulberg, Lahore');
  await page.getByRole('button', { name: /Consultation/ }).first().click();
  await page.getByPlaceholder('Search treatments...').fill('check-up');
  await page.getByRole('button', { name: /Dental check-up/ }).click();
  const dataDay = new Date(`${demo.bookingDay}T00:00:00`).toLocaleDateString('en-US');
  await page.locator(`button[data-day="${dataDay}"]`).click();
  await page.getByText('Pick a time').waitFor();
  await settle(page, 'button[aria-pressed]');
  await page.getByText('What would you like?').evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 16));
  await sleep(400);
  await shoot(page, 'booking.png');

  await page.locator('button[aria-pressed]:not([disabled])', { hasText: 'PM' }).nth(4).click();
  await page.getByLabel('Full name').fill('Ayesha Khan');
  await page.getByLabel('Phone (WhatsApp)').fill('0333-4172905');
  await page.getByRole('button', { name: 'Confirm booking' }).click();
  await page.getByText(/booked, Ayesha/).waitFor();
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(600);
  await shoot(page, 'booking-confirmed.png');
}

// ---------- Main

async function main() {
  for (const [port, what] of [[DB_PORT, 'the demo database'], [API_PORT, 'the demo API']]) {
    if (await portInUse(port)) throw new Error(`Port ${port}, needed for ${what}, is already in use.`);
  }
  await mkdir(OUT, { recursive: true });
  const dbDir = await mkdtemp(path.join(os.tmpdir(), 'clinic-demo-db-'));

  try {
    console.log('Starting a private demo database...');
    start('mongod', process.env.MONGOD || 'mongod', ['--dbpath', dbDir, '--port', String(DB_PORT), '--bind_ip', '127.0.0.1', '--quiet']);
    await waitFor(() => portInUse(DB_PORT), 'mongod');

    console.log('Seeding demo data...');
    const output = await runNode(fileURLToPath(new URL('./seed-demo.mjs', import.meta.url)), {
      ...process.env,
      DEMO_MONGO_URI: DB_URI,
    });
    const demo = JSON.parse(output.trim().split('\n').pop());

    console.log('Starting the demo API...');
    start('api', process.execPath, ['server.js'], {
      cwd: API_DIR,
      env: {
        ...process.env,
        PORT: String(API_PORT),
        MONGO_URI: DB_URI,
        JWT_SECRET: randomBytes(32).toString('hex'),
        JWT_EXPIRES_IN: '1d',
        CORS_ORIGIN: WEB,
        CLINIC_TIMEZONE: 'Asia/Karachi',
        NODE_ENV: 'development',
      },
    });
    await waitFor(() => isUp(`${DEMO_API}/api/health`), 'the demo API');

    if (await isUp(`${WEB}/login`).catch(() => false)) {
      console.log(`Using the web app already running on port ${WEB_PORT}.`);
    } else {
      console.log('Starting the web app (first page loads compile, so this takes a minute)...');
      start('web', path.join(ROOT, 'node_modules/.bin/next'), ['dev', '-p', String(WEB_PORT)], { cwd: WEB_DIR });
      await waitFor(() => isUp(`${WEB}/login`), 'the web app', 180000);
    }

    console.log(`Capturing into ${path.relative(ROOT, OUT)}/`);
    await capture(demo);
  } finally {
    stopAll();
    await sleep(1500);
    await rm(dbDir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});
