import apiClient from "@/lib/apiClient";

/**
 * Kit & Loose Component Service for Retailer Portal
 * Handles itemized GST bifurcation, loose component breakdowns,
 * and reverting back to flat GST slabs.
 */
export const kitService = {
  /**
   * Fetch loose components for a specific variant
   * GET /kits/variants/:variantId/components
   */
  getVariantComponents: async (variantId) => {
    const response = await apiClient.get(`/kits/variants/${variantId}/components`);
    return response.data;
  },

  /**
   * Save / configure loose kit components for a variant
   * PUT /kits/products/:productId/variants/:variantId/components
   *
   * @param {string} productId - Product UUID
   * @param {string} variantId - Variant UUID
   * @param {Array<Object>} components - Itemized loose components
   */
  saveVariantComponents: async (productId, variantId, components) => {
    const response = await apiClient.put(
      `/kits/products/${productId}/variants/${variantId}/components`,
      { components }
    );
    return response.data;
  },

  /**
   * Revert a split-GST variant back to a flat-rate GST slab
   * POST /kits/products/:productId/variants/:variantId/revert-flat
   *
   * @param {string} productId - Product UUID
   * @param {string} variantId - Variant UUID
   * @param {Object} payload
   * @param {string} payload.gstSlabId - Master GST slab UUID
   * @param {number} payload.price - Restored flat selling price
   * @param {number} payload.compareAtPrice - Restored MRP / compare-at price
   */
  revertToFlatGst: async (productId, variantId, { gstSlabId, price, compareAtPrice }) => {
    const response = await apiClient.post(
      `/kits/products/${productId}/variants/${variantId}/revert-flat`,
      { gstSlabId, price, compareAtPrice }
    );
    return response.data;
  },
};

export default kitService;
