import apiClient from "@/lib/apiClient";

export const bankService = {
  getAll: async () => {
    const response = await apiClient.get("/retailer/bank-accounts");
    return response.data.data;
  },

  add: async (data) => {
    const response = await apiClient.post("/retailer/bank-accounts", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/retailer/bank-accounts/${id}`, data);
    return response.data;
  },

  remove: async (id) => {
    const response = await apiClient.delete(`/retailer/bank-accounts/${id}`);
    return response.data;
  },

  setPrimary: async (id) => {
    const response = await apiClient.patch(`/retailer/bank-accounts/${id}/set-primary`);
    return response.data;
  },

  verifyBank: async ({ accountHolderName, accountNumber, ifscCode }) => {
    try {
      const response = await apiClient.post("/retailer/bank-accounts/verify", {
        accountHolderName,
        accountNumber,
        ifscCode,
      });
      return { success: true, data: response.data };
    } catch (error) {
      let message = "Bank verification failed. Please check your details and try again.";
      if (error.response?.data?.message) message = error.response.data.message;
      return { success: false, error: message };
    }
  },
};
