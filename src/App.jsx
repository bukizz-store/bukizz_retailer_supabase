import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import GuestRoute from '@/components/auth/GuestRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import GeneralStoreLayout from './layouts/GeneralStoreLayout';
import OrdersLayout from './layouts/OrdersLayout';

// Dashboard Pages
import Overview from './pages/dashboard/Overview';
import GeneralStorePage from './pages/dashboard/inventory/GeneralStorePage';
import AddProductPage from './pages/dashboard/inventory/AddProductPage';
import InventoryHealthPage from './pages/dashboard/inventory/InventoryHealthPage';
import MySchoolsPage from './pages/dashboard/inventory/MySchoolsPage';
import SchoolProductManagementPage from './pages/dashboard/inventory/SchoolProductManagementPage';
import ActiveOrdersPage from './pages/dashboard/orders/ActiveOrdersPage';
import CancelledOrdersPage from './pages/dashboard/orders/CancelledOrdersPage';
import ReturnsPage from './pages/dashboard/orders/ReturnsPage';

export default function App() {
    const initialize = useAuthStore((state) => state.initialize);

    useEffect(() => {
        initialize();
    }, [initialize]);

    return (
        <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />

            {/* Guest-only (redirect to dashboard if already logged in) */}
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
            <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Protected (redirect to login if not authenticated) */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Navigate to="overview" replace />} />
                <Route path="overview" element={<Overview />} />
                <Route path="inventory/general" element={<GeneralStoreLayout />}>
                    <Route index element={<GeneralStorePage />} />
                    <Route path="add" element={<AddProductPage />} />
                </Route>
                <Route path="inventory/health" element={<InventoryHealthPage />} />
                <Route path="inventory/schools" element={<MySchoolsPage />} />
                <Route path="inventory/schools/:schoolId" element={<SchoolProductManagementPage />} />
                <Route path="orders" element={<OrdersLayout />}>
                    <Route index element={<ActiveOrdersPage />} />
                    <Route path="cancelled" element={<CancelledOrdersPage />} />
                    <Route path="returns" element={<ReturnsPage />} />
                </Route>
            </Route>
        </Routes>
    );
}
