<template>
    <div class="flex flex-col items-center justify-center h-screen w-screen mt-[10rem]">
        <Transition name="fade-up" appear>
            <div class="flex flex-col items-center">
                <h1 class="text-center text-[#2D318F] font-extrabold mb-10">SELF VERIFICATION KIOSK</h1>
            </div>
        </Transition>
        <div v-if="loading" class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black bg-opacity-60 w-screen h-screen">
            <div class="bg-white rounded-2xl shadow-xl p-10 flex flex-col items-center">
                <svg class="animate-spin h-16 w-16 text-[#2D318F] mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <p class="text-2xl sm:text-lg text-[#2D318F] font-bold">Processing, please wait...</p>
            </div>
        </div>
        <div v-else-if="showSuccessScreen" class="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-8">
            <div class="flex flex-col items-center justify-center h-full w-full max-w-6xl">
                <!-- Success Icon -->
                <div class="mb-8">
                    <svg class="w-24 h-24 text-green-500" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>

                <!-- Success Message -->
                <h1 class="text-6xl font-bold text-green-600 mb-4">TRANSACTION SUCCESSFUL!</h1>
                <p class="text-3xl text-gray-700 mb-8 text-center">Your application has been processed successfully</p>

                <!-- Receipt Style Queue Number -->
                <div class="bg-white border-4 border-dashed border-gray-400 rounded-2xl p-12 mb-8 shadow-lg transform w-full max-w-2xl" style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)">
                    <div class="text-center">
                        <h2 class="text-4xl font-bold text-gray-800 mb-4">QUEUE RECEIPT</h2>
                        <div class="border-b-2 border-dashed border-gray-400 mb-6 pb-4">
                            <p class="text-2xl text-gray-600">{{ new Date().toLocaleDateString() }} - {{ new Date().toLocaleTimeString() }}</p>
                        </div>

                        <div class="mb-6">
                            <p class="text-2xl text-gray-700 mb-2"><strong>Service:</strong> {{ selectedProgram.name }}</p>
                            <p class="text-2xl text-gray-700"><strong>Category:</strong> {{ selectedSector.name }}</p>
                        </div>

                        <div class="border-t-2 border-dashed border-gray-400 pt-6 mb-6">
                            <p class="text-3xl text-gray-800 mb-4">YOUR QUEUE NUMBER</p>
                            <div class="bg-[#2D318F] text-white text-9xl font-bold py-8 px-12 rounded-xl shadow-lg">
                                {{ queueNumber }}
                            </div>
                        </div>

                        <div class="border-t-2 border-dashed border-gray-400 pt-4">
                            <p class="text-lg text-gray-600">Keep this number for reference</p>
                        </div>
                    </div>
                </div>

                <!-- Instructions -->
                <div class="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg mb-8 max-w-2xl">
                    <h3 class="text-2xl font-bold text-blue-800 mb-3">WHAT TO DO NEXT:</h3>
                    <div class="space-y-2">
                        <p class="text-lg text-blue-700 flex items-center">
                            <span class="mr-3">📺</span>
                            Monitor the display screen for your queue number
                        </p>
                        <p class="text-lg text-blue-700 flex items-center">
                            <span class="mr-3">🪑</span>
                            Please take a seat and wait for your turn
                        </p>
                        <p class="text-lg text-blue-700 flex items-center">
                            <span class="mr-3">📄</span>
                            Bring all required documents when called
                        </p>
                        <p class="text-lg text-blue-700 flex items-center">
                            <span class="mr-3">⏰</span>
                            Estimated waiting time: 15-30 minutes
                        </p>
                    </div>
                </div>

                <!-- Thank you message -->

                <!-- Thank you message -->
                <p class="text-2xl text-gray-600 text-center mb-8">Thank you for using our Self-Verification Kiosk!</p>

                <!-- OK Button -->
                <button @click="resetKiosk" class="bg-[#2D318F] hover:bg-[#1e256b] text-white text-3xl font-bold py-6 px-16 rounded-xl shadow-lg transition-colors duration-300 transform hover:scale-105">OK</button>
            </div>
        </div>
        <div v-else class="bg-white rounded-3xl shadow-2xl p-8 flex items-center justify-center" style="height: 90vh; width: 90vw">
            <div class="w-full h-full flex">
                <Stepper v-model:value="activeStep" class="w-full h-full flex flex-col" linear>
                    <StepList>
                        <Step v-slot="{ activateCallback, value, a11yAttrs }" asChild :value="1">
                            <div class="flex flex-row flex-auto gap-2" v-bind="a11yAttrs.root">
                                <button class="bg-transparent border-0 inline-flex flex-col gap-2" @click="activateCallback" v-bind="a11yAttrs.header">
                                    <span :class="['rounded-full border-2 w-12 h-12 inline-flex items-center justify-center', { 'bg-[#2D318F] text-white': value <= activeStep, 'border-surface-200 dark:border-surface-700': value > activeStep }]">
                                        <p>1</p>
                                    </span>
                                </button>
                                <Divider />
                            </div>
                        </Step>
                        <Step v-slot="{ activateCallback, value, a11yAttrs }" asChild :value="2">
                            <div class="flex flex-row flex-auto gap-2" v-bind="a11yAttrs.root">
                                <button class="bg-transparent border-0 inline-flex flex-col gap-2" @click="activateCallback" v-bind="a11yAttrs.header">
                                    <span :class="['rounded-full border-2 w-12 h-12 inline-flex items-center justify-center', { 'bg-[#2D318F] text-white': value <= activeStep, 'border-surface-200 dark:border-surface-700': value > activeStep }]">
                                        <p>2</p>
                                    </span>
                                </button>
                                <Divider />
                            </div>
                        </Step>
                        <Step v-slot="{ activateCallback, value, a11yAttrs }" asChild :value="3">
                            <div class="flex flex-row flex-auto gap-2" v-bind="a11yAttrs.root">
                                <button class="bg-transparent border-0 inline-flex flex-col gap-2" @click="activateCallback" v-bind="a11yAttrs.header">
                                    <span :class="['rounded-full border-2 w-12 h-12 inline-flex items-center justify-center', { 'bg-[#2D318F] text-white': value <= activeStep, 'border-surface-200 dark:border-surface-700': value > activeStep }]">
                                        <p>3</p>
                                    </span>
                                </button>
                                <Divider />
                            </div>
                        </Step>
                        <Step v-slot="{ activateCallback, value, a11yAttrs }" asChild :value="4">
                            <div class="flex flex-row flex-auto gap-2 pl-2" v-bind="a11yAttrs.root">
                                <button class="bg-transparent border-0 inline-flex flex-col gap-2" @click="activateCallback" v-bind="a11yAttrs.header">
                                    <span :class="['rounded-full border-2 w-12 h-12 inline-flex items-center justify-center', { 'bg-[#2D318F] text-white': value <= activeStep, 'border-surface-200 dark:border-surface-700': value > activeStep }]">
                                        <p>4</p>
                                    </span>
                                </button>
                                <Divider />
                            </div>
                        </Step>
                        <Step v-slot="{ activateCallback, value, a11yAttrs }" asChild :value="5">
                            <div class="flex flex-row pl-2" v-bind="a11yAttrs.root">
                                <button class="bg-transparent border-0 inline-flex flex-col gap-2" @click="activateCallback" v-bind="a11yAttrs.header">
                                    <span :class="['rounded-full border-2 w-12 h-12 inline-flex items-center justify-center', { 'bg-[#2D318F] text-white': value <= activeStep, 'border-surface-200 dark:border-surface-700': value > activeStep }]">
                                        <p>5</p>
                                    </span>
                                </button>
                            </div>
                        </Step>
                    </StepList>

                    <StepPanels class="flex-1 flex flex-col w-full h-full justify-center">
                        <StepPanel v-slot="{ activateCallback }" :value="1">
                            <Transition name="fade-slide" mode="out-in">
                                <template v-if="activeStep === 1">
                                    <div class="flex flex-col gap-5 mx-auto mt-4 h-full w-full justify-center items-center" style="max-width: 80%" key="step1">
                                        <h1 class="text-center mt-4 mb-4">Privacy Policy and Consent Notice</h1>
                                        <div class="bg-white rounded-xl shadow p-8 w-full max-w-2xl text-gray-800 text-lg overflow-y-auto" style="max-height: 40vh">
                                            <p>
                                                This Self Verification Kiosk collects and processes your personal information for the purpose of identity verification and authentication. By proceeding, you consent to the collection, use, and storage
                                                of your data in accordance with our privacy policy and applicable laws. Your information will be handled securely and will not be shared with unauthorized parties.
                                            </p>
                                            <ul class="list-disc pl-6 mt-4">
                                                <li>Your name, birth date, and other personal details will be used for verification.</li>
                                                <li>Biometric data (such as facial image) may be collected for liveness detection and identity matching.</li>
                                                <li>All data is encrypted and stored securely.</li>
                                                <li>You have the right to access and correct your personal data.</li>
                                            </ul>
                                        </div>
                                        <div class="flex items-center mt-6">
                                            <input id="privacy-agree" type="checkbox" v-model="privacyAgreed" class="w-6 h-6 mr-3 accent-primary" />
                                            <label for="privacy-agree" class="text-xl font-semibold select-none">I have read and agree to the Privacy Policy and Consent Notice.</label>
                                        </div>
                                        <button class="mt-8 bg-[#2D318F] text-white text-3xl w-full py-6 rounded-xl shadow-lg hover:bg-[#2D318F] transition disabled:opacity-50" :disabled="!privacyAgreed" @click="activateCallback(2)">Next</button>
                                    </div>
                                </template>
                            </Transition>
                        </StepPanel>
                        <StepPanel v-slot="{ activateCallback }" :value="2">
                            <Transition name="fade-slide" mode="out-in">
                                <template v-if="activeStep === 2">
                                    <div class="flex flex-col gap-5 mx-auto mt-4 h-full w-full justify-center items-center" style="max-width: 80%" key="step1">
                                        <h1 class="text-center text-6xl mt-4 mb-0">SELECT CLIENT TYPE</h1>
                                        <p class="text-center text-gray-400 text-3xl"><i>Specify whether you have used VALID before or not</i></p>
                                        <TransitionGroup name="scale-fade" tag="div" class="w-full">
                                            <div class="field w-full" v-for="(type, index) in clientTypeList" :key="type.value">
                                                <button
                                                    class="mb-6 w-full flex items-center justify-center text-left text-white text-center p-20 h-[10rem] text-5xl rounded-2xl shadow-lg shadow-[#1e293b]/60 sector-btn bg-[#2D318F] overflow-hidden relative group"
                                                    @click="handleClientTypeClick(type, 3, activateCallback)"
                                                >
                                                    <span class="absolute inset-0 rounded-2xl sector-bg pointer-events-none"></span>
                                                    <span class="px-8 py-2 rounded-md relative z-10 font-bold uppercase">{{ type.name }}</span>
                                                </button>
                                            </div>

                                            <button
                                                class="mt-8 text-[#2D318F] border border-[#2D318F] text-3xl w-full py-6 rounded-xl hover:bg-[#2D318F] hover:text-white transition disabled:opacity-50"
                                                :disabled="!privacyAgreed"
                                                @click="activateCallback(1)"
                                            >
                                                Go Back
                                            </button>
                                        </TransitionGroup>
                                    </div>
                                </template>
                            </Transition>
                        </StepPanel>
                        <StepPanel v-slot="{ activateCallback }" :value="3">
                            <Transition name="fade-slide" mode="out-in">
                                <template v-if="activeStep === 3">
                                    <div class="flex flex-col gap-5 mx-auto mt-4 h-full w-full justify-center items-center" style="max-width: 80%" key="step1">
                                        <h1 class="text-center text-6xl mt-4 mb-0">SELECT SECTOR</h1>
                                        <p class="text-center text-gray-400 text-3xl"><i>Specify which sector you belong to</i></p>
                                        <TransitionGroup name="scale-fade" tag="div" class="w-full">
                                            <div class="field w-full" v-for="(sector, index) in sectors" :key="sector.value">
                                                <button
                                                    class="mb-6 w-full flex items-center justify-center text-left text-white text-center p-20 h-[10rem] text-5xl rounded-2xl shadow-lg shadow-[#1e293b]/60 sector-btn bg-[#2D318F] overflow-hidden relative group gap-8"
                                                    @click="handleSectorClick(sector, 4, activateCallback)"
                                                >
                                                    <span class="absolute inset-0 rounded-2xl sector-bg pointer-events-none"></span>
                                                    <span class="relative z-10 flex items-center gap-8">
                                                        <span :class="sector.icon" aria-hidden="true" style="font-size: 2.5rem"></span>
                                                        <span class="px-8 py-2 rounded-md font-bold uppercase">{{ sector.name }}</span>
                                                    </span>
                                                </button>
                                            </div>

                                            <button
                                                class="mt-8 text-[#2D318F] border border-[#2D318F] text-3xl w-full py-6 rounded-xl hover:bg-[#2D318F] hover:text-white transition disabled:opacity-50"
                                                :disabled="!privacyAgreed"
                                                @click="activateCallback(2)"
                                            >
                                                Go Back
                                            </button>
                                        </TransitionGroup>
                                    </div>
                                </template>
                            </Transition>
                        </StepPanel>
                        <StepPanel v-slot="{ activateCallback }" :value="4">
                            <Transition name="fade-slide" mode="out-in">
                                <template v-if="activeStep === 4">
                                    <div class="flex flex-col gap-5 mx-auto mt-4 h-full w-full justify-center items-center" style="max-width: 80%" key="step2">
                                        <h1 class="text-center text-6xl mt-4 mb-0">SELECT PROGRAM</h1>
                                        <p class="text-center text-gray-400 text-3xl"><i>Specify which program you want to apply to</i></p>
                                        <!-- Make the button list scrollable -->
                                        <div class="w-full" style="max-height: 50vh; overflow-y: auto">
                                            <TransitionGroup name="scale-fade" tag="div" class="w-full">
                                                <div class="field w-full" v-for="(program, index) in programs" :key="program.value">
                                                    <button
                                                        class="mb-6 w-full flex items-center justify-center text-left text-white text-center p-20 h-[10rem] text-5xl rounded-2xl shadow-lg sector-btn bg-[#2D318F] shadow-[#1e293b]/60 overflow-hidden relative group"
                                                        @click="handleProgramClick(program, 5, activateCallback)"
                                                    >
                                                        <span class="absolute inset-0 rounded-2xl pointer-events-none" style="background: rgba(30, 41, 59, 0.2); z-index: 2"></span>
                                                        <span class="px-8 py-2 rounded-md relative z-10 font-bold uppercase">{{ program.name }}</span>
                                                    </button>
                                                </div>

                                                <button
                                                    class="mt-8 text-[#2D318F] border border-[#2D318F] text-3xl w-full py-6 rounded-xl hover:bg-[#2D318F] hover:text-white transition disabled:opacity-50"
                                                    :disabled="!privacyAgreed"
                                                    @click="activateCallback(3)"
                                                >
                                                    Go Back
                                                </button>
                                            </TransitionGroup>
                                        </div>
                                        <div class="field w-full"></div>
                                    </div>
                                </template>
                            </Transition>
                        </StepPanel>
                        <StepPanel v-slot="{ activateCallback }" :value="5">
                            <Transition name="fade-slide" mode="out-in">
                                <template v-if="activeStep === 5">
                                    <div v-if="selectedClientType == 2" class="flex flex-col gap-5 mx-auto mt-4 h-full w-full justify-center items-center" style="max-width: 80%" key="step3">
                                        <h1 class="text-center mt-2 mb-2">Enter Your Details</h1>
                                        <div class="w-full max-w-xl flex flex-col gap-6">
                                            <!-- First Name -->
                                            <div class="field">
                                                <label class="block mb-2 text-xl font-semibold">First Name</label>
                                                <input v-model="clientDetails.firstName" type="text" class="w-full p-6 text-3xl rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Enter first name" />
                                            </div>
                                            <!-- Middle Name -->
                                            <div class="field">
                                                <label class="block mb-2 text-xl font-semibold">Middle Name</label>
                                                <input v-model="clientDetails.middleName" type="text" class="w-full p-6 text-3xl rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Enter middle name" />
                                            </div>
                                            <!-- Last Name and Suffix in one row -->
                                            <div class="field flex gap-4">
                                                <div class="flex-1">
                                                    <label class="block mb-2 text-xl font-semibold">Last Name</label>
                                                    <input v-model="clientDetails.lastName" type="text" class="w-full p-6 text-3xl rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Enter last name" />
                                                </div>
                                                <div class="w-48">
                                                    <label class="block mb-2 text-xl font-semibold">Suffix</label>
                                                    <select v-model="clientDetails.suffix" class="w-full p-6 text-3xl rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary">
                                                        <option value="">None</option>
                                                        <option value="Jr.">Jr.</option>
                                                        <option value="Sr.">Sr.</option>
                                                        <option value="II">II</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <!-- Birth Date -->
                                            <!-- <div class="field">
                                                <label class="block mb-2 text-xl font-semibold">Birth Date</label>
                                                <input v-model="clientDetails.birthDate" type="date" class="w-full p-6 text-3xl rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" />
                                            </div> -->

                                            <div class="field">
                                                <label class="block mb-2 text-xl font-semibold">Birth Date</label>
                                                <SpinnerDatePicker v-model="clientDetails.birthDate" />
                                            </div>
                                            <!-- Submit Button -->
                                            <div class="field flex gap-6">
                                                <button
                                                    class="text-[#2D318F] border border-[#2D318F] text-3xl flex-1 py-6 rounded-xl hover:bg-[#2D318F] hover:text-white transition disabled:opacity-50"
                                                    :disabled="!privacyAgreed"
                                                    @click="activateCallback(4)"
                                                >
                                                    Go Back
                                                </button>
                                                <button type="button" class="bg-[#2D318F] text-white text-3xl flex-1 py-6 rounded-xl shadow-lg hover:bg-[#2D318F] transition" @click="searchClient">Submit</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-else class="flex flex-col gap-5 mx-auto mt-4 h-full w-full justify-center items-center" style="max-width: 80%" key="step31">
                                        <h1 class="text-center mt-2 mb-2">Enter Your Details</h1>
                                        <div class="w-full max-w-xl flex flex-col gap-6">
                                            <!-- Bene ID -->
                                            <div class="field">
                                                <label class="block mb-2 text-xl font-semibold">Beneficiary ID</label>
                                                <input
                                                    v-model="clientDetails.beneficiary_id"
                                                    type="text"
                                                    class="w-full p-6 text-3xl rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                                                    placeholder="Enter Beneficiary ID"
                                                />
                                            </div>
                                            <!-- Submit Button -->
                                            <div class="field flex gap-6">
                                                <button
                                                    class="text-[#2D318F] border border-[#2D318F] text-3xl flex-1 py-6 rounded-xl hover:bg-[#2D318F] hover:text-white transition disabled:opacity-50"
                                                    :disabled="!privacyAgreed"
                                                    @click="activateCallback(4)"
                                                >
                                                    Go Back
                                                </button>
                                                <button type="button" class="bg-[#2D318F] text-white text-3xl flex-1 py-6 rounded-xl shadow-lg hover:bg-[#2D318F] transition" @click="getClients">Submit</button>
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </Transition>
                        </StepPanel>
                    </StepPanels>
                </Stepper>
            </div>
        </div>
    </div>
    <Toast />
    <ConfirmDialog />
