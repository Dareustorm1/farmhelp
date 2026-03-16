import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from './Dashboard';
import AdminAnalytics from './Analytics';
import ProfilePage from '../Profile';
import FarmersList from './FarmersList';
import ConsumersList from './ConsumersList';
import OrderManagement from './OrderManagement';
import DocumentVerification from './DocumentVerification';
import Certificates from './Certificates';

const AdminRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/analytics" element={<AdminAnalytics />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/consumers" element={<ConsumersList />} />
            <Route path="/orders" element={<OrderManagement />} />
            <Route path="/farmers" element={<FarmersList />} />
            <Route path="/document-verification" element={<DocumentVerification />} />
            <Route path="/certificates" element={<Certificates />} />
        </Routes>
    );
};

export default AdminRoutes;