<script setup>
import ChartWidget from '@/components/dashboard/ChartWidget.vue';
import GeoWidget from '@/components/dashboard/GeoWidget.vue';
import VerifiedClientsServices from '@/service/verifiedClients/verifiedClients';
import Cookies from 'js-cookie';
import { onMounted, ref } from 'vue';
const clientCount = ref([]);
1;
const loggedUser = Cookies.get('name');

const getStatistics = async () => {
    const response = await VerifiedClientsServices.getStatistics();
    clientCount.value.total = response.total;
    clientCount.value.verified = response.verified;
    clientCount.value.unverified = response.unverified;
    clientCount.value.male = response.male;
    clientCount.value.female = response.female;

    console.log(clientCount.value);
};

const cardPT = {
    root: {
        style: 'background-color: #3b82f6 !important; color: white; '
    }
};

onMounted(async () => {
    // await getStatistics();
});
</script>

<template>
    <Card :pt="cardPT">
        <template #title>Dashboard</template>
        <template #content>
            <p class="m-0">
                Welcome, <b>{{ loggedUser }}</b>
            </p>
        </template>
    </Card>
    <div class="grid grid-cols-12 gap-8 mt-8 w-full">
        <StatsWidget :clientCount="clientCount" />
    </div>
    <div class="w-full">
        <GeoWidget class="mt-8" :clientCount="clientCount" :getStatistics="getStatistics" />
    </div>
    <div class="w-full mt-8"><ChartWidget :clientCount="clientCount" :getStatistics="getStatistics" /></div>
</template>
