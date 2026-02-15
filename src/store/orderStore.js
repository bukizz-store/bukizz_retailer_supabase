import { create } from "zustand";
import { orderService } from "@/services/orderService";

/**
 * Zustand store for order management in the retailer dashboard.
 *
 * Handles fetching, filtering, status updates, and error states
 * for orders tied to the active warehouse.
 */
const useOrderStore = create((set, get) => ({
  // ── Data ────────────────────────────────────────────────────
  orders: [],
  totalCount: 0,
  statistics: null,

  // ── Filters & Pagination ────────────────────────────────────
  page: 1,
  limit: 10,
  statusFilter: "all",
  searchQuery: "",

  // ── Loading / Error States ──────────────────────────────────
  isLoading: false,
  isUpdatingStatus: false,
  error: null,

  // ── Actions ─────────────────────────────────────────────────

  /**
   * Fetch orders from the API based on current filters.
   * @param {string} warehouseId — active warehouse UUID (required)
   */
  fetchOrders: async (warehouseId) => {
    if (!warehouseId) {
      set({ orders: [], totalCount: 0, isLoading: false });
      return;
    }

    const { page, limit, searchQuery } = get();
    set({ isLoading: true, error: null });

    try {
      // Always fetch without status filter — status filtering is done client-side
      // so that summary counts (All / New / Processed / Shipped) stay accurate.
      const response = await orderService.getOrders(warehouseId, {
        page,
        limit,
        search: searchQuery,
      });

      const data = response?.data || response;
      const orders = data?.orders || data?.items || data || [];
      const totalCount =
        data?.totalCount ?? data?.total ?? data?.pagination?.total ?? orders.length;

      set({
        orders: Array.isArray(orders) ? orders : [],
        totalCount,
        isLoading: false,
      });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to fetch orders. Please try again.";
      set({ error: message, isLoading: false, orders: [] });
    }
  },

  /**
   * Update the status of an order (e.g., mark as processed/confirmed).
   */
  updateOrderStatus: async (orderId, newStatus, note = "") => {
    set({ isUpdatingStatus: true, error: null });

    try {
      await orderService.updateOrderStatus(orderId, {
        status: newStatus,
        note,
      });

      // Optimistically update items-level status in local state
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: newStatus,
                items: (order.items || []).map((item) => ({ ...item, status: newStatus })),
              }
            : order
        ),
        isUpdatingStatus: false,
      }));

      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to update order status.";
      set({ error: message, isUpdatingStatus: false });
      return { success: false, error: message };
    }
  },

  /**
   * Fetch order statistics for the dashboard.
   */
  fetchStatistics: async () => {
    try {
      const response = await orderService.getStatistics();
      const data = response?.data || response;
      set({ statistics: data });
    } catch {
      // Statistics are non-critical; silently fail
    }
  },

  // ── Setters ─────────────────────────────────────────────────

  setStatusFilter: (status) => {
    set({ statusFilter: status, page: 1 });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query, page: 1 });
  },

  setPage: (page) => {
    set({ page });
  },

  setLimit: (limit) => {
    set({ limit, page: 1 });
  },

  clearError: () => {
    set({ error: null });
  },
}));

export default useOrderStore;