</template>

<script setup>
import SpinnerDatePicker from '@/components/SpinnerDatePicker.vue';
import { psaAxiosInstance } from '@/interceptors/axiosInstances.js';
import setupPSAInterceptor from '@/interceptors/psaInterceptors';
import PsaServices from '@/service/psa/PsaServices';
import queueManagement from '@/service/settings/queueManagement';
import VerifiedClientsServices from '@/service/verifiedClients/verifiedClients';
import Cookies from 'js-cookie';
import moment from 'moment';
import { useToast } from 'primevue';
import { useConfirm } from 'primevue/useconfirm';
import { ref, watch } from 'vue';
const emit = defineEmits(['resetKiosk']);
const confirm = useConfirm();
const toast = useToast();
const isLivenessDialogVisible = ref(false);
const verificationResultModal = ref(false);
const privacyAgreed = ref(false);
const showSuccessScreen = ref(false);
const verificationResult = ref({});
const verificationResultMessage = ref('');
const verificationResultHeader = ref('');
const queueNumber = ref(null);
const clientTypeList = ref([
    { name: 'Old', value: 1 },
    { name: 'New', value: 2 }
]);

const sectors = ref([
    { name: 'GENERAL', value: 3, bg: '/demo/images/regular.jpg', icon: 'fa-solid fa-users' },
    { name: 'PWD', value: 1, bg: '/demo/images/pwd.jpg', icon: 'fa-solid fa-wheelchair' },
    { name: 'SENIOR', value: 2, bg: '/demo/images/senior_citizens.jpg', icon: 'fa-solid fa-person-cane' }
]);

