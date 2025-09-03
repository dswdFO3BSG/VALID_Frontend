<script setup>
import FullPageLoader from '@/components/FullPageLoader.vue';
import { psaAxiosInstance } from '@/interceptors/axiosInstances.js';
import setupPSAInterceptor from '@/interceptors/psaInterceptors';
import { nameExtensions } from '@/service/nameExtensions';
import PsaServices from '@/service/psa/PsaServices';
import VerifiedClientsServices from '@/service/verifiedClients/verifiedClients';
import Cookies from 'js-cookie';
import moment from 'moment';
import { useToast } from 'primevue';
import { useConfirm } from 'primevue/useconfirm';
import { computed, onMounted, ref } from 'vue';
const confirm = useConfirm();
const toast = useToast();
const lastName = ref();
const firstName = ref();
const middleName = ref();
const suffix = ref();
const dob = ref();
const verification_session_id = ref();
const loading = ref(false);
const verifiedClients = ref([]);
const isInvalid = ref(false);
const isLivenessDialogVisible = ref(false);
const verificationResult = ref();
const verificationResultModal = ref(false);
const verificationResultMessage = ref('');
const verificationResultHeader = ref('');
const verificationResultStatus = ref();
const loggedInUser = ref();
const verificationType = ref();

const clearFilters = async () => {
    lastName.value = '';
    firstName.value = '';
    middleName.value = '';
    suffix.value = '';
    dob.value = '';
    verifiedClients.value = [];
};

const getClients = async () => {
    try {
        const result = await VerifiedClientsServices.getClients({ lastName: lastName.value, firstName: firstName.value, middleName: middleName.value, suffix: suffix.value, birthdate: dob.value });
        verifiedClients.value = result.data;
        console.log(verifiedClients.value);
        loading.value = false;
    } catch (error) {
        console.log(error);
    }
};

const searchClient = async () => {
    const isValid = inputVerification();
    if (!isValid) return;

    loading.value = true;
    await getClients();
    if (verifiedClients.value.length != 0) {
        console.log('Client found');
    } else {
        confirm.require({
            message: 'No data found. Do you want to proceed to client verification?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            rejectProps: {
                label: 'Cancel',
                severity: 'secondary',
                outlined: true
            },
            acceptProps: {
                label: 'Yes'
            },
            accept: async () => {
                verificationType.value = verifyClient;
                // await startLiveness();
            },
            reject: () => {
                clearFilters();
            }
        });
    }
    loading.value = false;
};

