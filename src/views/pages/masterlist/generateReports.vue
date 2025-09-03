<template>
    <div className="card">
        <div class="font-semibold text-xl">Masterlist</div>

        <Divider />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div class="flex flex-col grow gap-2">
                <label for="lastName">Last Name</label>
                <InputText v-model="filters.lastName" fluid id="lastName" type="text" />
            </div>
            <div class="flex flex-col grow gap-2">
                <label for="firstName">First Name</label>
                <InputText v-model="filters.firstName" fluid id="firstName" type="text" />
            </div>
            <div class="flex flex-col grow gap-2">
                <label for="middleName">Middle Name</label>
                <InputText v-model="filters.middleName" fluid id="middleName" type="text" />
            </div>
            <div class="flex flex-col grow gap-2">
                <label for="DateFrom">Date From</label>
                <DatePicker v-model="filters.dateFrom" showIcon fluid iconDisplay="input" placeholder="MM/DD/YYYY" />
            </div>
            <div class="flex flex-col grow gap-2">
                <label for="DateTo">Date To</label>
                <DatePicker v-model="filters.dateTo" showIcon fluid iconDisplay="input" placeholder="MM/DD/YYYY" />
            </div>
            <div class="flex flex-col grow gap-2">
                <label for="VerificationType">Verification</label>
                <Select v-model="filters.verificationType" name="city" :options="verificationType" optionLabel="name" optionValue="id" placeholder="Please Select" fluid />
            </div>
        </div>
        <div class="flex justify-between">
            <div class="flex mt-10">
                <Button :loading="isLoading" @click="generateReport()" severity="success" type="button" label="Download Report" icon="pi pi-download" />
            </div>
            <div class="flex flex-row-reverse mt-10">
                <Button :loading="isLoading" @click="searchClient()" type="button" label="Search" icon="pi pi-search" />
                <Button :loading="isLoading" @click="clear()" class="me-2" severity="danger" type="button" label="Clear" icon="pi pi-replay" />
            </div>
        </div>
    </div>

    <div className="card">
        <DataTable :loading="isLoading" :value="clientList" paginator :rows="10" :rowsPerPageOptions="[10, 20, 30]" tableStyle="min-width: 50rem">
            <Column field="beneficiary_id" header="Beneficiary ID"></Column>
            <Column field="last_name" header="Last Name"></Column>
            <Column field="first_name" header="First Name"></Column>
            <Column field="middle_name" header="Middle Name"></Column>
            <Column header="Date of Birth">
                <template #body="slotProps">
                    {{ moment(slotProps.data.birth_date).format('LL') }}
                </template>
            </Column>
            <Column field="psn" header="PSN"></Column>
            <Column header="Verification Date">
                <template #body="slotProps">
                    {{ moment(slotProps.data.verified_at).format('LL') }}
                </template>
            </Column>
            <Column field="verification_result" header="Verification Result">
                <template #body="slotProps">
                    <Tag v-if="slotProps.data.verification_result === 1" icon="pi pi-check" severity="success" value="Verified"></Tag>
                    <Tag v-else icon="pi pi-times" severity="danger" value="No PSN"></Tag>
                </template>
            </Column>
            <Column field="" header="Actions">
                <template #body="slotProps">
                    <div class="flex flex-col md:flex-row gap-2 items-center m-0">
                        <Button label="Generate ID" icon="pi pi-print" :fluid="false" size="small" @click="openCamera(slotProps.data)" />
                        <Button :disabled="slotProps.data.bene_id_created === 0" label="View" @click="viewPSARecord(slotProps.data)" icon="pi pi-eye" :fluid="false" size="small"></Button>
                    </div>
                </template>
            </Column>
            <template #empty> No data found.</template>
            <template #footer> Total: {{ clientList ? clientList.length : 0 }} </template>
        </DataTable>
    </div>

    <Dialog v-model:visible="cameraModalVisible" modal header="Capture Beneficiary Photo" :closable="true" :draggable="false" :style="{ width: '400px' }" @hide="closeCameraModal">
        <div v-if="!photoCaptured">
            <video ref="videoRef" autoplay playsinline width="100%" style="border-radius: 8px; background: #222" />
            <Button label="Capture" icon="pi pi-camera" class="mt-4" @click="capturePhoto" />
        </div>
        <div v-else>
            <img :src="capturedPhoto" alt="Captured" style="width: 100%; border-radius: 8px" />
            <div class="flex justify-end mt-2">
                <Button label="Retake" icon="pi pi-refresh" class="mr-2" @click="retakePhoto" />
                <Button label="Save & Print" icon="pi pi-print" @click="saveAndPrintPhoto" />
            </div>
        </div>
    </Dialog>
    <div ref="printArea" style="display: none">
        <IdCard :client="printClient" :qrCode="qrCodeDataUrl" />
    </div>

    <Dialog
        v-model:visible="clientDetailsModal"
        modal
        header="Beneficiary ID"
        :closable="false"
        :draggable="false"
        :style="{ width: '37vw', borderRadius: '10px', padding: '.5rem', textAlign: 'center' }"
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    >
        <IdCard :client="selectedClient" :qrCode="qrCodeDataUrl" />
        <Button @click="closeModal" label="OK" class="p-button-primary mt-4" />
    </Dialog>
