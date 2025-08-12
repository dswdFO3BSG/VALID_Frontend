<template>
    <div class="relative z-20 flex flex-col items-center justify-between min-h-screen w-full">
        <Transition name="fade-down" appear>
            <div class="flex flex-col items-center mt-10">
                <img src="/demo/images/dsbplogo.png" alt="CVS Logo" class="h-16 mt-10" />
            </div>
        </Transition>

        <Transition name="fade-up" appear>
            <div class="flex flex-col items-center">
                <p class="text-center text-white text-2xl mb-0">Verification and Authentication of Legitimate Identity</p>
                <h1 class="text-center text-white text-7xl font-extrabold mb-10">
                    SELF VERIFICATION <br />
                    KIOSK
                </h1>
                <Transition name="bounce-in" appear>
                    <button class="bg-[#2D318F] hover:bg-[#23266b] text-white text-4xl font-bold p-10 px-12 shadow-lg mt-10 mb-8 rounded-full" @click="$emit('unlock')">TAP TO START</button>
                </Transition>
            </div>
        </Transition>
    </div>
</template>
