<script setup>
// import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
import MFAService from '@/service/auth/MFAService.js';
import PasswordEncryptionService from '@/service/auth/PasswordEncryptionService.js';
import AuthServices from '@/service/authentication/AuthServices';
import PsaServices from '@/service/psa/PsaServices.js';
import Cookies from 'js-cookie';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const username = ref('');
const password = ref('');
const showPassword = ref(false);
const loginResult = ref('');
const psaAuthResult = ref('');
const loginResultModal = ref(false);
const loading = ref(false);

// MFA related variables
const showMFASetup = ref(false);
const showMFAVerification = ref(false);
const mfaSetupData = ref(null);
const totpCode = ref('');
const rememberMFA = ref(false);
const mfaLoading = ref(false);
const currentEmpno = ref('');

const recaptchaSiteKey = import.meta.env.VITE_SITE_KEY_RECAPTCHA;

onMounted(async () => {
    try {
        // Initialize reCAPTCHA v3 using service
        await RecaptchaService.initialize('v3');
    } catch (error) {
        console.error('Failed to initialize reCAPTCHA:', error);
    }

    // v2 script loading
    // const script = document.createElement('script');
    // script.src = 'https://www.google.com/recaptcha/api.js';
    // script.async = true;
    // script.defer = true;
    // document.head.appendChild(script);

    // // Make reCAPTCHA callback available globally
    // window.onRecaptchaCallback = (response) => {
    //     recaptchaResponse.value = response;
    // };
});

function formatEmployeeId(value) {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    // Format as XX-YYYYY...
    if (digits.length <= 2) return digits;
    return digits.slice(0, 2) + '-' + digits.slice(2);
}

function onEmployeeIdInput(e) {
    username.value = formatEmployeeId(e.target.value);
}

function togglePasswordVisibility() {
    showPassword.value = !showPassword.value;
}

// Uncomment v3 executeRecaptcha function using service
const executeRecaptcha = async () => {
    try {
        return await RecaptchaService.execute('login');
    } catch (error) {
        throw new Error('reCAPTCHA verification failed: ' + error.message);
    }
};

// Comment out v3 executeRecaptcha function
// const executeRecaptcha = () => {
//     return new Promise((resolve, reject) => {
//         if (typeof grecaptcha === 'undefined') {
//             reject(new Error('reCAPTCHA not loaded'));
//             return;
//         }

//         grecaptcha.ready(() => {
//             grecaptcha
//                 .execute(recaptchaSiteKey, { action: 'login' })
//                 .then((token) => {
//                     resolve(token);
//                 })
//                 .catch(reject);
//         });
//     });
// };

const login = async () => {
    loading.value = true;
    try {
        // Get reCAPTCHA v3 token using service (uncommented)
        const recaptchaToken = await executeRecaptcha();

        // Encrypt password before sending to server
        const encryptedPassword = PasswordEncryptionService.encryptPasswordBase64(password.value);

        // Check for remember token to potentially bypass MFA
        const rememberTokenData = MFAService.getRememberToken();

        console.log('Login - Remember Token Check:', {
            hasRememberToken: !!rememberTokenData,
            tokenData: rememberTokenData
        });

        const loginData = {
            username: username.value,
            password: encryptedPassword, // Send encrypted password
            recaptcha_token: recaptchaToken
        };

        // Include remember token if available
        if (rememberTokenData) {
            loginData.remember_token = rememberTokenData.token;
            console.log('Including remember token in login request');
        }

        loginResult.value = await AuthServices.login(loginData);
        console.log(loginResult.value);

        // Check if MFA is required
        if (loginResult.value.requires_mfa) {
            currentEmpno.value = loginResult.value.empno;

            if (loginResult.value.setup_required || loginResult.value.mfa_setup_required) {
                // Show MFA setup modal
                await initializeMFASetup();
            } else {
                // Show MFA verification modal
                showMFAVerification.value = true;
            }
            loading.value = false;
            return;
        }

        if (loginResult.value.status === true) {
            Cookies.set('token_valid', loginResult.value.token);
            Cookies.set('empNo', loginResult.value.UserInformation.empno);
            Cookies.set('name', loginResult.value.UserInformation.fname);
            psaAuthResult.value = await PsaServices.authPSA({ client_id: import.meta.env.VITE_PSA_CLIENT_ID, client_secret: import.meta.env.VITE_PSA_CLIENT_SECRET });
            console.log(psaAuthResult.value.data);
            var in30Minutes = 1 / 48;
            Cookies.set('psa-token', psaAuthResult.value.data.access_token, {
                expires: in30Minutes
            });

            window.location.replace('/dashboard');
        } else {
            loginResultModal.value = true;
        }
        loading.value = false;
    } catch (error) {
        console.log(error);
    }
};

