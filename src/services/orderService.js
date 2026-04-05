import apiClient from "@/lib/apiClient";

export const orderService = {
  /**
   * GET /retailer/orders/warehouse/:warehouseId
   * Fetches orders for a specific warehouse.
   * Supports pagination, status filtering, and search.
   */
  getOrders: async (
    warehouseId,
    { page = 1, limit = 50, status = "", search = "", startDate = "", endDate = "" } = {},
  ) => {
    if (!warehouseId)
      throw new Error("Warehouse ID is required to fetch orders.");

    const params = { page, limit };
    if (status && status !== "all") params.status = status;
    if (search) params.search = search;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await apiClient.get(
      `/retailer/orders/warehouse/${warehouseId}`,
      { params },
    );
    return response.data;
  },

  /**
   * GET /orders/admin/status/:status
   * Fetches orders filtered by a specific status.
   */
  getOrdersByStatus: async (status, { page = 1, limit = 10 } = {}) => {
    const params = { page, limit };
    const response = await apiClient.get(`/orders/admin/status/${status}`, {
      params,
    });
    return response.data;
  },

  /**
   * GET /orders/:orderId
   * Fetches full details of a single order.
   */
  getOrderById: async (orderId) => {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
  },

  /**
   * GET /orders//warehouse/items/:itemId
   * Fetches full details of a single order.
   */
  getOrderItemsById: async (itemId) => {
    const response = await apiClient.get(`/orders/warehouse/items/${itemId}`);
    return response.data;
  },

  /**
   * PUT /orders/:orderId/status
   * Updates the status of an order (e.g., initialized → processed).
   */
  updateOrderStatus: async (orderId, { status, note = "" }) => {
    const response = await apiClient.put(`/orders/${orderId}/status`, {
      status,
      note,
    });
    return response.data;
  },

  /**
   * PUT /orders/:orderId/items/:itemId/status
   * Updates the status of a specific order item.
   */
  updateOrderItemStatus: async (orderId, itemId, { status, note = "" }) => {
    const response = await apiClient.put(
      `/orders/${orderId}/items/${itemId}/status`,
      { status, note },
    );
    return response.data;
  },

  /**
   * GET /orders/admin/statistics
   * Returns order analytics/statistics for the retailer's warehouse.
   */
  getStatistics: async () => {
    const response = await apiClient.get("/orders/admin/statistics");
    return response.data;
  },

  /**
   * GET /users/admin/:userId
   * Fetches user details by ID (admin/retailer access).
   */
  getUserById: async (userId) => {
    const response = await apiClient.get(`/users/admin/${userId}`);
    return response.data;
  },

  // ── Advanced Filter APIs (All Orders Page) ──

  /**
   * POST /retailer/orders/warehouse/:warehouseId/filter
   * Advanced filtered order query with product type, school, product, student filters
   */
  filterOrders: async (warehouseId, body) => {
    if (!warehouseId) throw new Error("Warehouse ID is required");
    const response = await apiClient.post(
      `/retailer/orders/warehouse/${warehouseId}/filter`,
      body,
    );
    return response.data;
  },

  /**
   * GET /retailer/orders/warehouse/:warehouseId/filter-options/schools
   */
  getFilterSchools: async (warehouseId) => {
    const response = await apiClient.get(
      `/retailer/orders/warehouse/${warehouseId}/filter-options/schools`,
    );
    return response.data;
  },

  /**
   * GET /retailer/orders/warehouse/:warehouseId/filter-options/products
   */
  getFilterProducts: async (warehouseId, schoolIds = []) => {
    const params = {};
    if (schoolIds.length > 0) params.schoolIds = schoolIds.join(",");
    const response = await apiClient.get(
      `/retailer/orders/warehouse/${warehouseId}/filter-options/products`,
      { params },
    );
    return response.data;
  },

  /**
   * GET /retailer/orders/warehouse/:warehouseId/filter-options/students
   */
  getFilterStudents: async (warehouseId) => {
    const response = await apiClient.get(
      `/retailer/orders/warehouse/${warehouseId}/filter-options/students`,
    );
    return response.data;
  },
};
