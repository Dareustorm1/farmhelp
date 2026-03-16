# Farmhelp E-Commerce Platform - Troubleshooting & Setup Guide

## FIXES COMPLETED ✅

### 1. **ProductFarmers Page Reload Issue - FIXED**
**Problem:** Entering a pincode in ProductFarmers.jsx caused the entire page to reload unnecessarily.

**Root Cause:** The `useEffect` hook had `manualPincode` in its dependency array. This caused the effect to re-run on every keystroke, triggering page reloads.

**Solution Applied:**
- Removed `manualPincode` from useEffect dependency array
- Changed `handleManualPincodeSubmit()` to directly call `fetchFarmersForProduct(manualPincode)` instead of just setting state
- Changed `handleUseLocation()` to directly call `fetchFarmersForProduct(coords)` after getting geolocation
- Updated useEffect to only depend on `actualProductName`, so it only runs on initial page load

**Files Modified:**
- `frontend/src/pages/Consumers/ProductFarmers.jsx` (lines 511-550, 777-806)

### 2. **Debug Endpoint for Database Verification - ADDED**
**Purpose:** To help diagnose if MongoDB has any product data and from which farmers.

**New Route:** `GET /api/products/debug/all-products` (no authentication required)

**Response includes:**
- Total product count
- List of unique product names
- Breakdown of farmers and their products
- Sample products with farmer details

**Files Modified:**
- `backend/controllers/productController.js` - Added `debugGetAllProducts` export
- `backend/routes/productRoute.js` - Added debug route

## REQUIREMENTS FOR FULL FUNCTIONALITY ⚙️

The system is now fixed BUT requires these environment variables to work:

### Backend Configuration Needed
**File:** `backend/.env`

1. **OPENCAGE_API_KEY** (CRITICAL for location-based features)
   - Current value: `your_opencage_api_key` (placeholder - INVALID)
   - What is it: API key for converting pincodes to GPS coordinates
   - Get it from: https://opencagedata.com/
   - Free tier: 2,500 requests/day
   - Add to `.env`: `OPENCAGE_API_KEY=your_actual_api_key_here`

2. **Database Connection** (appears configured)
   - `MONGO_URL=mongodb+srv://hetumer296_db_user:hetumer296@cluster0.nwe33s2.mongodb.net/farmhelp`
   - Uses MongoDB Atlas with credentials included

3. **Razorpay Keys** (needed for payments)
   - Current value: `rzp_test_xxxxxxxxxxxx` (placeholder)
   - Get from: https://dashboard.razorpay.com/
   - Add to `.env`: Your actual test keys

### Frontend Configuration (Already Set)
**File:** `frontend/.env`

- `VITE_API_URL=http://localhost:5000` ✅ Set correctly for local development

## TESTING CHECKLIST 🧪

### Step 1: Check if MongoDB has data
1. Open terminal and run: `curl http://localhost:5000/api/products/debug/all-products`
2. Look for response showing total product count
3. If count = 0, you need to add products first (via farmer dashboard)

### Step 2: Test location-based feature
1. Make sure `OPENCAGE_API_KEY` is set in `backend/.env`
2. Navigate to ProductFarmers page with a product
3. Enter a valid 6-digit Indian pincode in the input field
4. **Expected behavior:** No page reload, should show farmers within 100 km OR "No farmers found" message
5. Try clicking "Use My Location" button if browser allows geolocation

### Step 3: Test full order flow
1. Login as consumer
2. Find product → Add to cart (happens via ProductFarmers page)
3. Go to cart page → See items with farmer details
4. Checkout → Select payment method
5. Complete payment (Razorpay test keys needed)
6. Order should appear in "Track Orders" page

## COMMON ISSUES & FIXES 🔧

### Issue: "Unable to get your location" or "No nearby farmers found"
- **Check:** Is `OPENCAGE_API_KEY` set to actual value (not `your_opencage_api_key`)?
- **Check:** Does MongoDB have any products? Use debug endpoint to verify
- **Check:** Does the farmer's profile have a `pincode` field set?

