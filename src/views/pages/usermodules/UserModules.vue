<template>
    <div class="card">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">User Modules Management</h1>
            <Button icon="pi pi-plus" label="Add Module" @click="openNew" class="p-button-success" />
        </div>

        <!-- Data Table -->
        <DataTable
            ref="dt"
            :value="modules"
            dataKey="module_id"
            :paginator="true"
            :rows="10"
            :filters="filters"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} modules"
            :globalFilterFields="['label', 'to', 'main_menu']"
            :loading="loading"
        >
            <template #header>
                <div class="flex justify-between items-center">
                    <h4 class="m-0">Manage User Modules</h4>
                    <IconField iconPosition="left">
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                        <InputText v-model="filters['global'].value" placeholder="Search modules..." />
                    </IconField>
                </div>
            </template>

            <Column field="order" header="Order" :sortable="true" headerStyle="width:10%; min-width:5rem;">
                <template #body="{ data }">
                    <span class="font-semibold">{{ data.order }}</span>
                </template>
            </Column>

            <Column field="label" header="Label" :sortable="true" headerStyle="width:20%; min-width:10rem;">
                <template #body="{ data }">
                    <span class="font-medium">{{ data.label }}</span>
                </template>
            </Column>

            <Column field="icon" header="Icon" headerStyle="width:15%; min-width:8rem;">
                <template #body="{ data }">
                    <div class="flex items-center gap-2">
                        <i v-if="data.icon" :class="data.icon" class="text-lg"></i>
                        <span class="text-sm text-gray-500">{{ data.icon }}</span>
                    </div>
                </template>
            </Column>

            <Column field="to" header="Route" :sortable="true" headerStyle="width:15%; min-width:10rem;">
                <template #body="{ data }">
                    <code class="bg-gray-100 px-2 py-1 rounded text-sm">{{ data.to }}</code>
                </template>
            </Column>

            <Column field="main_menu" header="Main Menu" :sortable="true" headerStyle="width:10%; min-width:8rem;"></Column>

            <Column field="parent" header="Parent ID" :sortable="true" headerStyle="width:10%; min-width:8rem;"></Column>

            <Column header="Actions" headerStyle="width:20%; min-width:10rem">
                <template #body="slotProps">
                    <div class="flex gap-2">
                        <Button icon="pi pi-eye" class="p-button-rounded p-button-info p-button-sm" @click="viewModule(slotProps.data)" v-tooltip.top="'View'" />
                        <Button icon="pi pi-pencil" class="p-button-rounded p-button-success p-button-sm" @click="editModule(slotProps.data)" v-tooltip.top="'Edit'" />
                        <Button icon="pi pi-trash" class="p-button-rounded p-button-warning p-button-sm" @click="confirmDeleteModule(slotProps.data)" v-tooltip.top="'Delete'" />
                    </div>
                </template>
            </Column>
        </DataTable>

        <!-- Add/Edit Module Dialog -->
        <Dialog v-model:visible="moduleDialog" :style="{ width: '700px' }" header="Module Details" :modal="true" :draggable="false" class="p-fluid">
            <form @submit.prevent="saveModule">
                <!-- Basic Information Section -->
                <div class="mb-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Basic Information</h3>
                    <div class="grid grid-cols-1 gap-4">
                        <!-- Label -->
                        <div class="field">
                            <label for="label" class="block text-sm font-medium text-gray-700 mb-2"> Module Label <span class="text-red-500">*</span> </label>
                            <InputText id="label" v-model.trim="module.label" required="true" autofocus :class="{ 'p-invalid': submitted && !module.label }" placeholder="Enter module label" class="w-full" />
                            <small class="p-invalid" v-if="submitted && !module.label">Label is required.</small>
                        </div>

                        <!-- Route and Order Row -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <!-- Route -->
                            <div class="field">
                                <label for="to" class="block text-sm font-medium text-gray-700 mb-2"> Route <span class="text-red-500">*</span> </label>
                                <InputText id="to" v-model.trim="module.to" required="true" :class="{ 'p-invalid': submitted && !module.to }" placeholder="/dashboard" class="w-full" />
                                <small class="p-invalid" v-if="submitted && !module.to">Route is required.</small>
                            </div>

                            <!-- Order -->
                            <div class="field">
                                <label for="order" class="block text-sm font-medium text-gray-700 mb-2"> Display Order <span class="text-red-500">*</span> </label>
                                <InputNumber id="order" v-model="module.order" :min="1" :max="999" :class="{ 'p-invalid': submitted && !module.order }" placeholder="1" class="w-full" />
                                <small class="p-invalid" v-if="submitted && !module.order">Order is required.</small>
                            </div>
                        </div>

                        <!-- Icon and Main Menu Row -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <!-- Icon -->
                            <div class="field">
                                <label for="icon" class="block text-sm font-medium text-gray-700 mb-2">Icon (PrimeVue)</label>
                                <InputText id="icon" v-model.trim="module.icon" placeholder="pi pi-home" class="w-full" />
                                <small class="text-gray-500 text-xs mt-1">Example: pi pi-home, pi pi-users, pi pi-cog</small>
                            </div>

                            <!-- Main Menu -->
                            <div class="field">
                                <label for="main_menu" class="block text-sm font-medium text-gray-700 mb-2">Main Menu</label>
                                <InputText id="main_menu" v-model.trim="module.main_menu" placeholder="1" class="w-full" />
                                <small class="text-gray-500 text-xs mt-1">Main menu identifier</small>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Parent Information Section -->
                <div class="mb-4">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Parent Information</h3>
                    <div class="grid grid-cols-1 gap-4">
                        <!-- Parent ID and Parent Route Row -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <!-- Parent ID -->
                            <div class="field">
                                <label for="parent" class="block text-sm font-medium text-gray-700 mb-2">Parent ID</label>
                                <InputNumber id="parent" v-model="module.parent" :min="0" placeholder="0" class="w-full" />
                                <small class="text-gray-500 text-xs mt-1">Leave 0 for top-level menu</small>
                            </div>

                            <!-- Parent Route -->
                            <div class="field">
                                <label for="parent_to" class="block text-sm font-medium text-gray-700 mb-2">Parent Route</label>
                                <InputText id="parent_to" v-model.trim="module.parent_to" placeholder="/parent-route" class="w-full" />
                                <small class="text-gray-500 text-xs mt-1">Route of the parent menu</small>
                            </div>
                        </div>

                        <!-- Parent Label and Parent Icon Row -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <!-- Parent Label -->
                            <div class="field">
                                <label for="parent_label" class="block text-sm font-medium text-gray-700 mb-2">Parent Label</label>
                                <InputText id="parent_label" v-model.trim="module.parent_label" placeholder="Parent Menu" class="w-full" />
                                <small class="text-gray-500 text-xs mt-1">Display name of parent menu</small>
                            </div>

                            <!-- Parent Icon -->
                            <div class="field">
                                <label for="parent_icon" class="block text-sm font-medium text-gray-700 mb-2">Parent Icon</label>
                                <InputText id="parent_icon" v-model.trim="module.parent_icon" placeholder="pi pi-folder" class="w-full" />
                                <small class="text-gray-500 text-xs mt-1">Icon for parent menu</small>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveModule" />
            </template>
        </Dialog>

        <!-- View Module Dialog -->
        <Dialog v-model:visible="viewDialog" :style="{ width: '500px' }" header="Module Details" :modal="true">
            <div class="space-y-4" v-if="selectedModule">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="font-medium text-gray-700">Label:</label>
                        <p class="mt-1">{{ selectedModule.label }}</p>
                    </div>
                    <div>
                        <label class="font-medium text-gray-700">Order:</label>
                        <p class="mt-1">{{ selectedModule.order }}</p>
                    </div>
                    <div>
                        <label class="font-medium text-gray-700">Icon:</label>
                        <div class="flex items-center gap-2 mt-1">
                            <i v-if="selectedModule.icon" :class="selectedModule.icon"></i>
                            <span>{{ selectedModule.icon || 'N/A' }}</span>
                        </div>
                    </div>
                    <div>
                        <label class="font-medium text-gray-700">Route:</label>
                        <p class="mt-1">{{ selectedModule.to }}</p>
                    </div>
                    <div>
                        <label class="font-medium text-gray-700">Main Menu:</label>
                        <p class="mt-1">{{ selectedModule.main_menu || 'N/A' }}</p>
                    </div>
                    <div>
                        <label class="font-medium text-gray-700">Parent ID:</label>
                        <p class="mt-1">{{ selectedModule.parent || 'N/A' }}</p>
                    </div>
                </div>

                <div v-if="selectedModule.parent_label || selectedModule.parent_to || selectedModule.parent_icon" class="border-t pt-4">
                    <h4 class="font-semibold mb-3">Parent Information</h4>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="font-medium text-gray-700">Parent Label:</label>
                            <p class="mt-1">{{ selectedModule.parent_label || 'N/A' }}</p>
                        </div>
                        <div>
                            <label class="font-medium text-gray-700">Parent Route:</label>
                            <p class="mt-1">{{ selectedModule.parent_to || 'N/A' }}</p>
                        </div>
                        <div class="col-span-2">
                            <label class="font-medium text-gray-700">Parent Icon:</label>
                            <div class="flex items-center gap-2 mt-1">
                                <i v-if="selectedModule.parent_icon" :class="selectedModule.parent_icon"></i>
                                <span>{{ selectedModule.parent_icon || 'N/A' }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <Button label="Close" icon="pi pi-times" class="p-button-text" @click="viewDialog = false" />
            </template>
        </Dialog>

        <!-- Delete Confirmation Dialog -->
        <Dialog v-model:visible="deleteModuleDialog" :style="{ width: '450px' }" header="Confirm Delete" :modal="true">
            <div class="confirmation-content flex items-center">
                <i class="pi pi-exclamation-triangle mr-3 text-2xl text-red-500" />
                <span v-if="module"
                    >Are you sure you want to delete the module <b>{{ module.label }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteModuleDialog = false" />
                <Button label="Yes" icon="pi pi-check" class="p-button-text p-button-danger" @click="deleteModule" />
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import UserModulesService from '@/service/usermodules/UserModulesService.js';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();

// Data
const modules = ref([]);
const moduleDialog = ref(false);
const viewDialog = ref(false);
const deleteModuleDialog = ref(false);
const module = ref({});
const selectedModule = ref({});
const submitted = ref(false);
const loading = ref(false);

// Filters - Define FilterMatchMode inline since import is not working
const FilterMatchMode = {
    STARTS_WITH: 'startsWith',
    CONTAINS: 'contains',
    NOT_CONTAINS: 'notContains',
    ENDS_WITH: 'endsWith',
    EQUALS: 'equals',
    NOT_EQUALS: 'notEquals',
    LESS_THAN: 'lt',
    LESS_THAN_OR_EQUAL_TO: 'lte',
    GREATER_THAN: 'gt',
    GREATER_THAN_OR_EQUAL_TO: 'gte',
    BETWEEN: 'between',
    IN: 'in',
    DATE_IS: 'dateIs',
    DATE_IS_NOT: 'dateIsNot',
    DATE_BEFORE: 'dateBefore',
    DATE_AFTER: 'dateAfter'
};

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

// Lifecycle
onMounted(() => {
    loadModules();
});

// Methods
const loadModules = async () => {
    loading.value = true;
    try {
        const response = await UserModulesService.getAll();
        if (response.status) {
            modules.value = response.data;
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: response.message || 'Failed to load modules', life: 3000 });
        }
    } catch (error) {
        console.error('Error loading modules:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load modules', life: 3000 });
    } finally {
        loading.value = false;
    }
};

