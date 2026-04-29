const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";

const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const buildUrl = (url: string, params?: Record<string, any>) => {
    const normalizedUrl = url.startsWith("/") ? url : `/${url}`;
    const fullUrl = `${API_BASE_URL}${normalizedUrl}`;
    if (!params) return fullUrl;

    const searchParams = new URLSearchParams(
        Object.entries(params).reduce<Record<string, string>>((acc, [key, value]) => {
            if (value !== undefined && value !== null) {
                acc[key] = String(value);
            }
            return acc;
        }, {})
    );

    return `${fullUrl}?${searchParams.toString()}`;
};

const request = async <T = any>(
    url: string,
    method: string,
    data?: any,
    config?: { headers?: Record<string, string>; params?: Record<string, any> }
): Promise<T> => {
    const response = await fetch(buildUrl(url, config?.params), {
        method,
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
            ...config?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
    }

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
        return response.json();
    }

    return response.text() as unknown as T;
};

const axiosInstance = {
    get: <T = any>(url: string, config?: { headers?: Record<string, string>; params?: Record<string, any> }) =>
        request<T>(url, "GET", undefined, config),
    post: <T = any>(url: string, data?: any, config?: { headers?: Record<string, string>; params?: Record<string, any> }) =>
        request<T>(url, "POST", data, config),
    put: <T = any>(url: string, data?: any, config?: { headers?: Record<string, string>; params?: Record<string, any> }) =>
        request<T>(url, "PUT", data, config),
    delete: <T = any>(url: string, config?: { headers?: Record<string, string>; params?: Record<string, any> }) =>
        request<T>(url, "DELETE", undefined, config),
};

export default axiosInstance;