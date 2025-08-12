import { authAxiosInstance } from '../../interceptors/axiosInstances.js';

export default class userAccess {
    static async getUserAccess(params) {
        try {
            const response = await authAxiosInstance.get('users/user-access', { params });
            return response.data;
        } catch (error) {
            return error;
        }
    }

    static async getUserModules(params) {
        try {
            const response = await authAxiosInstance.get('users/user-modules', {});
            return response.data;
        } catch (error) {
            return error;
        }
    }

    static async getUsers(params) {
        try {
            const response = await authAxiosInstance.get('users/users', { params });
            return response.data;
        } catch (error) {
            return error;
        }
    }

    static async getUserCurrentModules(params) {
        try {
            const response = await authAxiosInstance.get('users/user-current-modules', { params });
            return response.data;
        } catch (error) {
            return error;
        }
    }

    static async saveUserModules(data) {
        try {
            const response = authAxiosInstance.post('users/user-access', data);
            return response.data;
        } catch (error) {
            return error;
        }
    }

    static async checkUserAccessPath(params) {
        try {
            const response = await authAxiosInstance.get('users/user-access-path', { params });
            return response.data;
        } catch (error) {
            return error;
        }
    }
}
