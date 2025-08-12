<script setup>
const props = defineProps({
    clientCount: Object,
    loading: Boolean
});
</script>

<template>
    <div class="col-span-12 lg:col-span-6 xl:col-span-4">
        <div class="card mb-0">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium mb-4">Total Verified Clients </span>
                    <Skeleton v-if="!clientCount.total" height="2rem" class="mb-2"></Skeleton>
                    <div v-else class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ clientCount?.total }}</div>
                </div>
                <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-users text-blue-500 !text-xl"></i>
                </div>
            </div>
        </div>
    </div>
    <div class="col-span-12 flex-grow lg:col-span-6 xl:col-span-4">
        <div class="card mb-0">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium mb-4">Successful Verifications </span>
                    <Skeleton v-if="!clientCount.verified" height="2rem" class="mb-2"></Skeleton>
                    <div v-else class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ clientCount?.verified }}</div>
                </div>
                <div class="flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-check text-green-500 !text-xl"></i>
                </div>
            </div>
        </div>
    </div>
    <div class="col-span-12 flex-grow lg:col-span-6 xl:col-span-4">
        <div class="card mb-0">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium mb-4">Failed Verifications </span>
                    <Skeleton v-if="!clientCount.unverified" height="2rem" class="mb-2"></Skeleton>
                    <div v-else class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ clientCount?.unverified }}</div>
                </div>
                <div class="flex items-center justify-center bg-red-100 dark:bg-red-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-times text-red-500 !text-xl"></i>
                </div>
            </div>
        </div>
    </div>
</template>
