import { authAxiosInstance } from '../../interceptors/axiosInstances.js';
class UserModulesService {
    /**
     * Get all user modules
     */
    async getAll() {
        try {
            const response = await authAxiosInstance.get('/user-modules');
            return response.data;
        } catch (error) {
            console.error('Error fetching user modules:', error);
            throw error;
        }
    }

    /**
     * Get a specific user module by ID
     */
    async getById(id) {
        try {
            const response = await authAxiosInstance.get(`/user-modules/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user module:', error);
            throw error;
        }
    }

    /**
     * Create a new user module
     */
    async create(moduleData) {
        try {
            const response = await authAxiosInstance.post('/user-modules', moduleData);
            return response.data;
        } catch (error) {
            console.error('Error creating user module:', error);
            if (error.response && error.response.data) {
                return error.response.data;
            }
            throw error;
        }
    }

    /**
     * Update an existing user module
     */
    async update(id, moduleData) {
        try {
            const response = await authAxiosInstance.put(`/user-modules/${id}`, moduleData);
            return response.data;
        } catch (error) {
            console.error('Error updating user module:', error);
            if (error.response && error.response.data) {
                return error.response.data;
            }
            throw error;
        }
    }

    /**
     * Delete a user module
     */
    async delete(id) {
        try {
            const response = await authAxiosInstance.delete(`/user-modules/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting user module:', error);
            if (error.response && error.response.data) {
                return error.response.data;
            }
            throw error;
        }
    }

    /**
     * Get modules ordered by hierarchy
     */
    async getHierarchy() {
        try {
            const response = await this.getAll();
            if (response.status) {
                // Group modules by parent to create hierarchy
                const modules = response.data;
                const parentModules = modules.filter((module) => !module.parent || module.parent === 0);
                const childModules = modules.filter((module) => module.parent && module.parent > 0);

                // Sort parent modules by order
                parentModules.sort((a, b) => a.order - b.order);

                // Add children to their parents
                parentModules.forEach((parent) => {
                    parent.children = childModules.filter((child) => child.parent === parent.id).sort((a, b) => a.order - b.order);
                });

                return {
                    status: true,
                    data: parentModules
                };
            }
            return response;
        } catch (error) {
            console.error('Error fetching module hierarchy:', error);
            throw error;
        }
    }
}

export default new UserModulesService();
