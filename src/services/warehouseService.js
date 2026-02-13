import apiClient from "@/lib/apiClient";

export const warehouseService = {
  getWarehouses: async () => {
    const response = await apiClient.get("/warehouses");
    return response.data.data.warehouses;
  },

  createWarehouse: async (data) => {
    const response = await apiClient.post("/warehouses", data);
    return response.data;
  },

  updateWarehouse: async (id, data) => {
    const response = await apiClient.put(`/warehouses/${id}`, data);
    return response.data;
  },

  deleteWarehouse: async (id) => {
    const response = await apiClient.delete(`/warehouses/${id}`);
    return response.data;
  },
};
