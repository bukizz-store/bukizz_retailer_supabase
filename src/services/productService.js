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
};
