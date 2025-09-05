<template>
    <div class="card">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">MFA Management</h1>
            <div class="flex gap-3">
                <Button icon="pi pi-refresh" label="Refresh" @click="loadUsers" class="p-button-outlined" :loading="loading" />
                <Button icon="pi pi-shield" label="Bulk Reset MFA" @click="confirmBulkResetMfa" class="p-button-danger" :disabled="!selectedUsers.length || loading" v-tooltip.top="'Reset MFA for selected users'" />
            </div>
        </div>

        <!-- Filters -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="field">
                <label for="search" class="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
                <InputText id="search" v-model="searchQuery" placeholder="Search by name or email..." class="w-full" @input="debouncedSearch" />
            </div>

            <div class="field">
                <label for="mfa_status" class="block text-sm font-medium text-gray-700 mb-2">MFA Status</label>
                <Dropdown id="mfa_status" v-model="mfaStatusFilter" :options="mfaStatusOptions" optionLabel="label" optionValue="value" placeholder="All Users" class="w-full" @change="loadUsers" />
            </div>

            <div class="field flex items-end">
                <Button icon="pi pi-filter-slash" label="Clear Filters" @click="clearFilters" class="p-button-outlined p-button-secondary w-full" />
            </div>
        </div>

        <!-- Data Table -->
        <DataTable
            ref="dt"
            :value="users"
            dataKey="id"
            :paginator="true"
            :rows="10"
            :filters="filters"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25, 50]"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users"
            :loading="loading"
            v-model:selection="selectedUsers"
            :selectAll="selectOnPage"
            @select-all-change="onSelectAllChange"
            @row-select="onRowSelect"
            @row-unselect="onRowUnselect"
        >
            <template #header>
                <div class="flex justify-between items-center">
                    <h4 class="m-0">User MFA Management</h4>
                    <div class="flex items-center gap-3">
                        <span v-if="selectedUsers.length" class="text-sm text-gray-600"> {{ selectedUsers.length }} user(s) selected </span>
                        <IconField iconPosition="left">
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Quick search..." />
                        </IconField>
                    </div>
                </div>
            </template>

            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

            <Column field="full_name" header="User Name" :sortable="true" headerStyle="width:20%; min-width:12rem;">
                <template #body="{ data }">
                    <div class="flex items-center gap-3">
                        <Avatar :label="data.first_name?.charAt(0) + data.last_name?.charAt(0)" class="mr-2" size="normal" shape="circle" :style="{ backgroundColor: '#' + Math.floor(Math.random() * 16777215).toString(16) }" />
                        <div>
                            <div class="font-medium">{{ data.full_name }}</div>
                            <div class="text-sm text-gray-500">{{ data.email }}</div>
                        </div>
                    </div>
                </template>
            </Column>

            <Column field="email" header="Email" :sortable="true" headerStyle="width:25%; min-width:15rem;">
                <template #body="{ data }">
                    <code class="bg-gray-100 px-2 py-1 rounded text-sm">{{ data.email }}</code>
                </template>
            </Column>

            <Column field="mfa_status" header="MFA Status" :sortable="true" headerStyle="width:15%; min-width:10rem;">
                <template #body="{ data }">
                    <Tag :value="data.mfa_status" :severity="data.mfa_enabled ? 'success' : 'warning'" :icon="data.mfa_enabled ? 'pi pi-shield' : 'pi pi-exclamation-triangle'" />
                </template>
            </Column>

            <Column field="has_recovery_codes" header="Recovery Codes" headerStyle="width:15%; min-width:10rem;">
                <template #body="{ data }">
                    <div class="flex items-center gap-2">
                        <i :class="data.has_recovery_codes ? 'pi pi-check text-green-500' : 'pi pi-times text-red-500'"></i>
                        <span class="text-sm">{{ data.has_recovery_codes ? 'Available' : 'Not Set' }}</span>
                    </div>
                </template>
            </Column>

            <Column field="created_at" header="Account Created" :sortable="true" headerStyle="width:15%; min-width:10rem;">
                <template #body="{ data }">
                    <span class="text-sm">{{ formatDate(data.created_at) }}</span>
                </template>
            </Column>

            <Column header="Actions" headerStyle="width:12%; min-width:10rem">
                <template #body="slotProps">
                    <div class="flex gap-2">
                        <Button icon="pi pi-eye" class="p-button-rounded p-button-info p-button-sm" @click="viewUserDetails(slotProps.data)" v-tooltip.top="'View Details'" />
                        <Button
                            icon="pi pi-shield"
                            class="p-button-rounded p-button-warning p-button-sm"
                            @click="confirmResetMfa(slotProps.data)"
                            :disabled="!slotProps.data.mfa_enabled"
                            v-tooltip.top="slotProps.data.mfa_enabled ? 'Reset MFA' : 'MFA not enabled'"
                        />
                    </div>
                </template>
            </Column>
        </DataTable>

        <!-- View User Details Dialog -->
        <Dialog v-model:visible="userDetailsDialog" :style="{ width: '500px' }" header="User MFA Details" :modal="true" :draggable="false">
            <div class="space-y-4" v-if="selectedUserDetails">
                <div class="text-center mb-4">
                    <Avatar :label="selectedUserDetails.first_name?.charAt(0) + selectedUserDetails.last_name?.charAt(0)" size="xlarge" shape="circle" :style="{ backgroundColor: '#' + Math.floor(Math.random() * 16777215).toString(16) }" />
                    <h3 class="mt-3 text-lg font-semibold">{{ selectedUserDetails.full_name }}</h3>
                    <p class="text-gray-600">{{ selectedUserDetails.email }}</p>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <label class="font-medium text-gray-700 text-sm">MFA Status</label>
                        <div class="mt-2">
                            <Tag :value="selectedUserDetails.mfa_status" :severity="selectedUserDetails.mfa_enabled ? 'success' : 'warning'" :icon="selectedUserDetails.mfa_enabled ? 'pi pi-shield' : 'pi pi-exclamation-triangle'" class="text-base" />
                        </div>
                    </div>

                    <div class="bg-gray-50 p-4 rounded-lg">
                        <label class="font-medium text-gray-700 text-sm">Account Created</label>
                        <p class="mt-2 text-sm">{{ formatDate(selectedUserDetails.created_at) }}</p>
                    </div>
                </div>

                <div class="bg-blue-50 p-4 rounded-lg" v-if="selectedUserDetails.mfa_enabled">
                    <div class="flex items-start gap-3">
                        <i class="pi pi-info-circle text-blue-500 mt-1"></i>
                        <div>
                            <h4 class="font-medium text-blue-800">MFA Information</h4>
                            <p class="text-sm text-blue-600 mt-1">This user has MFA enabled. If they lose access to their authenticator device, you can reset their MFA settings to allow them to set it up again.</p>
                        </div>
                    </div>
                </div>

                <div class="bg-orange-50 p-4 rounded-lg" v-else>
                    <div class="flex items-start gap-3">
                        <i class="pi pi-exclamation-triangle text-orange-500 mt-1"></i>
                        <div>
                            <h4 class="font-medium text-orange-800">MFA Not Enabled</h4>
                            <p class="text-sm text-orange-600 mt-1">This user has not enabled MFA on their account. They can set it up from their profile settings.</p>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-between">
                    <Button label="Close" icon="pi pi-times" class="p-button-text" @click="userDetailsDialog = false" />
                    <Button v-if="selectedUserDetails?.mfa_enabled" label="Reset MFA" icon="pi pi-shield" class="p-button-danger" @click="confirmResetMfaFromDialog" />
                </div>
            </template>
        </Dialog>

        <!-- Reset MFA Confirmation Dialog -->
        <Dialog v-model:visible="resetMfaDialog" :style="{ width: '450px' }" header="Confirm MFA Reset" :modal="true" :draggable="false">
            <div class="confirmation-content">
                <div class="flex items-start gap-3">
                    <i class="pi pi-exclamation-triangle text-3xl text-red-500"></i>
                    <div>
                        <h4 class="font-semibold text-lg mb-2">Reset MFA for User?</h4>
                        <div v-if="selectedUser" class="space-y-2">
                            <p><strong>User:</strong> {{ selectedUser.full_name }}</p>
                            <p><strong>Email:</strong> {{ selectedUser.email }}</p>
                            <div class="bg-red-50 p-3 rounded-lg mt-3">
                                <p class="text-sm text-red-700"><strong>Warning:</strong> This will completely remove the user's MFA settings. They will need to set up MFA again from their profile.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <template #footer>
                <div class="flex gap-3">
                    <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="resetMfaDialog = false" />
                    <Button label="Yes, Reset MFA" icon="pi pi-check" class="p-button-danger" @click="resetMfa" />
                </div>
            </template>
        </Dialog>

        <!-- Bulk Reset MFA Confirmation Dialog -->
        <Dialog v-model:visible="bulkResetDialog" :style="{ width: '500px' }" header="Confirm Bulk MFA Reset" :modal="true" :draggable="false">
            <div class="confirmation-content">
                <div class="flex items-start gap-3">
                    <i class="pi pi-exclamation-triangle text-3xl text-red-500"></i>
                    <div>
                        <h4 class="font-semibold text-lg mb-2">Reset MFA for Multiple Users?</h4>
                        <p class="mb-3">
                            You are about to reset MFA for <strong>{{ selectedUsers.length }}</strong> user(s):
                        </p>

                        <div class="max-h-40 overflow-y-auto bg-gray-50 p-3 rounded-lg mb-4">
                            <ul class="space-y-1">
                                <li v-for="user in selectedUsers" :key="user.id" class="text-sm">• {{ user.full_name }} ({{ user.email }})</li>
                            </ul>
                        </div>

                        <div class="bg-red-50 p-3 rounded-lg">
                            <p class="text-sm text-red-700"><strong>Warning:</strong> This will completely remove MFA settings for all selected users. They will need to set up MFA again from their profiles.</p>
                        </div>
                    </div>
                </div>
            </div>
            <template #footer>
                <div class="flex gap-3">
                    <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="bulkResetDialog = false" />
                    <Button label="Yes, Reset All" icon="pi pi-check" class="p-button-danger" @click="bulkResetMfa" />
                </div>
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import MfaManagementService from '@/service/mfa/MfaManagementService.js';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();

