import axios from "axios";

const API_BASE_URL =
    window.location.hostname === 'localhost'
        ? 'http://localhost:5001/api/v1'
        : 'https://bukizz.in/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ── Helper: read persisted auth state from Zustand's localStorage ────
// Zustand persist stores under a single key; this extracts what we need.
function getPersistedAuth() {
  try {
    const raw = localStorage.getItem("bukizz-auth");
    if (!raw) return { accessToken: null, refreshToken: null };
    const parsed = JSON.parse(raw);
    return {
      accessToken: parsed?.state?.accessToken || null,
      refreshToken: parsed?.state?.refreshToken || null,
    };
  } catch {
    return { accessToken: null, refreshToken: null };
  }
}

function setPersistedTokens(accessToken, refreshToken) {
  try {
    const raw = localStorage.getItem("bukizz-auth");
    if (!raw) return;
    const parsed = JSON.parse(raw);
    parsed.state.accessToken = accessToken;
    parsed.state.refreshToken = refreshToken;
    localStorage.setItem("bukizz-auth", JSON.stringify(parsed));
  } catch {
    // noop
  }
}

function clearPersistedAuth() {
  try {
    const raw = localStorage.getItem("bukizz-auth");
    if (!raw) return;
    const parsed = JSON.parse(raw);
    parsed.state = {
      ...parsed.state,
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    };
    localStorage.setItem("bukizz-auth", JSON.stringify(parsed));
  } catch {
    localStorage.removeItem("bukizz-auth");
  }
}

// ── Request Interceptor ──────────────────────────────────────────────
// Attaches the access token to every outgoing request.
apiClient.interceptors.request.use(
  (config) => {
    const { accessToken } = getPersistedAuth();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    const activeWarehouseId = localStorage.getItem("activeWarehouseId");
    if (activeWarehouseId) {
      config.headers["x-warehouse-id"] = activeWarehouseId;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response Interceptor (silent token refresh) ──────────────────────
// On a 401, queues the failed request, refreshes tokens once, then
// replays all queued requests. Prevents race conditions when multiple
// requests 401 at the same time.

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401, and never retry more than once,
    // and never try to refresh the refresh-token request itself.
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/refresh-token") ||
      originalRequest.url?.includes("/auth/login")
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Another refresh is already in flight — queue this request.
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { refreshToken } = getPersistedAuth();
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
        refreshToken,
      });

      // Backend wraps response: { success, data: { accessToken, refreshToken } }
      const responsePayload = response.data?.data || response.data;
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        responsePayload;

      // Update persisted Zustand state
      setPersistedTokens(newAccessToken, newRefreshToken);

      apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      processQueue(null, newAccessToken);

      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);

      // Clear persisted auth and redirect to login
      clearPersistedAuth();

      // Avoid redirect loops
      if (
        !window.location.pathname.startsWith("/login") &&
        !window.location.pathname.startsWith("/register")
      ) {
        window.location.href = "/login";
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default apiClient;
