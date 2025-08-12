<template>
    <Toast />
    <ConfirmDialog></ConfirmDialog>
    <div className="card grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="flex flex-col grow gap-2">
            <h3 class="font-semibold text-xl">User Access Management</h3>
        </div>
        <div class="flex flex-col gap-2 items-start sm:items-end">
            <InputText type="text" v-model="filters['global'].value" placeholder="Search" />
        </div>
    </div>
    <div className="card">
        <DataTable v-model:filters="filters" :globalFilterFields="['empno', 'sname', 'fname', 'mname']" :loading="isLoading" :value="userDatas" paginator :rows="10" :rowsPerPageOptions="[10, 20, 50, 100]" tableStyle="min-width: 50rem">
            <Column field="empno" header="Employee No."></Column>
            <Column field="sname" header="Surname"></Column>
            <Column field="fname" header="First Name"></Column>
            <Column field="mname" header="Middle Name"></Column>
            <Column field="position_initial" header="Position"></Column>
            <Column header="Actions">
                <template #body="slotProps">
                    <Button icon="pi pi-pen-to-square" size="small" iconPos="left" label="Edit Access" class="me-2 mb-2" @click="editAccess(slotProps.data)" />
                </template>
            </Column>
            <template #empty> No user found. </template>
        </DataTable>
    </div>

    <Dialog v-model:visible="visible" modal header="User Access" :style="{ width: '60rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
        <Fieldset legend="User Infomation">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div class="flex flex-col grow gap-2">
                    <label>Full Name</label>
                    <div>{{ userProfile.sname }}, {{ userProfile.fname }} {{ userProfile.mname }}</div>
                </div>
                <div class="flex flex-col grow gap-2">
                    <label>Position</label>
                    <div>{{ userProfile.position ? userProfile.position : '-' }}</div>
                </div>
            </div>
        </Fieldset>
        <Fieldset legend="Access">
            <DataTable :loading="isLoadingAccess" v-model:selection="selectedProduct" :value="userModules" dataKey="module_id" tableStyle="min-width: 50rem">
                <Column selectionMode="multiple" headerStyle="width: 3rem" compareSelectionBy="equals"></Column>
                <Column field="label" header="Module Name"></Column>
                <Column field="to" header="Route"></Column>
            </DataTable>

            <div class="flex flex-row-reverse mt-10">
                <Button type="button" :loading="isLoadingAccess" label="Save" size="small" icon="pi pi-save" @click="confirmSave()" />
                <Button class="me-2" :loading="isLoadingAccess" type="button" size="small" label="Cancel" icon="pi pi-times" severity="danger" @click="visible = false" />
            </div>
        </Fieldset>
    </Dialog>
</template>

<script setup>
import userAccess from '@/service/settings/userAccess';
import { FilterMatchMode } from '@primevue/core/api';
import Cookies from 'js-cookie';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
const confirm = useConfirm();
const toast = useToast();
const userModules = ref([]);
const userDatas = ref([]);
const selectedProduct = ref();
const userProfile = ref({
    empno: '',
    sname: '',
    fname: '',
    mname: '',
    position: ''
});
const isLoading = ref(false);
const isLoadingAccess = ref(false);

const visible = ref(false);

const filtersData = ref({
    sname: '',
    fname: '',
    mname: ''
});

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

onMounted(() => {
    getUserModules();
    getUsers();
});

const getUserModules = async () => {
    const response = await userAccess.getUserModules();
    userModules.value = response.data;
};

const getUsers = async (params) => {
    isLoading.value = true;
    const response = await userAccess.getUsers(params);
    userDatas.value = response.data;
    isLoading.value = false;
};

const search = () => {
    getUsers(filtersData.value);
};

const editAccess = async (data) => {
    visible.value = true;
    isLoadingAccess.value = true;
    userProfile.value = {
        empno: data.empno,
        sname: data.sname,
        fname: data.fname,
        mname: data.mname,
        position: data.position_name
    };

    let userAccessData = await userAccess.getUserCurrentModules({ empNo: data.empno });

    if (userAccessData.data) {
        selectedProduct.value = userModules.value.filter((module) => userAccessData.data.some((access) => access.module_id === module.module_id));
    }
    isLoadingAccess.value = false;
};

const saveAccess = async () => {
    let data = {
        empNo: userProfile.value.empno,
        modules: selectedProduct.value.map((module) => {
            return {
                empno: userProfile.value.empno,
                addedBy: Cookies.get('empNo'),
                module_id: module.module_id
            };
        })
    };

    const response = await userAccess.saveUserModules(data);
    console.log(response);
};

const confirmSave = () => {
    confirm.require({
        message: 'Update user access?',
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
            saveAccess();
            visible.value = false;
            toast.add({ severity: 'info', summary: 'Confirmed', detail: 'You have accepted', life: 3000 });
        }
    });
};
</script>
