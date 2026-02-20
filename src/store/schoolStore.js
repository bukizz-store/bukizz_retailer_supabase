import { create } from "zustand";
import { schoolService } from "@/services/schoolService";

/**
 * School Zustand Store
 *
 * Manages:
 *  - Fetching schools from the API (filtered by warehouse city)
 *  - School search / filtering within the modal
 *  - School selection for access request
 *  - Submitting school access requests
 *  - Tracking existing school partnerships (approved / pending / rejected)
 */
const useSchoolStore = create((set, get) => ({
  // ── Available Schools (fetched from API by warehouse city) ────────
  schools: [],
  isLoadingSchools: false,
  schoolsError: null,

  // ── Search / Filter ──────────────────────────────────────────────
  searchQuery: "",
  selectedCity: "",

  // ── School Access Request Modal State ────────────────────────────
  isRequestModalOpen: false,
  selectedSchoolId: null,
  selectedCategories: [],
  isSubmitting: false,
  submitError: null,

  // ── Retailer's Connected Schools (per status) ───────────────────
  connectedSchools: {
    approved: [],
    pending: [],
    rejected: [],
  },
  isLoadingConnected: {
    approved: false,
    pending: false,
    rejected: false,
  },
  connectedError: {
    approved: null,
    pending: null,
    rejected: null,
  },

  // ── School Detail Page State ────────────────────────────────────
  // All data comes from single GET /schools/:id call
  schoolDetail: null, // full school object
  schoolProducts: [], // school.products extracted
  schoolAnalytics: null, // school.analytics extracted
  isLoadingSchoolDetail: false,
  schoolDetailError: null,

  // ── Actions ──────────────────────────────────────────────────────

  /**
   * Fetch schools by city (derived from the active warehouse).
   * Called when the "Request School Access" modal opens.
   */
  fetchSchoolsByCity: async (city) => {
    if (!city) {
      set({ schools: [], schoolsError: "No warehouse city found." });
      return;
    }

    set({ isLoadingSchools: true, schoolsError: null, selectedCity: city });

    try {
      const data = await schoolService.getSchoolsByCity(city, {
        search: get().searchQuery,
      });

      // API may return { schools: [...] } or an array directly
      const schoolsList = Array.isArray(data)
        ? data
        : data.schools || data.data || [];

      set({ schools: schoolsList, isLoadingSchools: false });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to fetch schools. Please try again.";
      set({ schools: [], isLoadingSchools: false, schoolsError: message });
    }
  },

  /**
   * Search schools with a query string (within the currently selected city).
   */
  searchSchools: async (query) => {
    set({ searchQuery: query });

    const city = get().selectedCity;
    if (!city) return;

    set({ isLoadingSchools: true, schoolsError: null });

    try {
      const data = await schoolService.getSchoolsByCity(city, {
        search: query,
      });
      const schoolsList = Array.isArray(data)
        ? data
        : data.schools || data.data || [];
      set({ schools: schoolsList, isLoadingSchools: false });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to search schools.";
      set({ isLoadingSchools: false, schoolsError: message });
    }
  },

  /**
   * Open the Request School Access modal.
   * Automatically fetches schools for the given warehouse city.
   */
  openRequestModal: (warehouseCity) => {
    set({
      isRequestModalOpen: true,
      selectedSchoolId: null,
      selectedCategories: [],
      searchQuery: "",
      submitError: null,
    });

    // Trigger fetch for the warehouse's city
    get().fetchSchoolsByCity(warehouseCity);
  },

  /**
   * Close the modal and reset selection state.
   */
  closeRequestModal: () => {
    set({
      isRequestModalOpen: false,
      selectedSchoolId: null,
      selectedCategories: [],
      searchQuery: "",
      submitError: null,
    });
  },

  /**
   * Select a school in the modal.
   */
  selectSchool: (schoolId) => set({ selectedSchoolId: schoolId }),

  /**
   * Toggle a product category for the access request.
   */
  toggleCategory: (category) => {
    const current = get().selectedCategories;
    if (current.includes(category)) {
      set({ selectedCategories: current.filter((c) => c !== category) });
    } else {
      set({ selectedCategories: [...current, category] });
    }
  },

  /**
   * Submit the school access request to the backend.
   */
  submitSchoolAccessRequest: async (warehouseId) => {
    const { selectedSchoolId, selectedCategories } = get();

    if (!selectedSchoolId || selectedCategories.length === 0) {
      set({
        submitError: "Please select a school and at least one product type.",
      });
      return { success: false };
    }

    set({ isSubmitting: true, submitError: null });

    try {
      await schoolService.requestSchoolAccess(selectedSchoolId, {
        productType: selectedCategories,
        warehouseId,
      });

      set({
        isSubmitting: false,
        isRequestModalOpen: false,
        selectedSchoolId: null,
        selectedCategories: [],
        searchQuery: "",
      });

      // Refresh connected schools lists after successful request
      get().refreshAllConnectedSchools();

      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to submit school access request.";
      set({ isSubmitting: false, submitError: message });
      return { success: false, error: message };
    }
  },

  /**
   * Fetch connected schools for a given status (approved | pending | rejected).
   * Calls GET /api/v1/retailer-schools/connected-schools?status=<status>
   */
  fetchConnectedSchools: async (status) => {
    set((state) => ({
      isLoadingConnected: { ...state.isLoadingConnected, [status]: true },
      connectedError: { ...state.connectedError, [status]: null },
    }));

    try {
      const data = await schoolService.getConnectedSchools(status);
      const schoolsList = data?.schools || [];

      set((state) => ({
        connectedSchools: { ...state.connectedSchools, [status]: schoolsList },
        isLoadingConnected: { ...state.isLoadingConnected, [status]: false },
      }));
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        `Failed to load ${status} schools.`;
      set((state) => ({
        isLoadingConnected: { ...state.isLoadingConnected, [status]: false },
        connectedError: { ...state.connectedError, [status]: message },
      }));
    }
  },

  /**
   * Refresh all three connected school lists.
   */
  refreshAllConnectedSchools: () => {
    const { fetchConnectedSchools } = get();
    fetchConnectedSchools("approved");
    fetchConnectedSchools("pending");
    fetchConnectedSchools("rejected");
  },

  // ── School Detail Page Actions ─────────────────────────────────

  /**
   * Fetch all school data using single GET /api/v1/schools/:id
   * The response contains school info, products[], analytics{}, partnerships[]
   */
  fetchAllSchoolData: async (schoolId) => {
    set({ isLoadingSchoolDetail: true, schoolDetailError: null });
    try {
      const data = await schoolService.getSchoolById(schoolId);
      // API returns { school: { ...info, products: [], analytics: {}, partnerships: [] } }
      const school = data?.school || data;
      const products = school?.products || [];
      const analytics = school?.analytics || null;

      set({
        schoolDetail: school,
        schoolProducts: products,
        schoolAnalytics: analytics,
        isLoadingSchoolDetail: false,
      });
      return school;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to load school details.";
      set({
        schoolDetail: null,
        schoolProducts: [],
        schoolAnalytics: null,
        isLoadingSchoolDetail: false,
        schoolDetailError: message,
      });
      return null;
    }
  },

  /**
   * Clear school detail page state (call when leaving the page).
   */
  clearSchoolDetail: () => {
    set({
      schoolDetail: null,
      schoolProducts: [],
      schoolAnalytics: null,
      isLoadingSchoolDetail: false,
      schoolDetailError: null,
    });
  },

  /**
   * Clear any errors.
   */
  clearError: () =>
    set({
      schoolsError: null,
      submitError: null,
      connectedError: { approved: null, pending: null, rejected: null },
    }),

  /**
   * Reset the entire store.
   */
  reset: () =>
    set({
      schools: [],
      isLoadingSchools: false,
      schoolsError: null,
      searchQuery: "",
      selectedCity: "",
      isRequestModalOpen: false,
      selectedSchoolId: null,
      selectedCategories: [],
      isSubmitting: false,
      submitError: null,
      connectedSchools: { approved: [], pending: [], rejected: [] },
      isLoadingConnected: { approved: false, pending: false, rejected: false },
      connectedError: { approved: null, pending: null, rejected: null },
      schoolDetail: null,
      schoolProducts: [],
      schoolAnalytics: null,
      isLoadingSchoolDetail: false,
      schoolDetailError: null,
    }),
}));

export default useSchoolStore;