const programs = ref([
    { name: 'AICS', value: 1, bg: '/demo/images/redvest.jpg' },
    { name: 'AKAP', value: 2, bg: '/demo/images/redvest.jpg' }
]);

const verification_session_id = ref();
const isInvalid = ref(false);
const loading = ref(false);
const verifiedClients = ref([]);
const activeStep = ref(1);
const selectedSector = ref(null);
const selectedProgram = ref(null);
const verificationType = ref(null);
const selectedClientType = ref(null);
const clientDetails = ref({
    lastName: '',
    firstName: '',
    middleName: '',
    suffix: '',
    birthDate: '',
    beneficiaryID: ''
});

const handleClientTypeClick = (clientType, section, activateCallback) => {
    activateCallback(section);
    selectedClientType.value = clientType.value;
    console.log('Selected clientType value:', clientType.value);
};

const handleSectorClick = (sector, section, activateCallback) => {
    activateCallback(section);
    selectedSector.value = sector;
    console.log('Selected sector value:', selectedSector.value);
};

const handleProgramClick = (program, section, activateCallback) => {
    activateCallback(section);
    selectedProgram.value = program;
    console.log('Selected program value:', selectedProgram.value);
};

const inputVerification = () => {
    if (!clientDetails.value.lastName || !clientDetails.value.firstName || !clientDetails.value.birthDate) {
        isInvalid.value = true;
        toast.add({ severity: 'warn', summary: 'Warning', detail: 'Please input all required fields', life: 3000 });
        return false;
    }
    isInvalid.value = false;
    return true;
};