</template>

<script setup>
import IdCard from '@/components/IdCard.vue';
import generateReports from '@/service/reports/generateReports';
import CryptoJS from 'crypto-js';
import ExcelJS from 'exceljs';
import moment from 'moment';
import { useToast } from 'primevue/usetoast';
import QRCode from 'qrcode';
import { computed, nextTick, onMounted, ref } from 'vue';
const qrCodeDataUrl = ref('');

async function generateQRCode(client) {
    if (!client) return;
    const secretKey = import.meta.env.VITE_QR_SECRET_KEY;
    const encrypted = CryptoJS.AES.encrypt(String(client.beneficiary_id), secretKey).toString();
    qrCodeDataUrl.value = await QRCode.toDataURL(encrypted, { width: 80 });
}

const cameraModalVisible = ref(false);
const videoRef = ref(null);
const photoCaptured = ref(false);
const capturedPhoto = ref('');
const clientForPhoto = ref(null);
const printClient = ref(null);
const printArea = ref(null);

function openCamera(client) {
    clientForPhoto.value = client;
    cameraModalVisible.value = true;
    photoCaptured.value = false;
    capturedPhoto.value = '';
    startCamera();
}

function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        if (videoRef.value) {
            videoRef.value.srcObject = stream;
        }
    });
}

function stopCamera() {
    const video = videoRef.value;
    if (video && video.srcObject) {
        video.srcObject.getTracks().forEach((track) => track.stop());
        video.srcObject = null;
    }
}

function capturePhoto() {
    const video = videoRef.value;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    capturedPhoto.value = canvas.toDataURL('image/png');
    photoCaptured.value = true;
    // Stop camera after capturing
    stopCamera();
}

function retakePhoto() {
    photoCaptured.value = false;
    capturedPhoto.value = '';
    startCamera();
}

function closeCameraModal() {
    stopCamera();
    cameraModalVisible.value = false;
    photoCaptured.value = false;
    capturedPhoto.value = '';
    clientForPhoto.value = null;
}

async function saveAndPrintPhoto() {
    stopCamera();
    cameraModalVisible.value = false;
    try {
        const client = clientForPhoto.value ? { ...clientForPhoto.value } : null;
        const beneficiaryId = clientForPhoto.value ? clientForPhoto.value.beneficiary_id : null;
        const data = await generateReports.uploadPhoto(beneficiaryId, capturedPhoto.value);
        if (data && data.face_url && client) {
            client.face_url = data.face_url;
            printClient.value = { ...client };
            await generateQRCode(printClient.value);
            await nextTick();
            printID();
            searchClient();
        }
    } catch (error) {
        console.log('Error uploading photo:', error);
        toast.add({ severity: 'error', summary: 'Upload Error', detail: 'Failed to upload photo', life: 3000 });
    }
    // Reset modal state
    photoCaptured.value = false;
    capturedPhoto.value = '';
    clientForPhoto.value = null;
}

