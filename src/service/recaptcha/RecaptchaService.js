class RecaptchaService {
    constructor() {
        this.siteKey = import.meta.env.VITE_SITE_KEY_RECAPTCHA;
        this.isLoaded = false;
        this.version = 'v3'; // Default to v3, can be changed to 'v2'
    }

    // Load reCAPTCHA v3 script
    loadV3Script() {
        return new Promise((resolve, reject) => {
            if (this.isLoaded && typeof grecaptcha !== 'undefined') {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = `https://www.google.com/recaptcha/api.js?render=${this.siteKey}`;
            script.async = true;

            script.onload = () => {
                this.isLoaded = true;
                this.version = 'v3';
                resolve();
            };

            script.onerror = () => {
                reject(new Error('Failed to load reCAPTCHA v3 script'));
            };

            document.head.appendChild(script);
        });
    }

    // Load reCAPTCHA v2 script
    loadV2Script() {
        return new Promise((resolve, reject) => {
            if (this.isLoaded && typeof grecaptcha !== 'undefined') {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://www.google.com/recaptcha/api.js';
            script.async = true;
            script.defer = true;

            script.onload = () => {
                this.isLoaded = true;
                this.version = 'v2';
                resolve();
            };

            script.onerror = () => {
                reject(new Error('Failed to load reCAPTCHA v2 script'));
            };

            document.head.appendChild(script);
        });
    }

    // Execute reCAPTCHA v3
    executeV3(action = 'submit') {
        return new Promise((resolve, reject) => {
            if (typeof grecaptcha === 'undefined') {
                reject(new Error('reCAPTCHA v3 not loaded'));
                return;
            }

            grecaptcha.ready(() => {
                grecaptcha
                    .execute(this.siteKey, { action })
                    .then((token) => {
                        resolve(token);
                    })
                    .catch((error) => {
                        reject(new Error('reCAPTCHA v3 execution failed: ' + error.message));
                    });
            });
        });
    }

    // Get reCAPTCHA v2 response
    getV2Response() {
        if (typeof grecaptcha === 'undefined') {
            throw new Error('reCAPTCHA v2 not loaded');
        }
        return grecaptcha.getResponse();
    }

    // Reset reCAPTCHA v2
    resetV2() {
        if (typeof grecaptcha !== 'undefined') {
            grecaptcha.reset();
        }
    }

    // Get site key
    getSiteKey() {
        return this.siteKey;
    }

    // Set version
    setVersion(version) {
        if (version === 'v2' || version === 'v3') {
            this.version = version;
        }
    }

    // Get current version
    getVersion() {
        return this.version;
    }

    // Initialize based on version
    async initialize(version = 'v3') {
        this.setVersion(version);

        if (version === 'v3') {
            await this.loadV3Script();
        } else if (version === 'v2') {
            await this.loadV2Script();
        }
    }

    // Execute based on current version
    async execute(action = 'submit', callback = null) {
        if (this.version === 'v3') {
            return await this.executeV3(action);
        } else if (this.version === 'v2') {
            const response = this.getV2Response();
            if (!response) {
                throw new Error('Please complete the reCAPTCHA verification');
            }
            return response;
        }
    }
}

// Export singleton instance
export default new RecaptchaService();
