# Handmade Market — Frontend

React frontend for a marketplace of independent stores selling handmade gifts, artwork, and other crafted products. Buyers can browse stores and products, manage a cart, place orders, and track fulfillment. Sellers can manage their stores, products, stock, and incoming orders.

## Technology

- React 19 and React Router 7.
- Vite 8, JavaScript, CSS, and the browser Fetch API.
- ESLint for code checks and Playwright for browser workflow tests.

## Requirements

- Node.js **22.12 or later** and npm.
- The accompanying Express backend, normally at `http://localhost:3000`.
- Backend MongoDB and Cloudinary configuration for persistent data and real image uploads.

## Local setup

Run commands from `FrontEnd/FrontEnd/` in the supplied project. If cloned separately, use the frontend directory containing `package.json`.

1. Install locked dependencies:

   ```bash
   npm ci
   ```

2. Copy `.env.example` to `.env` in this directory. In Bash or Git Bash:

   ```bash
   cp .env.example .env
   ```

   Alternatively, copy and rename the file through your editor or file manager.

3. Set the API address:

   ```env
   VITE_BACK_END_SERVER_URL=http://localhost:3000
   ```

4. Start the backend in another terminal, then start the frontend:

   ```bash
   npm run dev
   ```

5. Open the address printed by Vite, normally `http://localhost:5173`.

Restart Vite after changing `.env`. The backend's `FRONTEND_URL` must allow the exact frontend origin, including its port. `localhost` and `127.0.0.1` are different origins.

## Environment variables

| Variable | Purpose | Default |
| --- | --- | --- |
| `VITE_BACK_END_SERVER_URL` | API base URL, without an additional `/api` prefix. | `http://localhost:3000` |

Variables prefixed with `VITE_` are exposed to the browser. MongoDB credentials, JWT signing secrets, and Cloudinary API secrets belong in the backend only.

## Commands

| Command | Purpose |
| --- | --- |
| `npm ci` | Install locked dependencies. |
| `npm run dev` | Start Vite. |
| `npm run lint` | Check source code and browser tests. |
| `npm run build` | Create the production build in `dist/`. |
| `npm run preview` | Preview an existing production build locally. |
| `npm test` | Run Playwright workflow tests. |

## Folder structure

| Location | Responsibility |
| --- | --- |
| `src/main.jsx` | Application entry point and provider setup. |
| `src/App.jsx` | Routes, access guards, and application layout. |
| `src/pages/` | Catalog, authentication, profile, cart, dashboard, and orders. |
| `src/components/` | Navigation, forms, cards, images, and feedback. |
| `src/contexts/UserContext.jsx` | Current user, session restoration, and session expiry. |
| `src/services/` | Shared API client, authentication/profile requests, cart persistence, and resource loading. |
| `src/App.css`, `src/index.css` | Shared styles and responsive layouts. |
| `public/` | Static assets, including the image placeholder. |
| `tests/` | Playwright workflows and screenshot artifacts. |
| `vite.config.js` | Vite configuration. |
| `playwright.config.js` | Test browsers and fixture-server configuration. |

Keep local assets inside the frontend. Files in `public/images/` are referenced as `/images/filename.png`; files in `src/` can be imported by components. Avoid personal `Downloads` paths or absolute file paths on a developer's computer. User-uploaded images use Cloudinary URLs returned by the API.

## Routes

| Route | Purpose | Access |
| --- | --- | --- |
| `/` | Home with stores and products sections. | Public |
| `/stores/list` | Store catalog. | Public |
| `/stores/:storeId` | Store details and products. | Public |
| `/products` | Product catalog. | Public |
| `/products/:id` | Product details. | Public viewing |
| `/signup`, `/login` | Registration and login. | Public |
| `/profile` | Account details and editing. | Signed-in users |
| `/cart` | Quantities, address, totals, and checkout. | Buyers |
| `/orders` | Buyer order history and status. | Buyers |
| `/owner-dashboard` | Owned store and product management. | Sellers |
| `/products/new` | Create a product. | Sellers |
| `/products/edit/:id` | Edit an owned product. | Owning seller |
| `/stores/edit/:storeId` | Edit an owned store. | Owning seller |
| `/seller/orders` | Incoming orders and status updates. | Sellers |

