<template>
    <Toast />
    <ConfirmDialog></ConfirmDialog>
    <div class="card grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="flex flex-col grow gap-2">
            <h3 class="font-semibold text-xl">Queue Manager</h3>
        </div>
        <div class="flex flex-col gap-2 items-start sm:items-end w-full">
            <div class="flex flex-row gap-2 w-full justify-end">
                <InputText type="text" v-model="filters['global'].value" placeholder="Search" />
                <Button icon="pi pi-plus" label="Add" class="ml-2" @click="visible = true" />
            </div>
        </div>
    </div>
    <div className="card">
        <DataTable v-model:filters="filters" :globalFilterFields="['description']" :loading="isLoading" :value="queueList" paginator :rows="10" :rowsPerPageOptions="[10, 20, 50, 100]" tableStyle="min-width: 50rem">
            <Column field="description" header="Description"></Column>
            <Column field="sector_name" header="Sector"></Column>
            <Column field="program_name" header="Program"></Column>
            <Column field="last_queue_number" header="Last Queue Number"></Column>
            <Column header="Actions">
                <template #body="slotProps">
                    <Button icon="pi pi-pen-to-square" size="small" iconPos="left" label="Edit" class="me-2 mb-2" @click="editQueue(slotProps.data)" />
                </template>
            </Column>
            <template #empty> No user found. </template>
        </DataTable>
    </div>

    <Dialog v-model:visible="visible" modal :header="isEditMode ? 'Edit Queue' : 'Add Queue'" :style="{ width: '30rem' }">
        <div class="flex flex-col gap-4">
            <div>
                <label class="block mb-1">Description</label>
                <InputText v-model="newQueue.description" placeholder="Enter description" class="w-full" />
            </div>
            <div>
                <label class="block mb-1">Sector</label>
                <Dropdown v-model="newQueue.sector_id" :options="sectorsList" optionLabel="description" optionValue="id" placeholder="Select sector" class="w-full" />
            </div>
            <div>
                <label class="block mb-1">Program</label>
                <Dropdown v-model="newQueue.program_id" :options="programsList" optionLabel="description" optionValue="id" placeholder="Select program" class="w-full" />
            </div>
            <div class="flex flex-row-reverse gap-2 mt-4">
                <Button :label="isEditMode ? 'Update' : 'Save'" icon="pi pi-save" @click="confirmSave" />
                <Button
                    label="Cancel"
                    icon="pi pi-times"
                    severity="danger"
                    @click="
                        () => {
                            visible = false;
                            isEditMode = false;
                        }
                    "
                />
            </div>
        </div>
    </Dialog>
</template>

<script setup>
import queueManagement from '@/service/settings/queueManagement';
import { FilterMatchMode } from '@primevue/core/api';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
const confirm = useConfirm();
const toast = useToast();
const userModules = ref([]);
const queueList = ref([]);
const sectorsList = ref([]);
const programsList = ref([]);
const isLoading = ref(false);
const isLoadingAccess = ref(false);

const visible = ref(false);
const isEditMode = ref(false);
const newQueue = ref({
    id: null,
    description: '',
    sector_id: null,
    program_id: null
});
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

onMounted(() => {
    isLoading.value = true;
    getSectors();
    getPrograms();
    getQueues();
    isLoading.value = false;
});

const getSectors = async (params) => {
    const response = await queueManagement.getSectors(params);
    sectorsList.value = response.data;
};
const getPrograms = async (params) => {
    const response = await queueManagement.getPrograms(params);
    programsList.value = response.data;
};
const getQueues = async (params) => {
    const response = await queueManagement.getQueues(params);
    queueList.value = response.data;
};

const saveQueue = async () => {
    if (isEditMode.value) {
        const response = await queueManagement.updateQueue(newQueue.value.id, {
            description: newQueue.value.description,
            sector_id: newQueue.value.sector_id,
            program_id: newQueue.value.program_id
        });
        toast.add({ severity: 'success', summary: 'Updated', detail: 'Queue updated successfully', life: 3000 });
    } else {
        const response = await queueManagement.createQueue({
            description: newQueue.value.description,
            sector_id: newQueue.value.sector_id,
            program_id: newQueue.value.program_id
        });
        toast.add({ severity: 'success', summary: 'Added', detail: 'Queue added successfully', life: 3000 });
    }
};


const editQueue = (row) => {
    isEditMode.value = true;
    newQueue.value.id = row.id;
    newQueue.value.description = row.description;
    newQueue.value.sector_id = row.sector_id;
    newQueue.value.program_id = row.program_id;
    visible.value = true;
};

const confirmSave = () => {
    if (!newQueue.value.description || !newQueue.value.sector_id || !newQueue.value.program_id) {
        toast.add({ severity: 'warn', summary: 'Validation', detail: 'All fields are required', life: 3000 });
        return;
    }
    confirm.require({
        message: 'Are you sure you want to save new queue?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
            label: 'Cancel',
            severity: 'secondary',
            outlined: true
        },
        acceptProps: {
            label: 'Save'
        },
        accept: () => {
            saveQueue();
            newQueue.description = '';
            newQueue.sector_id = null;
            newQueue.program_id = null;
            visible.value = false;
            getQueues();
            isEditMode.value = false;
        }
    });
};
</script>
