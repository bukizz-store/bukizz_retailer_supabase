import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore, { selectIsAuthenticated } from '@/store/authStore';

/**
 * Route guard for authenticated-only pages.
 *
 * Auth check: derived from token presence (not a stored boolean).
 * While the store is still initializing (validating tokens via /auth/me),
 * shows a spinner. After init, redirects unauthenticated users to /login.
 */
export default function ProtectedRoute({ children }) {
    const isAuthenticated = useAuthStore(selectIsAuthenticated);
    const isInitialized = useAuthStore((s) => s.isInitialized);
    const location = useLocation();

    // If tokens exist → user is authenticated immediately (optimistic).
    // The spinner only shows if there are NO tokens and init hasn't finished.
    if (!isAuthenticated && !isInitialized) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                    <p className="text-sm font-medium text-slate-500">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}
