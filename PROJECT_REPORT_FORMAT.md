# KrushiSetu (Farmhelp) — Project Report  
## As per Content Format–Report Specification

**Formatting (apply in Word):** Main heading 18pt Times New Roman Bold; Sub heading 14pt Times New Roman Bold; Content 12pt Times New Roman; Alignment: Justified; Line spacing: 1.5. Header: Right – Project Title, Left – Student ID. Footer: Right – Page Number. Chapter-wise; no borders.

---

# Chapter 1: Introduction

## 1.1 Brief Overview of the Work

KrushiSetu (branded as Farmhelp) is a role-based web platform that connects smallholder farmers, administrators, and consumers in an agricultural marketplace. The system enables farmers to register, upload identity and certification documents (Aadhaar and government certificate), and list agricultural products. Administrators verify farmer documents and, upon full verification, trigger issuance of an immutable blockchain-backed certificate. Consumers can verify farmer certificates against the blockchain, browse products from farmers within a 100 km radius (geofencing), add items to cart, place orders with Razorpay or cash-on-delivery, and track orders. The platform uses MongoDB with GridFS for file storage, JWT for authentication, and a Solidity smart contract (EVM) for storing certificate hashes, ensuring traceability and trust in the supply chain.

## 1.2 Objective

- To build a secure, role-based web application connecting farmers, consumers, and administrators.
- To enable document-based farmer verification (Aadhaar and certificate) with admin approval and blockchain-backed certificate issuance.
- To provide a geofenced marketplace (100 km radius) so consumers buy from nearby verified farmers.
- To support end-to-end order flow: cart, checkout (Razorpay/COD), order tracking, and notifications for farmers and consumers.
- To deliver role-specific dashboards and analytics for admin, farmer, and consumer.

## 1.3 Scope

- **In scope:** User registration and login (farmer, consumer); admin-only document verification and certificate issuance; farmer document upload (Aadhaar, certificate) with GridFS storage; blockchain integration for certificate hashes (Solidity contract, Ethers.js); product CRUD and listing; cart and order management with Razorpay; geofencing (distance check) for consumer–farmer matching; notifications; role-based dashboards and analytics; certificate verification by certificate ID.
- **Out of scope:** Direct cryptocurrency payments; full ERP for farmers; mobile native apps (web-only); email/SMS delivery infrastructure beyond configuration.

## 1.4 Project Modules

1. **Authentication Module** — Registration (farmer/consumer), login, JWT access and refresh tokens, role-based access control, session handling.
2. **Farmer Module** — Profile, document upload (Aadhaar, certificate), product listing (add/edit/delete), order view, analytics, certificate view.
3. **Admin Module** — Dashboard statistics, farmer and consumer lists, document verification (approve/reject), certificate issuance (blockchain), order management, certificate list and verify.
4. **Consumer Module** — Marketplace browse (geofenced), cart, checkout (Razorpay/COD), order tracking, certificate verification, analytics.
5. **Product Module** — Product CRUD, listing by farmer/category, traceability fields (harvest method, harvest date).
6. **Order Module** — Order creation, payment (Razorpay/COD), status updates, cancellation, delivery estimate, notifications.
7. **Document & Certificate Module** — Upload/store documents in GridFS, compute SHA256 hashes, admin verification workflow, blockchain certificate issue and verify.
8. **Notification Module** — In-app notifications for order events (new order, shipped, delivered, cancelled) for farmers and consumers.
9. **Blockchain Module** — Smart contract (FarmerCertification) for issuing and verifying certificates; backend integration via Ethers.js.

## 1.5 Project Hardware/Software Requirements

**Hardware:**  
- Processor: x86/ARM compatible (e.g. Intel Core i3 or equivalent).  
- RAM: Minimum 4 GB (8 GB recommended for development).  
- Storage: Minimum 2 GB free disk space.  
- Network: Internet for MongoDB Atlas, blockchain RPC, Razorpay, and deployment.

**Software:**  
- **Frontend:** Node.js (v18+), npm/pnpm; React 18, Vite 5, React Router 6, Tailwind CSS 4, Axios, Recharts, Framer Motion, React Hot Toast, Lucide React, Socket.IO client, Firebase (optional).  
- **Backend:** Node.js (v18+), Express 4, Mongoose 8 (MongoDB), JWT (jsonwebtoken), bcrypt, Multer, CORS, Razorpay SDK, Socket.IO, Ethers.js 6, dotenv.  
- **Database:** MongoDB (local or Atlas); GridFS for files.  
- **Blockchain:** Solidity 0.8.x, Hardhat, Hedera EVM / Ethereum testnet; Ethers.js in backend.  
- **Tools:** Git, VS Code or similar IDE; Postman or similar for API testing.

---

# Chapter 2: Literature Review

