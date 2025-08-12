import { authAxiosInstance } from '../../interceptors/axiosInstances.js';

export default class VerifiedClientsServices {
    static async getClients(params) {
        try {
            const response = await authAxiosInstance.get('clients/clients', { params });
            return response.data;
        } catch (error) {
            return error;
        }
    }

    static async saveClient(params) {
        try {
            const response = await authAxiosInstance.post('clients/clients', params);
            return response.data;
        } catch (error) {
            return error;
        }
    }

    static async updateClient(params) {
        try {
            const response = await authAxiosInstance.patch('clients/clients', params);
            return response.data;
        } catch (error) {
            return error;
        }
    }

    static async getStatistics(params) {
        try {
            const response = await authAxiosInstance.get('clients/statistics', { params });
            return response.data;
        } catch (error) {
            return error;
        }
    }

    static async getAgeGroups(params) {
        try {
            const response = await authAxiosInstance.get('clients/age_group', { params });
            return response.data;
        } catch (error) {
            return error;
        }
    }

    static async getMunicipalityCount(params) {
        try {
            const response = await authAxiosInstance.get('clients/municipality', { params });
            return response.data;
        } catch (error) {
            return error;
        }
    }
}