const searchClient = async () => {
    const isValid = inputVerification();
    if (!isValid) return;

    loading.value = true;

    verificationType.value = saveClient;
    // await startLiveness();
    await saveClient(clientDetails);
    loading.value = false;

    showSuccessScreen.value = true;
};

const checkPSAtoken = async () => {
    const token = Cookies.get('psa-token');
    if (!token) {
        const psaAuthResult = await PsaServices.authPSA({ client_id: import.meta.env.VITE_PSA_CLIENT_ID, client_secret: import.meta.env.VITE_PSA_CLIENT_SECRET });
        console.log(psaAuthResult.data);
        var in30Minutes = 1 / 48;
        Cookies.set('psa-token', psaAuthResult.data.access_token, {
            expires: in30Minutes
        });
        setupPSAInterceptor(psaAxiosInstance, Cookies.get('psa-token'));
    }
};

const getClients = async () => {
    try {
        loading.value = true;
        await checkPSAtoken();
        const result = await VerifiedClientsServices.getClients({
            beneficiary_id: clientDetails.value.beneficiary_id
        });
        console.log(result.data);

        if (Array.isArray(result.data) && result.data.length > 0) {
            clientDetails.value = {
                lastName: result.data[0].last_name,
                firstName: result.data[0].first_name,
                middleName: result.data[0].middle_name,
                suffix: result.data[0].suffix,
                birthDate: moment(result.data[0].birth_date).format('YYYY-MM-DD'),
                beneficiaryID: result.data[0].beneficiary_id
            };
            console.log(clientDetails.value);
            await getQueueNumber();
            showSuccessScreen.value = true;
        } else {
            toast.add({ severity: 'warn', summary: 'Warning', detail: 'Invalid Beneficiary ID', life: 3000 });
        }
        loading.value = false;
    } catch (error) {
        loading.value = false;
        toast.add({ severity: 'error', summary: 'Error', detail: 'An error occurred while fetching client data.', life: 3000 });
        console.log(error);
    }
};

