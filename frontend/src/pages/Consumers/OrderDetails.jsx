import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FiPackage,
  FiCalendar,
  FiCreditCard,
  FiDownload,
  FiHome,
  FiClock,
  FiMapPin,
  FiBox,
  FiCheck
} from "react-icons/fi";
import { TbTruckDelivery } from "react-icons/tb";

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!order) {
      fetchOrder();
    }
  }, [order]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setOrder(res.data.order);
      } else {
        setError('Failed to load order details');
      }
    } catch (err) {
      console.error('Error fetching order details:', err.response || err.message);
      setError('Unable to fetch order information');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      console.error("Date formatting error:", error);
      return "N/A";
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const options = { hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleTimeString(undefined, options);
    } catch (error) {
      console.error("Time formatting error:", error);
      return "N/A";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-emerald-50">Loading order...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const orderDate = order.createdAt || order.orderDate || new Date().toISOString();

  // simple horizontal timeline component
  const OrderTimeline = ({ status }) => {
    const steps = [
      { status: 'created', icon: <FiBox size={20} />, label: 'Order Placed' },
      { status: 'processing', icon: <FiPackage size={20} />, label: 'Processing' },
      { status: 'shipped', icon: <TbTruckDelivery size={20} />, label: 'Shipped' },
      { status: 'delivered', icon: <FiCheck size={20} />, label: 'Delivered' }
    ];
    const currentStep = steps.findIndex(step => step.status === status);
    return (
      <div className="relative mt-8">
        <div className="hidden sm:block absolute top-4 left-0 w-full h-0.5 bg-gray-700" />
        <div className="block sm:hidden absolute left-4 top-0 h-full w-0.5 bg-gray-700" />
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center">
          {steps.map((step, index) => (
            <div key={step.status} className="flex items-start sm:flex-col sm:items-center gap-3 sm:gap-2 mb-4 sm:mb-0">
              <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full 
                ${index <= currentStep ? 'bg-emerald-500' : 'bg-gray-700'} 
                transition-colors duration-300`}>
                {step.icon}
              </div>
              <p className={`text-sm font-medium ${index <= currentStep ? 'text-emerald-500' : 'text-gray-400'}`}>
                {step.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const cancelOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/orders/${order._id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setOrder(prev => ({ ...prev, orderStatus: 'cancelled' }));
      }
    } catch (err) {
      console.error('Error cancelling order:', err.response || err.message);
    }
  };

  const deliveryDate = order.deliveryEstimate
    ? new Date(order.deliveryEstimate)
    : (() => {
        const date = new Date(orderDate);
        date.setDate(date.getDate() + 5);
        return date;
      })();

  return (
    <div className="pb-16 pt-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        {/* Header */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-green-200/20 dark:border-emerald-800/20 overflow-hidden mb-6">
          <div className="p-6 border-b border-green-200/20 dark:border-emerald-800/20 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <FiPackage className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-semibold text-white">Order Details</h2>
            </div>
            <span className="text-emerald-400 font-medium">
              #{order.order_id || order.orderNumber || "--"}
            </span>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex flex-col md:flex-row justify-between text-sm">
              <div className="mb-4 md:mb-0">
                <div className="text-gray-400 mb-1">Order Date</div>
                <div className="flex items-center text-white">
                  <FiCalendar className="w-4 h-4 mr-2 text-emerald-400" />
                  {formatDate(orderDate)} at {formatTime(orderDate)}
                </div>
              </div>

              <div className="mb-4 md:mb-0">
                <div className="text-gray-400 mb-1">Payment Method</div>
                <div className="flex items-center text-white">
                  <FiCreditCard className="w-4 h-4 mr-2 text-emerald-400" />
                  {order.paymentMethod === "razorpay"
                    ? "Online Payment (Razorpay)"
                    : "Cash on Delivery"}
                </div>
              </div>

              <div>
                <div className="text-gray-400 mb-1">Delivery Estimate</div>
                <div className="flex items-center text-white">
                  <FiMapPin className="w-4 h-4 mr-2 text-emerald-400" />
                  {formatDate(deliveryDate)}
                </div>
              </div>
            </div>

            {/* Shipping address and items etc. reuse similar structure from confirmation page below if needed */}
          </div>
        </div>

        {/* reuse the rest of the order summary from order confirmation */}
        {/* You can copy-paste the JSX from OrderConform.jsx below this comment and remove the success banner */}
        {/* Shipping Address, Item list, totals, payment info, and print/back buttons */}

        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-green-200/20 dark:border-emerald-800/20 overflow-hidden mb-6">
          {/* Shipping address section */}
          <div className="p-6 border-b border-green-200/20 dark:border-emerald-800/20 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <FiMapPin className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-semibold text-white">Shipping Address</h2>
            </div>
          </div>
          <div className="p-6 text-white text-sm space-y-1">
            <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
            <p>{order.shippingAddress.addressLine1}</p>
            {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-green-200/20 dark:border-emerald-800/20 overflow-hidden mb-6">
          {/* Items section */}
          <div className="p-6 border-b border-green-200/20 dark:border-emerald-800/20">
            <h2 className="text-xl font-semibold text-white">Products</h2>
          </div>
          <div className="p-6 space-y-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div className="text-white">
                  <p>{item.name} x {item.quantity}</p>
                  <p className="text-gray-400 text-xs">Farmer: {item.farmer_details?.name}</p>
                </div>
                <div className="text-emerald-400">₹{(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-green-200/20 dark:border-emerald-800/20 overflow-hidden mb-6">
          <div className="p-6 space-y-4">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Subtotal</span>
              <span>₹{order.subtotal.toFixed(2)}</span>
            </div>
            {order.shippingFee > 0 && (
              <div className="flex justify-between text-sm text-gray-400">
                <span>Shipping Fee</span>
                <span>₹{order.shippingFee.toFixed(2)}</span>
              </div>
            )}
            {order.discount > 0 && (
              <div className="flex justify-between text-sm text-gray-400">
                <span>Discount</span>
                <span>-₹{order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-white font-medium pt-2 border-t border-green-200/10 dark:border-emerald-800/10">
              <span>Total</span>
              <span className="text-emerald-400">₹{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <OrderTimeline status={order.orderStatus} />

        <div className="flex flex-col md:flex-row justify-center gap-4 mb-8">
          <Link
            to="/consumer/track-orders"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg flex items-center justify-center"
          >
            <FiClock className="mr-2" />
            Back to Orders
          </Link>

          {order.orderStatus !== 'shipped' && order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && (
            <button
              onClick={cancelOrder}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg flex items-center justify-center"
            >
              Cancel Order
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center justify-center"
          >
            <FiDownload className="mr-2" />
            Print Receipt
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderDetailsPage;
