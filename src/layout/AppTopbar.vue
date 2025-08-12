<script setup>
import { useLayout } from '@/layout/composables/layout';

const { toggleMenu, toggleDarkMode, isDarkTheme } = useLayout();
</script>

<template>
    <div class="layout-topbar" style="background-color: #032040">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" @click="toggleMenu">
                <i class="pi pi-bars text-white"></i>
            </button>
            <router-link to="/" class="layout-topbar-logo">
                <img class="mx-3 my-2" src="../../public/demo/images/mainlogo.png" width="20%" style="max-width: 240px" />
            </router-link>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
                    <i class="text-white" :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.layout-topbar .layout-topbar-action:hover {
    background-color: #032040;
    opacity: 0.5;
}
</style>