const closeLoginErrorModal = () => {
    loginResultModal.value = false;
    password.value = '';
};

const redirectToERM = () => {
    console.log('Redirecting to ERM');
    window.location.replace('http://172.31.32.25/registration/forgot/forgot_password.php');
};

// MFA Methods
const initializeMFASetup = async () => {
    try {
        mfaLoading.value = true;
        const response = await MFAService.setupMFA(currentEmpno.value);
        mfaSetupData.value = response.data;
        showMFASetup.value = true;
    } catch (error) {
        console.error('MFA Setup Error:', error);
        loginResult.value = {
            error: 'Failed to initialize MFA setup. Please try again.',
            validation: '1'
        };
        loginResultModal.value = true;
    } finally {
        mfaLoading.value = false;
    }
};

const verifyMFASetup = async () => {
    if (!totpCode.value || totpCode.value.length !== 6) {
        loginResult.value = {
            error: 'Please enter a valid 6-digit code.',
            validation: '1'
        };
        loginResultModal.value = true;
        return;
    }

    try {
        mfaLoading.value = true;
        const response = await MFAService.verifyAndEnableMFA(currentEmpno.value, totpCode.value);

        // MFA setup complete, close modals
        showMFASetup.value = false;
        totpCode.value = '';

        // The MFA setup verification now returns the complete login response with token
        if (response.status === true) {
            Cookies.set('token_valid', response.token);
            Cookies.set('empNo', response.UserInformation.empno);
            Cookies.set('name', response.UserInformation.fname);

            psaAuthResult.value = await PsaServices.authPSA({
                client_id: import.meta.env.VITE_PSA_CLIENT_ID,
                client_secret: import.meta.env.VITE_PSA_CLIENT_SECRET
            });

            var in30Minutes = 1 / 48;
            Cookies.set('psa-token', psaAuthResult.value.data.access_token, {
                expires: in30Minutes
            });

            window.location.replace('/dashboard');
        }
    } catch (error) {
        console.error('MFA Setup Verification Error:', error);
        loginResult.value = {
            error: error.response?.data?.error || 'MFA setup verification failed. Please try again.',
            validation: '1'
        };
        loginResultModal.value = true;
    } finally {
        mfaLoading.value = false;
    }
};

const verifyMFALogin = async () => {
    if (!totpCode.value || totpCode.value.length !== 6) {
        loginResult.value = {
            error: 'Please enter a valid 6-digit code.',
            validation: '1'
        };
        loginResultModal.value = true;
        return;
    }

    try {
        mfaLoading.value = true;
        const response = await MFAService.verifyMFAForLogin(currentEmpno.value, totpCode.value, rememberMFA.value);

        // Store remember token if provided
        if (response.remember_token) {
            MFAService.storeRememberToken(response.remember_token, response.expires_at);
        }

        // MFA verification complete, close modal
        showMFAVerification.value = false;
        totpCode.value = '';
        rememberMFA.value = false;

        // The MFA verification now returns the complete login response with token
        // So we can proceed directly to set cookies and redirect
        if (response.status === true) {
            Cookies.set('token_valid', response.token);
            Cookies.set('empNo', response.UserInformation.empno);
            Cookies.set('name', response.UserInformation.fname);

            psaAuthResult.value = await PsaServices.authPSA({
                client_id: import.meta.env.VITE_PSA_CLIENT_ID,
                client_secret: import.meta.env.VITE_PSA_CLIENT_SECRET
            });

            var in30Minutes = 1 / 48;
            Cookies.set('psa-token', psaAuthResult.value.data.access_token, {
                expires: in30Minutes
            });

            window.location.replace('/dashboard');
        }
    } catch (error) {
        console.error('MFA Login Verification Error:', error);
        loginResult.value = {
            error: error.response?.data?.error || 'MFA verification failed. Please try again.',
            validation: '1'
        };
        loginResultModal.value = true;
    } finally {
        mfaLoading.value = false;
    }
};

