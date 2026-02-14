import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore, { selectIsAuthenticated, selectIsOnboarding } from '@/store/authStore';

/**
 * Route guard for guest-only pages (login, register, forgot-password).
 * Redirects already-authenticated users to the dashboard,
 * UNLESS they are mid-onboarding (still filling out register steps).
 */
export default function GuestRoute({ children }) {
    const isAuthenticated = useAuthStore(selectIsAuthenticated);
    const isOnboarding = useAuthStore(selectIsOnboarding);
    const isInitialized = useAuthStore((s) => s.isInitialized);
    const location = useLocation();

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

    // Allow authenticated users who are still onboarding to stay on /register
    if (isAuthenticated && isOnboarding && location.pathname === '/register') {
        return children;
    }

    // Allow authenticated users redirected for onboarding resume (incomplete profile)
    if (isAuthenticated && location.pathname === '/register' && location.state?.resumeOnboarding) {
        return children;
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
