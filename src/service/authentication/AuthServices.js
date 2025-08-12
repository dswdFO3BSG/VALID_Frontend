import { authAxiosInstance } from '../../interceptors/axiosInstances.js';

export default class AuthServices {
    static async login(params) {
        try {
            const response = await authAxiosInstance.post('login', params);
            return response.data;
        } catch (error) {
            return error;
        }
    }

    static async logout(params) {
        try {
            const response = await authAxiosInstance.post('logout', params);
            return response.data;
        } catch (error) {
            return error;
        }
    }
}
