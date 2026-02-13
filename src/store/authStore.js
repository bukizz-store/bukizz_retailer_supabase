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

            // ── Transient State (never persisted, reset on refresh) ─────────
            isInitialized: false, // flips to true once init check completes
            error: null,

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
                    const response = await apiClient.post('/auth/login', { email, password, loginAs: 'admin' });
                    // Backend wraps response: { success, message, data: { user, accessToken, refreshToken } }
                    const payload = response.data?.data || response.data;
                    const { user, accessToken, refreshToken } = payload;

                    set({
                        user,
                        accessToken,
                        refreshToken,
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
             * Register a new retailer account.
             */
            register: async (fullName, email, password) => {
                set({ error: null });
                try {
                    const response = await apiClient.post('/auth/register', {
                        fullName,
                        email,
                        password,
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
             * Send OTP for registration (Pre-registration).
             */
            sendOtp: async (fullName, email, password) => {
                set({ error: null });
                try {
                    await apiClient.post('/auth/send-otp', {
                        fullName,
                        email,
                        password,
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
             * Verify OTP and complete registration.
             */
            verifyOtp: async (email, otp) => {
                set({ error: null });
                try {
                    const response = await apiClient.post('/auth/verify-otp', {
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

export default useAuthStore;
