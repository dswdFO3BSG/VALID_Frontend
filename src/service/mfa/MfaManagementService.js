import { authAxiosInstance } from '@/interceptors/axiosInstances';
class MfaManagementService {
    // Get all users with their MFA status
    async getAllUsers(params = {}) {
        try {
            const response = await authAxiosInstance.get('/mfa-management', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching users for MFA management:', error);
            throw error?.response?.data || error;
        }
    }

    // Get specific user's MFA details
    async getUserMfaDetails(userId) {
        try {
            const response = await authAxiosInstance.get(`/mfa-management/users/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user MFA details:', error);
            throw error?.response?.data || error;
        }
    }

    // Reset/Remove user's MFA
    async resetUserMfa(userId) {
        try {
            const response = await authAxiosInstance.post(`/mfa-management/reset/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error resetting user MFA:', error);
            throw error?.response?.data || error;
        }
    }

    // Bulk reset MFA for multiple users
    async bulkResetMfa(userIds) {
        try {
            const response = await authAxiosInstance.post('/mfa-management/bulk-reset', {
                user_ids: userIds
            });
            return response.data;
        } catch (error) {
            console.error('Error bulk resetting MFA:', error);
            throw error?.response?.data || error;
        }
    }
}

export default new MfaManagementService();
