import apiClient from "@/lib/apiClient";

export const settlementService = {
  getSettlementSummary: async (params = {}) => {
    // params = { startDate, endDate, warehouseId }
    const { warehouseId, ...restParams } = params;
    const response = await apiClient.get("/settlements/summary", {
      params: restParams,
      headers: warehouseId ? { "x-warehouse-id": warehouseId } : undefined,
    });
    return response.data;
  },

  getSettlementLedgers: async (params = {}) => {
    // params = { page, limit, startDate, endDate, warehouseId }
    const { warehouseId, ...restParams } = params;
    const response = await apiClient.get("/settlements/ledgers", {
      params: restParams,
      headers: warehouseId ? { "x-warehouse-id": warehouseId } : undefined,
    });
    return response.data;
  },
  getRetailerLedgers: async (params = {}) => {
    // params = { page, limit, startDate, endDate, status, warehouseId }
    const { warehouseId, ...restParams } = params;
    const response = await apiClient.get("/settlements/retailer/ledgers", {
      params: restParams,
      headers: warehouseId ? { "x-warehouse-id": warehouseId } : undefined,
    });
    return response.data;
  },

  getRetailerHistory: async (params = {}) => {
    // params = { page, limit, startDate, endDate }
    // NO warehouse-id header
    const response = await apiClient.get("/settlements/retailer/history", {
      params,
    });
    return response.data;
  },

  getSettlementDetail: async (settlementId) => {
    // NO warehouse-id header
    const response = await apiClient.get(
      `/settlements/retailer/history/${settlementId}`,
    );
    return response.data;
  },
};