// Data
const users = ref([]);
const selectedUsers = ref([]);
const selectedUser = ref(null);
const selectedUserDetails = ref(null);
const loading = ref(false);
const searchQuery = ref('');
const mfaStatusFilter = ref(null);

// Dialog states
const userDetailsDialog = ref(false);
const resetMfaDialog = ref(false);
const bulkResetDialog = ref(false);

// Filters - Define FilterMatchMode inline
const FilterMatchMode = {
    STARTS_WITH: 'startsWith',
    CONTAINS: 'contains',
    NOT_CONTAINS: 'notContains',
    ENDS_WITH: 'endsWith',
    EQUALS: 'equals',
    NOT_EQUALS: 'notEquals'
};

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

// Filter options
const mfaStatusOptions = ref([
    { label: 'All Users', value: null },
    { label: 'MFA Enabled', value: 'enabled' },
    { label: 'MFA Disabled', value: 'disabled' }
]);

// Selection management
const selectOnPage = ref(false);

// Lifecycle
onMounted(() => {
    loadUsers();
});

// Methods
const loadUsers = async () => {
    loading.value = true;
    try {
        const params = {};

        if (searchQuery.value?.trim()) {
            params.search = searchQuery.value.trim();
        }

        if (mfaStatusFilter.value) {
            params.mfa_status = mfaStatusFilter.value;
        }

        const response = await MfaManagementService.getAllUsers(params);
        if (response.status) {
            users.value = response.data;
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: response.message || 'Failed to load users', life: 3000 });
        }
    } catch (error) {
        console.error('Error loading users:', error);
        if (error.status === 403) {
            toast.add({ severity: 'error', summary: 'Unauthorized', detail: 'Only superadmins can access MFA management', life: 5000 });
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: error.message || 'Failed to load users', life: 3000 });
        }
    } finally {
        loading.value = false;
    }
};

