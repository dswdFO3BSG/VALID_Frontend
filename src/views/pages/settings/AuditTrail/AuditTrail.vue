<template>
    <div class="card grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="flex flex-col grow gap-2">
            <div class="font-semibold text-xl">Audit Trail</div>
            <div class="text-sm text-surface-500">View system activity and user actions</div>
        </div>
        <div class="flex items-center justify-end gap-2">
            <Button icon="pi pi-refresh" @click="refreshAuditTrail" :loading="isLoading" outlined />
            <Button icon="pi pi-download" label="Export" @click="exportData" outlined />
        </div>
    </div>

    <!-- Filters -->
    <div class="card">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div class="flex flex-col">
                <label class="font-medium text-sm mb-2">Employee Number</label>
                <InputText v-model="filters.empno" placeholder="Search by employee number" />
            </div>
            <div class="flex flex-col">
                <label class="font-medium text-sm mb-2">Module</label>
                <Select v-model="filters.module" :options="moduleOptions" optionLabel="label" optionValue="value" placeholder="All Modules" showClear />
            </div>
            <div class="flex flex-col">
                <label class="font-medium text-sm mb-2">Action</label>
                <Select v-model="filters.action" :options="actionOptions" optionLabel="label" optionValue="value" placeholder="All Actions" showClear />
            </div>
            <div class="flex flex-col">
                <label class="font-medium text-sm mb-2">Date Range</label>
                <DatePicker v-model="filters.dateRange" selectionMode="range" placeholder="Select date range" showIcon />
            </div>
        </div>
        <div class="flex justify-end">
            <Button label="Search" icon="pi pi-search" @click="applyFilters" :loading="isLoading" />
        </div>
    </div>

    <!-- Data Table -->
    <div class="card">
        <DataTable :loading="isLoading" :value="auditTrail" paginator :rows="15" :rowsPerPageOptions="[15, 25, 50, 100]" tableStyle="min-width: 50rem" :totalRecords="totalRecords" lazy @page="onPageChange" stripedRows>
            <Column field="id" header="ID" sortable style="width: 80px">
                <template #body="slotProps">
                    <span class="font-mono text-sm">#{{ slotProps.data.id }}</span>
                </template>
            </Column>

            <Column field="performed_at" header="Timestamp" sortable style="width: 150px">
                <template #body="slotProps">
                    <div class="text-sm">
                        <div>{{ formatDate(slotProps.data.performed_at) }}</div>
                        <div class="text-xs text-surface-500">{{ formatTime(slotProps.data.performed_at) }}</div>
                    </div>
                </template>
            </Column>

            <Column field="empno" header="Employee" sortable style="width: 120px">
                <template #body="slotProps">
                    <div class="text-sm">
                        <div class="font-medium">{{ slotProps.data.empno }}</div>
                        <div v-if="slotProps.data.user" class="text-xs text-surface-500">
                            {{ slotProps.data.user.fname }}
                        </div>
                    </div>
                </template>
            </Column>

            <Column field="action" header="Action" style="width: 120px">
                <template #body="slotProps">
                    <Tag :value="slotProps.data.action" :severity="getActionSeverity(slotProps.data.action)" rounded />
                </template>
            </Column>

            <Column field="module" header="Module" sortable style="width: 120px">
                <template #body="slotProps">
                    <Tag :value="slotProps.data.module" :severity="getModuleSeverity(slotProps.data.module)" outlined rounded />
                </template>
            </Column>

            <Column field="table_name" header="Table" style="width: 120px">
                <template #body="slotProps">
                    <span class="font-mono text-xs text-surface-600">
                        {{ slotProps.data.table_name || '-' }}
                    </span>
                </template>
            </Column>

            <Column field="description" header="Description" style="min-width: 250px">
                <template #body="slotProps">
                    <div class="text-sm">{{ slotProps.data.description }}</div>
                </template>
            </Column>

            <Column field="ip_address" header="IP Address" style="width: 130px">
                <template #body="slotProps">
                    <span class="font-mono text-xs">{{ slotProps.data.ip_address }}</span>
                </template>
            </Column>

            <Column header="Actions" style="width: 100px">
                <template #body="slotProps">
                    <Button icon="pi pi-eye" size="small" text @click="viewDetails(slotProps.data)" v-tooltip="'View Details'" />
                </template>
            </Column>

            <template #empty>
                <div class="text-center py-4">
                    <i class="pi pi-search text-4xl text-surface-400 mb-2"></i>
                    <div class="text-surface-600">No audit trail records found.</div>
                </div>
            </template>

            <template #footer>
                <div class="flex justify-between items-center">
                    <span class="text-sm text-surface-600"> Showing {{ auditTrail?.length || 0 }} of {{ totalRecords }} records </span>
                    <span class="text-xs text-surface-500"> Last updated: {{ new Date().toLocaleString() }} </span>
                </div>
            </template>
        </DataTable>
    </div>

    <!-- Details Dialog -->
    <Dialog v-model:visible="detailsVisible" modal header="Audit Trail Details" :style="{ width: '800px' }">
        <div v-if="selectedAuditTrail" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="font-medium text-sm">ID</label>
                    <div class="text-surface-600">#{{ selectedAuditTrail.id }}</div>
                </div>
                <div>
                    <label class="font-medium text-sm">Timestamp</label>
                    <div class="text-surface-600">{{ formatDateTime(selectedAuditTrail.performed_at) }}</div>
                </div>
                <div>
                    <label class="font-medium text-sm">Employee</label>
                    <div class="text-surface-600">{{ selectedAuditTrail.empno }}</div>
                </div>
                <div>
                    <label class="font-medium text-sm">Action</label>
                    <div>
                        <Tag :value="selectedAuditTrail.action" :severity="getActionSeverity(selectedAuditTrail.action)" />
                    </div>
                </div>
                <div>
                    <label class="font-medium text-sm">Module</label>
                    <div>
                        <Tag :value="selectedAuditTrail.module" :severity="getModuleSeverity(selectedAuditTrail.module)" outlined />
                    </div>
                </div>
                <div>
                    <label class="font-medium text-sm">IP Address</label>
                    <div class="font-mono text-surface-600">{{ selectedAuditTrail.ip_address }}</div>
                </div>
            </div>

            <div>
                <label class="font-medium text-sm">Description</label>
                <div class="text-surface-600 mt-1">{{ selectedAuditTrail.description }}</div>
            </div>

            <div v-if="selectedAuditTrail.old_values" class="space-y-2">
                <label class="font-medium text-sm">Old Values</label>
                <pre class="bg-surface-100 p-3 rounded text-xs overflow-auto max-h-40">{{ JSON.stringify(selectedAuditTrail.old_values, null, 2) }}</pre>
            </div>

            <div v-if="selectedAuditTrail.new_values" class="space-y-2">
                <label class="font-medium text-sm">New Values</label>
                <pre class="bg-surface-100 p-3 rounded text-xs overflow-auto max-h-40">{{ JSON.stringify(selectedAuditTrail.new_values, null, 2) }}</pre>
            </div>
        </div>
    </Dialog>
