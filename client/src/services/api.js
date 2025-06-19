import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api",
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;\n    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const login = (credentials) => {
  return apiClient.post("/login", credentials);
};

export const register = (userData) => {
  return apiClient.post("/register", userData);
};

// Inventory endpoints
export const getInventoryStats = () => {
  return apiClient.get("/inventory/stats");
};

export const getInventory = () => {
  return apiClient.get("/inventory");
};

export const addInventoryItem = (item) => {
  return apiClient.post("/inventory", item);
};

export const updateInventoryItem = (id, item) => {
  return apiClient.put(`/inventory/${id}`, item);
};

export const deleteInventoryItem = (id) => {
  return apiClient.delete(`/inventory/${id}`);
};

// Report endpoints
export const getInventoryReport = (params) => {
  return apiClient.get("/inventory/report", { params });
};

export default apiClient;
