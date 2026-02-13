import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore, { selectIsAuthenticated } from '@/store/authStore';

/**
 * Route guard for guest-only pages (login, register, forgot-password).
 * Redirects already-authenticated users to the dashboard.
 */
export default function GuestRoute({ children }) {
    const isAuthenticated = useAuthStore(selectIsAuthenticated);
    const isInitialized = useAuthStore((s) => s.isInitialized);

    if (!isInitialized && !isAuthenticated) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                    <p className="text-sm font-medium text-slate-500">Loading...</p>
                </div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
