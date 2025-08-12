import { psaAxiosInstance } from '../../interceptors/axiosInstances.js';

export default class PsaServices {
    static async authPSA(params) {
        try {
            const response = await psaAxiosInstance.post('auth', params);
            return response.data;
        } catch (error) {
            return error;
        }
    }

    static async verifyClient(params) {
        try {
            const response = await psaAxiosInstance.post('query', params);
            return response.data;
        } catch (error) {
            return error;
        }
    }
}
