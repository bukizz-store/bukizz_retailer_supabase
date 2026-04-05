import { create } from "zustand";
import { orderService } from "@/services/orderService";

/**
 * Zustand store for order management in the retailer dashboard.
 *
 * Holds fetched data and loading/error states.
 * Page, limit, status, and search are managed by each page via URL search params.
 */
const useOrderStore = create((set, get) => ({
  // ── Data ────────────────────────────────────────────────────
  orders: [],
  totalCount: 0,
  statusCounts: null,
  summary: null,
  statistics: null,

  // ── Loading / Error States ──────────────────────────────────
  isLoading: false,
  isUpdatingStatus: false,
  error: null,

  // ── Actions ─────────────────────────────────────────────────

  /**
   * Fetch orders from the API.
   * @param {string} warehouseId — active warehouse UUID (required)
   * @param {object} params — { page, limit, status, search, startDate, endDate }
   */
  fetchOrders: async (warehouseId, params = {}) => {
    if (!warehouseId) {
      set({ orders: [], totalCount: 0, statusCounts: null, summary: null, isLoading: false });
      return;
    }

    const { page = 1, limit = 50, status, search, startDate, endDate } = params;
    set({ isLoading: true, error: null });

    try {
      const response = await orderService.getOrders(warehouseId, {
        page,
        limit,
        status,
        search,
        startDate,
        endDate,
      });

      const data = response?.data || response;
      const orders = data?.orders || data?.items || data || [];
      const totalCount =
        data?.totalCount ?? data?.total ?? data?.pagination?.total ?? orders.length;
      const statusCounts = data?.statusCounts || null;
      const summary = data?.summary || null;

      set({
        orders: Array.isArray(orders) ? orders : [],
        totalCount,
        statusCounts,
        summary,
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
   * Fetch filtered orders using POST /filter API (All Orders page).
   * @param {string} warehouseId
   * @param {object} body — full POST body including advanced filters
   */
  fetchFilteredOrders: async (warehouseId, body = {}) => {
    if (!warehouseId) {
      set({ orders: [], totalCount: 0, statusCounts: null, summary: null, isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const response = await orderService.filterOrders(warehouseId, body);
      const data = response?.data || response;
      const orders = data?.orders || [];
      const totalCount = data?.pagination?.total ?? orders.length;
      const statusCounts = data?.statusCounts || null;
      const summary = data?.summary || null;

      set({
        orders: Array.isArray(orders) ? orders : [],
        totalCount,
        statusCounts,
        summary,
        isLoading: false,
      });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to fetch filtered orders.";
      set({ error: message, isLoading: false, orders: [] });
    }
  },

  /**
   * Update the status of an order item (e.g., mark as processed/shipped).
   */
  updateOrderItemStatus: async (orderId, itemId, newStatus, note = "") => {
    set({ isUpdatingStatus: true, error: null });

    try {
      await orderService.updateOrderItemStatus(orderId, itemId, {
        status: newStatus,
        note,
      });

      // Optimistically update items-level status in local state
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === orderId
            ? {
              ...order,
              itemCount: order.itemCount, // preserve
              items: (order.items || []).map((item) =>
                item.id === itemId ? { ...item, status: newStatus } : item
              ),
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
        "Failed to update order item status.";
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

  clearError: () => {
    set({ error: null });
  },
}));

export default useOrderStore;