const openNew = () => {
    module.value = {
        label: '',
        icon: '',
        to: '',
        main_menu: '',
        order: 1,
        parent: null,
        parent_to: '',
        parent_label: '',
        parent_icon: ''
    };
    submitted.value = false;
    moduleDialog.value = true;
};

const hideDialog = () => {
    moduleDialog.value = false;
    submitted.value = false;
};

const saveModule = async () => {
    submitted.value = true;

    if (!module.value.label?.trim() || !module.value.to?.trim() || !module.value.order) {
        return;
    }

    try {
        let response;
        if (module.value.module_id) {
            // Update existing module
            response = await UserModulesService.update(module.value.module_id, module.value);
        } else {
            // Create new module
            response = await UserModulesService.create(module.value);
        }

        if (response.status) {
            toast.add({ severity: 'success', summary: 'Successful', detail: response.message, life: 3000 });
            moduleDialog.value = false;
            loadModules();
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: response.message || 'Operation failed', life: 3000 });
        }
    } catch (error) {
        console.error('Error saving module:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save module', life: 3000 });
    }
};

const editModule = (moduleData) => {
    module.value = { ...moduleData };
    moduleDialog.value = true;
};

const viewModule = (moduleData) => {
    selectedModule.value = { ...moduleData };
    viewDialog.value = true;
};

