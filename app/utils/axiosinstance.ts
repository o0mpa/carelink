import axios from "axios";
import { API_BASE_URL } from "./api";

const apiRoot = API_BASE_URL.replace(/\/api\/?$/i, "");

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api",
    headers: { "Content-Type": "application/json" },
});

// Attach JWT token from localStorage to every request
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("carelink_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default axiosInstance;