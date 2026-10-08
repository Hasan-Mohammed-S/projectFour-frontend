import { test, expect, chromium } from '@playwright/test';
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=', 'base64');
const errors = [];
function observe(page) { page.on('pageerror', e => errors.push(e.message)); page.on('console', msg => { if (msg.type() === 'error' && !msg.text().includes('Failed to load resource')) errors.push(msg.text()); }); }
async function signup(page, name, phone, role) {
  await page.goto('/signup');
  await page.getByLabel('Username', { exact: true }).fill(name);
  await page.getByLabel('Email address', { exact: true }).fill(`${name}@example.test`);
  await page.getByLabel('Phone number', { exact: true }).fill(phone);
  await page.getByLabel('Password', { exact: true }).fill('Browser-test-password');
  await page.getByLabel('Account type').selectOption(role);
  await page.getByRole('button', { name: 'Sign up', exact: true }).click();
  await expect(page).toHaveURL(role === 'seller' ? /owner-dashboard/ : /\/$/);
}
async function imageOK(page) {
  await expect.poll(() => page.locator('img').evaluateAll(images => images.every(img => img.complete && img.naturalWidth > 0))).toBe(true);
}
async function seedAccount(request, name, phone, role) {
  const response = await request.post('http://127.0.0.1:3000/auth/signup', { data: { username: name, email: `${name}@example.test`, phoneNumber: phone, role, password: 'Browser-test-password' } });
  expect(response.status()).toBe(201); return response.json();
}
async function seedProduct(request, suffix, phone, stock = 1) {
  const account = await seedAccount(request, `seller_${suffix}`, phone, 'seller');
  const headers = { Authorization: `Bearer ${account.token}` };
  const response = await request.post('http://127.0.0.1:3000/stores', { headers, data: { name: `Store ${suffix}`, description: 'Synthetic handmade shop', address: 'Test area' } }); expect(response.status()).toBe(201);
  const store = await response.json();
  const productResponse = await request.post('http://127.0.0.1:3000/products', { headers, data: { store: store._id, name: `Product ${suffix}`, description: 'Synthetic handmade product', category: 'Gifts', price: 2.5, stock } }); expect(productResponse.status()).toBe(201);
  return productResponse.json();
}
async function ownBrowser() {
  const instance = await chromium.launch(test.info().project.use.launchOptions);
  const context = await instance.newContext({ baseURL: 'http://127.0.0.1:5173' });
  return { instance, page: await context.newPage() };
}
test('complete buyer/seller workflow: uploads, ownership, cart, checkout, stock and status persistence', async ({ browser }) => {
  const sellerContext = await browser.newContext();
  const buyerBrowser = await chromium.launch(test.info().project.use.launchOptions);
  const buyerContext = await buyerBrowser.newContext({ baseURL: 'http://127.0.0.1:5173' });
  const seller = await sellerContext.newPage(); const buyer = await buyerContext.newPage(); observe(seller); observe(buyer);
  await signup(seller, 'ui_seller', '77777777', 'seller');
  await seller.getByRole('button', { name: '+ Create store', exact: true }).click();
  await seller.getByLabel('Store name', { exact: true }).fill('Little Maker');
  await seller.getByRole('textbox', { name: 'Description', exact: true }).fill('Handmade gifts for happy occasions.');
  await seller.getByLabel('Store address', { exact: true }).fill('Manama, Bahrain');
  await seller.getByLabel('Store image (optional)').setInputFiles({ name: 'store.png', mimeType: 'image/png', buffer: png });
  await seller.getByRole('button', { name: 'Save store', exact: true }).click();
  await expect(seller.getByRole('status')).toContainText('Store created successfully');
  await seller.getByRole('link', { name: '+ Add product', exact: true }).click();
  await seller.getByLabel('Product name', { exact: true }).fill('Ceramic Keepsake');
  await seller.getByRole('textbox', { name: 'Description', exact: true }).fill('A thoughtful handmade keepsake.');
  await seller.getByLabel('Price ($)', { exact: true }).fill('12.35');
  await seller.getByLabel('Stock quantity', { exact: true }).fill('10');
  await seller.getByLabel('Category', { exact: true }).fill('Gifts');
  await seller.getByLabel('Product image (optional)').setInputFiles({ name: 'gift.png', mimeType: 'image/png', buffer: png });
  await seller.getByRole('button', { name: 'Save product', exact: true }).click();
  await expect(seller).toHaveURL(/owner-dashboard/);
  await seller.getByRole('link', { name: 'Ceramic Keepsake', exact: true }).click();
  const productURL = seller.url(); const productId = productURL.split('/').pop();
  await expect(seller.getByRole('button', { name: 'Add to Cart', exact: true })).toHaveCount(0);
  await expect(seller.getByLabel('Quantity', { exact: true })).toHaveCount(0);
  await imageOK(seller);
  await seller.getByRole('button', { name: 'Edit product', exact: true }).click();
  await seller.getByRole('textbox', { name: 'Description', exact: true }).fill('A thoughtful handmade keepsake, packed with care.');
  await seller.getByLabel('Replace image (optional)').setInputFiles({ name: 'replacement.png', mimeType: 'image/png', buffer: png });
  await seller.getByRole('button', { name: 'Save product', exact: true }).click();
  await expect(seller.getByText('A thoughtful handmade keepsake, packed with care.', { exact: true })).toBeVisible();
  await seller.reload(); await expect(seller.getByRole('heading', { name: 'Ceramic Keepsake', exact: true })).toBeVisible();
  await signup(buyer, 'ui_buyer', '88888888', 'buyer');
  await expect(buyer.getByRole('heading', { name: 'Stores', exact: true })).toBeVisible();
  await expect(buyer.getByRole('heading', { name: 'Products', exact: true })).toBeVisible();
  await imageOK(buyer);
  await buyer.getByRole('link', { name: 'Visit store →', exact: true }).click();
  await expect(buyer.getByRole('heading', { name: 'Little Maker', exact: true })).toBeVisible();
  await buyer.getByRole('link', { name: 'View details →', exact: true }).click();
  await buyer.getByLabel('Quantity', { exact: true }).fill('3');
  await buyer.getByRole('button', { name: 'Add to Cart', exact: true }).click();
  await expect(buyer.getByRole('status')).toContainText('3 items added');
  await buyer.getByRole('button', { name: 'Add to Cart', exact: true }).click();
  await buyer.getByRole('link', { name: /Cart 6/ }).click();
  await buyer.getByLabel('Quantity for Ceramic Keepsake').fill('3');
  await expect(buyer.getByText('3 × $12.35 = $37.05', { exact: true })).toBeVisible();
  await buyer.getByRole('button', { name: 'Remove', exact: true }).click();
  await expect(buyer.getByRole('heading', { name: 'Your cart is empty', exact: true })).toBeVisible();
  await buyer.goto(productURL); await buyer.getByLabel('Quantity', { exact: true }).fill('3'); await buyer.getByRole('button', { name: 'Buy now', exact: true }).click();
  await expect(buyer.getByText('3 × $12.35 = $37.05', { exact: true })).toBeVisible();
  await buyer.getByRole('button', { name: 'Place Order', exact: true }).click();
  await expect(buyer.getByRole('alert')).toContainText('Enter a delivery address');
  await buyer.getByLabel('Delivery address', { exact: true }).fill('Building 12, Road 3, Block 4, Manama');
  await buyer.getByRole('button', { name: 'Place Order', exact: true }).click();
  await expect(buyer.getByRole('status')).toContainText('placed successfully');
  await expect(buyer.getByRole('heading', { name: 'Your cart is empty', exact: true })).toBeVisible();
  await buyer.getByRole('link', { name: 'View My Orders →', exact: true }).click();
  await expect(buyer.locator('.order-card')).toHaveCount(1);
  await expect(buyer.locator('.order-card .badge')).toHaveText('Preparing'); await imageOK(buyer);
  await buyer.reload(); await expect(buyer.locator('.order-card')).toHaveCount(1);
  await seller.goto('/seller/orders'); await expect(seller.getByText('Customer: ui_buyer', { exact: true })).toBeVisible(); await expect(seller.getByText('Phone: 88888888', { exact: true })).toBeVisible(); await imageOK(seller);
  await seller.getByRole('button', { name: 'Mark Ready / On the Way', exact: true }).click();
  await expect(seller.locator('.order-card .badge')).toHaveText('Ready / On the Way'); await seller.reload(); await expect(seller.locator('.order-card .badge')).toHaveText('Ready / On the Way');
  await buyer.getByRole('button', { name: 'Refresh orders', exact: true }).click(); await expect(buyer.locator('.order-card .badge')).toHaveText('Ready / On the Way');
  await seller.getByRole('button', { name: 'Mark Completed', exact: true }).click(); await expect(seller.locator('.order-card .badge')).toHaveText('Completed');
  await buyer.getByRole('button', { name: 'Refresh orders', exact: true }).click(); await expect(buyer.locator('.order-card .badge')).toHaveText('Completed');
  await buyer.goto(productURL); await expect(buyer.getByText('7 available', { exact: true })).toBeVisible();
  await buyer.getByRole('link', { name: 'ui_buyer', exact: true }).click();
  await buyer.getByLabel('Username', { exact: true }).fill('ui_buyer_updated'); await buyer.getByRole('button', { name: 'Save changes', exact: true }).click(); await expect(buyer.getByRole('status')).toContainText('Profile updated successfully'); await buyer.reload(); await expect(buyer.getByLabel('Username', { exact: true })).toHaveValue('ui_buyer_updated');
  // Sellers remain unable to purchase their own products via direct API calls.
  const ownerToken = await seller.evaluate(() => localStorage.getItem('token'));
  const forbidden = await seller.request.post('http://127.0.0.1:3000/orders', { headers: { Authorization: `Bearer ${ownerToken}`, 'Idempotency-Key': 'browser-forbidden-purchase' }, data: { store: '000000000000000000000001', items: [{ product: productId, quantity: 1 }], shippingAddress: 'Test' } }); expect(forbidden.status()).toBe(403);
  expect(errors).toEqual([]);
  await seller.screenshot({ path: 'tests/artifacts/seller-orders-desktop.png', fullPage: true });
  await buyer.goto('/'); await buyer.screenshot({ path: 'tests/artifacts/home-desktop.png', fullPage: true });
  await buyerContext.close(); await buyerBrowser.close(); await sellerContext.close();
});
test('responsive catalog, broken image fallback, loading/error/retry states, protected routes and invalid token refresh', async ({ request }) => {
  await seedProduct(request, 'responsive', '99999999');
  const { instance, page } = await ownBrowser();
  observe(page); await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/'); await expect(page.getByRole('heading', { name: 'Products', exact: true })).toBeVisible();
  await imageOK(page); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'tests/artifacts/home-mobile.png', fullPage: true });
  await page.goto('/products'); await page.getByLabel('Search products', { exact: true }).fill('no-such-product'); await expect(page.getByRole('heading', { name: 'No products found', exact: true })).toBeVisible(); await page.getByRole('button', { name: 'Reset filters', exact: true }).click();
  await page.route('http://127.0.0.1:3000/products', async route => { if (route.request().method() === 'GET') await route.fulfill({ status: 500, json: { error: 'Temporary test failure' } }); else await route.continue(); });
  await page.reload(); await expect(page.getByRole('alert')).toHaveText('Temporary test failure');
  await page.unroute('http://127.0.0.1:3000/products'); await page.getByRole('button', { name: 'Try again', exact: true }).click(); await expect(page.locator('.catalog-card').first()).toBeVisible();
  await page.route('http://127.0.0.1:3000/products', async route => { const response = await route.fetch(); const data = await response.json(); data.forEach(p => p.image = 'http://127.0.0.1:5173/missing-image.png'); await route.fulfill({ response, json: data }); });
  await page.reload(); await expect.poll(() => page.locator('.card-image').first().getAttribute('src')).toBe('/placeholder.svg'); await imageOK(page);
  await page.goto('/cart'); await expect(page).toHaveURL(/login/);
  await page.evaluate(() => localStorage.setItem('token', 'malformed-token')); await page.reload(); await expect(page.getByRole('alert')).toContainText('session has expired');
  expect(await page.evaluate(() => localStorage.getItem('token'))).toBe(null);
  await page.goto('/unknown-page'); await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  expect(errors).toEqual([]); await instance.close();
});
test('mobile login, per-store checkout, stale/out-of-stock cart handling and account cart isolation', async ({ request }) => {
  const a = await seedProduct(request, 'stock_a', '60000001', 1);
  const b = await seedProduct(request, 'stock_b', '60000002', 2);
  await seedAccount(request, 'mobile_buyer', '60000003', 'buyer');
  const concurrent = await seedAccount(request, 'concurrent_buyer', '60000004', 'buyer');
  const { instance, page } = await ownBrowser(); observe(page); await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/login'); await page.getByLabel('Username, email, or phone number').fill('mobile_buyer'); await page.getByLabel('Password', { exact: true }).fill('Browser-test-password'); await page.getByRole('button', { name: 'Log in', exact: true }).click(); await expect(page).toHaveURL(/\/$/);
  for (const [product, qty] of [[a, 1], [b, 2]]) {
    await page.goto(`/products/${product._id}`); await page.getByLabel('Quantity', { exact: true }).fill(String(qty)); await page.getByRole('button', { name: 'Add to Cart', exact: true }).click(); await expect(page.getByRole('status')).toContainText('added to your cart');
  }
  await page.goto('/cart'); await expect(page.getByRole('button', { name: 'Place Order', exact: true })).toHaveCount(2);
  await page.getByLabel('Delivery address', { exact: true }).fill('Building 1, Road 2, Block 3');
  await imageOK(page); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'tests/artifacts/cart-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Place Order', exact: true }).first().click(); await expect(page.getByRole('status')).toContainText('placed successfully'); await expect(page.locator('.cart-item')).toHaveCount(1);
  const depleted = await request.post('http://127.0.0.1:3000/orders', { headers: { Authorization: `Bearer ${concurrent.token}`, 'Idempotency-Key': 'mobile-concurrent-purchase-key' }, data: { store: b.store._id, shippingAddress: 'Test area', items: [{ product: b._id, quantity: 1 }] } }); expect(depleted.status()).toBe(201);
  await page.getByRole('button', { name: 'Place Order', exact: true }).click(); await expect(page.getByRole('alert')).toContainText('insufficient stock'); await expect(page.locator('.cart-item')).toHaveCount(1); await expect(page.getByRole('button', { name: 'Place Order', exact: true })).toBeDisabled();
  await page.getByLabel('Quantity for Product stock_b').fill('1'); await expect(page.getByRole('button', { name: 'Place Order', exact: true })).toBeEnabled(); await page.getByRole('button', { name: 'Place Order', exact: true }).click(); await expect(page.getByRole('heading', { name: 'Your cart is empty', exact: true })).toBeVisible();
  await page.goto(`/products/${a._id}`); await expect(page.getByText('Out of stock', { exact: true })).toBeVisible(); await expect(page.getByRole('button', { name: 'Add to Cart', exact: true })).toHaveCount(0); await expect(page.getByText('This product is currently unavailable.', { exact: true })).toBeVisible();
  await page.goto('/orders'); await expect(page.locator('.order-card')).toHaveCount(2); await imageOK(page); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); await page.screenshot({ path: 'tests/artifacts/orders-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Log out', exact: true }).click(); await expect(page).toHaveURL(/login/); await page.getByLabel('Username, email, or phone number').fill('concurrent_buyer'); await page.getByLabel('Password', { exact: true }).fill('Browser-test-password'); await page.getByRole('button', { name: 'Log in', exact: true }).click(); await expect(page).toHaveURL(/\/$/); await page.goto('/cart'); await expect(page.getByRole('heading', { name: 'Your cart is empty', exact: true })).toBeVisible();
  expect(errors).toEqual([]); await instance.close();
});
