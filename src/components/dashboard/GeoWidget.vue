<script setup>
import VerifiedClientsServices from '@/service/verifiedClients/verifiedClients';
import { onMounted, ref } from 'vue';
const municipalityCount = ref([]);
const selectedMunicipality = ref('Pampanga');
const menu = ref(null);
const clients = ref();
const loading = ref(false);
const loadingMunicipalities = ref(false);

const getVerifiedClients = async () => {
    loading.value = true;
    const response = await VerifiedClientsServices.getClients();
    clients.value = response.data;
    loading.value = false;
};
const getClientsPerMunicipality = async () => {
    loadingMunicipalities.value = true;
    console.log(selectedMunicipality.value);
    const response = await VerifiedClientsServices.getMunicipalityCount({ province: selectedMunicipality.value });
    municipalityCount.value = response.municipalities;
    console.log('muni', municipalityCount.value);
    loadingMunicipalities.value = false;
};

onMounted(async () => {
    await getClientsPerMunicipality();
    await getVerifiedClients();
});

const items = ref([
    {
        label: 'Pampanga',
        command: () => {
            selectedMunicipality.value = 'Pampanga';
            getClientsPerMunicipality();
        }
    },
    {
        label: 'Tarlac',
        command: () => {
            selectedMunicipality.value = 'Tarlac';
            getClientsPerMunicipality();
        }
    },
    {
        label: 'Aurora',
        command: () => {
            selectedMunicipality.value = 'Aurora';
            getClientsPerMunicipality();
        }
    },
    {
        label: 'Bulacan',
        command: () => {
            selectedMunicipality.value = 'Bulacan';
            getClientsPerMunicipality();
        }
    },
    {
        label: 'Bataan',
        command: () => {
            selectedMunicipality.value = 'Bataan';
            getClientsPerMunicipality();
        }
    },
    {
        label: 'Zambales',
        command: () => {
            selectedMunicipality.value = 'Zambales';
            getClientsPerMunicipality();
        }
    },
    {
        label: 'Nueva Ecija',
        command: () => {
            selectedMunicipality.value = 'Nueva Ecija';
            getClientsPerMunicipality();
        }
    }
]);
</script>

<template>
    <div class="flex flex-col sm:flex-row gap-8">
        <div class="card card1">
            <div class="flex justify-between items-center">
                <div class="font-semibold text-xl">Number of Clients per Province - {{ selectedMunicipality }}</div>
                <div>
                    <Button icon="pi pi-filter" class="p-button-text p-button-plain p-button-rounded" @click="$refs.menu.toggle($event)"></Button>
                    <Menu ref="menu" popup :model="items" class="!min-w-40"></Menu>
                </div>
            </div>
            <Divider />
            <ul v-if="loadingMunicipalities" class="m-0 p-0 list-none">
                <li class="mb-4">
                    <div class="flex">
                        <div class="self-center" style="flex: 1">
                            <Skeleton width="100%" class="mb-2"></Skeleton>
                            <Skeleton width="75%"></Skeleton>
                        </div>
                    </div>
                </li>
            </ul>
            <ul v-if="!loadingMunicipalities && municipalityCount.length > 0" class="list-none mt-2 p-0 m-0">
                <li v-for="m of municipalityCount" class="flex flex-row md:flex-row items-center justify-between mb-6">
                    <div>
                        <span class="text-surface-900 dark:text-surface-0 font-medium mr-2 mb-1 md:mb-0">{{ m.municipality }}</span>
                    </div>
                    <div class="md:mt-0 flex items-center">
                        <span class="text-blue-500 ml-4 font-medium">{{ m.total_clients }}</span>
                    </div>
                </li>
            </ul>
            <p v-else-if="!loadingMunicipalities && municipalityCount.length == 0" class="text-red-500">No Data Found.</p>
        </div>
        <div class="card card2">
            <div class="flex justify-between items-center mb-6">
                <div class="font-semibold text-xl">Recently Verified Clients</div>
                <div>
                    <a href="/client-verification" class="text-blue-500">Verify Clients</a>
                </div>
            </div>
            <div>
                <DataTable :loading="loading" :value="clients" tableStyle="min-width: 50rem" paginator :rows="4">
                    <template #empty> Please Search Client to Start. </template>
                    <template #loading> Loading client data. Please wait. </template>
                    <Column field="fullName" header="Name"></Column>
                    <Column field="verification_result" header="Verification Result">
                        <template #body="slotProps">
                            <Tag v-if="slotProps.data.verification_result === 1" icon="pi pi-check" severity="success" value="Verified"></Tag>
                            <Tag v-else icon="pi pi-times" severity="danger" value="No PSN"></Tag>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>

<style scoped>
.card1,
.card2 {
    width: 100%;
    max-height: 27rem;
    display: flex;
    flex-direction: column;
    margin: 0;
    overflow: hidden;
}

.card1 ul,
.card2 ul {
    flex-grow: 1;
    overflow-y: auto;
    margin: 0;
    padding: 0;
}
</style>
