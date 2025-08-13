<script setup>
// import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
import AuthServices from '@/service/authentication/AuthServices';
import PsaServices from '@/service/psa/PsaServices.js';
import Cookies from 'js-cookie';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const username = ref('');
const password = ref('');
const loginResult = ref('');
const psaAuthResult = ref('');
const loginResultModal = ref(false);
const loading = ref(false);

const login = async () => {
    loading.value = true;
    try {
        loginResult.value = await AuthServices.login({ username: username.value, password: password.value });
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
    }
};

const closeLoginErrorModal = () => {
    loginResultModal.value = false;
    password.value = '';
};

const redirectToERM = () => {
    console.log('Redirecting to ERM');
    window.location.replace('http://172.31.32.57/registration/index.php');
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
                            <InputMask class="w-full mb-8" id="basic" v-model="username" mask="99-99999" placeholder="03-000000" />

                            <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Password</label>
                            <Password @keyup.enter="login" id="password1" v-model="password" placeholder="Password" :toggleMask="true" class="mb-4 w-full" fluid :feedback="false"></Password>
                            <Button :loading="loading" @click="login" label="Sign In" class="w-full"></Button>
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