const inputVerification = () => {
    if (!lastName.value || !firstName.value || !dob.value) {
        isInvalid.value = true;
        toast.add({ severity: 'warn', summary: 'Warning', detail: 'Please input all required fields', life: 3000 });
        return false;
    }
    isInvalid.value = false;
    return true;
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

const handleReverification = async (clientData) => {
    verificationType.value = reverifyClient;
    // await startLiveness(clientData);
};

const reverifyClient = async (clientData) => {
    await checkPSAtoken();
    // verification_session_id.value = '1234567890';
    console.log('Re-verify client');
    loading.value = true;
    const result = await PsaServices.verifyClient({
        last_name: clientData.last_name,
        first_name: clientData.first_name,
        middle_name: clientData.middle_name,
        suffix: clientData.suffix_name,
        birth_date: moment(clientData.birth_date).format('YYYY-MM-DD'),
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
    } else {
        verificationResultMessage.value = 'Client verified successfully.';
        verificationResultHeader.value = 'Verification Result';
        verificationResultModal.value = true;
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
    await getClients();
};

const verifyClient = async (clientData) => {
    await checkPSAtoken();
    loading.value = true;
    const result = await PsaServices.verifyClient({
        last_name: lastName.value,
        first_name: firstName.value,
        middle_name: middleName.value,
        suffix: suffix.value,
        birth_date: moment(dob.value).format('YYYY-MM-DD'),
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
        const result = await VerifiedClientsServices.saveClient({
            lastName: lastName.value,
            firstName: firstName.value,
            middleName: middleName.value,
            suffix: suffix.value,
            birth_date: moment(dob.value).format('YYYY-MM-DD'),
            verificationResult: verificationResult.value.isVerified
        });
        loading.value = false;
    } else {
        verificationResultMessage.value = 'Client verified successfully.';
        verificationResultHeader.value = 'Verification Result';
        verificationResultModal.value = true;
        verificationResult.value.isVerified = 1;

        console.log('asdf2', verificationResult.value);
        loading.value = true;
        const result = await VerifiedClientsServices.saveClient({
            face_url: verificationResult.value.face_url,
            lastName: lastName.value,
            firstName: firstName.value,
            middleName: middleName.value,
            suffix: suffix.value,
            birth_date: moment(dob.value).format('YYYY-MM-DD'),
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
    await getClients();
};

// const startLiveness = (clientData) => {
//     window
//         .eKYC()
//         .start({
//             pubKey: 'eyJpdiI6IjNVK2NPNEVvYUQxbVlmZEU4REV0bmc9PSIsInZhbHVlIjoibUJHT3VNWUxBdm11VnQzc0xvZmpjZz09IiwibWFjIjoiNDlkOWRjZTY5MDVmNDcwZmRlOWFmZTg2NmQ2MTcwNjE0NWY1YTRkNjczMTRjMWQ0NGQ2YWM4NjkwMzQ4NTRjZiIsInRhZyI6IiJ9'
//         })
//         .then(async (data) => {
//             verification_session_id.value = data.result.session_id;
//             console.log(verification_session_id.value);
//             isLivenessDialogVisible.value = false;
//             await verificationType.value(clientData);
//         })
//         .catch((err) => {
//             console.log('error', err);
//         });
// };

const saveVerificationResult = async () => {
    verificationResultModal.value = false;
    console.log('Saving verification result');
};

const formattedReference = computed(() => {
    if (verificationResult.value?.reference) {
        return verificationResult.value.reference.replace(/(.{4})/g, '$1-').slice(0, -1);
    }
    return '';
});
onMounted(async () => {
    loggedInUser.value = Cookies.get('empNo');
    // await getClients();
});
</script>

<template>
    <div class="mb-4">
        <Card>
            <template #title>
                <h3 class="mb-0">Client Verification</h3>
            </template>
            <template #content>
                <p class="mb-8">Input client's details</p>
                <div class="flex flex-wrap items-start gap-8">
                    <FloatLabel class="flex-grow">
                        <InputText class="w-full" v-model="firstName" size="large" id="firstName" type="text" :invalid="isInvalid" />
                        <label for="firstName">First Name</label>
                    </FloatLabel>
                    <FloatLabel class="flex-grow">
                        <InputText class="w-full" v-model="middleName" size="large" id="middleName" type="text" />
                        <label for="middleName">Middle Name</label>
                    </FloatLabel>
                    <FloatLabel class="flex-grow">
                        <InputText class="w-full" v-model="lastName" size="large" id="lastname" type="text" :invalid="isInvalid" />
                        <label for="lastname">Last Name</label>
                    </FloatLabel>

                    <FloatLabel class="flex-grow">
                        <Select v-model="suffix" :options="nameExtensions" optionLabel="name" optionValue="value" size="large" class="w-full" editable />
                        <label for="suffix">Suffix</label>
                    </FloatLabel>
                    <FloatLabel class="flex-grow">
                        <DatePicker size="large" class="w-full" v-model="dob" inputId="dob" showIcon iconDisplay="input" :invalid="isInvalid" />
                        <label for="dob">Date of Birth</label>
                    </FloatLabel>
                </div>
                <div class="flex flex-wrap items-end w-full mt-4 gap-3">
                    <Button @click="searchClient" :loading="loading" label="Search" icon="pi pi-search" size="large" :fluid="false" class="flex-grow sm:flex-grow-0 ml-auto"></Button>
                    <Button @click="clearFilters" severity="danger" icon="pi pi-filter-slash" label="Clear" size="large" :fluid="false" class="flex-grow sm:flex-grow-0"></Button>
                </div>
            </template>
        </Card>
    </div>
    <Card>
        <template #content>
            <DataTable :loading="loading" :value="verifiedClients" tableStyle="min-width: 50rem" paginator :rows="10" :rowsPerPageOptions="[10, 20, 50]">
                <template #empty> Please Search Client to Start. </template>
                <template #loading> Loading customers data. Please wait. </template>
                <Column field="psn" header="PhilSys Number"></Column>
                <Column field="fullName" header="Name"></Column>
                <Column field="formattedBirthdate" header="Date of Birth"></Column>
                <Column field="verification_result" header="Verification Result">
                    <template #body="slotProps">
                        <Tag v-if="slotProps.data.verification_result === 1" icon="pi pi-check" severity="success" value="Verified"></Tag>
                        <Tag v-else icon="pi pi-times" severity="danger" value="No PSN"></Tag>
                    </template>
                </Column>
                <Column field="" header="Actions">
                    <template #body="slotProps">
                        <Button v-if="slotProps.data.verification_result === 0" label="Re-verify" @click="handleReverification(slotProps.data)" icon="pi pi-eye" :fluid="false" class="flex-grow sm:flex-grow-0 ml-auto" size="small"></Button>
                    </template>
                </Column>
            </DataTable>
        </template>
    </Card>
    <Toast />
    <ConfirmDialog :draggable="false" :closable="false"></ConfirmDialog>
    <Dialog
        v-model:visible="verificationResultModal"
        modal
        :header="verificationResultHeader"
        :closable="false"
        :draggable="false"
        :style="{ width: '30vw', borderRadius: '10px', padding: '1rem', textAlign: 'center' }"
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    >
        <div class="id-card">
            <p class="m-0 mb-3 text-black">{{ verificationResultMessage }}</p>

            <div v-if="verificationResult.isVerified == 1" class="id-content">
                <Divider />
                <div class="image-container">
                    <img :src="verificationResult.face_url" alt="Profile Image" class="id-image" />
                </div>
                <div class="id-info">
                    <p><b>Philsys Number:</b> {{ formattedReference }}</p>
                    <p><b>Full Name:</b> {{ verificationResult.first_name + ' ' + verificationResult.middle_name + ' ' + verificationResult.last_name }}</p>
                    <p><b>Birthdate:</b> {{ moment(verificationResult.birth_date).format('MMMM D, YYYY') }}</p>
                    <p>
                        <b>Address:</b>
                        {{
                            [
                                verificationResult.present_address_line_1,
                                verificationResult.present_address_line_2,
                                verificationResult.present_barangay,
                                verificationResult.present_municipality,
                                verificationResult.present_province,
                                verificationResult.present_postal_code
                            ]
                                .filter(Boolean)
                                .join(', ')
                        }}
                    </p>
                </div>

                <Divider />
            </div>
            <Button @click="saveVerificationResult" label="OK" class="p-button-primary" />
        </div>
    </Dialog>
    <FullPageLoader :isLoading="loading" />
</template>

<style>
.id-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 12px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

.image-container {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
}

.id-image {
    width: 200px;
    height: auto;
    border: 1px solid #747474;
    object-fit: center;
}

.id-info {
    text-align: left;
    width: 100%;
    font-size: 14px;
    color: #333;
}

.id-info p {
    margin: 5px 0;
    font-size: 18px;
}
</style>