(The following are representative areas of literature referred during the project. Replace or extend with actual papers and citations as per your references.)

**1. Role-based access control in web applications**  
Role-based access control (RBAC) is widely used to restrict system functions by user role. In this project, three roles—admin, farmer, and consumer—are enforced at the API layer using JWT and middleware, ensuring that document verification and certificate issuance remain admin-only while farmers and consumers access only their respective resources. Literature on RBAC in REST APIs and JWT-based authentication was referred for design of routes and middleware.

**2. Blockchain for supply chain and certification**  
Blockchain is used to store tamper-evident records of farmer certifications. Existing work on using smart contracts for certificates and supply chain traceability was referred. In this project, certificate hashes (Aadhaar and government certificate) are stored on-chain so that consumers can verify authenticity without relying solely on a central database, aligning with decentralised trust models discussed in blockchain literature.

**3. Geospatial filtering and haversine distance**  
Restricting consumer purchases to farmers within a fixed radius (e.g. 100 km) requires computing distance between geographic points. The Haversine formula and related geospatial indexing approaches were referred for implementing server-side distance checks and geofencing so that product and farmer listings respect the 100 km constraint.

**4. File storage and hashing (GridFS and SHA-256)**  
Storing large files (e.g. Aadhaar, certificates) in MongoDB GridFS and computing SHA-256 hashes for integrity and blockchain input was designed with reference to GridFS documentation and cryptographic hashing practices. Literature on secure document storage and hash-based verification supported the choice of hash-on-upload and hash-on-chain verification.

**5. Payment gateway integration (Razorpay)**  
Integrating Razorpay for online payments required understanding of order creation, capture, and webhook handling. Official Razorpay documentation and best practices for idempotency and secure callback handling were referred to implement checkout and payment status updates.

**6. Real-time notifications (Socket.IO)**  
Socket.IO was used for real-time notifications (e.g. new order, order status) to farmers and consumers. Literature and documentation on WebSocket-based real-time communication and event-driven updates were referred for designing the notification flow and client–server event names.

**7. React and single-page application architecture**  
The frontend is built with React, Vite, and React Router. Documentation and best practices on component structure, context for auth, protected routes, and state management were referred to organise the admin, farmer, and consumer flows and dashboards.

---

# Chapter 3: System Analysis & Design

## 3.1 Comparison of Existing Applications with Your Project (Merits and Demerits)

| Aspect | Existing Agri/Marketplace Apps | KrushiSetu (This Project) |
|--------|--------------------------------|----------------------------|
| **Verification** | Often manual or email-based; no immutable record | Admin verifies documents; certificate hashes stored on blockchain for public verification |
| **Trust** | Centralised; depends on platform | Decentralised trust via smart contract; anyone can verify certificate by ID |
| **Geofencing** | Rare or limited | Built-in 100 km radius for consumer–farmer matching |
| **Roles** | Sometimes only buyer/seller | Clear admin, farmer, consumer roles with separate dashboards and APIs |
| **File storage** | Often local disk or simple cloud | GridFS with hashing; files linked to verification and blockchain |
| **Payments** | Varies | Integrated Razorpay and COD; order and payment status tracked |
| **Real-time** | Often polling or none | Socket.IO for order and status notifications |

**Merits of this project:** Blockchain-backed certificates, geofencing, role-based design, integrated payments and notifications, document verification workflow, traceability fields on products.  
**Demerits/Limitations:** Single admin in smart contract; geofencing depends on accurate location data; EVM gas costs for certificate issuance; web-only (no native mobile app).

## 3.2 Project Feasibility Study

- **Technical feasibility:** Stack (React, Node, MongoDB, Solidity) is well supported; GridFS, JWT, and Ethers.js are mature. Geofencing and Razorpay are implementable with existing libraries and APIs.  
- **Operational feasibility:** Roles match real-world actors (admin, farmer, consumer); document verification and certificate workflow are clear and implementable.  
- **Economic feasibility:** Use of testnet or low-cost EVM for blockchain keeps cost manageable; MongoDB Atlas free tier and Razorpay test mode support development.  
- **Schedule feasibility:** Modular design (auth, products, orders, documents, certificates, notifications) allows phased development and testing.

## 3.3 Project Timeline Chart

(A high-level Gantt-style outline; adapt dates as per your schedule.)

- **Phase 1 (Weeks 1–2):** Requirements, SRS, database and API design; setup (MongoDB, Express, React, Vite).  
- **Phase 2 (Weeks 3–4):** Auth module (register, login, JWT, roles); user and profile APIs; frontend login/register and routing.  
- **Phase 3 (Weeks 5–6):** Farmer document upload (GridFS), admin verification APIs; product CRUD and listing; frontend farmer and admin flows.  
- **Phase 4 (Weeks 7–8):** Smart contract (FarmerCertification) development and testnet deployment; backend blockchain service (issue/verify certificate); certificate APIs and UI.  
- **Phase 5 (Weeks 9–10):** Cart and order module; Razorpay integration; geofencing logic; consumer shop and checkout.  
- **Phase 6 (Weeks 11–12):** Notifications (Socket.IO); dashboards and analytics; testing, bug fixes, and report/documentation.

