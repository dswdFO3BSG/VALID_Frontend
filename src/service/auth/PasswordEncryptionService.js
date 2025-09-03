import CryptoJS from 'crypto-js';

class PasswordEncryptionService {
    // Use a secret key - in production, this should be from environment variables
    static secretKey = import.meta.env.VITE_PASSWORD_ENCRYPTION_KEY || 'VALID_System_2024_SecretKey';

    /**
     * Encrypt password before sending to backend
     *
     * @param {string} password - The plain text password
     * @returns {string} - The encrypted password
     */
    static encryptPassword(password) {
        try {
            const encrypted = CryptoJS.AES.encrypt(password, this.secretKey).toString();
            return encrypted;
        } catch (error) {
            console.error('Password encryption failed:', error);
            throw new Error('Password encryption failed');
        }
    }

    /**
     * Alternative encryption using Base64 encoding (simpler but less secure)
     * Use this if AES encryption causes issues
     *
     * @param {string} password - The plain text password
     * @returns {string} - The base64 encoded password
     */
    static encryptPasswordBase64(password) {
        try {
            const encoded = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(password));
            return encoded;
        } catch (error) {
            console.error('Password encoding failed:', error);
            throw new Error('Password encoding failed');
        }
    }
}

export default PasswordEncryptionService;
