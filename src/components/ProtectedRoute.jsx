import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user } = useAuth();
    const location = useLocation();

    if (!user?.token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requiredRole) {
        if (Array.isArray(requiredRole)) {
            if (!requiredRole.includes(user.role)) {
                return <Navigate to="/" replace />;
            }
        } else if (user.role !== requiredRole) {
            return <Navigate to="/" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
