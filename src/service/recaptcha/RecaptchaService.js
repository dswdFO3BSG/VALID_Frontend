class RecaptchaService {
    constructor() {
        this.siteKey = import.meta.env.VITE_SITE_KEY_RECAPTCHA;
        this.isLoaded = false;
    }

    // Load reCAPTCHA v3 script
    loadScript() {
        return new Promise((resolve, reject) => {
            if (this.isLoaded && typeof grecaptcha !== 'undefined') {
                // Even if already loaded, ensure grecaptcha is ready
                grecaptcha.ready(() => {
                    resolve();
                });
                return;
            }

            const script = document.createElement('script');
            script.src = `https://www.google.com/recaptcha/api.js?render=${this.siteKey}`;
            script.async = true;

            script.onload = () => {
                // Wait for grecaptcha to be available and ready
                const checkAndWait = () => {
                    if (typeof grecaptcha !== 'undefined') {
                        grecaptcha.ready(() => {
                            this.isLoaded = true;
                            resolve();
                        });
                    } else {
                        // If grecaptcha is not available yet, wait a bit more
                        setTimeout(checkAndWait, 100);
                    }
                };
                checkAndWait();
            };

            script.onerror = () => {
                reject(new Error('Failed to load reCAPTCHA v3 script'));
            };

            document.head.appendChild(script);
        });
    }

    // Execute reCAPTCHA v3
    execute(action = 'submit') {
        return new Promise((resolve, reject) => {
            if (typeof grecaptcha === 'undefined') {
                reject(new Error('reCAPTCHA v3 not loaded'));
                return;
            }

            if (!this.siteKey) {
                reject(new Error('reCAPTCHA site key not configured'));
                return;
            }

            // Retry mechanism for "No reCAPTCHA clients exist" error
            const attemptExecution = (retryCount = 0) => {
                grecaptcha.ready(() => {
                    grecaptcha
                        .execute(this.siteKey, { action })
                        .then((token) => {
                            if (!token) {
                                throw new Error('No token received from reCAPTCHA');
                            }
                            resolve(token);
                        })
                        .catch((error) => {
                            // Retry up to 3 times for client initialization issues
                            if (retryCount < 3 && error.message.includes('No reCAPTCHA clients exist')) {
                                setTimeout(() => attemptExecution(retryCount + 1), 1000);
                            } else {
                                reject(new Error('reCAPTCHA v3 execution failed: ' + error.message));
                            }
                        });
                });
            };

            attemptExecution();
        });
    }

    // Get site key
    getSiteKey() {
        return this.siteKey;
    }

    // Initialize reCAPTCHA v3
    async initialize() {
        await this.loadScript();
    }
}

// Export singleton instance
export default new RecaptchaService();
