<template>
    <div class="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden">
        <!-- Background layers -->
        <div class="absolute inset-0 z-0" style="background: url('/demo/images/kiosk-bg.jpg') center/cover no-repeat; opacity: 0.5; filter: blur(2px) grayscale(1)"></div>
        <div class="absolute inset-0 z-10" :style="unlocked ? 'background: linear-gradient(rgba(255,255,255,0.8), rgba(120,120,120,0.9))' : 'background: linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7))'"></div>
        ..
        <!-- Main Content with fade transition -->
        <div :class="showInactivityModal ? 'pointer-events-none select-none' : ''">
            <Transition name="fade-kiosk" mode="out-in">
                <div v-if="!unlocked" key="lockscreen" class="relative z-20 flex flex-col items-center justify-center align-center sm:px-2">
                    <Transition name="fade-down" appear>
                        <div class="flex flex-col items-center mt-10 sm:mt-4">
                            <img src="/demo/images/dsbplogo.png" alt="CVS Logo" class="h-20 sm:h-20 mt-20 mb-10 sm:mt-4 mb-10 sm:mb-10" />
                        </div>
                    </Transition>
                    <Transition name="fade-up" appear>
                        <div class="flex flex-col items-center">
                            <p class="text-center text-[#2D318F] md:text-2xl sm:text-base mb-0">Verification and Authentication of Legitimate Identity</p>
                            <h1 class="text-center text-[#2D318F] md:text-7xl sm:text-4xl font-extrabold mb-10 sm:mb-4 leading-tight">SELF VERIFICATION KIOSK</h1>
                            <Transition name="bounce-in" appear>
                                <button
                                    class="bg-[#2D318F] hover:bg-[#23266b] text-white md:text-4xl sm:text-lg font-bold p-10 md:p-10 sm:p-3 px-12 md:px-8 sm:px-4 shadow-lg mt-10 md:mt-10 sm:mt-4 mb-8 sm:mb-4 rounded-full w-full max-w-xs sm:max-w-[50vw]"
                                    @click="unlock"
                                >
                                    TAP TO START
                                </button>
                            </Transition>
                        </div>
                    </Transition>
                </div>
                <div v-else key="kiosk" class="absolute inset-0 z-30 flex flex-col items-center justify-center min-h-screen w-full px-4 sm:px-2 overflow-auto">
                    <verificationScreen @resetKiosk="unlocked = false" />
                </div>
            </Transition>
        </div>

        <!-- Inactivity Modal (responsive) -->
        <div v-if="showInactivityModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 pointer-events-auto">
            <div class="bg-white rounded-3xl shadow-2xl p-16 md:p-10 sm:p-4 flex flex-col items-center max-w-2xl md:max-w-lg sm:max-w-xs w-full pointer-events-auto">
                <h2 class="text-5xl md:text-3xl sm:text-xl font-extrabold mb-8 sm:mb-4 text-[#2D318F] text-center">Are you still there?</h2>
                <p class="text-3xl md:text-xl sm:text-base mb-12 sm:mb-6 text-gray-700 text-center">Do you need more time to complete your transaction?</p>
                <div class="flex flex-col md:flex-row gap-6 md:gap-10 w-full">
                    <button class="bg-[#2D318F] text-white px-12 md:px-8 sm:px-4 py-6 md:py-4 sm:py-3 w-full rounded-2xl text-3xl md:text-2xl sm:text-lg font-bold hover:bg-[#1e256b]" @click="handleInactivityYes">Yes</button>
                    <button class="bg-gray-300 text-gray-800 px-12 md:px-8 sm:px-4 py-6 md:py-4 sm:py-3 w-full rounded-2xl text-3xl md:text-2xl sm:text-lg font-bold hover:bg-gray-400" @click="handleInactivityNo">No</button>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import verificationScreen from './verificationScreen.vue';

