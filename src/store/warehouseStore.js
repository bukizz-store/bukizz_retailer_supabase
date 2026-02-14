import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '@/lib/apiClient';

/**
 * Warehouse (Store & Pickup) Zustand Store
 *
 * Persists all warehouse form data so the user never loses progress
 * if they navigate away or refresh during onboarding.
 *
 * Shape mirrors the POST /api/v1/warehouses/ request body.
 */
const useWarehouseStore = create(
    persist(
        (set, get) => ({
            // ── Form State ─────────────────────────────────────────────
            name: '',
            contactEmail: '',
            contactPhone: '',
            website: '',
            isVerified: false,
            metadata: {},

            // Address (nested object or UUID string)
            address: {
                line1: '',
                line2: '',
                city: '',
                state: '',
                postalCode: '',
                country: 'India',
                lat: null,
                lng: null,
            },

            // ── API State ──────────────────────────────────────────────
            warehouseId: null, // UUID returned after creation
            isSubmitting: false,
            error: null,
            isCreated: false, // true once warehouse is saved to backend

            // ── Actions ────────────────────────────────────────────────

            /**
             * Update a top-level field.
             * Usage: updateField('name', 'My Warehouse')
             */
            updateField: (field, value) => set({ [field]: value }),

            /**
             * Update a single address sub-field.
             * Usage: updateAddress('city', 'Delhi')
             */
            updateAddress: (field, value) =>
                set((state) => ({
                    address: { ...state.address, [field]: value },
                })),

            /**
             * Bulk-set the entire address object.
             */
            setAddress: (addressObj) =>
                set((state) => ({
                    address: { ...state.address, ...addressObj },
                })),

            /**
             * Bulk-set multiple top-level fields at once.
             * Usage: setFields({ name: '…', contactEmail: '…' })
             */
            setFields: (fields) => set(fields),

            /**
             * POST /api/v1/warehouses/
             * Creates a warehouse for the currently logged-in retailer.
             * retailerId is automatically derived from the JWT token on the server.
             */
            createWarehouse: async () => {
                set({ isSubmitting: true, error: null });

                const { name, contactEmail, contactPhone, website, metadata, address } = get();

                // Build request body matching the API spec
                const body = {
                    name,
                    contactEmail: contactEmail || undefined,
                    contactPhone: contactPhone || undefined,
                    website: website || undefined,
                    isVerified: false,
                    metadata: metadata && Object.keys(metadata).length > 0 ? metadata : undefined,
                    address: {
                        line1: address.line1,
                        line2: address.line2 || undefined,
                        city: address.city,
                        state: address.state,
                        postalCode: address.postalCode,
                        country: address.country || 'India',
                        lat: address.lat || undefined,
                        lng: address.lng || undefined,
                    },
                };

                try {
                    const response = await apiClient.post('/warehouses/', body);
                    const payload = response.data?.data || response.data;

                    set({
                        warehouseId: payload.id || payload.warehouseId || null,
                        isCreated: true,
                        isSubmitting: false,
                        error: null,
                    });

                    return { success: true, data: payload };
                } catch (error) {
                    const message =
                        error.response?.data?.message ||
                        error.response?.data?.error ||
                        'Failed to create warehouse. Please try again.';
                    set({ isSubmitting: false, error: message });
                    return { success: false, error: message };
                }
            },

            /**
             * POST /api/v1/warehouses/admin
             * Admin-only: create warehouse for a specific retailer.
             */
            createWarehouseAdmin: async (retailerId) => {
                set({ isSubmitting: true, error: null });

                const { name, contactEmail, contactPhone, website, metadata, address } = get();

                const body = {
                    retailerId,
                    name,
                    contactEmail: contactEmail || undefined,
                    contactPhone: contactPhone || undefined,
                    website: website || undefined,
                    isVerified: false,
                    metadata: metadata && Object.keys(metadata).length > 0 ? metadata : undefined,
                    address: {
                        line1: address.line1,
                        line2: address.line2 || undefined,
                        city: address.city,
                        state: address.state,
                        postalCode: address.postalCode,
                        country: address.country || 'India',
                        lat: address.lat || undefined,
                        lng: address.lng || undefined,
                    },
                };

                try {
                    const response = await apiClient.post('/warehouses/admin', body);
                    const payload = response.data?.data || response.data;

                    set({
                        warehouseId: payload.id || payload.warehouseId || null,
                        isCreated: true,
                        isSubmitting: false,
                        error: null,
                    });

                    return { success: true, data: payload };
                } catch (error) {
                    const message =
                        error.response?.data?.message ||
                        error.response?.data?.error ||
                        'Failed to create warehouse. Please try again.';
                    set({ isSubmitting: false, error: message });
                    return { success: false, error: message };
                }
            },

            /**
             * Clear any API error.
             */
            clearError: () => set({ error: null }),

            /**
             * Reset the store to initial state (e.g. after onboarding completes).
             */
            reset: () =>
                set({
                    name: '',
                    contactEmail: '',
                    contactPhone: '',
                    website: '',
                    isVerified: false,
                    metadata: {},
                    address: {
                        line1: '',
                        line2: '',
                        city: '',
                        state: '',
                        postalCode: '',
                        country: 'India',
                        lat: null,
                        lng: null,
                    },
                    warehouseId: null,
                    isSubmitting: false,
                    error: null,
                    isCreated: false,
                }),
        }),
        {
            name: 'bukizz-warehouse',
            partialize: (state) => ({
                // Persist form data + creation status so nothing is lost on refresh
                name: state.name,
                contactEmail: state.contactEmail,
                contactPhone: state.contactPhone,
                website: state.website,
                metadata: state.metadata,
                address: state.address,
                warehouseId: state.warehouseId,
                isCreated: state.isCreated,
            }),
        }
    )
);

export default useWarehouseStore;
