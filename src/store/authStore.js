import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '@/lib/apiClient';

const useAuthStore = create(
    persist(
        (set, get) => ({
            // ── Persisted State (tokens + cached user) ──────────────────────
            user: null,
            accessToken: null,
            refreshToken: null,
            isOnboarding: false, // true while user is mid-registration (OTP verified but onboarding not complete)

            // ── Transient State (never persisted, reset on refresh) ─────────
            isInitialized: false, // flips to true once init check completes
            error: null,

            // ── Verification & Data Status (checked after login) ────────────
            verificationStatus: null, // { isVerified, isActive, status, deactivationReason, message }
            dataStatus: null,         // { hasData, isComplete, missingFields, message }
            warehouseStatus: null,    // { hasWarehouse, warehouses }
            isVerificationChecked: false, // true once post-login checks complete

            // ── Actions ────────────────────────────────────────────────────

            /**
             * Called once on app mount.
             *
             * If tokens exist in localStorage (via persist middleware),
             * the user is ALREADY considered authenticated (because
             * isAuthenticated is derived from token presence).
             *
             * This function just validates the session in the background
             * by calling GET /auth/me, and logs the user out only if
             * the token is truly expired AND refresh also failed.
             */
            initialize: async () => {
                const { accessToken } = get();

                if (!accessToken) {
                    set({ isInitialized: true });
                    return;
                }

                // Tokens exist → validate in background
                try {
                    const response = await apiClient.get('/auth/me');
                    const payload = response.data?.data || response.data;
                    const freshUser = payload.user || payload;
                    set({ user: freshUser, isInitialized: true });
                } catch {
                    // Token expired AND refresh failed → truly logged out
                    set({
                        user: null,
                        accessToken: null,
                        refreshToken: null,
                        isInitialized: true,
                    });
                }
            },

            /**
             * Email + password login.
             */
            login: async (email, password) => {
                set({ error: null });
                try {
                    const response = await apiClient.post('/auth/login-retailer', { email, password });
                    // Backend wraps response: { success, message, data: { user, accessToken, refreshToken } }
                    const payload = response.data?.data || response.data;
                    const { user, accessToken, refreshToken } = payload;

                    set({
                        user,
                        accessToken,
                        refreshToken,
                        isOnboarding: false,
                        isInitialized: true,
                        error: null,
                    });

                    return { success: true };
                } catch (error) {
                    const message =
                        error.response?.data?.message ||
                        error.response?.data?.error ||
                        'Login failed. Please check your credentials.';
                    set({ error: message });
                    return { success: false, error: message };
                }
            },

            /**
             * Check retailer verification status.
             * Called after login to determine if the account is authorized.
             */
            checkVerificationStatus: async () => {
                try {
                    const response = await apiClient.get('/retailer/verification-status');
                    const data = response.data?.data;
                    set({ verificationStatus: data });
                    return { success: true, data };
                } catch (error) {
                    const message =
                        error.response?.data?.message ||
                        'Failed to check verification status.';
                    return { success: false, error: message };
                }
            },

            /**
             * Check retailer data/profile completion status.
             * Called when retailer is not yet authorized to determine onboarding state.
             */
            checkDataStatus: async () => {
                try {
                    const response = await apiClient.get('/retailer/data/status');
                    const data = response.data?.data;
                    set({ dataStatus: data });
                    return { success: true, data };
                } catch (error) {
                    const message =
                        error.response?.data?.message ||
                        'Failed to check data status.';
                    return { success: false, error: message };
                }
            },

            /**
             * Check if the retailer has any warehouses.
             * Called after data is complete to determine if store setup is done.
             */
            checkWarehouseStatus: async () => {
                try {
                    const { user } = get();
                    const retailerId = user?.id || user?._id;
                    if (!retailerId) {
                        return { success: false, error: 'No retailer ID found.' };
                    }
                    const response = await apiClient.get(`/warehouses/retailer/${retailerId}`);
                    const warehouses = response.data?.data?.warehouses || [];
                    const data = { hasWarehouse: warehouses.length > 0, warehouses };
                    set({ warehouseStatus: data });
                    return { success: true, data };
                } catch (error) {
                    const message =
                        error.response?.data?.message ||
                        'Failed to check warehouse status.';
                    return { success: false, error: message };
                }
            },

            /**
             * Full post-login verification flow.
             * 1. Check verification status
             * 2. If not authorized, check data completeness
             * 3. If data complete, check warehouse existence
             * Returns: { destination, message? }
             *   destination: 'dashboard' | 'onboarding' | 'onboarding-warehouse' | 'pending'
             */
            runPostLoginChecks: async () => {
                set({ isVerificationChecked: false });

                // Step 1: Check verification status
                const verResult = await get().checkVerificationStatus();

                // If verification check itself fails, still proceed to data checks
                // rather than blocking the user at pending screen
                const verData = verResult.success ? verResult.data : null;
                const status = verData?.status;
                const message = verData?.message || verResult.error;

                // Authorized → go to dashboard
                if (status === 'authorized') {
                    set({ isVerificationChecked: true });
                    return { destination: 'dashboard' };
                }

                // Not authorized (pending/deactivated/unknown) → check data completeness
                const dataResult = await get().checkDataStatus();

                // If data status API fails, assume profile is incomplete → send to onboarding
                if (!dataResult.success) {
                    set({ isOnboarding: true, isVerificationChecked: true });
                    return { destination: 'onboarding', missingFields: [], message: message || 'Please complete your profile.' };
                }

                const { isComplete, missingFields } = dataResult.data;

                if (!isComplete) {
                    // Profile incomplete → send to onboarding (ID & Signature step)
                    set({ isOnboarding: true, isVerificationChecked: true });
                    return { destination: 'onboarding', missingFields, message };
                }

                // Step 3: Data is complete → check if warehouse exists
                const whResult = await get().checkWarehouseStatus();
                if (!whResult.success || !whResult.data.hasWarehouse) {
                    // No warehouse or API failed → send to Store & Pickup step
                    set({ isOnboarding: true, isVerificationChecked: true });
                    return { destination: 'onboarding-warehouse', message };
                }

                // Data is complete + warehouse exists but not authorized → pending approval
                set({ isVerificationChecked: true });
                return { destination: 'pending', message };
            },

            /**
             * Reset verification state (on logout).
             */
            resetVerificationState: () => set({
                verificationStatus: null,
                dataStatus: null,
                warehouseStatus: null,
                isVerificationChecked: false,
            }),

            /**
             * Register a new retailer account.
             */
            register: async (fullName, email, password, phone) => {
                set({ error: null });
                try {
                    const response = await apiClient.post('/auth/register-retailer', {
                        fullName,
                        email,
                        password,
                        phone,
                    });

                    const payload = response.data?.data || response.data;
                    const { user, accessToken, refreshToken } = payload;

                    if (accessToken && refreshToken) {
                        set({
                            user,
                            accessToken,
                            refreshToken,
                            isInitialized: true,
                            error: null,
                        });
                    }

                    return { success: true, user };
                } catch (error) {
                    const message =
                        error.response?.data?.message ||
                        error.response?.data?.error ||
                        'Registration failed. Please try again.';
                    set({ error: message });
                    return { success: false, error: message };
                }
            },

            /**
             * Send OTP for retailer registration.
             */
            sendOtp: async (fullName, email, password, mobile) => {
                set({ error: null });
                try {
                    await apiClient.post('/auth/send-retailer-otp', {
                        email,
                        password,
                        fullName,
                        phone: mobile || undefined,
                    });
                    return { success: true };
                } catch (error) {
                    const message =
                        error.response?.data?.message ||
                        error.response?.data?.error ||
                        'Failed to send OTP. Please try again.';
                    set({ error: message });
                    return { success: false, error: message };
                }
            },

            /**
             * Verify retailer OTP and complete registration.
             */
            verifyOtp: async (email, otp) => {
                set({ error: null });
                try {
                    const response = await apiClient.post('/auth/verify-retailer-otp', {
                        email,
                        otp,
                    });

                    const payload = response.data?.data || response.data;
                    const { user, accessToken, refreshToken } = payload;

                    if (accessToken && refreshToken) {
                        set({
                            user,
                            accessToken,
                            refreshToken,
                            isOnboarding: true,
                            isInitialized: true,
                            error: null,
                        });
                    }

                    return { success: true, user };
                } catch (error) {
                    const message =
                        error.response?.data?.message ||
                        error.response?.data?.error ||
                        'OTP verification failed. Please try again.';
                    set({ error: message });
                    return { success: false, error: message };
                }
            },

            /**
             * Log the user out. Revokes the refresh token server-side.
             */
            logout: async () => {
                const { refreshToken } = get();
                try {
                    if (refreshToken) {
                        await apiClient.post('/auth/logout', { refreshToken });
                    }
                } catch {
                    // Even if the server call fails we still clear local state
                } finally {
                    set({
                        user: null,
                        accessToken: null,
                        refreshToken: null,
                        error: null,
                        verificationStatus: null,
                        dataStatus: null,
                        warehouseStatus: null,
                        isVerificationChecked: false,
                    });
                }
            },

            /**
             * Refresh the access token.
             */
            refreshAccessToken: async () => {
                const { refreshToken } = get();
                if (!refreshToken) throw new Error('No refresh token');

                const response = await apiClient.post('/auth/refresh-token', {
                    refreshToken,
                });

                const payload = response.data?.data || response.data;

                set({
                    accessToken: payload.accessToken,
                    refreshToken: payload.refreshToken,
                });
                return payload.accessToken;
            },

            /**
             * Fetch current user profile.
             */
            fetchUser: async () => {
                try {
                    const response = await apiClient.get('/auth/me');
                    const payload = response.data?.data || response.data;
                    const user = payload.user || payload;
                    set({ user });
                    return user;
                } catch {
                    return null;
                }
            },

            forgotPassword: async (email) => {
                set({ error: null });
                try {
                    await apiClient.post('/auth/forgot-password', { email });
                    return { success: true };
                } catch (error) {
                    const message =
                        error.response?.data?.message ||
                        error.response?.data?.error ||
                        'Failed to send reset email. Please try again.';
                    set({ error: message });
                    return { success: false, error: message };
                }
            },

            resetPassword: async (resetToken, newPassword) => {
                set({ error: null });
                try {
                    await apiClient.post('/auth/reset-password', { resetToken, newPassword });
                    return { success: true };
                } catch (error) {
                    const message =
                        error.response?.data?.message ||
                        error.response?.data?.error ||
                        'Password reset failed. The link may have expired.';
                    set({ error: message });
                    return { success: false, error: message };
                }
            },

            /**
             * Mark onboarding as complete (called after final registration step).
             */
            completeOnboarding: () => set({ isOnboarding: false }),

            clearError: () => set({ error: null }),
        }),
        {
            name: 'bukizz-auth',
            partialize: (state) => ({
                // ✅ ONLY persist tokens + cached user profile
                // ✅ isAuthenticated is derived from accessToken presence
                // ❌ NEVER persist isInitialized, error
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isOnboarding: state.isOnboarding,
            }),
        }
    )
);

/**
 * Selector: derives isAuthenticated from token presence.
 * Usage: const isAuthenticated = useAuthStore(selectIsAuthenticated);
 *
 * This is the ONLY way to check auth status. It cannot be spoofed
 * by editing localStorage because:
 * 1. Token presence alone gets you past the route guard
 * 2. But every API call validates the token server-side
 * 3. If the token is invalid, the interceptor logs you out
 */
export const selectIsAuthenticated = (state) => !!state.accessToken;
export const selectIsOnboarding = (state) => !!state.isOnboarding;

export default useAuthStore;
