import { authAxiosInstance } from '../../interceptors/axiosInstances.js';

export default class generateReports {
    static async getClients(params) {
        try {
            const response = await authAxiosInstance.get('/reports/clients', { params });
            return response.data;
        } catch (error) {
            return error;
        }
    }

    static async uploadPhoto(beneficiary_id, photo) {
        try {
            const formData = new FormData();
            formData.append('beneficiary_id', beneficiary_id);
            formData.append('photo', photo);
            const response = await authAxiosInstance.post('/bene_id/upload-photo', formData);
            return response.data;
        } catch (error) {
            return error;
        }
    }
}
