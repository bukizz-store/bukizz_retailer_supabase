import apiClient from "@/lib/apiClient";

/**
 * Finance & Commission Service for Retailer Portal
 */
export const financeService = {
  /**
   * Fetch active commission rules applicable to the logged-in retailer
   */
  getMyCommissions: async () => {
    const response = await apiClient.get("/commissions/retailers/me");
    return response.data;
  },

  /**
   * Fetch official GST tax slabs and HSN/SAC classifications
   */
  getGstSlabs: async () => {
    const response = await apiClient.get("/finance/gst-slabs");
    return response.data;
  },

  /**
   * Fetch standard platform and marketplace service charge configs
   */
  getPlatformFees: async () => {
    const response = await apiClient.get("/finance/fees");
    return response.data;
  },

  /**
   * Fetch tiered closing fee matrix
   */
  getClosingFees: async () => {
    const response = await apiClient.get("/admin/closing-fees");
    return response.data;
  },

  /**
   * Preview financial breakdown, tax bifurcation, deductions and net payout estimator
   */
  previewFinancials: async (payload) => {
    const response = await apiClient.post("/finance/cart/preview", payload);
    return response.data;
  },
};

export default financeService;
