import { authAxiosInstance } from '@/interceptors/axiosInstances';

export default class AuditTrailServices {
    /**
     * Get audit trail records with filtering and pagination
     * @param {Object} params - Query parameters for filtering
     * @returns {Promise} Response with audit trail data
     */
    static async getAuditTrail(params = {}) {
        try {
            const response = await authAxiosInstance.get('/audit-trail', { params });
            return response.data;
        } catch (error) {
            console.error('Audit Trail Service Error:', error);
            throw error;
        }
    }

    /**
     * Get specific audit trail record by ID
     * @param {number} id - Audit trail record ID
     * @returns {Promise} Response with audit trail record
     */
    static async getAuditTrailById(id) {
        try {
            const response = await authAxiosInstance.get(`/audit-trail/${id}`);
            return response.data;
        } catch (error) {
            console.error('Audit Trail By ID Service Error:', error);
            throw error;
        }
    }

    /**
     * Get audit trail statistics
     * @param {Object} params - Query parameters for date range
     * @returns {Promise} Response with statistics data
     */
    static async getStatistics(params = {}) {
        try {
            const response = await authAxiosInstance.get('/audit-trail/statistics', { params });
            return response.data;
        } catch (error) {
            console.error('Audit Trail Statistics Service Error:', error);
            throw error;
        }
    }

    /**
     * Export audit trail data
     * @param {Object} params - Query parameters for filtering
     * @returns {Promise} Response with exported data
     */
    static async exportAuditTrail(params = {}) {
        try {
            const response = await authAxiosInstance.get('/audit-trail/export', { params });
            return response.data;
        } catch (error) {
            console.error('Audit Trail Export Service Error:', error);
            throw error;
        }
    }
}