const completeLogin = async () => {
    try {
        // Re-run the login request to get the token now that MFA is verified
        const recaptchaToken = await executeRecaptcha();
        const encryptedPassword = PasswordEncryptionService.encryptPasswordBase64(password.value);

        // Check for remember token and verification token
        const rememberTokenData = MFAService.getRememberToken();
        const verificationToken = MFAService.getVerificationToken();

        const loginData = {
            username: username.value,
            password: encryptedPassword,
            recaptcha_token: recaptchaToken
        };

        if (rememberTokenData) {
            loginData.remember_token = rememberTokenData.token;
        }

        if (verificationToken) {
            loginData.verification_token = verificationToken;
        }

        loginResult.value = await AuthServices.login(loginData);

        // Clear the verification token after use
        MFAService.clearVerificationToken();

        if (loginResult.value.status === true) {
            Cookies.set('token_valid', loginResult.value.token);
            Cookies.set('empNo', loginResult.value.UserInformation.empno);
            Cookies.set('name', loginResult.value.UserInformation.fname);

            psaAuthResult.value = await PsaServices.authPSA({
                client_id: import.meta.env.VITE_PSA_CLIENT_ID,
                client_secret: import.meta.env.VITE_PSA_CLIENT_SECRET
            });

            var in30Minutes = 1 / 48;
            Cookies.set('psa-token', psaAuthResult.value.data.access_token, {
                expires: in30Minutes
            });

            window.location.replace('/dashboard');
        }
    } catch (error) {
        console.error('Complete Login Error:', error);
        loginResult.value = {
            error: 'Login completion failed. Please try again.',
            validation: '1'
        };
        loginResultModal.value = true;
    }
};

const closeMFAModals = () => {
    showMFASetup.value = false;
    showMFAVerification.value = false;
    totpCode.value = '';
    rememberMFA.value = false;
    currentEmpno.value = '';
    mfaSetupData.value = null;
};

const copySecretKey = () => {
    if (mfaSetupData.value?.manual_entry_key) {
        navigator.clipboard.writeText(mfaSetupData.value.manual_entry_key.replace(/\s/g, ''));
    }
};
</script>