const saveClient = async () => {
    console.log(clientDetails.value);
    await checkPSAtoken();
    loading.value = true;
    try {
        const result = await PsaServices.verifyClient({
            last_name: clientDetails.value.lastName,
            first_name: clientDetails.value.firstName,
            middle_name: clientDetails.value.middleName,
            suffix: clientDetails.value.suffix,
            birth_date: moment(clientDetails.value.birthDate).format('YYYY-MM-DD'),
            face_liveness_session_id: verification_session_id.value
        });
        verificationResult.value = result.data;
        console.log('asdf ', verificationResult.value);
        loading.value = false;
        if (!verificationResult.value.code) {
            verificationResultMessage.value = 'Client not found in PhilSys ID database.';
            verificationResultHeader.value = 'Verification Result';
            verificationResultModal.value = true;
            verificationResult.value.isVerified = 0;
            loading.value = true;
            await VerifiedClientsServices.saveClient({
                lastName: clientDetails.value.lastName,
                firstName: clientDetails.value.firstName,
                middleName: clientDetails.value.middleName,
                suffix: clientDetails.value.suffix,
                birth_date: moment(clientDetails.value.birthDate).format('YYYY-MM-DD'),
                verificationResult: verificationResult.value.isVerified
            });
            await getQueueNumber();
            loading.value = false;
        } else {
            verificationResultMessage.value = 'Client verified successfully.';
            verificationResultHeader.value = 'Verification Result';
            verificationResultModal.value = true;
            verificationResult.value.isVerified = 1;

            console.log('asdf2', verificationResult.value);
            loading.value = true;
            await VerifiedClientsServices.saveClient({
                face_url: verificationResult.value.face_url,
                lastName: clientDetails.value.lastName,
                firstName: clientDetails.value.firstName,
                middleName: clientDetails.value.middleName,
                suffix: clientDetails.value.suffix,
                birth_date: moment(clientDetails.value.birthDate).format('YYYY-MM-DD'),
                psn: verificationResult.value.reference,
                sex: verificationResult.value.gender,
                marital_status: verificationResult.value.marital_status,
                email: verificationResult.value.email,
                mobile_number: verificationResult.value.mobile_number,
                address_line_1: verificationResult.value.address_line_1,
                address_line_2: verificationResult.value.address_line_2,
                barangay: verificationResult.value.barangay,
                municipality: verificationResult.value.municipality,
                province: verificationResult.value.province,
                country: verificationResult.value.country,
                postal_code: verificationResult.value.postal_code,
                present_address_line_1: verificationResult.value.present_address_line_1,
                present_address_line_2: verificationResult.value.present_address_line_2,
                present_barangay: verificationResult.value.present_barangay,
                present_municipality: verificationResult.value.present_municipality,
                present_province: verificationResult.value.present_province,
                present_country: verificationResult.value.present_country,
                present_postal_code: verificationResult.value.present_postal_code,
                residency_status: verificationResult.value.residency_status,
                place_of_birth: verificationResult.value.place_of_birth,
                pob_municipality: verificationResult.value.pob_municipality,
                pob_province: verificationResult.value.pob_province,
                pob_country: verificationResult.value.pob_country,
                verified_by: verificationResult.value.verified_by,
                verificationResult: verificationResult.value.isVerified
            });
            await getQueueNumber();
            loading.value = false;
        }
    } catch (error) {
        loading.value = false;
        verificationResultMessage.value = 'An error occurred while verifying the client. Please try again.';
        verificationResultHeader.value = 'Verification Error';
        verificationResultModal.value = true;
        // Always save client even on error
        loading.value = true;
        await VerifiedClientsServices.saveClient({
            lastName: clientDetails.value.lastName,
            firstName: clientDetails.value.firstName,
            middleName: clientDetails.value.middleName,
            suffix: clientDetails.value.suffix,
            birth_date: moment(clientDetails.value.birthDate).format('YYYY-MM-DD'),
            verificationResult: 0
        });
        await getQueueNumber();
        loading.value = false;
    }
};