// Debounced search function
let searchTimeout;
const debouncedSearch = () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        loadUsers();
    }, 500);
};

const clearFilters = () => {
    searchQuery.value = '';
    mfaStatusFilter.value = null;
    filters.value.global.value = null;
    loadUsers();
};

const viewUserDetails = async (user) => {
    try {
        const response = await MfaManagementService.getUserMfaDetails(user.id);
        if (response.status) {
            selectedUserDetails.value = response.data;
            userDetailsDialog.value = true;
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: response.message || 'Failed to load user details', life: 3000 });
        }
    } catch (error) {
        console.error('Error loading user details:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load user details', life: 3000 });
    }
};

const confirmResetMfa = (user) => {
    selectedUser.value = user;
    resetMfaDialog.value = true;
};

const confirmResetMfaFromDialog = () => {
    selectedUser.value = selectedUserDetails.value;
    userDetailsDialog.value = false;
    resetMfaDialog.value = true;
};

const confirmBulkResetMfa = () => {
    if (selectedUsers.value.length === 0) {
        toast.add({ severity: 'warn', summary: 'No Selection', detail: 'Please select users to reset MFA', life: 3000 });
        return;
    }
    bulkResetDialog.value = true;
};

const resetMfa = async () => {
    try {
        const response = await MfaManagementService.resetUserMfa(selectedUser.value.id);
        if (response.status) {
            toast.add({ severity: 'success', summary: 'Success', detail: response.message, life: 3000 });
            resetMfaDialog.value = false;
            loadUsers();
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: response.message || 'Failed to reset MFA', life: 3000 });
        }
    } catch (error) {
        console.error('Error resetting MFA:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: error.message || 'Failed to reset MFA', life: 3000 });
    }
};

