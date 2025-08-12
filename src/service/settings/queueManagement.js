import { authAxiosInstance } from '../../interceptors/axiosInstances.js';

export default class queueManager {
    static async createQueue(data) {
        try {
            const response = authAxiosInstance.post('queue/queues', data);
            return response.data;
        } catch (error) {
            return error;
        }
    }

    static async getQueueNumber(params) {
        try {
            const response = await authAxiosInstance.get('queue/queueNumber', { params });
            return response.data;
        } catch (error) {
            return error;
        }
    }

    static async updateQueue(id, data) {
        try {
            const response = await authAxiosInstance.patch(`queue/queues/${id}`, data);
            return response.data;
        } catch (error) {
            return error;
        }
    }

    static async getSectors(params) {
        try {
            const response = await authAxiosInstance.get('queue/sectors', { params });
            return response.data;
        } catch (error) {
            return error;
        }
    }

    static async getPrograms(params) {
        try {
            const response = await authAxiosInstance.get('queue/programs', { params });
            return response.data;
        } catch (error) {
            return error;
        }
    }

    static async getQueues(params) {
        try {
            const response = await authAxiosInstance.get('queue/queues', { params });
            return response.data;
        } catch (error) {
            return error;
        }
    }
}
