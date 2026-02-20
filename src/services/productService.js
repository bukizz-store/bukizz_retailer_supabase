import apiClient from "@/lib/apiClient";

export const productService = {
  /**
   * Fetch products for a specific warehouse.
   * The warehouse ID is sent via the `x-warehouse-id` header (auto-attached
   * by apiClient interceptor). You can also pass it explicitly to override.
   */
  getProductsByWarehouseId: async ({
    warehouseId,
    page = 1,
    limit = 10,
    search = "",
    categoryId = "",
    status = "",
  } = {}) => {
    const params = { page, limit };
    if (search) params.search = search;
    if (categoryId && categoryId !== "all") params.categoryId = categoryId;
    if (status) params.status = status;

    const headers = {};
    if (warehouseId) {
      headers["x-warehouse-id"] = warehouseId;
    }

    const response = await apiClient.get("/products/warehouse", {
      params,
      ...(warehouseId && { headers }),
    });
    return response.data;
  },

  getCategories: async ({ parentId = null } = {}) => {
    const params = {};
    if (parentId) {
      params.parentId = parentId;
    } else {
      params.rootOnly = true;
    }
    const response = await apiClient.get("/categories", { params });
    // Assuming backend returns { success: true, data: [...] } or just [...]
    return response.data.data || response.data;
  },

  getBrands: async ({ limit = 100, search = "" } = {}) => {
    const params = { limit };
    if (search) params.search = search;
    const response = await apiClient.get("/brands", { params });
    return response.data.data || response.data;
  },

  getCategoryById: async (id) => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data.data || response.data;
  },

  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await apiClient.post("/images/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await apiClient.post(
      "/products/comprehensive",
      productData,
    );
    return response.data;
  },

  updateComprehensiveProduct: async (id, productData) => {
    const response = await apiClient.put(
      `/products/${id}/comprehensive`,
      productData,
    );
    return response.data;
  },

  createBrand: async (brandData) => {
    const response = await apiClient.post("/brands", brandData);
    return response.data;
  },

  getProductById: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  getComprehensiveProduct: async (id) => {
    const response = await apiClient.get(`/products/${id}/comprehensive`);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },

  /**
   * Update stock for a single variant.
   * @param {string}  variantId  – UUID of the variant
   * @param {number}  quantity   – stock quantity value
   * @param {string}  operation  – "set" | "increment" | "decrement"
   */
  updateVariantStock: async (variantId, { quantity, operation = "set" }) => {
    console.log(
      "[updateVariantStock] variantId:",
      variantId,
      "quantity:",
      quantity,
      "operation:",
      operation,
    );
    const response = await apiClient.patch(
      `/products/variants/${variantId}/stock`,
      { quantity, operation },
    );
    return response.data;
  },

  /**
   * Bulk-update stock for multiple variants at once.
   * @param {Array<{ variantId: string, quantity: number, operation: string }>} updates
   */
  bulkUpdateVariantStock: async (updates) => {
    console.log(
      "[bulkUpdateVariantStock] updates:",
      JSON.stringify(updates, null, 2),
    );
    const response = await apiClient.put("/products/variants/bulk-stock", {
      updates,
    });
    return response.data;
  },
};
