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
};