## 3.4 Detailed Modules Description

**Authentication Module**  
- **Methodology:** User registers with name, email, password, role (farmer/consumer); password hashed with bcrypt. Login returns JWT access token and refresh token; middleware validates JWT and attaches user/role. Admin role is predefined (e.g. seeded).  
- **Expected output:** Secure login/register; protected routes by role; session expiry and refresh handling.

**Farmer Module**  
- **Methodology:** Farmer uploads Aadhaar and certificate via multipart API; files stored in GridFS; metadata and SHA256 hash stored in FarmerDocument. Farmer can add/edit/delete products, view orders, and view own certificate after admin verification and blockchain issuance.  
- **Expected output:** Document upload and product CRUD working; farmer dashboard and certificate view.

**Admin Module**  
- **Methodology:** Admin lists pending documents, verifies or rejects each document; when both Aadhaar and certificate are verified, backend generates certificateId, calls smart contract `issueCertificate`, stores certificateId and blockchainTxId in FarmerDocument. Admin can view farmers, consumers, orders, and certificate list.  
- **Expected output:** Document verification and one-click certificate issuance; dashboard stats and lists.

**Consumer Module**  
- **Methodology:** Consumer browses products (backend filters by distance ≤100 km using Haversine). Consumer adds to cart, checks out with Razorpay or COD; order is created and notifications sent. Consumer can verify farmer certificate via certificateId (backend calls contract `verifyCertificateById`).  
- **Expected output:** Geofenced product list; cart, checkout, order tracking; certificate verification.

**Product Module**  
- **Methodology:** CRUD APIs for products (name, category, description, price, quantity, unit, image, traceability); listing by farmer and category; image upload via GridFS or multer.  
- **Expected output:** Products created/updated by farmers; listing and filtering for marketplace.

**Order Module**  
- **Methodology:** Order created from cart with items, shipping address, subtotal, tax, discount; payment via Razorpay (create order, capture) or COD; status transitions (placed, processing, shipped, delivered, cancelled); delivery estimate and notifications.  
- **Expected output:** Orders created and paid; status updates and notifications to farmer and consumer.

**Document & Certificate Module**  
- **Methodology:** Documents uploaded to GridFS; hashes computed and stored in FarmerDocument. Admin verification updates status; on full verification, blockchain service issues certificate and saves certificateId/blockchainTxId. Verify API reads from contract and returns validity, farmerId, farmerName, expiry.  
- **Expected output:** Immutable certificate record on blockchain; public verification by certificateId.

**Notification Module**  
- **Methodology:** Backend creates notification records (userId, type, message, orderId); Socket.IO emits to connected clients by role; frontend listens and shows in-app notifications.  
- **Expected output:** Real-time order and status notifications for farmers and consumers.

**Blockchain Module**  
- **Methodology:** Solidity contract stores Certificate struct (isValid, issuedAt, expiryDate, hashes, farmerId, farmerName). issueCertificate (admin-only) and verifyCertificateById (view) are called from backend via Ethers.js using deployed contract address and admin wallet.  
- **Expected output:** Certificates issued on-chain and verifiable by anyone with certificateId.

## 3.5 Project SRS

### 3.5.1 Use Case Diagrams

- **Actors:** Admin, Farmer, Consumer.  
- **Use cases:** Farmer: Register, Login, Upload documents, Add/Edit/Delete product, View orders, View certificate. Consumer: Register, Login, Browse products (geofenced), Add to cart, Checkout (Razorpay/COD), Track orders, Verify certificate. Admin: Login, Verify documents, Issue certificate, View farmers/consumers/orders, Manage orders.  
- (Draw in UML: actors on left/right, use cases in centre, associations and include/extend as needed.)

### 3.5.2 Data Flow Diagrams

- **Level 0:** External entities: Farmer, Consumer, Admin. Process: KrushiSetu System. Data flows: Registration/Login, Documents, Products, Orders, Certificate issue/verify.  
- **Level 1:** Processes: Auth, Document management, Product management, Order management, Certificate (blockchain), Notifications. Data stores: User, FarmerDocument, Product, Order, Notification.  
- (Draw DFD with standard notation; show flows between processes and stores.)

### 3.5.3 Class Diagram