<template>
    <div class="flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden px-4 lg:px-0" style="background-color: #d9dee8">
        <div class="flex flex-col items-center justify-center w-full lg:w-4/6" style="max-width: 850px">
            <div class="flex border border-gray-300 rounded-lg shadow-lg w-full overflow-hidden" style="border-radius: 30px">
                <div class="w-full md:w-1/2 flex flex-col justify-center items-center">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 px-10 pt-10 pb-20">
                        <div class="text-center mb-8">
                            <div class="flex justify-center mb-3">
                                <img src="/public/demo/images/dsbplogo.png" width="200px" class="mx-4" />
                            </div>
                            <div class="text-surface-900 dark:text-surface-0 text-2xl font-medium mb-4">Verification and Authentication of Legitimate Identity</div>
                            <span class="text-muted-color font-medium">Sign in to continue</span>
                        </div>

                        <div>
                            <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Employee ID</label>
                            <input class="w-full mb-8 px-3 py-2 border rounded" id="basic" :value="username" @input="onEmployeeIdInput" placeholder="03-000000" maxlength="12" autocomplete="off" type="text" />

                            <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-1">Password</label>
                            <div class="relative mb-4 w-full">
                                <input
                                    @keyup.enter="login"
                                    id="password1"
                                    v-model="password"
                                    :type="showPassword ? 'text' : 'password'"
                                    placeholder="Password"
                                    class="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                    autocomplete="current-password"
                                />
                                <button
                                    type="button"
                                    @click="togglePasswordVisibility"
                                    class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors duration-200"
                                >
                                    <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" style="font-size: 0.8rem"></i>
                                </button>
                            </div>

                            <!-- Comment out reCAPTCHA v2 widget -->
                            <!-- <div class="flex justify-center my-4">
                                <div class="g-recaptcha" :data-sitekey="recaptchaSiteKey" data-callback="onRecaptchaCallback"></div>
                            </div> -->

                            <Button :loading="loading" @click="login" label="Sign In" class="w-full mb-4"></Button>
                            <div class="text-center">
                                <a @click="redirectToERM" class="text-blue-500 hover:text-blue-700 cursor-pointer text-sm">Forgot Password?</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="w-1/2 bg-cover bg-left hidden md:flex" style="background-image: url('/demo/images/login-bg.jpg')"></div>
            </div>
        </div>
    </div>

    <Dialog v-model:visible="loginResultModal" modal :closable="false" :draggable="false" :style="{ width: '35rem' }">
        <div class="text-center p-4">
            <span class="pi pi-exclamation-circle text-red-500 mb-4" style="font-size: 2.5rem"></span>
            <p v-if="loginResult.validation != '3'" class="font-semibold w-full">{{ loginResult.error }}</p>
            <p v-else class="font-semibold w-full">
                This account's status is <span class="text-red-500 font-bold">{{ loginResult.accountStatus }}</span
                >. Please coordinate with HR. Thank you.
            </p>
        </div>
        <div class="flex justify-center gap-2">
            <Button v-if="loginResult.validation == '2'" type="button" label="Confirm" severity="primary" @click="redirectToERM"></Button>
            <Button v-else type="button" label="Confirm" severity="primary" @click="closeLoginErrorModal"></Button>
        </div>
    </Dialog>

    <!-- MFA Setup Modal -->
    <Dialog v-model:visible="showMFASetup" modal :closable="false" :draggable="false" :style="{ width: '45rem' }">
        <template #header>
            <h3 class="text-xl font-bold text-gray-800">Setup Multi-Factor Authentication</h3>
        </template>

        <div class="p-4">
            <div class="mb-6">
                <p class="text-gray-600 mb-4">
                    To enhance your account security, you need to set up multi-factor authentication using an authenticator app like
                    <strong>Google Authenticator</strong>, <strong>Microsoft Authenticator</strong>, or <strong>Authy</strong>.
                </p>
            </div>

            <div v-if="mfaSetupData" class="space-y-6">
                <!-- Step 1: Install App -->
                <div class="border-l-4 border-blue-500 pl-4">
                    <h4 class="font-semibold text-gray-800 mb-2">Step 1: Install an Authenticator App</h4>
                    <p class="text-sm text-gray-600">Download one of these apps on your mobile device:</p>
                    <ul class="text-sm text-gray-600 mt-2 space-y-1">
                        <li>• <strong>Google Authenticator</strong> (Android/iOS)</li>
                        <li>• <strong>Microsoft Authenticator</strong> (Android/iOS)</li>
                        <li>• <strong>Authy</strong> (Android/iOS/Desktop)</li>
                    </ul>
                </div>

                <!-- Step 2: Scan QR Code -->
                <div class="border-l-4 border-green-500 pl-4">
                    <h4 class="font-semibold text-gray-800 mb-3">Step 2: Scan the QR Code</h4>
                    <div class="flex flex-col items-center bg-white p-4 border rounded-lg">
                        <div v-html="mfaSetupData.qr_code_svg" class="mb-3"></div>
                        <p class="text-xs text-gray-500 text-center">Scan this QR code with your authenticator app</p>
                    </div>
                </div>

                <!-- Step 3: Manual Entry (Alternative) -->
                <div class="border-l-4 border-yellow-500 pl-4">
                    <h4 class="font-semibold text-gray-800 mb-2">Alternative: Manual Entry</h4>
                    <p class="text-sm text-gray-600 mb-2">If you can't scan the QR code, manually enter this key:</p>
                    <div class="flex items-center space-x-2">
                        <input type="text" :value="mfaSetupData.manual_entry_key" readonly class="flex-1 px-3 py-2 border rounded text-sm font-mono bg-gray-50" />
                        <Button @click="copySecretKey" size="small" severity="secondary" icon="pi pi-copy" />
                    </div>
                </div>

                <!-- Step 4: Verify -->
                <div class="border-l-4 border-purple-500 pl-4">
                    <h4 class="font-semibold text-gray-800 mb-3">Step 3: Enter Verification Code</h4>
                    <p class="text-sm text-gray-600 mb-3">Enter the 6-digit code from your authenticator app:</p>
                    <div class="flex space-x-3">
                        <input type="text" v-model="totpCode" placeholder="000000" maxlength="6" class="flex-1 px-3 py-2 border rounded text-center font-mono text-lg" @keyup.enter="verifyMFASetup" />
                        <Button @click="verifyMFASetup" :loading="mfaLoading" :disabled="!totpCode || totpCode.length !== 6" label="Verify & Enable" class="px-6" />
                    </div>
                </div>
            </div>

            <div v-else class="flex justify-center items-center py-8">
                <div class="text-center">
                    <i class="pi pi-spin pi-spinner text-3xl text-blue-500 mb-3"></i>
                    <p class="text-gray-600">Setting up MFA...</p>
                </div>
            </div>
        </div>
    </Dialog>

    <!-- MFA Verification Modal -->
    <Dialog v-model:visible="showMFAVerification" modal :closable="false" :draggable="false" :style="{ width: '35rem' }">
        <template #header>
            <h3 class="text-xl font-bold text-gray-800">Multi-Factor Authentication</h3>
        </template>

        <div class="p-4">
            <div class="text-center mb-6">
                <i class="pi pi-shield text-4xl text-blue-500 mb-3"></i>
                <p class="text-gray-600">Enter the 6-digit code from your authenticator app to complete the login process.</p>
            </div>

            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
                    <input type="text" v-model="totpCode" placeholder="000000" maxlength="6" class="w-full px-3 py-3 border rounded text-center font-mono text-xl tracking-widest" @keyup.enter="verifyMFALogin" autofocus />
                </div>

                <div class="flex items-center">
                    <input type="checkbox" id="rememberDevice" v-model="rememberMFA" class="mr-2" />
                    <label for="rememberDevice" class="text-sm text-gray-600"> Remember this device for 30 days </label>
                </div>

                <div class="flex gap-3 pt-4">
                    <Button @click="closeMFAModals" label="Cancel" severity="secondary" class="flex-1" />
                    <Button @click="verifyMFALogin" :loading="mfaLoading" :disabled="!totpCode || totpCode.length !== 6" label="Verify & Login" class="flex-1" />
                </div>
            </div>
        </div>
    </Dialog>
</template>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}

/* Custom password input styling to match PrimeVue */
.relative input {
    font-size: 1rem;
    padding: 0.75rem 3rem 0.75rem 0.75rem;
    border-radius: 6px;
    border: 1px solid #d1d5db;
    background: #ffffff;
    color: #374151;
    transition:
        border-color 0.2s,
        box-shadow 0.2s;
}

.relative input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.2);
}

.relative input:hover {
    border-color: #9ca3af;
}

.relative button {
    padding: 0.5rem;
    border-radius: 4px;
}

.relative button:hover {
    background-color: rgba(0, 0, 0, 0.04);
}
</style>