const unlocked = ref(false);
const INACTIVITY_LIMIT = 3 * 15 * 1000;
const MODAL_BEFORE = 5 * 1000;
let inactivityTimer = null;
let modalTimer = null;

const showInactivityModal = ref(false);

const resetInactivityTimer = () => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    if (modalTimer) clearTimeout(modalTimer);
    showInactivityModal.value = false;
    if (unlocked.value) {
        // Set timer to show modal before actual timeout
        modalTimer = setTimeout(() => {
            showInactivityModal.value = true;
        }, INACTIVITY_LIMIT - MODAL_BEFORE);

        // Set timer to auto-lock after full timeout
        inactivityTimer = setTimeout(() => {
            unlocked.value = false;
            showInactivityModal.value = false;
        }, INACTIVITY_LIMIT);
    }
};

const globalInactivityHandler = () => {
    if (!showInactivityModal.value) {
        resetInactivityTimer();
    }
};

const startInactivityTimer = () => {
    resetInactivityTimer();
    window.addEventListener('mousedown', globalInactivityHandler);
    window.addEventListener('touchstart', globalInactivityHandler);
    window.addEventListener('keydown', globalInactivityHandler);
};

const stopInactivityTimer = () => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    if (modalTimer) clearTimeout(modalTimer);
    window.removeEventListener('mousedown', globalInactivityHandler);
    window.removeEventListener('touchstart', globalInactivityHandler);
    window.removeEventListener('keydown', globalInactivityHandler);
};

const unlock = () => {
    unlocked.value = true;
    startInactivityTimer();
};

const handleInactivityYes = () => {
    resetInactivityTimer();
};

const handleInactivityNo = () => {
    console.log('no!!');
    unlocked.value = false;
    showInactivityModal.value = false;
};

onMounted(() => {
    if (unlocked.value) startInactivityTimer();
});

onUnmounted(() => {
    stopInactivityTimer();
});

watch(unlocked, (val) => {
    if (!val) stopInactivityTimer();
});
</script>

<style scoped>
::-webkit-scrollbar {
    display: none;
}

.fade-down-enter-active,
.fade-down-leave-active {
    transition:
        opacity 0.8s,
        transform 0.8s;
}
.fade-down-enter-from {
    opacity: 0;
    transform: translateY(-40px);
}
.fade-down-enter-to {
    opacity: 1;
    transform: translateY(0);
}

.fade-up-enter-active,
.fade-up-leave-active {
    transition:
        opacity 0.8s,
        transform 0.8s;
}
.fade-up-enter-from {
    opacity: 0;
    transform: translateY(40px);
}
.fade-up-enter-to {
    opacity: 1;
    transform: translateY(0);
}

.bounce-in-enter-active {
    animation: bounce-in 1s;
}
@keyframes bounce-in {
    0% {
        opacity: 0;
        transform: scale(0.3);
    }
    50% {
        opacity: 1;
        transform: scale(1.05);
    }
    70% {
        transform: scale(0.9);
    }
    100% {
        transform: scale(1);
    }
}

/* Swipe up transition for lockscreen */
.swipe-up-leave-active {
    transition:
        transform 0.7s cubic-bezier(0.4, 0, 0.2, 1),
        opacity 0.7s;
}
.swipe-up-leave-to {
    transform: translateY(-100vh);
    opacity: 0;
}
.swipe-up-enter-active {
    transition:
        transform 0.7s,
        opacity 0.7s;
}
.swipe-up-enter-from {
    transform: translateY(100vh);
    opacity: 0;
}
.swipe-up-enter-to {
    transform: translateY(0);
    opacity: 1;
}

.fade-kiosk-enter-active,
.fade-kiosk-leave-active {
    transition: opacity 0.7s;
}
.fade-kiosk-enter-from,
.fade-kiosk-leave-to {
    opacity: 0;
}
.fade-kiosk-enter-to,
.fade-kiosk-leave-from {
    opacity: 1;
}
</style>
