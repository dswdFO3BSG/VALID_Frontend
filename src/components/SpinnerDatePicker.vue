<template>
    <div class="grid grid-cols-3 gap-4 text-3xl">
        <!-- Month Spinner -->
        <select v-model="month" class="spinner-select">
            <option v-for="(m, idx) in months" :key="idx" :value="idx + 1">{{ m }}</option>
        </select>

        <!-- Day Spinner -->
        <select v-model="day" class="spinner-select">
            <option v-for="d in 31" :key="d" :value="d">{{ String(d).padStart(2, '0') }}</option>
        </select>

        <!-- Year Spinner -->
        <select v-model="year" class="spinner-select">
            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>
    </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';

const props = defineProps({
    modelValue: String
});
const emit = defineEmits(['update:modelValue']);

const now = new Date();
const day = ref(now.getDate());
const month = ref(now.getMonth() + 1);
const year = ref(now.getFullYear());

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const years = computed(() => {
    const y = [];
    for (let i = now.getFullYear(); i >= 1900; i--) {
        y.push(i);
    }
    return y;
});

watch([day, month, year], () => {
    const formatted = `${year.value}-${String(month.value).padStart(2, '0')}-${String(day.value).padStart(2, '0')}`;
    emit('update:modelValue', formatted);
});

onMounted(() => {
    if (props.modelValue) {
        const [yy, mm, dd] = props.modelValue.split('-').map(Number);
        year.value = yy;
        month.value = mm;
        day.value = dd;
    }
});
</script>

<style scoped>
.spinner-select {
    appearance: none;
    padding: 1rem;
    border-radius: 0.75rem;
    border: 2px solid #ccc;
    background-color: white;
    font-size: 2rem;
    text-align: center;
    height: 4.5rem;
    overflow-y: auto;
}
</style>
