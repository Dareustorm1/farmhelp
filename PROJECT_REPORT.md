# Farmhelp (KrushiSetu) — Project Report

## 1. Project Overview

**Farmhelp** (branded as **KrushiSetu** in the README) is a **role-based web platform** that connects **smallholder farmers**, **administrators**, and **consumers**. It provides:

- **Secure document upload and admin verification** for farmers (Aadhaar + certificate)
- **Blockchain-backed certificate issuance** (certificate hashes stored on-chain)
- **Geofenced marketplace** — consumers can buy from farmers within a **100 km** radius
- **Role-specific dashboards and analytics** for farmers, consumers, and admins

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React + Vite)                         │
│  Home | Marketplace | Login/Register | Admin/* | Farmer/* | Consumer/*      │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ REST API (JWT)
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND (Node.js + Express)                        │
│  Auth | Products | Cart | Orders | Documents | Certificates | Notifications  │
└─────────────────────────────────────────────────────────────────────────────┘
         │                              │                              │
         ▼                              ▼                              ▼
┌─────────────────┐          ┌─────────────────┐          ┌─────────────────────┐
│  MongoDB        │          │  GridFS         │          │  Blockchain (EVM)   │
│  (Users,        │          │  (Documents,    │          │  FarmerCertification │
│   Products,     │          │   Profile       │          │  Smart Contract      │
│   Orders, Cart) │          │   Images)       │          │  (Hedera/Ethereum)   │
└─────────────────┘          └─────────────────┘          └─────────────────────┘
```

---

## 3. Backend Modules and Components

### 3.1 Entry Point

- **`server.js`** — Express app, CORS, route mounting, MongoDB connection, error middleware. Uses `http.createServer` for potential Socket.IO.

### 3.2 Configuration

| File | Purpose |
|------|---------|
| **`config/mongoDb.js`** | MongoDB connection. |
| **`config/gridfsConfig.js`** | GridFS buckets: `farmerDocuments`, `profileImages`. Helpers: `createUploadStream`, `createDownloadStream`, `deleteFile`, `generateFileHash` (SHA256). |

### 3.3 Models (MongoDB / Mongoose)

| Model | File | Description |
|-------|------|-------------|
| **User** | `models/user.js` | `name`, `email`, `password` (bcrypt), `role` (`admin` \| `farmer` \| `consumer`), `phoneNumber`, `pincode`, `location` (country, state, district, city), `bio`, `profileImage`, `refreshToken`. Methods: `comparePassword`, `generateToken`, `generateRefreshToken`. |
| **Product** | `models/Product.js` | `name`, `category`, `description`, `price`, `discount`, `available_quantity`, `unit`, `image_url` / `image_id`, `traceability` (harvest_method, harvest_date), `farmer_id` (ref User). |
| **Order** | `models/order.js` | `user`, `order_id`, `orderNumber`, `items` (product, farmer_id, name, price, quantity, traceability, farmer_details), `shippingAddress`, `subtotal`, `shippingFee`, `taxAmount`, `discount`, `totalAmount`, `paymentMethod` (cod \| razorpay), `paymentStatus`, `orderStatus`, `status`, `paymentDetails` (Razorpay IDs), `deliveryEstimate`, `cancellationReason`, `cancelledBy`, `cancelledAt`. Auto-generates `order_id`, `orderNumber`, `deliveryEstimate`. |
| **Cart** | `models/Cart.js` | `user`, `items` (product, product_details, farmer_details, traceability, quantity), `total`, `coupon_code`, `discount_amount`. Pre-save computes total. |
| **FarmerDocument** | `models/FarmerDocument.js` | `farmerId`, `documents.aadhaar` & `documents.certificate` (documentType, fileId, filename, fileHash, contentType, status, verifiedBy, verificationDate, remarks), `certificateId`, `certificateIssueDate`, `expiryDate`, `blockchainTxId`, `aadhaarHash`, `certificateHash`, `farmerType`, `verificationStatus` (pending \| partial \| complete \| certified \| rejected). Methods: `areAllDocumentsUploaded`, `areAllDocumentsVerified`, `updateVerificationStatus`. |
| **Notification** | `models/Notification.js` | `userId`, `userRole` (farmer \| consumer), `type` (new_order, order_received, order_processing, order_shipped, order_delivered, order_cancelled), `message`, `orderId`, `read`. |

### 3.4 Controllers

| Controller | File | Main Responsibilities |
|------------|------|----------------------|
| **authController** | `authController.js` | Login (JWT + refresh token). |
| **adminController** | `adminController.js` | Admin dashboard stats (products, farmers, consumers, orders, revenue), list farmers/consumers, order management, notifications. |
| **productController** | `productController.js` | CRUD products, list by farmer/category. |
| **cartController** | `cartController.js` | Add/remove/update cart items, get cart. |
| **orderController** | `orderController.js` | Create order, Razorpay integration, order status, cancellation. |
| **farmerController** | `farmerController.js` | Farmer-specific operations. |
| **notificationController** | `notificationController.js` | Create/read notifications for farmers and consumers. |
| **uploadController** | `uploadController.js` | Product images / file uploads (likely with GridFS or multer). |

### 3.5 Middlewares

| Middleware | File | Purpose |
|------------|------|---------|
| **authMiddleware** | `authMiddleware.js` | JWT `authenticate`, role-based `restrictTo`. |
| **adminAuth** | `adminAuth.js` | Admin-only access. |
| **upload** | `upload.js` | Multer config for file uploads. |

### 3.6 Routes (API Prefixes)

| Prefix | Route File | Purpose |
|--------|------------|---------|
| `/api/auth` | `authRoutes.js` | Register (farmer/consumer only), login, refresh-token, logout, `/me`. |
| `/api/products` | `productRoute.js` | Product CRUD and listing. |
| `/api/cart` | `cartRoutes.js` | Cart operations. |
| `/api/orders` | `orderRoutes.js` | Order creation, status, payment. |
| `/api/users` | `profileRoutes.js` | User profile. |
| `/api/farmer` | `FarmerOrdersRoute.js` | Farmer orders. |
| `/api/admin` | `adminRoutes.js` | Admin dashboard, farmers list, consumers list, order management, document verification. |
| `/api/notifications` | `notificationRoutes.js` | Notifications. |
| `/api/documents` | `documentRoutes.js` | Upload Aadhaar/certificate (single or both), get by farmer, download file, admin verify (single or verify-all), pending documents list. On full verification → issue blockchain certificate. |
| `/api/certificates` | `certificateRoutes.js` | Public farmers list, list certificates (admin), statistics, verify by certificateId (blockchain), farmer certificates, verification-status by farmerId. |
| `/api/farmer1` | `farmerRoutes.js` | Additional farmer routes. |

### 3.7 Utilities

| File | Purpose |
|------|---------|
| **`utils/blockchainService.js`** | Loads FarmerCertification contract (EVM). **Issue certificate**: after admin verifies both docs, calls `issueCertificate(certificateId, farmerId, farmerName, aadhaarHash, certificateHash)` and stores `certificateId`, `blockchainTxId` in FarmerDocument. **Verify certificate**: `verifyCertificateEVM(certificateId)` calls contract `verifyCertificateById`, returns validity, farmerId, farmerName, expiry. Uses `ethers` + optional Hedera SDK; EVM-only mode for production. |

---

## 4. Frontend Modules and Components

### 4.1 Entry and Routing

- **`main.jsx`** — Renders `App` inside `StrictMode` (no `AuthProvider` in snippet; may be used inside specific trees).
- **`App.jsx`** — `BrowserRouter`, `Toaster` (react-hot-toast), top-level routes:
  - `/` → Home  
  - `/marketplace` → Marketplace  
  - `/farmers`, `/about`  
  - `/login`, `/register`  
  - `/admin/*` → Admin routes  
  - `/farmer/*` → Farmer routes  
  - `/consumer/*` → Consumer routes  

### 4.2 Context

| Context | File | Purpose |
|---------|------|---------|
| **AuthContext** | `context/authContext.jsx` | `user`, `login`, `logout`, `loading`, `error`, `isAuthenticated`, session expiry (e.g. 24h), `getRemainingSessionTime`, `formatRemainingTime`, `autoLogout`. Uses `authApi` (login, getCurrentUser). |
| **ThemeContext** | `ThemeContext.jsx` / `ThemeContext.js` | Theme (e.g. light/dark) if used. |

### 4.3 API Layer

- **`api/authApi.js`** — `loginUser`, `getCurrentUser` (calls backend auth endpoints with token).

### 4.4 Shared Components

| Component | File | Purpose |
|-----------|------|---------|
| **Navbar** | `Navbar.jsx` | Navigation. |
| **Footer** | `Footer.jsx` | Footer. |
| **LandingPage** | `LandingPage.jsx` | Landing content. |
| **HomeAdd** | `HomeAdd.jsx` | Home page addition. |
| **NotificationSystem** | `NotificationSystem.jsx` | In-app notifications. |
| **ProtectedAdminRoute** | `ProtectedAdminRoute.jsx` | Wraps admin-only pages. |
| **Button, Card, Tabs** | `ui/*.jsx` | Reusable UI. |
| **use-toast, useDashboard** | `hooks/*.jsx` | Shared hooks. |

### 4.5 Pages (by Role)

#### Public

| Page | Path / File | Description |
|------|-------------|-------------|
| Home | `/` | `Home.jsx` |
| Marketplace | `/marketplace` | `MarketPlace.jsx` |
| Farmers | `/farmers` | `Farmers.jsx` |
| About | `/about` | `About.jsx` |
| Contact | (if used) | `Contact.jsx` |
| Login | `/login` | `Login.jsx` |
| Register | `/register` | `RegisterPage.jsx` |
| ProductList | (marketplace) | `ProductList.jsx` (public product list). |
| Services | (if used) | `Services.jsx` |

#### Admin (`/admin/*`)

| Route | Component | Description |
|-------|------------|-------------|
| `/`, `/dashboard` | `Admin/Dashboard.jsx` | Admin dashboard (stats, charts). |
| `/profile` | `Profile.jsx` | Profile (wrapped in ProtectedAdminRoute). |
| `/consumers` | `ConsumersList.jsx` | List consumers. |
| `/orders` | `OrderManagement.jsx` | Order management. |
| `/farmers` | `FarmersList.jsx` | List farmers. |
| `/document-verification` | `DocumentVerification.jsx` | Review and verify farmer documents (Aadhaar, certificate); triggers certificate issuance when both verified. |
| `/certificates` | `Certificates.jsx` | View/verify issued certificates. |

#### Farmer (`/farmer/*`)

| Route | Component | Description |
|-------|------------|-------------|
| `/` | `Farmers/Dashboard.jsx` | Farmer dashboard. |
| `/profile` | `Profile.jsx` | Profile. |
| `/products` | `Farmers/ProductList.jsx` | Farmer’s product list. |
| `/add-product` | `AddProduct.jsx` | Add product. |
| `/update/:productId` | `EditProduct.jsx` | Edit product. |
| `/orders` | `Farmerorder.jsx` | Farmer orders. |
| `/documents` | `DocumentUpload.jsx` | Upload Aadhaar and certificate. |
| `/certificate/:certificateId` | `FarmerCertificate.jsx` | View own certificate. |

#### Consumer (`/consumer/*`)

| Route | Component | Description |
|-------|------------|-------------|
| `/` (layout) | `Consumers/Dashboard.jsx` | Dashboard layout. |
| `/profile` | `Profile.jsx` | Profile. |
| `/cart` | `CartPage.jsx` | Cart. |
| `/shop` | `ProductList.jsx` | Browse products (geofenced in backend). |
| `/checkout` | `Checkout.jsx` | Checkout (Razorpay/COD). |
| `/order-confirmation` | `OrderConform.jsx` | Order confirmation. |
| `/track-orders` | `TrackOrders.jsx` | Track orders. |
| `/analytics` | `Analytics.jsx` | Consumer analytics. |
| `/product/:productName/farmers` | `ProductFarmers.jsx` | Farmers selling a product (e.g. for certificate verification). |

Other consumer-related pages: `Wishlist.jsx`, `TotalSpend.jsx`, `Orders.jsx` (used where applicable).

### 4.6 Firebase

- **`firebase.js`** — Firebase config and Google Auth provider (for optional Google sign-in).

---

## 5. Smart Contracts Module

### 5.1 Contract

- **`smart-contracts/contracts/FarmerCertification.sol`**
  - **Struct**: `Certificate` — `isValid`, `issuedAt`, `expiryDate`, `aadharHash`, `certificateHash`, `farmerId`, `farmerName`.
  - **Admin**: single `admin` address, `onlyAdmin` modifier.
  - **Functions**:
    - `issueCertificate(certificateId, farmerId, farmerName, aadharHash, certificateHash)` — stores certificate, 1-year expiry.
    - `revokeCertificate(certificateId, reason)` — sets `isValid = false`.
    - `verifyCertificateById(certificateId)` — view; returns `isValid`, `farmerId`, `farmerName`, `expiryDate` (valid if not expired and `isValid`).
    - `changeAdmin(newAdmin)`.
  - **Events**: `CertificateIssued`, `CertificateRevoked`, `AdminChanged`.

### 5.2 Deployment and Scripts

- **Hardhat** config: `hardhat.config.js` (Hedera/EVM).
- **Deploy**: `scripts/deploy-hedera.js`, `deploy.js`.
- **Artifacts**: `artifacts/`, `deployments/deployment-testnet.json`, `FarmerCertification.json`.
- **Scripts**: `issue-certificate.js`, `verify-certificate.js`, `verify-contract.js`, `get-bytecode.js`, `interact.js`, `test-certificates.js`, `test-two-farmers.js`, `test.js`.

Backend reads contract address from deployment JSON or `CONTRACT_ADDRESS` and uses **EVM** (ethers) to issue and verify certificates.

---

## 6. End-to-End Workflows

### 6.1 Farmer onboarding and certification

1. Farmer **registers** (role: farmer) via `/api/auth/register`.
2. Farmer **uploads** Aadhaar and certificate via **Document Upload** (`/api/documents/upload` or upload-both); files stored in **GridFS**, hashes in **FarmerDocument**.
3. Admin opens **Document Verification**, sees **pending** documents.
4. Admin **verifies** each document (or verify-all); status set to `verified`.
5. When **both** are verified, backend calls **blockchainService.verifyAndIssueCertificate(farmerId)**:
   - Generates `certificateId`, gets document hashes from FarmerDocument.
   - Calls smart contract `issueCertificate(certificateId, farmerId, farmerName, aadhaarHash, certificateHash)`.
   - Saves `certificateId`, `blockchainTxId`, `certificateIssueDate` on FarmerDocument; `verificationStatus` → `certified`.
6. Farmer can view certificate at `/farmer/certificate/:certificateId`.

### 6.2 Consumer verifies farmer and shops

1. Consumer **registers** or **logs in** (role: consumer).
2. In marketplace/shop, consumer can see **farmers** selling a product (e.g. ProductFarmers).
3. Consumer (or product page) can **verify** farmer certificate via `/api/certificates/verify/:certificateId` — backend calls contract `verifyCertificateById` and returns validity, farmer name, expiry.
4. Consumer adds products to **cart**, proceeds to **checkout** (Razorpay or COD).
5. **Order** is created; **geofencing** (e.g. 100 km) is enforced on backend when listing farmers/products.
6. **Notifications** (new_order, order_delivered, etc.) sent to farmer and consumer.

### 6.3 Admin operations

- **Dashboard**: stats from `adminController` (products, farmers, consumers, orders, revenue).
- **Farmers/Consumers lists**: manage users.
- **Order management**: view/update order status.
- **Document verification**: approve/reject Aadhaar and certificate → triggers blockchain certificate when both verified.
- **Certificates**: list and verify issued certificates.

---

## 7. Technology Stack Summary

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 18, Vite, React Router, Tailwind CSS, Framer Motion, Recharts, Axios, React Hot Toast, Lucide React, Firebase (optional Google Auth), Socket.IO client. |
| **Backend** | Node.js, Express, Mongoose (MongoDB), JWT (access + refresh), bcrypt, Multer, CORS, Razorpay, Socket.IO, Ethers.js, Hashgraph SDK (optional). |
| **Database** | MongoDB; GridFS for farmer documents and profile images. |
| **Blockchain** | Solidity (FarmerCertification), Hardhat, Hedera EVM / Ethereum testnet; Ethers.js in backend. |
| **Security** | JWT, role-based middleware, bcrypt passwords, file type/size validation, HTTPS-ready. |

---

## 8. Environment and Repo Layout

- **Root**: `package.json` (workspace-style or scripts), `.env.example`, `.gitignore`, `README.md`, this report.
- **backend/**: Express server, config, models, controllers, routes, middlewares, `utils/blockchainService.js`, `.env.example`.
- **frontend/**: Vite React app, `src/` (pages, components, context, api), `public/`, `.env.example`.
- **smart-contracts/**: Hardhat, Solidity contract, scripts, deployments, `.env.example`.

Use `.env.example` in each folder to configure MongoDB, JWT secrets, Razorpay keys, RPC and private key for blockchain, etc.

---

## 9. Report Summary

Farmhelp (KrushiSetu) is a **full-stack, role-based agri-platform** with:

- **Backend**: Auth, products, cart, orders (Razorpay), documents (GridFS), certificates (blockchain), notifications, admin and farmer APIs.
- **Frontend**: Separate flows for Admin, Farmer, and Consumer with dashboards, document upload/verification, certificate view/verify, marketplace, cart, checkout, and analytics.
- **Blockchain**: Solidity **FarmerCertification** contract for issuing and verifying farmer certificates; backend uses EVM (ethers) to issue on admin verification and to verify for consumers.
- **File storage**: GridFS for Aadhaar/certificate and profile images; SHA256 hashes used for blockchain and verification.

This document can be used as the **main project report** for your major project submission. You can add sections such as “Future work”, “Screenshots”, and “Testing” as needed.
