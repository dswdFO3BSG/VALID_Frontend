export default function setupPSAInterceptor(axiosInstance, token) {
    axiosInstance.defaults.baseURL = import.meta.env.VITE_PSA_API;
    if (token) {
        axiosInstance.interceptors.request.use((config) => {
            config.headers.Authorization = `Bearer ${token}`;
            return config;
        });
    }
}
