# Quick Start Guide - Getting Farmhelp Running

## Prerequisites
- Node.js 16+ installed
- MongoDB Atlas account (connection string provided in .env)
- Terminal/Command Prompt access

## Step 1: Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Ensure .env file exists with these critical values:
# OPENCAGE_API_KEY=<your_api_key>  # Required for location features!
# MONGO_URL=<your_mongodb_connection_string>

# Start backend server
npm start
# Expected: "Server running on port 5000" + "MongoDB Connected Successfully!"
```

**Test backend is running:**
```bash
curl http://localhost:5000/api/products/debug/all-products
```

## Step 2: Frontend Setup

```bash
# Open new terminal, navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start frontend dev server
npm run dev
# Expected: "Local: http://localhost:5173"
```

## Step 3: Test Location Features

1. **Open browser:** http://localhost:5173
2. **Login with existing account** (or create new one)
3. **Navigate to a product** → Click "View Product Farmers"
4. **Test pincode input:**
   - Enter a valid pincode (e.g., 400001 for Mumbai)
   - Should NOT reload page
   - Should show farmers within 100 km OR "No farmers found"

## Step 4: Verify Data

**Check if products exist in MongoDB:**
```bash
curl http://localhost:5000/api/products/debug/all-products
```

**Expected response:**
```json
{
  "success": true,
  "message": "Debug data - all products in MongoDB",
  "totalCount": 5,
  "uniqueProductNames": ["Tomato", "Wheat", "Rice"],
  "uniqueProductCount": 3,
  "farmerBreakdown": { ... },
  "sampleProducts": [ ... ]
}
```

If `totalCount: 0`, you need to:
1. Login as farmer
2. Add products via "Add Product" page
3. Make sure to set a valid pincode in farmer profile

## Step 5: Test Full Flow

1. **Login as consumer**
2. **Go to MarketPlace**
3. **Select a product**
4. **Enter pincode to find farms**
5. **Click "Buy from Farmer"** → Adds to cart
6. **Go to Cart page**
7. **Click Checkout**
8. **Select payment method**
9. **Complete purchase**
10. **Track order** in "Track Orders" page – the app now redirects here automatically a few seconds after checkout and your new order is prepended.
11. **View Receipt:** Click "View Receipt" on any order to see full details, print or download a receipt, or cancel the order if eligible.

> Note: the cart is cleared on the server and in localStorage once an order is placed; if the shopping cart ever shows items after checkout, refresh the page to fetch the empty cart again.

## Troubleshooting

### Backend won't start
```
Error: Cannot find module 'express'
→ Run: npm install in backend folder

Error: MongoDB Connection Failed
→ Check MONGO_URL in .env is correct
→ Check internet connection
```

### Frontend showing "Cannot connect to backend"
```
Check:
1. Backend is running on http://localhost:5000
2. VITE_API_URL in frontend/.env is correct
3. CORS is enabled (check backend/server.js)
```

### Pincode input still causes reload
```
This should be FIXED in latest version
If still happening:
1. Check browser console for errors
2. Hard refresh (Ctrl+Shift+R)
3. Clear browser cache
```

### No farmers showing even with valid pincode
```
Check:
1. OPENCAGE_API_KEY is set in backend/.env
2. Farmers have valid pincodes in their profiles
3. There are products in MongoDB (use debug endpoint)
4. Farmers are within 100 km of entered pincode
```

## Key Files Modified

**Frontend:**
- `src/pages/Consumers/ProductFarmers.jsx` - Fixed useEffect dependencies ✅

**Backend:**
- `controllers/productController.js` - Added debug endpoint ✅
- `routes/productRoute.js` - Added debug route ✅

## Environment Variables Required

**backend/.env:**
```env
PORT=5000
NODE_ENV=development
MONGO_URL=mongodb+srv://...
JWT_SECRET=your-secret
OPENCAGE_API_KEY=<GET THIS FROM https://opencagedata.com/>
RAZORPAY_KEY_ID=rzp_test_... (for payments)
RAZORPAY_KEY_SECRET=... (for payments)
```

**frontend/.env:**
```env
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_...
```

## Support

If issues persist:
1. Check TROUBLESHOOTING_GUIDE.md for detailed debugging
2. Review console errors (frontend DevTools)
3. Check server logs (backend terminal)
4. Use `/api/products/debug/all-products` to verify data