const confirmDeleteModule = (moduleData) => {
    module.value = moduleData;
    deleteModuleDialog.value = true;
};

const deleteModule = async () => {
    try {
        const response = await UserModulesService.delete(module.value.module_id);
        if (response.status) {
            toast.add({ severity: 'success', summary: 'Successful', detail: response.message, life: 3000 });
            deleteModuleDialog.value = false;
            loadModules();
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: response.message || 'Delete failed', life: 3000 });
        }
    } catch (error) {
        console.error('Error deleting module:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete module', life: 3000 });
    }
};
</script>

<style scoped>
.confirmation-content {
    align-items: center;
}

.field {
    margin-bottom: 1rem;
}

.field label {
    display: block;
    font-weight: 500;
    margin-bottom: 0.5rem;
}

.field small {
    display: block;
    margin-top: 0.25rem;
}

.field small.text-gray-500 {
    color: #6b7280;
    font-style: italic;
}

.p-button-sm {
    padding: 0.5rem;
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

/* Section headers */
.field h3 {
    color: #374151;
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

/* Form field spacing */
.grid .field {
    margin-bottom: 0;
}

/* Input improvements */
:deep(.p-inputtext),
:deep(.p-inputnumber-input) {
    padding: 0.75rem;
    border-radius: 0.375rem;
    border: 1px solid #d1d5db;
    transition:
        border-color 0.15s ease-in-out,
        box-shadow 0.15s ease-in-out;
}

:deep(.p-inputtext:focus),
:deep(.p-inputnumber-input:focus) {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

:deep(.p-invalid.p-inputtext),
:deep(.p-invalid .p-inputnumber-input) {
    border-color: #ef4444;
}

/* Required field asterisk */
.text-red-500 {
    color: #ef4444;
}

/* Help text styling */
small.text-gray-500 {
    color: #6b7280;
    font-size: 0.75rem;
}

small.p-invalid {
    color: #ef4444;
    font-size: 0.75rem;
    font-weight: 500;
}
</style>