const reverifyClient = async (clientDetails) => {
    await checkPSAtoken();
    console.log('Re-verify client');
    loading.value = true;
    const result = await PsaServices.verifyClient({
        last_name: clientDetails.last_name,
        first_name: clientDetails.first_name,
        middle_name: clientDetails.middle_name,
        suffix: clientDetails.suffix_name,
        birth_date: moment(clientDetails.birth_date).format('YYYY-MM-DD'),
        face_liveness_session_id: verification_session_id.value
    });
    verificationResult.value = result.data;
    console.log('asdf ', verificationResult.value);
    loading.value = false;
    if (!verificationResult.value || Object.keys(verificationResult.value).length === 0) {
        verificationResult.value.isVerified = 0;
    } else {
        verificationResult.value.isVerified = 1;
        console.log('asdf2', verificationResult.value);
        const result = await VerifiedClientsServices.updateClient({
            id: clientData.id,
            lastName: lastName.value,
            firstName: firstName.value,
            middleName: middleName.value,
            suffix: suffix.value,
            birth_date: moment(dob.value).format('YYYY-MM-DD'),
            face_url: verificationResult.value.face_url,
            psn: verificationResult.value.reference,
            sex: verificationResult.value.gender,
            marital_status: verificationResult.value.marital_status,
            email: verificationResult.value.email,
            mobile_number: verificationResult.value.mobile_number,
            address_line_1: verificationResult.value.address_line_1,
            address_line_2: verificationResult.value.address_line_2,
            barangay: verificationResult.value.barangay,
            municipality: verificationResult.value.municipality,
            province: verificationResult.value.province,
            country: verificationResult.value.country,
            postal_code: verificationResult.value.postal_code,
            present_address_line_1: verificationResult.value.present_address_line_1,
            present_address_line_2: verificationResult.value.present_address_line_2,
            present_barangay: verificationResult.value.present_barangay,
            present_municipality: verificationResult.value.present_municipality,
            present_province: verificationResult.value.present_province,
            present_country: verificationResult.value.present_country,
            present_postal_code: verificationResult.value.present_postal_code,
            residency_status: verificationResult.value.residency_status,
            place_of_birth: verificationResult.value.place_of_birth,
            pob_municipality: verificationResult.value.pob_municipality,
            pob_province: verificationResult.value.pob_province,
            pob_country: verificationResult.value.pob_country,
            verified_by: verificationResult.value.verified_by,
            verificationResult: verificationResult.value.isVerified
        });
    }
};