function printID() {
    try {
        const printContents = printArea.value?.innerHTML;
        if (!printContents) throw new Error('No print content found');

        const printWindow = window.open('', '', 'height=600,width=900');
        if (!printWindow) throw new Error('Failed to open print window');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html><head><meta charset="UTF-8"><title>Beneficiary ID</title>
            <link rel="stylesheet" href="/print-id.css"></head>
            <body>${printContents}</body></html>
        `);
        printWindow.document.close();

        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        };
    } catch (error) {
        console.error('Print error:', error);
        toast.add({ severity: 'error', summary: 'Print Error', detail: 'Failed to print ID card', life: 3000 });
    }
}

const toast = useToast();
const workbook = new ExcelJS.Workbook();
const isLoading = ref(false);
const clientDetailsModal = ref(false);
const formattedReference = computed(() => {
    if (selectedClient.value?.psn) {
        return selectedClient.value.psn.replace(/(.{4})/g, '$1-').slice(0, -1);
    }
    return '';
});
const verificationType = ref([
    { name: 'All', id: 2 },
    { name: 'Verified', id: 1 },
    { name: 'No PSN', id: 0 }
]);

const clientList = ref([]);
const selectedClient = ref();
const filters = ref({
    lastName: '',
    firstName: '',
    middleName: '',
    dateFrom: '',
    dateTo: '',
    verificationType: 2
});

onMounted(() => {
    searchClient();
});

const clear = () => {
    filters.value.lastName = '';
    filters.value.firstName = '';
    filters.value.middleName = '';
    filters.value.dateFrom = '';
    filters.value.dateTo = '';
    filters.value.verificationType = 2;

    searchClient();
};

const searchClient = async () => {
    isLoading.value = true;
    let params = {
        lastName: filters.value.lastName,
        firstName: filters.value.firstName,
        middleName: filters.value.middleName,
        dateFrom: filters.value.dateFrom ? moment(filters.value.dateFrom).format('YYYY-MM-DD') : '',
        dateTo: filters.value.dateTo ? moment(filters.value.dateTo).format('YYYY-MM-DD') : '',
        verificationType: filters.value.verificationType
    };

    const result = await generateReports.getClients(params);
    clientList.value = result.data;
    isLoading.value = false;
};

const viewPSARecord = async (data) => {
    selectedClient.value = data;
    await generateQRCode(selectedClient.value);
    clientDetailsModal.value = true;
};

const closeModal = () => {
    clientDetailsModal.value = false;
    selectedClient.value = [];
};

const generateReport = async () => {
    if (clientList.value.length == 0) {
        return toast.add({ severity: 'warn', summary: 'No data found', detail: 'cannot generate report', life: 3000 });
    }

    isLoading.value = true;

    await downloadFile(clientList.value);

    setTimeout(() => {
        isLoading.value = false;
    }, 1000);
};

const downloadFile = async (data) => {
    workbook.removeWorksheet('Client Details');
    const sheet = workbook.addWorksheet('Client Details', {
        pageSetup: {
            paperSize: 9,
            orientation: 'landscape',
            margins: { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 }
        }
    });

    sheet.mergeCells('A1:AF1');
    const departmentHeaderCell = sheet.getCell('A1');
    departmentHeaderCell.value = 'Department of Social Welfare and Development';
    departmentHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' };
    departmentHeaderCell.font = { bold: true, size: 10 };

    sheet.mergeCells('A2:AF2');
    const programCell = sheet.getCell('A2');
    programCell.value = 'Client Verification System';
    programCell.alignment = { horizontal: 'center', vertical: 'middle' };
    programCell.font = { size: 10 };

    const headerRow = sheet.getRow(5);
    headerRow.values = [
        'No.',
        'PSN',
        'First Name',
        'Middle Name',
        'Last Name',
        'Suffix Name',
        'Sex',
        'Marital Status',
        'Birthdate',
        'Place of Birth',
        'POB Municipality',
        'POB Province',
        'POB Country',
        'Mobile Number',
        'Email Address',
        'Address Line 1',
        'Address Line 2',
        'Barangay',
        'Municipality',
        'Province',
        'Country',
        'Postal Code',
        'Present Address Line 1',
        'Present Address Line 2',
        'Present Barangay',
        'Present Municipality',
        'Present Province',
        'Present Country',
        'Present Postal Code',
        'Residency Status',
        'Verification Result',
        'Verified At'
    ];

    headerRow.eachCell((cell) => {
        cell.font = { size: 9, bold: true };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    sheet.columns = [
        { key: 'no', width: 5 },
        { key: 'psn', width: 20 },
        { key: 'first_name', width: 20 },
        { key: 'middle_name', width: 20 },
        { key: 'last_name', width: 20 },
        { key: 'suffix_name', width: 15 },
        { key: 'sex', width: 10 },
        { key: 'marital_status', width: 15 },
        { key: 'birthdate', width: 15 },
        { key: 'place_of_birth', width: 20 },
        { key: 'pob_municipality', width: 20 },
        { key: 'pob_province', width: 20 },
        { key: 'pob_country', width: 20 },
        { key: 'mobile_number', width: 15 },
        { key: 'email', width: 30 },
        { key: 'address_line_1', width: 30 },
        { key: 'address_line_2', width: 30 },
        { key: 'barangay', width: 20 },
        { key: 'municipality', width: 20 },
        { key: 'province', width: 20 },
        { key: 'country', width: 20 },
        { key: 'postal_code', width: 10 },
        { key: 'present_address_line_1', width: 30 },
        { key: 'present_address_line_2', width: 30 },
        { key: 'present_barangay', width: 20 },
        { key: 'present_municipality', width: 20 },
        { key: 'present_province', width: 20 },
        { key: 'present_country', width: 20 },
        { key: 'present_postal_code', width: 10 },
        { key: 'residency_status', width: 20 },
        { key: 'verification_result', width: 20 },
        { key: 'verified_at', width: 15 }
    ];

    if (data && Array.isArray(data)) {
        const formattedData = data.map((item, index) => ({
            no: index + 1,
            psn: item.psn || '',
            first_name: item.first_name || '',
            middle_name: item.middle_name || '',
            last_name: item.last_name || '',
            suffix_name: item.suffix_name || '',
            sex: item.sex || '',
            marital_status: item.marital_status || '',
            birthdate: item.birth_date ? moment(item.birth_date).format('LL') : '',
            place_of_birth: item.place_of_birth || '',
            pob_municipality: item.pob_municipality || '',
            pob_province: item.pob_province || '',
            pob_country: item.pob_country || '',
            mobile_number: item.mobile_number || '',
            email: item.email || '',
            address_line_1: item.address_line_1 || '',
            address_line_2: item.address_line_2 || '',
            barangay: item.barangay || '',
            municipality: item.municipality || '',
            province: item.province || '',
            country: item.country || '',
            postal_code: item.postal_code || '',
            present_address_line_1: item.present_address_line_1 || '',
            present_address_line_2: item.present_address_line_2 || '',
            present_barangay: item.present_barangay || '',
            present_municipality: item.present_municipality || '',
            present_province: item.present_province || '',
            present_country: item.present_country || '',
            present_postal_code: item.present_postal_code || '',
            residency_status: item.residency_status || '',
            verification_result: item.verification_result === 1 ? 'Verified' : 'No PSN',
            verified_at: item.verified_at ? moment(item.verified_at).format('LL') : ''
        }));

        sheet.addRows(formattedData);

        formattedData.forEach((_, rowIndex) => {
            const row = sheet.getRow(rowIndex + 6);
            row.height = 15;
            row.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            row.eachCell((cell) => {
                cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                cell.font = { size: 9 };
            });
        });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Client-Details.xlsx';
    link.click();
};
</script>
<style scoped src="/public/print-id.css"></style>
<style>
/* Modal and display styles only - print styles are in /print-id.css */
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
    width: 120px;
    height: 120px;
    border-radius: 50%;
    border: 1px solid #747474;
    object-fit: cover;
}

.id-info {
    text-align: left;
    width: 100%;
    font-size: 14px;
    color: #333;
}

.id-info p {
    margin: 5px 0;
    font-size: 20px;
}
</style>
