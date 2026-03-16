import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiBarChart2, FiArrowLeft, FiUsers, FiShoppingBag, FiTruck, FiDollarSign, FiActivity, FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';
import Navbar from '../../components/Navbar';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminAnalytics = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalFarmers: 0,
        totalConsumers: 0,
        activeOrders: 0,
        completedOrders: 0,
        totalProducts: 0,
        totalRevenue: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!token || user.role !== 'admin') {
            navigate('/login');
            return;
        }
        const fetchStats = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/admin/stats`, {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
                });
                if (response.data.success) setStats(response.data.stats || response.data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load analytics');
                setLoading(false);
                if (err.response?.status === 401 || err.response?.status === 403) navigate('/login');
            }
        };
        fetchStats();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#0d1612] to-[#0f1f18] flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-emerald-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#0d1612] to-[#0f1f18] flex items-center justify-center">
                <div className="text-red-400 text-xl text-center">
                    <p>{error}</p>
                    <button onClick={() => navigate('/admin')} className="mt-4 text-emerald-400 hover:underline">Back to Dashboard</button>
                </div>
            </div>
        );
    }

    const completionRate = stats.totalOrders ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0;

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0d1612] to-[#0f1f18]">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate('/admin')}
                    className="flex items-center gap-2 text-gray-300 hover:text-emerald-400 transition-colors mb-8"
                >
                    <FiArrowLeft className="w-5 h-5" /> Back to Dashboard
                </motion.button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl font-bold text-emerald-50 mb-2 flex items-center justify-center gap-3">
                        <FiBarChart2 className="w-10 h-10 text-emerald-400" />
                        Platform Analytics
                    </h1>
                    <p className="text-gray-400">Detailed metrics and performance overview</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: 'Total Farmers', value: stats.totalFarmers, icon: FiUsers, color: 'emerald' },
                        { label: 'Total Consumers', value: stats.totalConsumers, icon: FiUsers, color: 'emerald' },
                        { label: 'Total Products', value: stats.totalProducts, icon: FiShoppingBag, color: 'emerald' },
                        { label: 'Total Orders', value: stats.totalOrders, icon: FiTruck, color: 'emerald' },
                    ].map((item, i) => (
                        <motion.div
                            key={item.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-emerald-800/20"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-400 text-sm">{item.label}</span>
                                <item.icon className="w-5 h-5 text-emerald-400" />
                            </div>
                            <p className="text-2xl font-bold text-white">{item.value}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-emerald-800/20"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <FiTruck className="w-6 h-6 text-yellow-500" />
                            <h2 className="text-lg font-semibold text-white">Active Orders</h2>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats.activeOrders}</p>
                        <p className="text-sm text-gray-400 mt-1">Currently processing</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-emerald-800/20"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <FiCheckCircle className="w-6 h-6 text-green-500" />
                            <h2 className="text-lg font-semibold text-white">Completed Orders</h2>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats.completedOrders}</p>
                        <p className="text-sm text-gray-400 mt-1">Successfully delivered</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-emerald-800/20"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <FiDollarSign className="w-6 h-6 text-emerald-500" />
                            <h2 className="text-lg font-semibold text-white">Total Revenue</h2>
                        </div>
                        <p className="text-3xl font-bold text-white">₹{stats.totalRevenue ?? 0}</p>
                        <p className="text-sm text-gray-400 mt-1">All time earnings</p>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-emerald-800/20"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <FiActivity className="w-6 h-6 text-purple-500" />
                        <h2 className="text-lg font-semibold text-white">Order Completion Rate</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-4 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${completionRate}%` }} />
                        </div>
                        <span className="text-2xl font-bold text-white">{completionRate}%</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
