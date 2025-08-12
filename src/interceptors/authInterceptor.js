export default function setupAuthInterceptor(axiosInstance, token) {
    axiosInstance.defaults.baseURL = import.meta.env.VITE_API;
    if (token) {
        axiosInstance.interceptors.request.use((config) => {
            config.headers.Authorization = `Bearer ${token}`;
            return config;
        });
    }
}
