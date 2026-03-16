import { Routes, Route } from "react-router-dom";
import React from "react";
import ConsumerDashboard from "./Dashboard";
import Orders from "./Orders";
import CartPage from './CartPage';
import ProductList from './ProductList';
import CheckoutPage from "./Checkout";
import OrderConfirmationPage from "./OrderConform";
import OrderDetailsPage from "./OrderDetails";
import Profile from '../Profile';
import TrackOrders from "./TrackOrders";
import Analytics from "./Analytics";
import ProductFarmers from "./ProductFarmers";
import Wishlist from "./Wishlist";
import TotalSpend from "./TotalSpend";

function ConsumerRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ConsumerDashboard />}>
        <Route index element={<Profile />} />
        <Route path="profile" element={<Profile />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="shop" element={<ProductList />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="order-confirmation" element={<OrderConfirmationPage />} />
        <Route path="order/:orderId" element={<OrderDetailsPage />} />
        <Route path="orders" element={<Orders />} />
        <Route path="track-orders" element={<TrackOrders />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="total-spend" element={<TotalSpend />} />
        <Route path="settings" element={<Profile />} />
        <Route path="product/:productName/farmers" element={<ProductFarmers />} />
      </Route>
    </Routes>
  );
}

export default ConsumerRoutes;