- **Classes:** User (name, email, password, role, phoneNumber, pincode, location, bio, profileImage); Product (name, category, description, price, discount, available_quantity, unit, image_url, traceability, farmer_id); Order (user, order_id, orderNumber, items, shippingAddress, subtotal, totalAmount, paymentMethod, orderStatus, …); Cart (user, items, total); FarmerDocument (farmerId, documents.aadhaar/certificate, certificateId, blockchainTxId, verificationStatus); Notification (userId, type, message, orderId, read).  
- **Relationships:** User 1—* Product; User 1—* Order; User 1—1 Cart; User 1—1 FarmerDocument (for farmer); Order *—* Product (through order items).  
- (Draw in UML class diagram notation.)

### 3.5.4 Entity Relationship Diagrams

- **Entities:** User, Product, Order, Cart, FarmerDocument, Notification.  
- **Key relationships:** User–Product (one-to-many); User–Order (one-to-many); User–Cart (one-to-one); User–FarmerDocument (one-to-one for farmers); Order–OrderItem (one-to-many); OrderItem–Product (many-to-one).  
- (Draw ER diagram with cardinalities.)

### 3.5.5 Sequence Diagrams

- **Certificate issuance:** Farmer (upload docs) → Backend → GridFS; Admin (verify) → Backend → FarmerDocument; Backend → Blockchain (issueCertificate) → FarmerDocument (save certificateId, blockchainTxId).  
- **Consumer order:** Consumer (checkout) → Backend → Razorpay (if online); Backend → Order create → Notification (Socket.IO) → Farmer/Consumer.  
- (Draw sequence diagrams for main flows.)

### 3.5.6 State/Activity Diagram

- **Order state diagram:** States: Placed → Processing → Shipped → Delivered; alternate: Cancelled. Transitions on admin/farmer actions and payment confirmation.  
- **FarmerDocument verification:** States: Pending → Partial (one doc verified) → Complete (both verified) → Certified (blockchain issued) or Rejected.  
- (Draw state or activity diagram as applicable.)

## 3.6 Data Dictionary

| Entity | Attribute | Type | Description |
|--------|-----------|------|-------------|
| User | _id | ObjectId | Primary key |
| User | name | String | Full name |
| User | email | String | Unique, lowercase |
| User | password | String | Bcrypt hash |
| User | role | Enum | admin, farmer, consumer |
| User | phoneNumber | String | 10 digits |
| User | pincode | String | 6 digits |
| User | location | Object | country, state, district, city |
| User | bio | String | Max 500 chars |
| User | profileImage | String | Reference/URL |
| Product | _id | ObjectId | Primary key |
| Product | name | String | Product name |
| Product | category | String | Category |
| Product | description | String | Description |
| Product | price | Number | Price per unit |
| Product | discount | Number | 0–100 |
| Product | available_quantity | Number | Stock |
| Product | unit | Enum | kg, g, lb, pieces, etc. |
| Product | image_url / image_id | String/ObjectId | Image reference |
| Product | traceability | Object | harvest_method, harvest_date |
| Product | farmer_id | ObjectId | Ref User |
| Order | _id | ObjectId | Primary key |
| Order | user | ObjectId | Ref User (consumer) |
| Order | order_id | String | Unique (e.g. Razorpay) |
| Order | orderNumber | String | Display number |
| Order | items | Array | product, farmer_id, name, price, quantity, traceability |
| Order | shippingAddress | Object | firstName, lastName, email, phone, address |
| Order | subtotal, shippingFee, taxAmount, discount, totalAmount | Number | Monetary fields |
| Order | paymentMethod | Enum | cod, razorpay |
| Order | paymentStatus, orderStatus | String | Status fields |
| Cart | _id | ObjectId | Primary key |
| Cart | user | ObjectId | Ref User |
| Cart | items | Array | product, quantity, farmer_details, traceability |
| Cart | total | Number | Computed total |
| FarmerDocument | _id | ObjectId | Primary key |
| FarmerDocument | farmerId | ObjectId | Ref User |
| FarmerDocument | documents.aadhaar/certificate | Subdocument | fileId, filename, fileHash, status, verifiedBy |
| FarmerDocument | certificateId | String | Unique, from blockchain |
| FarmerDocument | certificateIssueDate, expiryDate | Date | Certificate validity |
| FarmerDocument | blockchainTxId | String | Transaction hash |
| FarmerDocument | verificationStatus | Enum | pending, partial, complete, certified, rejected |
| Notification | _id | ObjectId | Primary key |
| Notification | userId | ObjectId | Ref User |
| Notification | type | String | new_order, order_delivered, etc. |
| Notification | message | String | Display message |
| Notification | orderId | ObjectId | Ref Order |
| Notification | read | Boolean | Read flag |

---

*End of Report. Insert Use Case, DFD, Class, ER, Sequence, and State/Activity diagrams as figures in Chapter 3.5. Apply the prescribed font and layout in Word (Times New Roman, 18/14/12 pt, justified, 1.5 line spacing, header/footer).*
