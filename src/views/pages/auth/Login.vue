<script setup>
// import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
import AuthServices from '@/service/authentication/AuthServices';
import PsaServices from '@/service/psa/PsaServices.js';
import RecaptchaService from '@/service/recaptcha/RecaptchaService.js';
import Cookies from 'js-cookie';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const username = ref('');
const password = ref('');
const loginResult = ref('');
const psaAuthResult = ref('');
const loginResultModal = ref(false);
const loading = ref(false);

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

        // Comment out v2 validation
        // if (!recaptchaResponse.value) {
        //     loginResult.value = {
        //         error: 'Please complete the reCAPTCHA verification.',
        //         validation: '1'
        //     };
        //     loginResultModal.value = true;
        //     loading.value = false;
        //     return;
        // }

        loginResult.value = await AuthServices.login({
            username: username.value,
            password: password.value,
            recaptcha_token: recaptchaToken
        });
        console.log(loginResult.value);
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
        loading.value = false;

        // Handle reCAPTCHA errors
        if (error.message && error.message.includes('reCAPTCHA')) {
            loginResult.value = {
                error: 'reCAPTCHA verification failed. Please try again.',
                validation: '1'
            };
            loginResultModal.value = true;
        }
    }
};

const closeLoginErrorModal = () => {
    loginResultModal.value = false;
    password.value = '';
    // Comment out v2 reset functionality
    // if (typeof grecaptcha !== 'undefined') {
    //     grecaptcha.reset();
    //     recaptchaResponse.value = '';
    // }
};

const redirectToERM = () => {
    console.log('Redirecting to ERM');
    window.location.replace('http://172.31.32.25/registration/index.php');
};
</script>

<template>
    <div class="flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden px-4 lg:px-0" style="background-color: #d9dee8">
        <div class="flex flex-col items-center justify-center w-full lg:w-4/6" style="max-width: 1000px">
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
                            <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-1">Employee ID</label>
                            <input class="w-full mb-4 px-3 py-2 border rounded" id="basic" :value="username" @input="onEmployeeIdInput" placeholder="03-000000" maxlength="12" autocomplete="off" type="text" />

                            <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-1">Password</label>
                            <Password @keyup.enter="login" id="password1" v-model="password" placeholder="Password" :toggleMask="true" class="mb-4 w-full" fluid :feedback="false"></Password>

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
</style>
