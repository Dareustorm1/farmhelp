import { Navigate } from 'react-router-dom';

const ProtectedAdminRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    let user = {};
    try {
        user = JSON.parse(localStorage.getItem('user') || '{}');
    } catch (_) {
        user = {};
    }
    const role = (user && user.role) ? String(user.role).toLowerCase() : '';

    if (!token || role !== 'admin') {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedAdminRoute;