<script setup>
import AuthServices from '@/service/authentication/AuthServices';
import userAccess from '@/service/settings/userAccess';
import Cookies from 'js-cookie';
import { onMounted, ref } from 'vue';
import AppMenuItem from './AppMenuItem.vue';

const model = ref([]);

onMounted(async () => {
    await getMenu();
});

const getMenu = async () => {
    if (Cookies.get('token_valid')) {
        let user = {
            empNo: Cookies.get('empNo')
        };
        const access = await userAccess.getUserAccess(user);
        model.value = access.data;
    } else {
        console.log('No token found');
    }
};

const logout = async () => {
    await AuthServices.logout({});
    Cookies.remove('psa-token');
    Cookies.remove('token_valid');
    Cookies.remove('empNo');
    Cookies.remove('name');
    window.location.replace('/login');
};
</script>

<template>
    <div class="flex flex-col h-full w-full overflow-hidden justify-content-between">
        <div>
            <ul v-if="model.length != 0" class="layout-menu w-100">
                <template v-for="(item, i) in model" :key="item.id || i">
                    <app-menu-item v-if="!item.separator" :item="item" :index="i" />
                    <li v-else class="menu-separator"></li>
                </template>
            </ul>

            <ul v-else class="layout-menu w-100">
                <li class="pt-4"><Skeleton height="2rem" class="mb-2"></Skeleton></li>
                <li class="pt-4"><Skeleton height="2rem" class="mb-2"></Skeleton></li>
                <li class="pt-4"><Skeleton height="2rem" class="mb-2"></Skeleton></li>
                <li class="pt-4"><Skeleton height="2rem" class="mb-2"></Skeleton></li>
            </ul>
        </div>

        <div class="mt-auto">
            <hr class="mb-3 mx-3 border-top-1 surface-border" />
            <a @click="logout" v-ripple class="my-3 flex align-items-center cursor-pointer p-3 gap-2 border-round text-700 hover:surface-100 transition-duration-150">
                <i class="pi pi-fw pi-power-off"></i>
                <span>Logout</span>
            </a>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