const startLiveness = () => {
    console.log('Client Details:', clientDetails.value);
    window
        .eKYC()
        .start({
            pubKey: 'eyJpdiI6IjNVK2NPNEVvYUQxbVlmZEU4REV0bmc9PSIsInZhbHVlIjoibUJHT3VNWUxBdm11VnQzc0xvZmpjZz09IiwibWFjIjoiNDlkOWRjZTY5MDVmNDcwZmRlOWFmZTg2NmQ2MTcwNjE0NWY1YTRkNjczMTRjMWQ0NGQ2YWM4NjkwMzQ4NTRjZiIsInRhZyI6IiJ9'
        })
        .then(async (data) => {
            verification_session_id.value = data.result.session_id;
            console.log(verification_session_id.value);
            isLivenessDialogVisible.value = false;
        })
        .catch(async (err) => {
            await saveClient();
            console.log('error', err);
        });
};

const saveVerificationResult = async () => {
    verificationResultModal.value = false;
    console.log('Saving verification result');
};

const getQueueNumber = async () => {
    try {
        const response = await queueManagement.getQueueNumber({
            sector_id: selectedSector.value.value,
            program_id: selectedProgram.value.value
        });
        if (response && response.data) {
            queueNumber.value = response.data.last_queue_number;
            console.log('Queue Number Response:', queueNumber.value);
        } else {
            toast.add({ severity: 'warn', summary: 'Warning', detail: 'Unable to fetch queue number.', life: 3000 });
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'An error occurred while fetching queue number.', life: 3000 });
        console.log(error);
    }
};

