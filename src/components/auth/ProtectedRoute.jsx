import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore, { selectIsAuthenticated } from '@/store/authStore';

/**
 * Route guard for authenticated-only pages.
 *
 * Auth check: derived from token presence (not a stored boolean).
 * After authentication is confirmed, runs verification checks to
 * determine if the retailer is authorized to access the dashboard.
 *
 * Flow:
 * 1. Wait for store initialization
 * 2. Check if authenticated → if not, redirect to /login
 * 3. Run post-login verification checks
 *    - authorized → render children (dashboard)
 *    - pending/deactivated + incomplete profile → redirect to /register
 *    - pending/deactivated + complete profile → redirect to /pending-approval
 */
export default function ProtectedRoute({ children }) {
    const isAuthenticated = useAuthStore(selectIsAuthenticated);
    const isInitialized = useAuthStore((s) => s.isInitialized);
    const isVerificationChecked = useAuthStore((s) => s.isVerificationChecked);
    const verificationStatus = useAuthStore((s) => s.verificationStatus);
    const dataStatus = useAuthStore((s) => s.dataStatus);
    const warehouseStatus = useAuthStore((s) => s.warehouseStatus);
    const runPostLoginChecks = useAuthStore((s) => s.runPostLoginChecks);
    const location = useLocation();

    const [checkResult, setCheckResult] = useState(null);
    const [isChecking, setIsChecking] = useState(false);

    // Run verification checks once authenticated and initialized
    useEffect(() => {
        // Skip if already checked (e.g. LoginPage already ran checks before navigating here)
        if (!isAuthenticated || !isInitialized || isVerificationChecked || isChecking) return;

        let cancelled = false;
        setIsChecking(true);

        runPostLoginChecks()
            .then((result) => {
                if (!cancelled) {
                    setCheckResult(result);
                }
            })
            .catch((err) => {
                console.error('Post-login checks failed:', err);
                // If checks fail entirely, still mark as checked to prevent infinite spinner
                if (!cancelled) {
                    useAuthStore.setState({ isVerificationChecked: true });
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setIsChecking(false);
                }
            });

        return () => { cancelled = true; };
    }, [isAuthenticated, isInitialized, isVerificationChecked, isChecking, runPostLoginChecks]);

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

    // Still running verification checks — but only show spinner if store hasn't been checked yet
    if (!isVerificationChecked) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-600 border-t-transparent" />
                    <p className="text-sm font-medium text-slate-500">Verifying account status...</p>
                </div>
            </div>
        );
    }

    // Redirect based on verification result
    const status = verificationStatus?.status;

    if (status !== 'authorized') {
        // Not authorized — check data completeness
        if (dataStatus && !dataStatus.isComplete) {
            // Incomplete profile → send to onboarding (ID & Signature step)
            return (
                <Navigate
                    to="/register"
                    replace
                    state={{ resumeOnboarding: true, missingFields: dataStatus.missingFields }}
                />
            );
        }
        // Data complete but no warehouse → send to onboarding (Store & Pickup step)
        if (warehouseStatus && !warehouseStatus.hasWarehouse) {
            return (
                <Navigate
                    to="/register"
                    replace
                    state={{ resumeOnboarding: true, resumeStep: 'business' }}
                />
            );
        }
        // Complete profile + warehouse exists but not authorized → pending
        return <Navigate to="/pending-approval" replace />;
    }

    return children;
}
