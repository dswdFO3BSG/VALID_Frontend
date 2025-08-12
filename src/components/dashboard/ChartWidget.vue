<script setup>
import { useLayout } from '@/layout/composables/layout';
import VerifiedClientsServices from '@/service/verifiedClients/verifiedClients';
import { onMounted, ref, watch } from 'vue';

const props = defineProps({
    clientCount: {
        type: Object,
        default: () => ({ male: 0, female: 0 })
    },
    getStatistics: {
        type: Function,
        required: true
    }
});
const { getPrimary, getSurface, isDarkTheme } = useLayout();
const pieData = ref(null);
const barData = ref(null);
const pieOptions = ref(null);
const barOptions = ref(null);
const ageGroup = ref([]);
const getAgeCount = async () => {
    const response = await VerifiedClientsServices.getAgeGroups();
    ageGroup.value = response;
    console.log(ageGroup.value);
};

onMounted(async () => {
    await props.getStatistics();
    await getAgeCount();
    setColorOptions();
});

function setColorOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    barData.value = {
        labels: ['0-14', '15-24', '25-54', '55-64', '65+'],
        datasets: [
            {
                backgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
                borderColor: documentStyle.getPropertyValue('--p-primary-500'),
                data: [ageGroup.value.children, ageGroup.value.early_working, ageGroup.value.prime_working, ageGroup.value.mature_working, ageGroup.value.elderly]
            }
        ]
    };
    barOptions.value = {
        plugins: {
            legend: {
                display: false,
                labels: {
                    fontColor: textColor
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary,
                    font: {
                        weight: 500
                    }
                },
                grid: {
                    display: false,
                    drawBorder: false
                }
            },
            y: {
                ticks: {
                    color: textColorSecondary,
                    stepSize: 1
                },
                grid: {
                    color: surfaceBorder,
                    drawBorder: false
                }
            }
        }
    };

    pieData.value = {
        labels: ['Male', 'Female'],
        datasets: [
            {
                data: [props.clientCount.male, props.clientCount.female],
                backgroundColor: [documentStyle.getPropertyValue('--p-primary-500'), documentStyle.getPropertyValue('--p-primary-200')],
                hoverBackgroundColor: [documentStyle.getPropertyValue('--p-primary-400'), documentStyle.getPropertyValue('--p-primary-100')]
            }
        ]
    };

    pieOptions.value = {
        plugins: {
            legend: {
                labels: {
                    usePointStyle: true,
                    color: textColor
                }
            }
        }
    };
}

watch(
    [getPrimary, getSurface, isDarkTheme],
    () => {
        setColorOptions();
    },
    { immediate: true }
);
</script>

<template>
    <Fluid class="grid grid-cols-12 gap-8 mt-4">
        <div class="col-span-12 xl:col-span-6">
            <div class="card flex flex-col items-center">
                <div class="font-semibold text-xl mb-0">Gender</div>
                <Chart type="pie" :data="pieData" :options="pieOptions" class="mt-0"></Chart>
            </div>
        </div>
        <div class="col-span-12 xl:col-span-6">
            <div class="card text-center">
                <div class="font-semibold text-xl mb-4">Age Groups</div>
                <Chart type="bar" :data="barData" :options="barOptions"></Chart>
            </div>
        </div>
    </Fluid>
</template>
<style scoped>
.card {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
}
</style>
