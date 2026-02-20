import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import GuestRoute from "@/components/auth/GuestRoute";

// Context Providers
import { ToastProvider } from "@/context/ToastContext";
import { WarehouseProvider } from "@/context/WarehouseContext";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import PendingApprovalPage from "./pages/PendingApprovalPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import SellerPolicyPage from "./pages/SellerPolicyPage";

// Layouts
import DashboardLayout from "./layouts/DashboardLayout";
import GeneralStoreLayout from "./layouts/GeneralStoreLayout";
import OrdersLayout from "./layouts/OrdersLayout";

// Dashboard Pages
import Overview from "./pages/dashboard/Overview";
import GeneralStorePage from "./pages/dashboard/inventory/GeneralStorePage";
import AddProductPage from "./pages/dashboard/inventory/AddProductPage";
import InventoryHealthPage from "./pages/dashboard/inventory/InventoryHealthPage";
import MySchoolsPage from "./pages/dashboard/inventory/MySchoolsPage";
import SchoolProductManagementPage from "./pages/dashboard/inventory/SchoolProductManagementPage";
import AddSchoolProductPage from "./pages/dashboard/inventory/AddSchoolProductPage";
import ProductDetailPage from "./pages/dashboard/inventory/ProductDetailPage";
import ActiveOrdersPage from "./pages/dashboard/orders/ActiveOrdersPage";
import OrderViewPage from "./pages/dashboard/orders/OrderViewPage";
import CancelledOrdersPage from "./pages/dashboard/orders/CancelledOrdersPage";
import ReturnsPage from "./pages/dashboard/orders/ReturnsPage";
import WarehouseManagementPage from "./pages/dashboard/settings/WarehouseManagementPage";
import ProfileSettingsPage from "./pages/dashboard/settings/ProfileSettingsPage";
import NotificationsPage from "./pages/dashboard/NotificationsPage";

export default function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <ToastProvider>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />

        {/* Guest-only (redirect to dashboard if already logged in) */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <GuestRoute>
              <ForgotPasswordPage />
            </GuestRoute>
          }
        />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/pending-approval" element={<PendingApprovalPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="/seller-policy" element={<SellerPolicyPage />} />

        {/* Protected (redirect to login if not authenticated) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <WarehouseProvider>
                <DashboardLayout />
              </WarehouseProvider>
            </ProtectedRoute>
          }
        >
          <Route
            path=""
            element={<Navigate to="/dashboard/overview" replace />}
          />
          <Route path="overview" element={<Overview />} />
          <Route path="inventory/general" element={<GeneralStoreLayout />}>
            <Route index element={<GeneralStorePage />} />
            <Route path="add" element={<AddProductPage />} />
            <Route
              path="edit/:productId"
              element={<AddProductPage isEditMode={true} />}
            />
            <Route path=":productId" element={<ProductDetailPage />} />
          </Route>
          <Route path="inventory/health" element={<InventoryHealthPage />} />
          <Route path="inventory/schools" element={<MySchoolsPage />} />
          <Route
            path="inventory/schools/:schoolId"
            element={<SchoolProductManagementPage />}
          />
          <Route
            path="inventory/schools/:schoolId/add"
            element={<AddSchoolProductPage />}
          />
          <Route
            path="inventory/schools/:schoolId/edit/:productId"
            element={<AddSchoolProductPage isEditMode={true} />}
          />
          <Route path="orders" element={<OrdersLayout />}>
            <Route index element={<ActiveOrdersPage />} />
            <Route path=":orderId" element={<OrderViewPage />} />
            <Route path="cancelled" element={<CancelledOrdersPage />} />
            <Route path="returns" element={<ReturnsPage />} />
          </Route>
          <Route path="notifications" element={<NotificationsPage />} />
          <Route
            path="settings/warehouses"
            element={<WarehouseManagementPage />}
          />
          <Route path="settings/profile" element={<ProfileSettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  );
}
