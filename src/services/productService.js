import apiClient from "@/lib/apiClient";

export const productService = {
  getProducts: async ({
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

    const response = await apiClient.get("/products/warehouse", { params });
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

  createBrand: async (brandData) => {
    const response = await apiClient.post("/brands", brandData);
    return response.data;
  },

  getProductById: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },
};