const bulkResetMfa = async () => {
    try {
        const userIds = selectedUsers.value.map((user) => user.id);
        const response = await MfaManagementService.bulkResetMfa(userIds);
        if (response.status) {
            toast.add({ severity: 'success', summary: 'Success', detail: response.message, life: 3000 });
            bulkResetDialog.value = false;
            selectedUsers.value = [];
            selectOnPage.value = false;
            loadUsers();
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: response.message || 'Failed to bulk reset MFA', life: 3000 });
        }
    } catch (error) {
        console.error('Error bulk resetting MFA:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: error.message || 'Failed to bulk reset MFA', life: 3000 });
    }
};

// Selection handlers
const onSelectAllChange = (event) => {
    selectedUsers.value = event.checked ? users.value.filter((user) => user.mfa_enabled) : [];
    selectOnPage.value = event.checked;
};

const onRowSelect = (event) => {
    // Handle individual row selection
};

const onRowUnselect = (event) => {
    // Handle individual row unselection
};

// Utility functions
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};
</script>

<style scoped>
.confirmation-content {
    align-items: flex-start;
}

.field {
    margin-bottom: 1rem;
}

.field label {
    display: block;
    font-weight: 500;
    margin-bottom: 0.5rem;
}

code {
    font-family: 'Courier New', monospace;
    font-size: 0.875rem;
}

/* Dialog improvements */
:deep(.p-dialog .p-dialog-header) {
    padding: 1.5rem 1.5rem 1rem 1.5rem;
    border-bottom: 1px solid #e5e7eb;
}

:deep(.p-dialog .p-dialog-content) {
    padding: 1.5rem;
    max-height: 70vh;
    overflow-y: auto;
}

:deep(.p-dialog .p-dialog-footer) {
    padding: 1rem 1.5rem 1.5rem 1.5rem;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
}

/* Button spacing */
.p-button-sm {
    padding: 0.5rem;
}

/* Tag improvements */
:deep(.p-tag) {
    font-weight: 500;
}

/* Avatar styling */
:deep(.p-avatar) {
    color: white;
    font-weight: 500;
}
</style>