### Issue: Page reloads or behaves strangely after entering pincode
- **Status:** This should be FIXED now (see above)
- **If still happening:** Check browser DevTools Console for errors

### Issue: Farmers list shows but with wrong distance
- **Cause:** Could be Haversine formula or road multiplier calculations
- **Check:** Backend logs should show calculated distances for each farmer

### Issue: Cart not persisting or showing old data
- **Server-backed cart:** Requires authentication token + valid `/api/cart/*` endpoints
- **Fallback:** localStorage is used for unauthenticated users
- **Check:** Ensure `backend/.env` has proper JWT_SECRET

### Issue: Cart appears empty or actions fail
- Verify `axios` is imported in `CartPage.jsx` (added in latest update).
- Quantity buttons now send **new quantity** instead of delta.
- Inspect browser console and network tab when performing cart operations; look for 200 responses from `/api/cart` and check response payloads.
- Backend logs now print each cart request; check terminal for messages like `POST /api/cart/add` etc.
- Use `curl -H "Authorization: Bearer <token>" http://localhost:5000/api/cart` to view raw server cart JSON.
- When merging local cart into server, localStorage is cleared and items are added sequentially.
- If price or quantity values look wrong, the client normalizes fields before display.
- **Checkout flow:** The cart page now saves `checkout` data into localStorage even when authenticated. Checkout page will also fetch the server cart if no local data exists, so users rarely get bounced back to cart.
- **Order submission hang:** Earlier the checkout page would spin indefinitely if the payment method value was somehow missing or unrecognised. A fallback redirect to `/consumer/orders` is now in place and processing state is always cleared; additionally the console logs the submission and server response for easier debugging.

### Issue: Orders not visible after placing
- After placing an order you'll initially land on a confirmation page. The app now **automatically redirects to the Track Orders page after a few seconds** and passes the new order along, so you don’t have to click anything.
- The link still remains in case you want to navigate immediately.
- Server‑side cart is cleared automatically when an order is processed (checkout calls `/api/cart/clear`), and the client also removes any saved cart from localStorage. If you ever see items lingering, refresh the cart page to pull the fresh empty cart.
- If the order still doesn't show up, reload or revisit the tracking page; the list is fetched from `/api/orders/my-orders` and will include the recent order.
- You can open any order from the tracking list to see full details and download/print a receipt or cancel the order if it's not yet shipped.


## FILE SUMMARY 📁

**Backend Changes:**
- `backend/controllers/productController.js` - Added `debugGetAllProducts` function
- `backend/routes/productRoute.js` - Added debug route + imported new controller

**Frontend Changes:**
- `frontend/src/pages/Consumers/ProductFarmers.jsx` - MAJOR FIX:
  - Removed `manualPincode` from useEffect dependencies (line 806)
  - Updated `handleManualPincodeSubmit()` to trigger fetch (line 533)
  - Updated `handleUseLocation()` to trigger fetch (line 548)

## NEXT STEPS 🚀

1. **Get OPENCAGE_API_KEY:**
   - Sign up at https://opencagedata.com/
   - Copy your API key
   - Add to `backend/.env`: `OPENCAGE_API_KEY=<your_key>`

2. **Verify MongoDB:**
   - Run: `curl http://localhost:5000/api/products/debug/all-products`
   - If count = 0, add test products via farmer dashboard

3. **Test location features:**
   - Try pincode input without page reloading
   - Verify farmers display within 100 km radius

4. **Setup Razorpay (optional for testing):**
   - Get test keys from Razorpay dashboard
   - Add to `.env`

## Notes 📝

- The 100 km marketplace radius is working as designed
- Geofencing logic includes road multipliers (1.2x-1.5x) to account for non-straight-line distances
- System supports both pincode-based AND geolocation-based searching
- All farmer data must have a valid `pincode` in their profile for location filtering to work
