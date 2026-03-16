import React, { useState, useEffect } from "react";
import axios from 'axios';
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiShoppingCart,
  FiTrash2,
  FiMinus,
  FiPlus,
  FiCreditCard,
  FiShield,
  FiTruck,
  FiRefreshCw,
  FiInfo,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CartPage = () => {
  // Add this utility function at the top of your component
  const ensureString = (location) => {
    if (!location) return "";
    if (typeof location === "string") return location;
    if (typeof location === "object") {
      if (location.city || location.state) {
        return [location.city, location.state].filter(Boolean).join(", ");
      }
      return JSON.stringify(location);
    }
    return String(location);
  };
  
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [error, setError] = useState(null);
  const [checkoutData, setCheckoutData] = useState(null);

  // Calculate cart totals
  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const shippingFee = cart.length > 0 ? 4.99 : 0;
  const taxAmount = subtotal * 0.05; // 5% tax
  const discountAmount = couponApplied ? subtotal * 0.1 : 0; // 10% discount if coupon applied
  const totalAmount = subtotal + shippingFee + taxAmount - discountAmount;

  // Load cart data when component mounts
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // try to load from server first
      fetchServerCart(token);
    } else {
      loadCart();
    }
  }, []);

  // Listen for cartUpdated events to refresh data automatically
  useEffect(() => {
    const handler = () => {
      const token = localStorage.getItem("token");
      if (token) {
        fetchServerCart(token);
      } else {
        loadCart();
      }
    };
    window.addEventListener('cartUpdated', handler);
    return () => window.removeEventListener('cartUpdated', handler);
  }, []);

  // Function to load cart data from localStorage (fallback)
  const loadCart = () => {
    setLoading(true);
    try {
      console.log("Loading cart from localStorage...");
      const savedCart = localStorage.getItem("cart");

      if (savedCart) {
        // Log raw cart data for debugging
        console.log("Raw cart data:", savedCart);

        const parsedCart = JSON.parse(savedCart);
        console.log("Parsed cart data:", parsedCart);

        if (Array.isArray(parsedCart)) {
          console.log(`Found ${parsedCart.length} items in cart`);
          setCart(parsedCart);
        } else {
          console.log("Cart data is not an array:", parsedCart);
          setCart([]);
        }
      } else {
        console.log("No cart found in localStorage");
        setCart([]);
      }
      setError(null);
    } catch (error) {
      console.error("Error loading cart:", error);
      setError("Failed to load your cart. Please try again.");
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  // Load cart from server using API when user authenticated
  const fetchServerCart = async (token) => {
    try {
      setLoading(true);

      // merge any local cart items first
      const localCartRaw = localStorage.getItem('cart');
      if (localCartRaw) {
        try {
          const localCartItems = JSON.parse(localCartRaw);
          for (const item of localCartItems) {
            await axios.post(
              `${API_BASE_URL}/api/cart/add`,
              { productId: item._id, quantity: item.quantity },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          }
        } catch (mergeErr) {
          console.warn('Error merging local cart into server:', mergeErr.message);
        }
        localStorage.removeItem('cart');
      }

      const response = await axios.get(`${API_BASE_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Server cart response:', response.data);
      if (response.data.success) {
        // handle possible structure differences
        const items = response.data.cart.items || [];
        // if each item has product_details.price, copy it to top-level price for calculations
        const normalized = items.map(item => {
          if (item.product_details && item.product_details.price && !item.price) {
            return { ...item, price: item.product_details.price };
          }
          return item;
        });
        setCart(normalized);
      } else {
        setError("Unable to fetch cart from server");
      }
    } catch (err) {
      console.error("Server cart fetch error:", err.response || err.message);
      // fallback to local
      loadCart();
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity (local or server)
  const updateQuantity = async (itemId, change) => {
    const token = localStorage.getItem("token");
    // calculate new quantity based on current cart state
    const currentItem = cart.find(item => item._id === itemId);
    const newQty = currentItem ? Math.max(1, currentItem.quantity + change) : change;
    if (token) {
      try {
        const response = await axios.put(
          `${API_BASE_URL}/api/cart/update`,
          { itemId, quantity: newQty },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
          fetchServerCart(token);
        }
      } catch (err) {
        console.error("Error updating server cart quantity:", err);
      }
      return;
    }

    // fallback to local
    const updatedCart = cart.map((item) => {
      if (item._id === itemId) {
        const newQuantity = Math.max(1, item.quantity + change);

        // Check if new quantity exceeds available quantity
        if (newQuantity > item.available_quantity) {
          setError(`Only ${item.available_quantity} units available`);
          setTimeout(() => setError(null), 3000);
          return item;
        }

        return { ...item, quantity: newQuantity };
      }
      return item;
    });

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await axios.delete(`${API_BASE_URL}/api/cart/remove/${itemId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchServerCart(token);
      } catch (err) {
        console.error("Error removing server cart item:", err);
      }
      return;
    }

    const updatedCart = cart.filter((item) => item._id !== itemId);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your cart?")) return;
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await axios.delete(`${API_BASE_URL}/api/cart/clear`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchServerCart(token);
      } catch (err) {
        console.error("Error clearing server cart:", err);
      }
      return;
    }

    setCart([]);
    localStorage.removeItem("cart");
  };

  // Apply coupon code (uses server if authenticated)
  const applyCoupon = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await axios.post(`${API_BASE_URL}/api/cart/coupon`,
          { couponCode },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
          // re-fetch cart to update discount
          fetchServerCart(token);
          setCouponApplied(true);
        } else {
          setError(response.data.message || "Invalid coupon code");
          setTimeout(() => setError(null), 3000);
        }
      } catch (err) {
        console.error('Apply coupon error', err);
        setError('Failed to apply coupon');
        setTimeout(() => setError(null), 3000);
      }
      return;
    }

    const validCoupons = ["discount10", "welcome", "AGROSYNC"];

    if (validCoupons.includes(couponCode.toLowerCase())) {
      setCouponApplied(true);
    } else {
      setError("Invalid coupon code");
      setTimeout(() => setError(null), 3000);
    }
  };

  // Continue shopping
  const continueShopping = () => {
    navigate("/consumer/shop");
  };

  // Proceed to checkout
  const handleCheckout = () => {
    if (cart.length === 0) {
      setError("Your cart is empty");
      return;
    }

    // Create a deep copy of cart items and ensure locations are strings
    const processedItems = cart.map(item => {
      const processedItem = {...item};
      
      // Ensure farmer_location is a string
      if (typeof processedItem.farmer_location === 'object') {
        processedItem.farmer_location = ensureString(processedItem.farmer_location);
      }
      
      // Ensure farmer_details.location is a string
      if (processedItem.farmer_details && typeof processedItem.farmer_details.location === 'object') {
        processedItem.farmer_details = {
          ...processedItem.farmer_details,
          location: ensureString(processedItem.farmer_details.location)
        };
      }
      
      // Ensure traceability.farm_location is a string
      if (processedItem.traceability && typeof processedItem.traceability.farm_location === 'object') {
        processedItem.traceability = {
          ...processedItem.traceability,
          farm_location: ensureString(processedItem.traceability.farm_location)
        };
      }
      
      return processedItem;
    });
    
    // Prepare checkout data from processed cart items and calculated values
    const checkoutData = {
      items: processedItems,
      subtotal: subtotal,
      shippingFee: shippingFee,
      taxAmount: taxAmount,
      discount: discountAmount || 0,
      total: totalAmount,
      couponCode: couponApplied ? couponCode : null
    };

    // Save checkout data to localStorage regardless of login state
    console.log('Saving checkout data:', checkoutData);
    localStorage.setItem("checkout", JSON.stringify(checkoutData));

    // Now navigate to checkout page
    navigate("/consumer/checkout");
  };

  // Debug function
  const debugCart = () => {
    try {
      const savedCart = localStorage.getItem("cart");
      console.log("Raw localStorage cart:", savedCart);

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        console.log("Parsed cart items:", parsedCart);
        console.log("Cart item count:", parsedCart.length);

        if (parsedCart.length > 0) {
          console.log("First item structure:", parsedCart[0]);
        }
      } else {
        console.log("No cart found in localStorage");
      }
    } catch (error) {
      console.error("Error debugging cart:", error);
    }
  };

  // Trigger debug
  useEffect(() => {
    debugCart();
  }, []);

  return (
    <div className="pb-16">
      {/* Error Message */}
      {error && (
        <div className="fixed top-4 right-4 z-50 p-4 bg-red-600 text-white rounded-lg shadow-lg flex items-center space-x-2">
          <FiInfo />
          <span>{error}</span>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center space-x-3 mb-6">
          <button
            onClick={continueShopping}
            className="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span>Continue Shopping</span>
          </button>

          {/* Add refresh button for debugging */}
          <button
            onClick={loadCart}
            className="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 transition-colors ml-4"
          >
            <FiRefreshCw className="w-4 h-4" />
            <span>Refresh Cart</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <FiShoppingCart className="w-7 h-7 text-emerald-400" />
          <h1 className="text-3xl font-bold text-white">Your Cart</h1>
        </div>
        <p className="text-gray-400 mt-2">
          {cart.length === 0
            ? "Your cart is empty."
            : `You have ${cart.length} item${
                cart.length !== 1 ? "s" : ""
              } in your cart.`}
        </p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : cart.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 bg-white/5 backdrop-blur-sm rounded-xl border border-green-200/20 dark:border-emerald-800/20"
        >
          <FiShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-400 mb-6">
            Looks like you haven't added any products to your cart yet.
          </p>
          <button
            onClick={continueShopping}
            className="px-5 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Browse Products
          </button>
        </motion.div>
      ) : (
        <div className="flex flex-col md:flex-row gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:w-2/3"
          >
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-green-200/20 dark:border-emerald-800/20 overflow-hidden">
              <div className="p-6 border-b border-green-200/20 dark:border-emerald-800/20 flex justify-between">
                <h2 className="text-xl font-semibold text-white">
                  Product Details
                </h2>
                <button
                  onClick={clearCart}
                  className="text-red-400 hover:text-red-300 text-sm flex items-center space-x-1"
                >
                  <FiTrash2 className="w-4 h-4" />
                  <span>Clear Cart</span>
                </button>
              </div>

              <div className="divide-y divide-green-200/10 dark:divide-emerald-800/10">
                {cart.map((item, index) => (
                  <div
                    key={item._id || index}
                    className="p-6 flex flex-col sm:flex-row gap-4"
                  >
                    <div className="w-20 h-20 rounded overflow-hidden flex-shrink-0 bg-white/10">
                      {item.image_url && (
                        <img
                          src={
                            item.image_url.startsWith("http")
                              ? item.image_url
                              : `${API_BASE_URL}${item.image_url}`
                          }
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.log(
                              "Image failed to load:",
                              item.image_url
                            );
                            e.target.src =
                              "https://via.placeholder.com/80?text=No+Image";
                          }}
                        />
                      )}
                    </div>

                    <div className="flex-grow">
                      <h3 className="text-white font-medium">{item.name}</h3>
                      {item.category && (
                        <span className="text-xs px-2 py-1 rounded-full bg-emerald-900/30 text-emerald-400 inline-block mt-1">
                          {item.category}
                        </span>
                      )}

                      {(item.farmer_location ||
                        (item.farmer_details &&
                          item.farmer_details.location)) && (
                        <div className="mt-2 text-xs text-gray-400 space-y-1">
                          <p>
                            <span className="text-emerald-400">
                              Farmer location:
                            </span>{" "}
                            {ensureString(item.farmer_location || item.farmer_details?.location)}
                          </p>
                          {item.farmer_mobile ||
                          item.farmer_details?.contact ? (
                            <p>
                              <span className="text-emerald-400">Contact:</span>{" "}
                              {item.farmer_mobile ||
                                item.farmer_details?.contact}
                            </p>
                          ) : null}
                          {item.farmer_details?.rating && (
                            <p>
                              <span className="text-emerald-400">Rating:</span>{" "}
                              {item.farmer_details.rating}★
                            </p>
                          )}
                        </div>
                      )}

                      {item.traceability && (
                        <div className="mt-2 text-xs text-gray-400">
                          <details className="group">
                            <summary className="cursor-pointer text-emerald-400 hover:text-emerald-300 flex items-center">
                              View traceability info
                              <svg
                                className="ml-1 w-3 h-3 transition-transform group-open:rotate-180"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </summary>
                            <div className="pt-2 pl-2 space-y-1">
                           
                              {item.traceability.farm_location && (
                                <p>
                                  Farm location:{" "}
                                  {ensureString(item.traceability.farm_location)}
                                </p>
                              )}
                              {item.traceability.harvest_date && (
                                <p>
                                  Harvested:{" "}
                                  {new Date(
                                    item.traceability.harvest_date
                                  ).toLocaleDateString()}
                                </p>
                              )}
                              {item.traceability.harvest_method && (
                                <p>
                                  Method: {item.traceability.harvest_method}
                                </p>
                              )}
                              {item.traceability.certified_by && (
                                <p>
                                  Certified by: {item.traceability.certified_by}
                                </p>
                              )}
                            </div>
                          </details>
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item._id, -1)}
                            className="w-8 h-8 rounded-full border border-emerald-700 flex items-center justify-center text-white hover:bg-emerald-800/50"
                          >
                            <FiMinus className="w-3 h-3" />
                          </button>
                          <span className="text-white font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item._id, 1)}
                            className="w-8 h-8 rounded-full border border-emerald-700 flex items-center justify-center text-white hover:bg-emerald-800/50"
                          >
                            <FiPlus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-emerald-400 font-semibold">
                          ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:w-1/3"
          >
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-green-200/20 dark:border-emerald-800/20 sticky top-28">
              <div className="p-6 border-b border-green-200/20 dark:border-emerald-800/20">
                <h2 className="text-xl font-semibold text-white">
                  Order Summary
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-between text-gray-300">
                  <span>
                    Subtotal (
                    {cart.reduce((total, item) => total + item.quantity, 0)}{" "}
                    items)
                  </span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-300">
                  <span>Shipping Fee</span>
                  <span className="font-medium">₹{shippingFee.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-300">
                  <span>Tax (5%)</span>
                  <span className="font-medium">₹{taxAmount.toFixed(2)}</span>
                </div>

                {couponApplied && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount (10%)</span>
                    <span className="font-medium">
                      -₹{discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="pt-4 border-t border-green-200/10 dark:border-emerald-800/10">
                  <div className="flex justify-between text-white">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-emerald-400">
                    ₹{totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* <div className="pt-4 mt-4 border-t border-green-200/10 dark:border-emerald-800/10">
                  <p className="text-sm text-gray-400 mb-2">
                    Apply Coupon Code
                  </p>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={couponApplied}
                      placeholder="Enter coupon code"
                      className="flex-grow px-3 py-2 bg-white/5 border border-green-200/20 dark:border-emerald-800/20 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      onClick={applyCoupon}
                      disabled={couponApplied || !couponCode}
                      className={`px-4 py-2 rounded-lg ${
                        couponApplied
                          ? "bg-emerald-900/50 text-emerald-200 cursor-not-allowed"
                          : "bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                      }`}
                    >
                      Apply
                    </button>
                  </div>
                  {couponApplied && (
                    <p className="text-sm text-emerald-400 mt-2">
                      Coupon applied successfully!
                    </p>
                  )}
                </div> */}

                <button
                  onClick={handleCheckout}
                  className="w-full mt-6 py-3 px-4 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <FiCreditCard className="w-5 h-5" />
                  <span>Proceed to Checkout</span>
                </button>

                <button
                  onClick={continueShopping}
                  className="w-full mt-3 py-3 px-4 border border-emerald-600 text-emerald-400 rounded-lg font-medium hover:bg-emerald-900/30 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>

              <div className="p-6 pt-0">
                <div className="flex justify-center items-center space-x-6 text-gray-400 text-xs">
                  <div className="flex flex-col items-center">
                    <FiShield className="w-5 h-5 mb-1" />
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <FiTruck className="w-5 h-5 mb-1" />
                    <span>Fast Delivery</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <FiShield className="w-5 h-5 mb-1" />
                    <span>Money-back Guarantee</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Debug Panel for Development - Can remove in production */}
    </div>
  );
};

export default CartPage;