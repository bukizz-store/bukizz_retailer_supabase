import apiClient from "@/lib/apiClient";

export const schoolService = {
  /**
   * GET /api/v1/schools?city=<city>
   * Fetch schools filtered by city (warehouse city).
   */
  getSchoolsByCity: async (city, { page = 1, limit = 50, search = "" } = {}) => {
    const params = { city, page, limit };
    if (search) params.search = search;

    const response = await apiClient.get("/schools", { params });
    const payload = response.data?.data || response.data;
    return payload;
  },

  /**
   * GET /api/v1/schools/:id
   * Fetch a single school by ID.
   */
  getSchoolById: async (id) => {
    const response = await apiClient.get(`/schools/${id}`);
    return response.data?.data || response.data;
  },

  /**
   * GET /api/v1/schools
   * Search schools with optional filters.
   */
  searchSchools: async ({ search = "", city = "", state = "", board = "", page = 1, limit = 50 } = {}) => {
    const params = { page, limit };
    if (search) params.search = search;
    if (city) params.city = city;
    if (state) params.state = state;
    if (board) params.board = board;

    const response = await apiClient.get("/schools", { params });
    return response.data?.data || response.data;
  },

  /**
   * GET /api/v1/retailer-schools/connected-schools
   * Fetch connected schools with full school info.
   * Optionally filter by status: approved | pending | rejected
   */
  getConnectedSchools: async (status) => {
    const params = {};
    if (status) params.status = status;

    const response = await apiClient.get('/retailer-schools/connected-schools', { params });
    return response.data;
  },

  /**
   * GET /api/v1/schools/:id/catalog
   * Fetch the product catalog for a specific school.
   */
  getSchoolCatalog: async (schoolId, { page = 1, limit = 50, search = "", category = "" } = {}) => {
    const params = { page, limit };
    if (search) params.search = search;
    if (category && category !== "all") params.category = category;

    const response = await apiClient.get(`/schools/${schoolId}/catalog`, { params });
    return response.data?.data || response.data;
  },

  /**
   * GET /api/v1/schools/:id/analytics
   * Fetch analytics data for a school (product counts, student count, etc.).
   */
  getSchoolAnalytics: async (schoolId) => {
    const response = await apiClient.get(`/schools/${schoolId}/analytics`);
    return response.data?.data || response.data;
  },

  /**
   * GET /api/v1/products/school/:schoolId
   * Fetch products associated with a specific school.
   */
  getSchoolProducts: async (schoolId, { page = 1, limit = 50, search = "", productType = "" } = {}) => {
    const params = { page, limit };
    if (search) params.search = search;
    if (productType && productType !== "all") params.productType = productType;

    const response = await apiClient.get(`/products/school/${schoolId}`, { params });
    return response.data?.data || response.data;
  },

  /**
   * POST /api/v1/retailer-schools/link
   * Link retailer to a school (request school access).
   * retailerId is auto-picked from the authenticated user's token.
   */
  requestSchoolAccess: async (schoolId, { productType = [] } = {}) => {
    const response = await apiClient.post('/retailer-schools/link', {
      schoolId,
      status: 'pending',
      productType,
    });
    return response.data;
  },
};
