<template>
    <div v-if="isLoading" class="full-page-loader">
        <ProgressSpinner />
        <p>Loading, please wait...</p>
    </div>
</template>

<script>
import ProgressSpinner from 'primevue/progressspinner';

export default {
    components: {
        ProgressSpinner
    },
    props: {
        isLoading: {
            type: Boolean,
            required: true
        }
    }
};
</script>

<style scoped>
.full-page-loader {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 1.2rem;
    z-index: 9999;
    transition: opacity 0.3s ease-in-out;
}
</style>
