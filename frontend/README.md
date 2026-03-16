# Farmhelp Frontend

React + Vite frontend for Farmhelp (farmers, admin, consumers).

---

## How to run / watch (development)

1. **Install dependencies** (first time only):
   ```bash
   cd frontend
   npm install
   ```

2. **Start the dev server** (run & watch with hot reload):
   ```bash
   npm run dev
   ```
   - App runs at **http://localhost:5173**
   - Edits to code auto-reload in the browser.

3. **Stop the server**: Press `Ctrl+C` in the terminal.

---

## Other scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Start dev server (Vite) — **use this to run/watch** |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Serve production build locally |
| `npm run lint` | Run ESLint |

---

## Environment

Create a `.env` file (see `.env.example`) and set:

- `VITE_API_URL` — backend API base URL (e.g. `http://localhost:5000`)

---

## How to run Admin

1. **Backend must be running** (admin API needs it):
   ```bash
   cd backend
   npm install
   node server.js
   ```
   Ensure MongoDB is running and `backend/.env` has `JWT_SECRET`, etc.

2. **Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   Open **http://localhost:5173** (or the port Vite shows).

3. **Create an admin account**:
   - Go to **http://localhost:5173/register**
   - Choose **Account Type: Admin**
   - Enter email and password → Register
   - You will be redirected to Login.

4. **Log in as admin**:
   - Go to **http://localhost:5173/login**
   - Sign in with the admin email and password
   - You should be redirected to **http://localhost:5173/admin**

5. **If you still can’t access admin**:
   - Check browser console (F12) for errors (e.g. API/CORS)
   - Ensure `VITE_API_URL` in `frontend/.env` points to your backend (e.g. `http://localhost:5000`)
   - After login, check **Application → Local Storage** and confirm `user` has `"role": "admin"`

---

## Page analysis (all pages exist and are routed)

| Area | Page file | Route | Status |
|------|-----------|--------|--------|
| **App** | Home.jsx | `/` | ✅ |
| | About.jsx | `/about` | ✅ |
| | Contact.jsx | `/contact` | ✅ |
| | Services.jsx | `/services` | ✅ |
| | Farmers.jsx | `/farmers` | ✅ |
| | MarketPlace.jsx | `/marketplace` | ✅ |
| | Login.jsx | `/login` | ✅ |
| | RegisterPage.jsx | `/register` | ✅ |
| **Admin** | Dashboard.jsx | `/admin`, `/admin/dashboard` | ✅ Protected |
| | Analytics.jsx | `/admin/analytics` | ✅ Protected |
| | FarmersList.jsx | `/admin/farmers` | ✅ Protected |
| | ConsumersList.jsx | `/admin/consumers` | ✅ Protected |
| | OrderManagement.jsx | `/admin/orders` | ✅ Protected |
| | DocumentVerification.jsx | `/admin/document-verification` | ✅ Protected |
| | Certificates.jsx | `/admin/certificates` | ✅ Protected |
| | Profile (shared) | `/admin/profile` | ✅ Protected |
| **Farmer** | Dashboard.jsx | `/farmer` | ✅ |
| | ProductList.jsx | `/farmer/products` | ✅ |
| | AddProduct.jsx | `/farmer/add-product` | ✅ |
| | EditProduct.jsx | `/farmer/update/:productId` | ✅ |
| | Farmerorder.jsx | `/farmer/orders` | ✅ |
| | DocumentUpload.jsx | `/farmer/documents` | ✅ |
| | FarmerCertificate.jsx | `/farmer/certificate/:certificateId` | ✅ |
| | Profile (shared) | `/farmer/profile`, `/farmer/settings` | ✅ |
| **Consumer** | Dashboard.jsx | `/consumer` | ✅ |
| | Profile (shared) | `/consumer/profile`, `/consumer/settings` | ✅ |
| | CartPage.jsx | `/consumer/cart` | ✅ |
| | ProductList.jsx | `/consumer/shop` | ✅ |
| | Checkout.jsx | `/consumer/checkout` | ✅ |
| | OrderConform.jsx | `/consumer/order-confirmation` | ✅ |
| | Orders.jsx | `/consumer/orders` | ✅ |
| | TrackOrders.jsx | `/consumer/track-orders` | ✅ |
| | Analytics.jsx | `/consumer/analytics` | ✅ |
| | ProductFarmers.jsx | `/consumer/product/:productName/farmers` | ✅ |
| | Wishlist.jsx | `/consumer/wishlist` | ✅ |
| | TotalSpend.jsx | `/consumer/total-spend` | ✅ |

**Not routed (optional):** `pages/ProductList.jsx` (root), `Consumers/Cartservice.jsx` — not used in any route; marketplace uses `MarketPlace.jsx`.

---

## Routes quick reference

**Public:** `/`, `/about`, `/contact`, `/services`, `/marketplace`, `/farmers`, `/login`, `/register`

**Admin (login as admin):** `/admin`, `/admin/dashboard`, `/admin/analytics`, `/admin/profile`, `/admin/consumers`, `/admin/orders`, `/admin/farmers`, `/admin/document-verification`, `/admin/certificates`

**Farmer (login as farmer):** `/farmer`, `/farmer/profile`, `/farmer/settings`, `/farmer/products`, `/farmer/add-product`, `/farmer/update/:id`, `/farmer/orders`, `/farmer/documents`, `/farmer/certificate/:id`

**Consumer (login as consumer):** `/consumer`, `/consumer/profile`, `/consumer/settings`, `/consumer/cart`, `/consumer/shop`, `/consumer/checkout`, `/consumer/order-confirmation`, `/consumer/orders`, `/consumer/track-orders`, `/consumer/analytics`, `/consumer/wishlist`, `/consumer/total-spend`, `/consumer/product/:productName/farmers`

---

## Full stack (frontend + backend)

1. **Backend** (in another terminal):
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   (or whatever your backend start script is, e.g. `node server.js`.)

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Open **http://localhost:5173** and use the app. Admin/farmer/consumer pages work when you log in with the matching role.