`/dashboard` redirects to `/owner-dashboard`. Unknown routes display a not-found page. The backend also enforces access and ownership; client route guards alone do not authorize operations.

## Main workflows

### Seller

1. Register a seller account and sign in.
2. Create a store from the dashboard.
3. Add products with descriptions, categories, prices, integer stock, and optional images.
4. Open Store Orders to view customer username/phone, address, purchased products, quantities, totals, dates, and status.
5. Advance orders through **Preparing → Ready / On the Way → Completed**.

Seller accounts cannot purchase products. Quantity and Add to Cart controls are hidden from product owners.

### Buyer

1. Register a separate buyer account and browse stores or products.
2. Choose a positive whole-number quantity within available stock and add to the cart.
3. Update quantities or remove items; the cart shows quantity × unit price = subtotal and totals per store.
4. Enter a delivery address and place an order for a store.
5. Successful checkout removes that store's purchased items; other stores' items remain.
6. Open My Orders to view saved orders and current status.

Adding to the cart does not reduce stock. The backend verifies current prices and availability at checkout. Carts are stored per buyer in that browser's local storage and are not synchronized across devices. Prices are displayed in USD. Order pages refresh every 30 seconds, on window focus, and through their Refresh button.

## Authentication and images

The shared API client sends the JWT in an Authorization Bearer header. The token is stored in local storage; the user is restored through `/auth/me` on reload. Invalid/expired sessions trigger sign-in feedback. Logout removes the local token; there is no backend token revocation list.

Store/product forms submit images through multipart field `image`. JPG, PNG, and WebP files up to 5 MB are supported. The backend uploads to Cloudinary and returns a secure URL. The shared `Image` component displays a local SVG placeholder when images are missing or fail to load.

## Verification

Run code checks and build validation:

```bash
npm run lint
npm run build
```

For browser tests, install backend dependencies first. Preserve the supplied directory relationship because the Playwright fixture command uses `../../BackEnd/BackEnd/tests/browser-server.cjs`. A separately cloned frontend needs that fixture path configured to the backend's actual location.

Stop normal development servers so ports **3000** and **5173** are free, then run:

```bash
npx playwright install chromium
npm test
```

Playwright starts Vite and a synthetic API backed by a temporary MongoDB replica set. The first run may download a MongoDB binary. Tests cover buyer/seller checkout, ownership, stock changes, status persistence, cart isolation, mobile layouts, image fallback, and loading/error states.

Cloudinary is mocked; these tests do not verify your live Cloudinary account or use your Atlas database. `PLAYWRIGHT_CHROMIUM_EXECUTABLE` optionally selects an existing browser; `PLAYWRIGHT_CHROMIUM_ARGS` accepts a JSON array of launch arguments.

## Production deployment

1. Set `VITE_BACK_END_SERVER_URL` to the deployed HTTPS API address **before building**.
2. Run `npm ci` and `npm run build`.
3. Deploy the contents of `dist/` to a static host.
4. Configure the host to serve `index.html` for application routes so refreshing `/orders` or a product page works.
5. Set the backend's `FRONTEND_URL` to the deployed frontend origin and use HTTPS for both services.

`npm run preview` is for local build previews. API-address changes require rebuilding the frontend.

## Troubleshooting

| Issue | Check |
| --- | --- |
| API requests fail | Start the backend and verify `VITE_BACK_END_SERVER_URL`. |
| CORS errors | Match the frontend origin to backend `FRONTEND_URL`; restart the backend. |
| Vite uses another port | Free port 5173 or allow the printed origin in the backend. |
| Old account fails after database switch | Sign out and register in the new database. |
| Place Order fails | Check address, stock, buyer role, and MongoDB replica-set configuration. |
| Images show placeholders | Check returned image URLs and backend Cloudinary configuration. |
| Route refresh returns 404 after deployment | Configure the host's `index.html` fallback. |
| Browser tests fail to start | Install backend dependencies and Chromium; free ports 3000 and 5173. |

## Scope

Online payments, refunds, tax/delivery-fee calculation, and email/SMS notifications are not implemented. There is no dedicated administrator frontend dashboard; protected administrator endpoints exist in the backend.
