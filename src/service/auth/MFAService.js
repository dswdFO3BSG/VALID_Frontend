import { authAxiosInstance } from '@/interceptors/axiosInstances';

class MFAService {
    /**
     * Setup MFA for user - generates QR code and secret
     * @param {string} empno - Employee number
     * @returns {Promise} Response with QR code and setup data
     */
    static async setupMFA(empno) {
        try {
            const response = await authAxiosInstance.post('/mfa/setup', {
                empno: empno
            });
            return response.data;
        } catch (error) {
            console.error('MFA Setup Error:', error);
            throw error;
        }
    }

    /**
     * Verify TOTP code and enable MFA
     * @param {string} empno - Employee number
     * @param {string} totpCode - 6-digit TOTP code
     * @returns {Promise} Response confirming MFA activation
     */
    static async verifyAndEnableMFA(empno, totpCode) {
        try {
            const response = await authAxiosInstance.post('/mfa/verify-setup', {
                empno: empno,
                totp_code: totpCode
            });
            return response.data;
        } catch (error) {
            console.error('MFA Verification Error:', error);
            throw error;
        }
    }

    /**
     * Verify TOTP code for login
     * @param {string} empno - Employee number
     * @param {string} totpCode - 6-digit TOTP code
     * @param {boolean} rememberMFA - Remember this device for 30 days
     * @returns {Promise} Response with verification result
     */
    static async verifyMFAForLogin(empno, totpCode, rememberMFA = false) {
        try {
            const response = await authAxiosInstance.post('/mfa/verify-login', {
                empno: empno,
                totp_code: totpCode,
                remember_mfa: rememberMFA
            });

            // Store verification token for login
            if (response.data.verification_token) {
                localStorage.setItem('mfa_verification_token', response.data.verification_token);
            }

            return response.data;
        } catch (error) {
            console.error('MFA Login Verification Error:', error);
            throw error;
        }
    }

    /**
     * Check if remember token is still valid
     * @param {string} empno - Employee number
     * @param {string} rememberToken - Remember token
     * @returns {Promise} Response with token validity
     */
    static async checkRememberToken(empno, rememberToken) {
        try {
            const response = await authAxiosInstance.post('/mfa/check-remember', {
                empno: empno,
                remember_token: rememberToken
            });
            return response.data;
        } catch (error) {
            console.error('MFA Remember Token Check Error:', error);
            throw error;
        }
    }

    /**
     * Disable MFA for user
     * @param {string} empno - Employee number
     * @param {string} totpCode - Current TOTP code for verification
     * @returns {Promise} Response confirming MFA disabled
     */
    static async disableMFA(empno, totpCode) {
        try {
            const response = await authAxiosInstance.post('/mfa/disable', {
                empno: empno,
                totp_code: totpCode
            });
            return response.data;
        } catch (error) {
            console.error('MFA Disable Error:', error);
            throw error;
        }
    }

    /**
     * Check if user has MFA enabled
     * @param {string} empno - Employee number
     * @returns {Promise} Response with MFA status
     */
    static async checkMFAStatus(empno) {
        try {
            const response = await authAxiosInstance.get(`/mfa/status?empno=${empno}`);
            return response.data;
        } catch (error) {
            console.error('MFA Status Check Error:', error);
            throw error;
        }
    }

    /**
     * Store remember token in localStorage
     * @param {string} rememberToken - Token to remember device
     * @param {string} expiresAt - Expiration date
     */
    static storeRememberToken(rememberToken, expiresAt) {
        try {
            localStorage.setItem('mfa_remember_token', rememberToken);
            localStorage.setItem('mfa_remember_expires', expiresAt);
        } catch (error) {
            console.error('Error storing remember token:', error);
        }
    }

    /**
     * Get stored remember token
     * @returns {Object|null} Remember token data or null if not found/expired
     */
    static getRememberToken() {
        try {
            const token = localStorage.getItem('mfa_remember_token');
            const expires = localStorage.getItem('mfa_remember_expires');

            if (!token || !expires) return null;

            // Check if token is expired
            if (new Date() > new Date(expires)) {
                this.clearRememberToken();
                return null;
            }

            return { token, expires };
        } catch (error) {
            console.error('Error getting remember token:', error);
            return null;
        }
    }

    /**
     * Clear stored remember token
     */
    static clearRememberToken() {
        try {
            localStorage.removeItem('mfa_remember_token');
            localStorage.removeItem('mfa_remember_expires');
        } catch (error) {
            console.error('Error clearing remember token:', error);
        }
    }

    /**
     * Get stored verification token for login
     * @returns {string|null} Verification token or null if not found
     */
    static getVerificationToken() {
        try {
            return localStorage.getItem('mfa_verification_token');
        } catch (error) {
            console.error('Error getting verification token:', error);
            return null;
        }
    }

    /**
     * Clear stored verification token
     */
    static clearVerificationToken() {
        try {
            localStorage.removeItem('mfa_verification_token');
        } catch (error) {
            console.error('Error clearing verification token:', error);
        }
    }

    /**
     * Check if user should be prompted for MFA setup
     * @param {string} empno - Employee number
     * @returns {boolean} True if should prompt for setup
     */
    static shouldPromptMFASetup(empno) {
        // Check if user has dismissed setup prompt
        const dismissedKey = `mfa_setup_dismissed_${empno}`;
        return !localStorage.getItem(dismissedKey);
    }

    /**
     * Mark MFA setup as dismissed for user
     * @param {string} empno - Employee number
     */
    static dismissMFASetup(empno) {
        const dismissedKey = `mfa_setup_dismissed_${empno}`;
        localStorage.setItem(dismissedKey, 'true');
    }
}

export default MFAService;