</template>

<script setup>
import AuditTrailServices from '@/service/auditTrail/AuditTrailServices';
import { useToast } from 'primevue/usetoast';
import { onMounted, reactive, ref } from 'vue';

const toast = useToast();

// Data
const auditTrail = ref([]);
const totalRecords = ref(0);
const isLoading = ref(false);
const detailsVisible = ref(false);
const selectedAuditTrail = ref(null);

// Filters
const filters = reactive({
    empno: '',
    module: '',
    action: '',
    dateRange: null,
    start_date: '',
    end_date: ''
});

// Pagination
const currentPage = ref(0);
const rowsPerPage = ref(15);

// Options
const moduleOptions = ref([
    { label: 'Masterlist', value: 'masterlist' },
    { label: 'User Access', value: 'user_access' },
    { label: 'Queue Manager', value: 'queue_manager' },
    { label: 'MFA', value: 'mfa' },
    { label: 'Authentication', value: 'authentication' },
    { label: 'API', value: 'api' }
]);

const actionOptions = ref([
    { label: 'Create', value: 'CREATE' },
    { label: 'Update', value: 'UPDATE' },
    { label: 'Delete', value: 'DELETE' },
    { label: 'Login Success', value: 'LOGIN_SUCCESS' },
    { label: 'Login Failed', value: 'LOGIN_FAILED' },
    { label: 'Logout', value: 'LOGOUT' },
    { label: 'MFA Setup', value: 'MFA_SETUP' },
    { label: 'MFA Verify', value: 'MFA_VERIFY' },
    { label: 'MFA Verify Failed', value: 'MFA_VERIFY_FAILED' },
    { label: 'MFA Reset', value: 'MFA_RESET' }
]);