const resetKiosk = () => {
    showSuccessScreen.value = false;
    activeStep.value = 1;
    privacyAgreed.value = false;
    selectedSector.value = null;
    selectedProgram.value = null;
    selectedClientType.value = null;
    clientDetails.value = {
        lastName: '',
        firstName: '',
        middleName: '',
        suffix: '',
        birthDate: '',
        beneficiaryID: ''
    };
    emit('resetKiosk');
};

watch(showSuccessScreen, (val) => {
    if (val) {
        setTimeout(() => {
            resetKiosk();
        }, 100000);
    }
});
</script>

<style scoped>
.sector-btn .sector-bg {
    filter: blur(1px) grayscale(1);
    transition: filter 0.3s;
    z-index: 1;
}
.sector-btn:hover .sector-bg,
.sector-btn:focus .sector-bg {
    filter: blur(0.3px) grayscale(0.5);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
    transition:
        opacity 0.4s,
        transform 0.4s;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(30px) scale(0.98);
}
.fade-slide-enter-to,
.fade-slide-leave-from {
    opacity: 1;
    transform: translateY(0) scale(1);
}

.scale-fade-enter-active,
.scale-fade-leave-active {
    transition:
        opacity 0.3s,
        transform 0.3s;
}
.scale-fade-enter-from,
.scale-fade-leave-to {
    opacity: 0;
    transform: scale(0.95);
}
.scale-fade-enter-to,
.scale-fade-leave-from {
    opacity: 1;
    transform: scale(1);
}
</style>