// Methods
const getAuditTrail = async (params = {}) => {
    try {
        isLoading.value = true;

        // Add pagination parameters
        params.page = currentPage.value + 1;
        params.per_page = rowsPerPage.value;

        const response = await AuditTrailServices.getAuditTrail(params);

        if (response.status) {
            auditTrail.value = response.data.data;
            totalRecords.value = response.data.total;
        } else {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: response.message || 'Failed to fetch audit trail',
                life: 3000
            });
        }
    } catch (error) {
        console.error('Error fetching audit trail:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to fetch audit trail data',
            life: 3000
        });
    } finally {
        isLoading.value = false;
    }
};

const applyFilters = () => {
    const params = {};

    if (filters.empno) params.empno = filters.empno;
    if (filters.module) params.module = filters.module;
    if (filters.action) params.action = filters.action;

    if (filters.dateRange && filters.dateRange.length === 2) {
        params.start_date = formatDateForAPI(filters.dateRange[0]);
        params.end_date = formatDateForAPI(filters.dateRange[1]);
    }

    currentPage.value = 0; // Reset to first page
    getAuditTrail(params);
};

const refreshAuditTrail = () => {
    getAuditTrail();
};

const onPageChange = (event) => {
    currentPage.value = event.page;
    rowsPerPage.value = event.rows;
    applyFilters();
};

const exportData = async () => {
    try {
        const params = {};
        if (filters.empno) params.empno = filters.empno;
        if (filters.module) params.module = filters.module;
        if (filters.action) params.action = filters.action;
        if (filters.dateRange && filters.dateRange.length === 2) {
            params.start_date = formatDateForAPI(filters.dateRange[0]);
            params.end_date = formatDateForAPI(filters.dateRange[1]);
        }

        const response = await AuditTrailServices.exportAuditTrail(params);

        if (response.status) {
            // Create and download CSV file
            const csvContent = convertToCSV(response.data);
            downloadCSV(csvContent, 'audit_trail_export.csv');

            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Audit trail exported successfully',
                life: 3000
            });
        }
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to export audit trail',
            life: 3000
        });
    }
};

const viewDetails = (auditTrailItem) => {
    selectedAuditTrail.value = auditTrailItem;
    detailsVisible.value = true;
};

// Utility functions
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
};

const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString();
};

const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
};

const formatDateForAPI = (date) => {
    return date.toISOString().split('T')[0];
};

const getActionSeverity = (action) => {
    const severityMap = {
        CREATE: 'success',
        UPDATE: 'warn',
        DELETE: 'danger',
        LOGIN_SUCCESS: 'success',
        LOGIN_FAILED: 'danger',
        LOGOUT: 'secondary',
        MFA_SETUP: 'info',
        MFA_VERIFY: 'success',
        MFA_VERIFY_FAILED: 'danger',
        MFA_RESET: 'warn'
    };
    return severityMap[action] || 'secondary';
};

const getModuleSeverity = (module) => {
    const severityMap = {
        masterlist: 'primary',
        user_access: 'info',
        queue_manager: 'warn',
        mfa: 'success',
        authentication: 'secondary',
        api: 'contrast'
    };
    return severityMap[module] || 'secondary';
};

const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';

    const headers = ['ID', 'Employee No', 'Action', 'Module', 'Description', 'Table', 'IP Address', 'Timestamp'];
    const rows = data.map((item) => [item.id, item.empno, item.action, item.module, `"${item.description || ''}"`, item.table_name || '', item.ip_address || '', formatDateTime(item.performed_at)]);

    return [headers, ...rows].map((row) => row.join(',')).join('\n');
};

const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

// Lifecycle
onMounted(() => {
    getAuditTrail();
});
</script>
